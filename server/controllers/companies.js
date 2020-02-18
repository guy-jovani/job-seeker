
const mongoose = require('mongoose');

const Company = require('../models/company');
const validation = require('../utils/validation');
const errorHandling = require('../utils/errorHandling');
const getBulkArrayForUpdate = require('../utils/shared').getBulkArrayForUpdate;
const getNullKeysForUpdate = require('../utils/shared').getNullKeysForUpdate;


exports.fetchSingle = async (req, res, next) => {
  try {
    let company = await Company.findById(req.query._id).select('_id email name imagePath positionIds')
                                    .populate('positionsIds');

    company = company.toObject();
    Reflect.set(company, 'positions', company['positionsIds']);
    Reflect.deleteProperty(company, 'positionsIds');

    res.status(200).json({
      type: 'success',
      company: company
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, "there was an error fetching the company"));
  }
};

exports.fetchAll = async (req, res, next) => {
  try {
    const companies = await Company.find({_id: { $ne: req.query._id }}).select('_id name description');
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

const getUpdateQuery = async (req) => {
  let newImage = updateReqImagePath(req);

  // get an object with keys to delete from the company document (all keys that are null)
  const companyRemovableKeys = ['name', 'website', 'description', 'imagePath'];
  const nullKeys = getNullKeysForUpdate(req, companyRemovableKeys);
  if(req.query.removeImage === 'true' && !newImage) nullKeys.imagePath = ''; 

  return await getBulkArrayForUpdate(req, nullKeys);
};

exports.updateCompany = async (req, res, next) => {
  try {
    if(validation.handleValidationRoutesErrors(req, res)) return;
    if(await validation.companyNameExistValidation(req.body.name, res, req.body._id)) return;
    if(await validation.userEmailExistValidation(req.body.email, res, req.body._id)) return;
    
    const bulkRes = await Company.bulkWrite(await getUpdateQuery(req));
    if(!bulkRes.result.nMatched){
      throw new Error("trying to update a non exisitng company");
    }

    let updatedCompany = await Company.findById(req.body._id).select(
                            '-__v -createdAt -updatedAt -resetPassToken -resetPassTokenExpiration -password'
                          ).populate('positionsIds');
    
    updatedCompany = updatedCompany.toObject();
    Reflect.set(updatedCompany, 'positions', updatedCompany['positionsIds']);
    Reflect.deleteProperty(updatedCompany, 'positionsIds');
    res.status(201).json({
      message: 'company updated successfully!',
      type: 'success',
      company: updatedCompany
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