
const { validationResult } = require('express-validator');

const Employee = require('../models/employee');
const Company = require('../models/company');
const Position = require('../models/position');


exports.userEmailExistValidation = async (email, res, _id = null) => {
  const employee = await Employee.findOne({ _id: { $ne: _id }, email: email });
  const company = await Company.findOne({ _id: { $ne: _id }, email: email });
  if(employee || company){
    res.status(422).json({
      messages: ['This email address is already in use, please provide a different one'],
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
      messages: ['A company with this name already exist, please provide a different one'],
      type: 'failure'
    });
    return true;
  }
  return false;
};


exports.handleValidationRoutesErrors = ( req, res ) => {
  const reqErrors = validationResult(req);
  if(!reqErrors.isEmpty()){
    let messages = reqErrors.errors.reduce((prev, curr) => {
      prev.push(curr['msg']);
      return prev;
    }, []);
    res.status(422).json({
      type: 'failure',
      messages
    });
    return true;
  }
  return false;
};


exports.positionTitleExistForCompanyValidation = async (title, res, companyId, posId = null) => {
  const position = await Position.findOne({ 
    _id: { $ne: posId } , companyId: companyId , title: title 
  });
  if(position){
    res.status(422).json({
      messages: ['You already have a position with that title, please choose a different one'],
      type: 'failure'
    });
    return true;
  }
  return false;
};



