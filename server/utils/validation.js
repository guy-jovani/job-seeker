
const { validationResult } = require('express-validator');

const Employee = require('../models/employee');
const Company = require('../models/company');


exports.userEmailExistValidation = async (email, res, _id = null) => {
  const employee = await Employee.findOne({ _id: { $ne: _id }, email: email });
  const company = await Company.findOne({ _id: { $ne: _id }, email: email });
  if(employee || company){
    res.status(422).json({
      errors: [{
        msg: 'You can not use this email address, please provide a different one'
      }],
      type: 'failure'
    });
    return true;
  }
  return false;
};

exports.companyNameExistValidation = async (name, res, _id = null) => {
  const company = await Company.findOne({ _id: { $ne: _id }, name: name });
  if(company){
    res.status(422).json({
      errors: [{
        msg: 'A company with this name already exist, please provide a different one'
      }],
      type: 'failure'
    });
    return true;
  }
  return false;
};


exports.handleValidationRoutesErrors = ( req, res ) => {
  const reqErrors = validationResult(req);
  if(!reqErrors.isEmpty()){
    res.status(422).json({
      type: 'failure',
      errors: reqErrors.errors
    });
    return true;
  }
  return false;
};