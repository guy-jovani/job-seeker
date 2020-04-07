

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
    const employees = await Employee
                              .find({_id: { $ne: req.query._id }})
                              .skip(skippedDocuments(req.query.page))
                              .limit(+process.env.DOCS_PER_PAGE)
                              .select('_id email firstName lastName profileImagePath work');

    const total = await Employee.aggregate([
      { $match: { _id: { $ne: req.query._id } } },
      { $count: 'email' }
    ]);

    res.status(200).json({
      type: 'success',
      employees,
      total: req.query.kind === 'employee' ? total[0].email - 1 : total[0].email
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

    const bulkRes = await Employee.bulkWrite(await getUpdateQuery(req));
    if(!bulkRes.result.nMatched){
      throw new Error("Trying to update a non existing employee.");
    }
    let updatedEmployee = await Employee.findById(req.body._id).select(
        '-__v -password -resetPassToken -resetPassTokenExpiration').populate({
          path: 'jobs.job', 
          populate: { path: 'company', select: 'name' }
        });;

    updatedEmployee = updatedEmployee.toObject();

    res.status(201).json({
      messages: ['employee updated successfully!'],
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


const sortWorkByEndDate = work => {
  work.sort((first, second) => {
    if (!first.endDate) { // means a currently work
      return -1;
    }

    if (!second.endDate || first.endDate < second.endDate) {
      return 1;
    }

    return -1;
  });
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
            title: req.body.title,
            company: req.body.company,
            employmentType: req.body.employmentType,
            startDate: new Date(req.body.startDate),
            endDate: req.body.endDate ? new Date(req.body.endDate) : null,
          } 
        } 
      },
      { new: true }
    ).populate('jobs.job');

    sortWorkByEndDate(employeeToUpdate.work)
    
    res.status(201).json({
      messages: ['employee updated successfully!'],
      type: 'success',
      employee: employeeToUpdate
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
                    _id: req.body._id, 'work._id': req.body.workId }).populate('jobs.job');
    
    const workToUpdateInd = employeeToUpdate.work.findIndex(work => work._id.toString() === req.body.workId);

    employeeToUpdate.work[workToUpdateInd] = { 
      _id: req.body.workId,
      title: req.body.title,
      company: req.body.company,
      employmentType: req.body.employmentType,
      startDate: new Date(req.body.startDate),
      endDate: req.body.endDate ? new Date(req.body.endDate) : null,
    };
    await employeeToUpdate.save();

    sortWorkByEndDate(employeeToUpdate.work);
    
    res.status(201).json({
      type: 'success',
      employee: employeeToUpdate
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
    const employeeToUpdate = await Employee.findOneAndUpdate(
      { _id: req.query._id }, 
      { $pull: {
          'work' : { 
            _id: req.query.workId
          } 
        } 
      },
      { new: true }
    ).populate('jobs.job');

    sortWorkByEndDate(employeeToUpdate.work);
    
    res.status(201).json({
      type: 'success',
      employee: employeeToUpdate
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, "There was an error trying to delete the experience."));
  }
};











