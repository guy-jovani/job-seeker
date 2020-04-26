
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Employee = require('../models/employee');
const Company = require('../models/company');
const Job = require('../models/job');


exports.userEmailExistValidation = async (email, _id = null) => {
  const employee = await Employee.findOne({ _id: { $ne: _id }, email: email });
  const company = await Company.findOne({ _id: { $ne: _id }, email: email });
  if(employee || company){
    return {
      messages: ['This email address is already in use, please provide a different one.'],
      type: 'failure'
    }
  }
  return {
    messages: [],
    type: 'success'
  }
};

exports.companyNameExistValidation = async (name, _id = null) => {
  const company = await Company.findOne({ _id: { $ne: _id }, name: name });
  if(company){
    return {
      messages: ['A company with this name already exist, please provide a different one.'],
      type: 'failure'
    }
  }
  return {
    messages: [],
    type: 'success'
  }
};

exports.handleValidationRoutesErrors = req => {
  const reqErrors = validationResult(req);
  if(!reqErrors.isEmpty()){
    let messages = reqErrors.errors.reduce((prev, curr) => {
      if(!prev.includes(curr['msg'])) {
        prev.push(curr['msg']);
      }
      return prev;
    }, []);
    return {
      type: 'failure',
      messages
    }
  }
  return {
    messages: [],
    type: 'success'
  }
};

exports.jobTitleExistForCompanyValidation = async (title, companyId, jobId = null) => {
  const jobs = await Job.find({ 
    _id: { $ne: mongoose.Types.ObjectId(jobId) }, company: companyId, title: title 
  });

  if(jobs.length){
    return {
      messages: ['You already have a job with that title, please choose a different one.'],
      type: 'failure'
    }
  }
  return {
    messages: [],
    type: 'success'
  }
};



