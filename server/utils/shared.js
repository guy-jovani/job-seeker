
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const validation = require('../utils/validation');
const Employee = require('../models/employee');
const Company = require('../models/company');


exports.getSocketFileUniqueName = fileName => {
  return fileName.split('.')[0] + '-' + 
          new Date().toISOString().replace(/:/g, '-') + 
          '.' + fileName.split('.')[1];
};

exports.getSocketFileUrl = (fileName, hostName) => {
  return process.env.REQ_PROTOCOL + hostName + '/files/' + fileName;
};

const getSocketFilePath = uniqueName => {
  return path.join(__dirname, '../', 'files', uniqueName);
}

exports.saveSocketFilePath = (buffer, uniqueName) => {
  fs.writeFile(getSocketFilePath(uniqueName), buffer, (err) => {
    if(!err) console.log('File written');
  });
};

exports.skippedDocuments = page => {
  // page: 1, docs: 20 => (1 - 1) * 20 + 1 => 1
  // page: 2, docs: 20 => (2 - 1) * 20 + 1 => 21
  // page: 3, docs: 20 => (3 - 1) * 20 + 1 => 41
  return (page - 1) * process.env.DOCS_PER_PAGE + 1;
}

exports.getNullKeysForUpdate = (req, removableKeys) => {
  // get an object with keys to delete from the employee document (all the keys that are null)
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

  if(emailExist.type === 'failure' || nameExist && nameExist.type === 'failure'){
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


const newApplicant = (status, company, employeeId, positionId) => {
  if(status !== 'saved') {
    company.applicants.push({ 
      employee: employeeId, 
      positions: [ { position: positionId, status: status, date: Date.now() } ] 
    });
  }
}

const applicantUpdatePositionStatus = (status, company, positionId, applicantInd) => {
  const position = company.applicants[applicantInd].positions.find(posInfo => posInfo.position.toString() === positionId); 
  if(position){ // update position status
    position.status = status;
    position.date = Date.now();
  } else { // add new position with status
    company.applicants[applicantInd].positions.push({ position: positionId, status: status, date: Date.now() });
  }
}

const removeApplicantPosition = (company, positionId, applicantInd) => {
  let applicantPositions = company.applicants[applicantInd].positions;
  if(applicantPositions.length > 1) { // just remove the position
    company.applicants[applicantInd].positions = applicantPositions.filter(pos => pos.position.toString() !== positionId);
  } else { // remove the applicant - he has no more positions for that company
    company.applicants.splice(applicantInd, 1);
  }
}

const updateApplicant = (status, company, positionId, applicantInd) => {
  if(status !== 'saved') {
    applicantUpdatePositionStatus(status, company, positionId, applicantInd);
  } else { // need to remove the position of the applicant
    removeApplicantPosition(company, positionId, applicantInd);
  }
}

changeStatusOnCompanyApplicantsPositions = async (companyId, employeeId, positionId, status) => {
  let company = await Company.findById(companyId);
  if(!company) { return 404; }
  const applicantInd = company.applicants.findIndex(applicant => applicant.employee.toString() === employeeId);

  if (applicantInd > -1) {
    updateApplicant(status, company, positionId, applicantInd);
  } else { // new applicant
    newApplicant(status, company, employeeId, positionId, applicantInd);
  }
  company = (await company.save()).toObject();
  Reflect.deleteProperty(company, 'password');
  Reflect.deleteProperty(company, '__v');
  company = await Company.populate(company, 'positions');
  company = await Company.populate(company, { path: 'applicants.employee', select: '-__v -password'});
  company = await Company.populate(company, { path: 'applicants.positions.position', select: 'title'});
  return company;
};



exports.changeStatusOfAUserPosition = async (companyId, employeeId, positionId, status) => {
  const employee = await changeStatusOnEmployeePositions(employeeId, positionId, status);
  if(employee === 404) { 
    return 404;
  }
  const company = await changeStatusOnCompanyApplicantsPositions(companyId, employeeId, positionId, status);
  if(company === 404) {
    return 404;
  }

  return [employee, company];
}







