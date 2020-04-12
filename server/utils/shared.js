const jwt = require('jsonwebtoken');
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
  // page: 1, docs: 20 => (1 - 1) * 20 => 0
  // page: 2, docs: 20 => (2 - 1) * 20 => 20
  // page: 3, docs: 20 => (3 - 1) * 20 => 40
  return (page - 1) * +process.env.DOCS_PER_PAGE;
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


changeStatusOnEmployeeJobs = async (employeeId, jobId, status) => {
  let employee = await Employee.findById(employeeId);
  if(!employee) { return 404; }
  const pos = employee.jobs.find(pos => pos.job.toString() === jobId);
  if (pos) {
    pos.status = status;
    pos.date = Date.now();
  } else {
    employee.jobs.push({ job: jobId, status: status, date: Date.now() })
  }
  employee = (await employee.save()).toObject();
  Reflect.deleteProperty(employee, 'password');
  Reflect.deleteProperty(employee, '__v');
  return await Employee.populate(employee, {
                                      path: 'jobs.job', 
                                      populate: { path: 'company', select: 'name' } });
};


const newApplicant = (status, company, employeeId, jobId) => {
  if(status !== 'saved') {
    company.applicants.push({ 
      employee: employeeId, 
      jobs: [ { job: jobId, status: status, date: Date.now() } ] 
    });
  }
}

const applicantUpdateJobStatus = (status, company, jobId, applicantInd) => {
  const job = company.applicants[applicantInd].jobs.find(posInfo => posInfo.job.toString() === jobId); 
  if(job){ // update job status
    job.status = status;
    job.date = Date.now();
  } else { // add new job with status
    company.applicants[applicantInd].jobs.push({ job: jobId, status: status, date: Date.now() });
  }
}

const removeApplicantJob = (company, jobId, applicantInd) => {
  let applicantJobs = company.applicants[applicantInd].jobs;
  if(applicantJobs.length > 1) { // just remove the job
    company.applicants[applicantInd].jobs = applicantJobs.filter(pos => pos.job.toString() !== jobId);
  } else { // remove the applicant - he has no more jobs for that company
    company.applicants.splice(applicantInd, 1);
  }
}

const updateApplicant = (status, company, jobId, applicantInd) => {
  if(status !== 'saved') {
    applicantUpdateJobStatus(status, company, jobId, applicantInd);
  } else { // need to remove the job of the applicant
    removeApplicantJob(company, jobId, applicantInd);
  }
}

changeStatusOnCompanyApplicantsJobs = async (companyId, employeeId, jobId, status) => {
  let company = await Company.findById(companyId);
  if(!company) { return 404; }
  const applicantInd = company.applicants.findIndex(applicant => applicant.employee.toString() === employeeId);

  if (applicantInd > -1) {
    updateApplicant(status, company, jobId, applicantInd);
  } else { // new applicant
    newApplicant(status, company, employeeId, jobId, applicantInd);
  }
  company = (await company.save()).toObject();
  Reflect.deleteProperty(company, 'password');
  Reflect.deleteProperty(company, '__v');
  company = await Company.populate(company, 'jobs');
  company = await Company.populate(company, { path: 'applicants.employee', select: '-__v -password'});
  company = await Company.populate(company, { path: 'applicants.jobs.job', select: 'title'});
  return company;
};



exports.changeStatusOfAUserJob = async (companyId, employeeId, jobId, status) => {
  const employee = await changeStatusOnEmployeeJobs(employeeId, jobId, status);
  if(employee === 404) { 
    return 404;
  }
  const company = await changeStatusOnCompanyApplicantsJobs(companyId, employeeId, jobId, status);
  if(company === 404) {
    return 404;
  }

  return [employee, company];
}


/**
 * Creates a Jason Web Token, that expires in process.env.JWT_TOKEN_EXPIRATION_SECONDS
 * with information about the user id, email and kind.
 * @param {object} user - A user object (Employee | Company). 
 * @param {string} kind - the kind of the user ('employee' | 'company'). 
 * @return {string} - the accessToken.
 */
getAndCreateAccessToken = (user, kind) => {

  const accessToken = jwt.sign({
    userId: user._id,
    kind,
    email: user.email
  }, process.env.SECRET_TOKEN_KEY, { expiresIn: process.env.JWT_TOKEN_EXPIRATION_SECONDS +'s' });

  return accessToken;
};

exports.getAndCreateAccessToken = getAndCreateAccessToken;

/**
 * Creates a Refresh Jason Web Token - with no expiration.
 * saves the token on the db.
 * With information about the user id, email and kind.
 * Saves the token to the user object in the db.
 * 
 * @param {object} user - A user object (Employee | Company). 
 * @param {string} kind - the kind of the user ('employee' | 'company'). 
 * @return {string} - the refreshToken.
 */
getAndCreateRefreshToken = async (user, kind) => {
  const refreshToken = jwt.sign({
    userId: user._id,
    kind,
    email: user.email
  }, process.env.SECRET_TOKEN_KEY );
  user.refreshToken = refreshToken;
  await user.save();
  return refreshToken;
};


/**
 * Creates a Jason Web Token, that expires in process.env.JWT_TOKEN_EXPIRATION_SECONDS
 * with information about the user id.
 * @param {object} user - A user object (Employee | Company). 
 * @param {string} kind - the kind of the user ('employee' | 'company'). 
 * @return {Array.<{accessToken: string, refreshToken: string}>} - the accessToken and the refreshToken.
 */
exports.getAndCreateTokens = async (user, kind) => {
  return [getAndCreateAccessToken(user, kind),
          await getAndCreateRefreshToken(user, kind)];
}




