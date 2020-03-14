
const bcrypt = require('bcryptjs');
const validation = require('../utils/validation');
const Employee = require('../models/employee');
const Company = require('../models/company');



exports.getNullKeysForUpdate = (req, removableKeys) => {
  // get an object with keys to delete from the employee document (all keys that are null)
  const reqBodyKeys = Object.keys(req.body);
  let nullKeys = removableKeys.filter(key => !reqBodyKeys.includes(key));
  nullKeys = nullKeys.reduce((obj, key) => (obj[key]='',  obj), {});
  return nullKeys;
};


exports.getBulkArrayForUpdate = async (req, nullKeys) => { 
  let bulkArr = [];
  if(req.body.password) {
    const password = await bcrypt.hash(req.body.password, 12);
    req.body.password = password;
  }

  bulkArr.push({ updateOne: { // updating the fields
    filter: { _id: req.body._id },
    update: { $set: { ...req.body } }
  }})
  if(Object.entries(nullKeys).length) { // deleting empty fields from the db
    bulkArr.push({updateOne: {
      filter: { _id: req.body._id },
      update: { $unset: { ...nullKeys } } 
    }})
  }
  
  return bulkArr;
};


sendMessagesResponse = (res, statusCode, messages, type) => {
  res.status(statusCode).json({ type, messages });
};

exports.sendMessagesResponse = sendMessagesResponse;


exports.checkCompanyUpdateSignupValidation = async (req, signup = true) => {
  let messages, nameExist, emailExist;
  if(signup){
    emailExist = await validation.userEmailExistValidation(req.body.email);
  } else {
    emailExist = await validation.userEmailExistValidation(req.body.email, req.body._id);
  }
  messages = emailExist.messages;
  if(req.body.name) {
    req.body.name = req.body.name.toLowerCase();
    nameExist = await validation.companyNameExistValidation(req.body.name, req.body._id);
    messages = messages.concat(nameExist.messages);
  }

  if(emailExist.type === 'failure' || nameExist.type === 'failure'){
    return {
      type: 'failure', 
      messages
    }
  }
  return {
    type: 'success',
    messages: []
  }
};


changeStatusOnEmployeePositions = async (employeeId, positionId, status) => {
  let employee = await Employee.findById(employeeId);
  if(!employee) { return 404; }
  const pos = employee.positions.find(pos => pos.position.toString() === positionId);
  if (pos) {
    pos.status = status;
    pos.date = Date.now();
  } else {
    employee.positions.push({ position: positionId, status: status, date: Date.now() })
  }
  employee = (await employee.save()).toObject();
  Reflect.deleteProperty(employee, 'password');
  Reflect.deleteProperty(employee, '__v');
  return await Employee.populate(employee, {
                                      path: 'positions.position', 
                                      populate: { path: 'company', select: 'name' } });
};

changeStatusOnCompanyApplicantsPositions = async (companyId, employeeId, positionId, status) => {
  let company = await Company.findById(companyId);
  if(!company) { return 404; }
  const applicantInd = company.applicants.findIndex(applicant => applicant.employee.toString() === employeeId);

  if (applicantInd > -1) {
    if(status !== 'saved') {
      const position = company.applicants[applicantInd].positions.find(posInfo => posInfo.position.toString() === positionId); // only required cuase there is no real time updates of the positions of the user and company
      if(position){ // update position status
        position.status = status;
        position.date = Date.now();
      } else { // add new position with stats
        company.applicants[applicantInd].positions.push({ position: positionId, status: status, date: Date.now() });
      }
    } else { // need to remove the position of the applicant
      const applicantPositions = company.applicants[applicantInd].positions;
      if(applicantPositions.length > 1) { // just remove the position
        company.applicants[applicantInd].positions = company.applicants[applicantInd].filter(pos => pos._id !== positionId);
      } else { // remove the applicant - he has no more positions for that company
        company.applicants.splice(applicantInd, 1);
      }
    }
  } else { // new applicant
    if(status !== 'saved') {
      company.applicants.push({ 
        employee: employeeId, 
        positions: [ { position: positionId, status: status, date: Date.now() } ] 
      });
    }
  }
  company = (await company.save()).toObject();
  Reflect.deleteProperty(company, 'password');
  Reflect.deleteProperty(company, '__v');
  company = await Company.populate(company, 'positions');
  company = await Company.populate(company, { path: 'applicants.employee', select: '-__v -password'});
  company = await Company.populate(company, { path: 'applicants.positions.position', select: 'title'});
  return company;
};



exports.changeStatusOfAUserPosition = async (req, res, companyId, employeeId, positionId, status, kind) => {
  const routeErros = validation.handleValidationRoutesErrors(req);
  if(routeErros.type === 'failure') {
    return sendMessagesResponse(res, 422, routeErros.messages, 'failure');
  } 
  
  const employee = await changeStatusOnEmployeePositions(employeeId, positionId, status);
  if(employee === 404) { 
    return sendMessagesResponse(res, 404, ['There was an error updating the status of the wanted position.'], 'failure');
  }
  const company = await changeStatusOnCompanyApplicantsPositions(companyId, employeeId, positionId, status);
  if(company === 404) {
    return sendMessagesResponse(res, 404, ['There was an error updating the status of the wanted position.'], 'failure');
  }

  res.status(201).json({
    message: 'Operation succeeded.',
    type: 'success',
    user: kind === 'employee' ? employee : company
  });
}







