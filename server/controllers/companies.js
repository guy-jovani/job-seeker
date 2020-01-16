
const mongoose = require('mongoose');

const Company = require('../models/company');
const Employee = require('../models/employee');
const validation = require('../utils/validation');
const errorHandling = require('../utils/errorHandling')



exports.getCompany = async (req, res, next) => {
  try {
    const company = await Company.aggregate([
                { "$match": { '_id':  mongoose.Types.ObjectId(req.query._id) } },
                { "$project": { 'createdAt': 0, 'updatedAt': 0, '__v': 0 } }
              ]);
    res.status(200).json({
      type: 'success',
      company
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, "there was an error fetching the company"));
  }
};

exports.getCompanies = async (req, res, next) => {
  try {
    const companies = await Company.aggregate([
                { "$project": { 'createdAt': 0, 'updatedAt': 0, '__v': 0 } }
              ]);
    res.status(200).json({
      type: 'success',
      companies
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, "there was an error fetching the companies"));
  }
};


const getFilteredCompany = company => {
  // filter a company object from fileds that shouldn't return to the client
  const companyFieldsNotToReturn = ['__v', 'createdAt', 'updatedAt'];
  return Object.keys(company._doc)
              .filter(key => !companyFieldsNotToReturn.includes(key))
              .reduce((obj, key) => (obj[key] = company._doc[key], obj), {});
} 

exports.register = async (req, res, next) => {
  try {
    if(validation.handleValidationRoutesErrors(req, res)) return;
    const nameExist = await validation.companyNameExistValidation(req.body.name, res);
    if(nameExist) return;
    let company = await Company.create( { ...req.body } );
    if(req.file) {
      const url = req.protocol + '://' + req.get('host');
      const imagePath = url + '/images/' + req.file.filename;
      company.imagePath = imagePath;
      await company.save();
    }
    // gets a company object without the fields that shouldn't return         
    company = getFilteredCompany(company);
    
    res.status(201).json({
      message: 'company created successfully!',
      type: 'success',
      company
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, "there was an error fetching the company"));
  }
};

exports.updateCompany = async (req, res, next) => {
  try {
    if(validation.handleValidationRoutesErrors(req, res)) return;
    const nameExist = await validation.companyNameExistValidation(req.body.name, res, req.body._id);
    if(nameExist) return;
    let url = null, imagePath = null;
    if(req.file) { // new image for company
      url = req.protocol + '://' + req.get('host');
      imagePath = url + '/images/' + req.file.filename;
      req.body.imagePath = imagePath;
    }        
    // get an object with keys to delete from the company document (all keys that are null)
    const companyEditableKeys = ['name', 'website', 'description', 'imagePath'];
    const reqBodyKeys = Object.keys(req.body);
    let nullKeys = companyEditableKeys.filter(key => !reqBodyKeys.includes(key));
    nullKeys = nullKeys.reduce((obj, key) => (obj[key]='',  obj), {});
    let bulkArr = [];
    if(!nullKeys.imagePath) delete nullKeys.imagePath; // so we don't override an existing image
    bulkArr.push({ updateOne: {
      filter: { _id: req.body._id },
      update: { $set: { ...req.body } }
    }})

    if(Object.entries(nullKeys).length) {
      bulkArr.push({updateOne: {
        filter: { _id: req.body._id },
        update: { $unset: { ...nullKeys } } 
      }})
    }
    const bulkRes = await Company.bulkWrite(bulkArr);
    if(!bulkRes.result.nMatched){
      throw new Error("trying to update a non exisitng company");
    }
    const updatedCompany = await Company.aggregate([
                { "$match": { '_id':  mongoose.Types.ObjectId(req.body._id) } },
                { "$project": { 'createdAt': 0, 'updatedAt': 0, '__v': 0 } }
              ]);
    res.status(201).json({
      message: 'company updated successfully!',
      type: 'success',
      company: updatedCompany[0]
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, "there was an error updating the company"));
  }
};