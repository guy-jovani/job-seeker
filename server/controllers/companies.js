
const mongoose = require('mongoose');

const Company = require('../models/company');
// const Employee = require('../models/employee');
const validation = require('../utils/validation');
const errorHandling = require('../utils/errorHandling');
const getBulkArrayForUpdate = require('../utils/shared').getBulkArrayForUpdate;
const getNullKeysForUpdate = require('../utils/shared').getNullKeysForUpdate;


exports.getCompany = async (req, res, next) => {
  try {
    const company = await Company.aggregate([
                { "$match": { '_id':  mongoose.Types.ObjectId(req.query._id) } },
                { "$project": { 'createdAt': 0, 'updatedAt': 0, '__v': 0, 'password': 0 } }
              ]);
    res.status(200).json({
      type: 'success',
      company: company[0]
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, "there was an error fetching the company"));
  }
};

exports.getCompanies = async (req, res, next) => {
  try {
    const companies = await Company.aggregate([
                { "$match": { '_id': { $ne: mongoose.Types.ObjectId(req.query._id) }}},
                { "$project": { 'createdAt': 0, 'updatedAt': 0, 'website': 0, 'email': 0, '__v': 0, 'password': 0 } }
              ]);
    res.status(200).json({
      type: 'success',
      companies
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, "there was an error fetching the companies"));
  }
};


const updateReqImagePath = req => {
  if(req.file) { // new image for company 
    let url = req.protocol + '://' + req.get('host');
    url = url + '/images/' + req.file.filename;
    req.body.imagePath = url;
    return true;
  }   
  return false;
};

const getUpdateQuery = (req) => {
  let newImage = updateReqImagePath(req);

  // get an object with keys to delete from the company document (all keys that are null)
  const companyRemovableKeys = ['name', 'website', 'description', 'imagePath'];
  const nullKeys = getNullKeysForUpdate(req, companyRemovableKeys);
  if(req.query.removeImage === 'true' && !newImage) nullKeys.imagePath = ''; 
  
  return getBulkArrayForUpdate(req, nullKeys);
};

exports.updateCompany = async (req, res, next) => {
  try {
    if(validation.handleValidationRoutesErrors(req, res)) return;
    const nameExist = await validation.companyNameExistValidation(req.body.name, res, req.body._id);
    if(nameExist) return;
       
    const bulkRes = await Company.bulkWrite(getUpdateQuery(req));
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











// const getFilteredCompany = company => {
//   // filter a company object from fileds that shouldn't return to the client
//   const companyFieldsNotToReturn = ['__v', 'createdAt', 'updatedAt'];
//   return Object.keys(company._doc)
//               .filter(key => !companyFieldsNotToReturn.includes(key))
//               .reduce((obj, key) => (obj[key] = company._doc[key], obj), {});
// } 
// 
// exports.register = async (req, res, next) => {
//   try {
//     if(validation.handleValidationRoutesErrors(req, res)) return;
//     const nameExist = await validation.companyNameExistValidation(req.body.name, res);
//     if(nameExist) return;
//     let company = await Company.create( { ...req.body } );
//     if(req.file) {
//       const url = req.protocol + '://' + req.get('host');
//       const imagePath = url + '/images/' + req.file.filename;
//       company.imagePath = imagePath;
//       await company.save();
//     }
//     // gets a company object without the fields that shouldn't return         
//     company = getFilteredCompany(company);
// 
//     res.status(201).json({
//       message: 'company created successfully!',
//       type: 'success',
//       company
//     });
//   } catch (error) {
//     next(errorHandling.handleServerErrors(error, 500, "there was an error fetching the company"));
//   }
// };