const mongoose = require('mongoose');

const Employee = require('../models/employee');
const validation = require('../utils/validation');
const errorHandling = require('../utils/errorHandling')
const getBulkArrayForUpdate = require('../utils/shared').getBulkArrayForUpdate;
const getNullKeysForUpdate = require('../utils/shared').getNullKeysForUpdate;
const sendMessagesResponse = require('../utils/shared').sendMessagesResponse;
const changeStatusOfAUserJob = require('../utils/shared').changeStatusOfAUserJob;
const skippedDocuments = require('../utils/shared').skippedDocuments;

exports.fetchSingle = async (req, res, next) => {
  try {throw "111"
    const employee = await Employee.findById(req.query._id).select('_id email firstName lastName profileImagePath work');
    res.status(200).json({
      type: 'success',
      employee
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, "There was an error fetching the employee."));
  }
};

exports.fetchEmployees = async (req, res, next) => {
  try {
    const routeErrors = validation.handleValidationRoutesErrors(req);
    if(routeErrors.type === 'failure') {
      return sendMessagesResponse(res, 422, routeErrors.messages, 'failure');
    }
    
    let employeeQuery = {};
    if (req.query.searchQuery) {
      const search = JSON.parse(req.query.searchQuery);
      if(search.company) {
        employeeQuery['work.company'] = search.company;
      }
      if(search.work) {
        employeeQuery['work.title'] = search.work;
      }
      if(search.name || search.email) {
        employeeQuery['$or'] = [
          { name: search.name },
          { email: search.email },
        ]
      }
    }

    const addFields = { $addFields: {
        firstName: { $ifNull: ['$firstName', ''] },
        lastName: { $ifNull: ['$lastName', ''] }
      }
    };

    const projectWantedFields = { $project: {
        name: {
          $trim: {
            input: {
              $concat: ['$firstName', ' ', '$lastName']
            }
          }
        },
        _id: 1,
        email: 1,
        firstName: 1,
        lastName: 1,
        profileImagePath: 1,
        work: 1,
      }
    };
    
    const match = { $match: employeeQuery };
    const skipDocuments = { $skip: skippedDocuments(req.query.page) };
    const projectRemoveUnwantedFields = { $project: { name: 0 } };
    const limitResults = {  $limit: +process.env.DOCS_PER_PAGE };
    const countField = { $count: 'email' };

    const employees = await Employee.aggregate([
      addFields, projectWantedFields, match, skipDocuments, projectRemoveUnwantedFields, limitResults
    ]);

    let total = await Employee.aggregate([
      addFields, projectWantedFields, match, countField
    ]);
    total = total[0] ? total[0].email : 0;
    res.status(200).json({
      type: 'success',
      employees,
      total: total
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, "There was an error fetching the employee."));
  }
};

const updateReqProfileImage = req => {
  if(req.file) { // new image for company 
    let url = req.protocol + '://' + req.get('host');
    url = url + '/images/' + req.file.filename;
    req.body.profileImagePath = url;
    return true;
  }
  if (process.env.NODE_ENV === 'production') {
    return true;
  }
  return false;
}

const getUpdateQuery = async (req) => {
  let newProfileImage = updateReqProfileImage(req);
  const employeeRemovableKeys = ['firstName', 'lastName']; 
  const nullKeys = getNullKeysForUpdate(req, employeeRemovableKeys);
  if(req.body.deleteImage === 'true' && !newProfileImage) nullKeys.profileImagePath = ''; 
  return await getBulkArrayForUpdate(req, nullKeys);
};

exports.updateEmployee = async (req, res, next) => {
  try {
    const routeErrors = validation.handleValidationRoutesErrors(req);
    if(routeErrors.type === 'failure') {
      return sendMessagesResponse(res, 422, routeErrors.messages, 'failure');
    } 
    const emailExist = await validation.userEmailExistValidation(req.body.email, req.body._id);
    if(emailExist.type === 'failure'){
      return sendMessagesResponse(res, 422, emailExist.messages, 'failure');
    }

    for (let [key, value] of Object.entries(req.body)) {
      req.body[key] = typeof value === 'string' ? value.toLowerCase() : value;
    }
    
    const bulkRes = await Employee.bulkWrite(await getUpdateQuery(req));
    if(!bulkRes.result.nMatched){
      throw new Error("Trying to update a non existing employee.");
    }
    let updatedEmployee = await Employee.findById(req.body._id).select(
        '-__v -password -resetPassToken -resetPassTokenExpiration -refreshToken -jobs -work');
    
    res.status(200).json({
      type: 'success',
      employee: updatedEmployee
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, "There was an error updating the employee."));
  }
};


exports.applySaveJob = async (req, res, next) => {
  try {
    await changeStatusOfAUserJob(req, res, req.body.companyId, req.body.employeeId, req.body.jobId, req.body.status, 'employee')
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, `There was an error updating the status of the wanted job.`));
  }
};


exports.createWork = async (req, res, next) => {
  try {
    const routeErrors = validation.handleValidationRoutesErrors(req);
    if(routeErrors.type === 'failure') {
      return sendMessagesResponse(res, 422, routeErrors.messages, 'failure');
    } 

    const employeeToUpdate = await Employee.findOneAndUpdate(
      { _id: req.body._id }, 
      { $push: {
          'work' : { 
            title: req.body.title.toLowerCase(),
            company: req.body.company,
            employmentType: req.body.employmentType,
            startDate: new Date(req.body.startDate),
            endDate: !req.body.present && !!req.body.endDate ? new Date(req.body.endDate) : null,
          } 
        } 
      },
      { new: true }
    )

    res.status(201).json({
      type: 'success',
      work: employeeToUpdate.work[employeeToUpdate.work.length - 1]
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, "There was an error trying to create the experience."));
  }
};

exports.updateWork = async (req, res, next) => {
  try {
    const routeErrors = validation.handleValidationRoutesErrors(req);
    if(routeErrors.type === 'failure') {
      return sendMessagesResponse(res, 422, routeErrors.messages, 'failure');
    }
    
    const employeeToUpdate = await Employee.findOne({ 
                    _id: req.body._id, 'work._id': req.body.workId });
    
    const workToUpdateInd = employeeToUpdate.work.findIndex(work => work._id.toString() === req.body.workId);

    const updatedWork = employeeToUpdate.work[workToUpdateInd] = { 
      _id: req.body.workId,
      title: req.body.title.toLowerCase(),
      company: req.body.company,
      employmentType: req.body.employmentType,
      startDate: new Date(req.body.startDate),
      endDate: !req.body.present && !!req.body.endDate ? new Date(req.body.endDate) : null,
    };
    await employeeToUpdate.save();
    
    res.status(201).json({ 
      type: 'success',
      updatedWork
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, "There was an error trying to update the experience."));
  }
};

exports.deleteWork = async (req, res, next) => {
  try {
    const routeErrors = validation.handleValidationRoutesErrors(req);
    if(routeErrors.type === 'failure') {
      return sendMessagesResponse(res, 422, routeErrors.messages, 'failure');
    } 
    
    await Employee.findOneAndUpdate(
      { _id: req.query._id }, 
      { $pull: {
          'work' : { 
            _id: req.query.workId
          } 
        } 
      },
      { new: true }
    ).populate('jobs.job');
    
    res.status(201).json({
      type: 'success',
      deletedWorkID: req.query.workId
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, "There was an error trying to delete the experience."));
  }
};








