

const Employee = require('../models/employee');
const validation = require('../utils/validation');
const errorHandling = require('../utils/errorHandling')
const getBulkArrayForUpdate = require('../utils/shared').getBulkArrayForUpdate;
const getNullKeysForUpdate = require('../utils/shared').getNullKeysForUpdate;
const sendMessagesResponse = require('../utils/shared').sendMessagesResponse;
const changeStatusOfAUserPosition = require('../utils/shared').changeStatusOfAUserPosition;


exports.fetchSingle = async (req, res, next) => {
  try {throw "111"
    const employee = await Employee.findById(req.query._id).select('_id email firstName lastName profileImagePath');
    res.status(200).json({
      type: 'success',
      employee
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, "there was an error fetching the employee"));
  }
};

exports.fetchAll = async (req, res, next) => {
  try {
    const employees = await Employee.find({_id: { $ne: req.query._id }}).select('_id email firstName lastName profileImagePath');
    res.status(200).json({
      type: 'success',
      employees
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, "there was an error fetching the employees"));
  }
};



const updateReqProfileImage = (req, res, next) => {
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
    const routeErros = validation.handleValidationRoutesErrors(req);
    if(routeErros.type === 'failure') {
      return sendMessagesResponse(res, 422, routeErros.messages, 'failure');
    } 
    const emailExist = await validation.userEmailExistValidation(req.body.email, req.body._id);
    if(emailExist.type === 'failure'){
      return sendMessagesResponse(res, 422, emailExist.messages, 'failure');
    }

    const bulkRes = await Employee.bulkWrite(await getUpdateQuery(req));
    if(!bulkRes.result.nMatched){
      throw new Error("Trying to update a non exisitng employee.");
    }
    let updatedEmployee = await Employee.findById(req.body._id).select(
        '-__v -password -resetPassToken -resetPassTokenExpiration').populate('positions');

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


exports.applySavePosition = async (req, res, next) => {
  try {
    await changeStatusOfAUserPosition(req, res, req.body.companyId, req.body.employeeId, req.body.positionId, req.body.status, 'employee')
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, `There was an error updating the status of the wanted position.`));
  }
};














