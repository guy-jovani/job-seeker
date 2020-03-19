
const mongoose = require('mongoose');

const Company = require('../models/company');
const validation = require('../utils/validation');
const errorHandling = require('../utils/errorHandling');
const getBulkArrayForUpdate = require('../utils/shared').getBulkArrayForUpdate;
const getNullKeysForUpdate = require('../utils/shared').getNullKeysForUpdate;
const checkCompanyUpdateSignupValidation = require('../utils/shared').checkCompanyUpdateSignupValidation
const changeStatusOfAUserPosition = require('../utils/shared').changeStatusOfAUserPosition;

exports.fetchSingle = async (req, res, next) => {
  try { 
    let company = await Company.findById(req.query._id).select(
      '_id email name website description imagesPath positions')
        .populate({
          path: 'positions', 
          populate: { path: 'company', select: 'name' }
        });
    company = company.toObject();
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
    const companies = await Company.aggregate([
      { $match: { _id: { $ne: mongoose.Types.ObjectId(req.query._id)} } },
      { $project: { positions: 0, createdAt: 0, updatedAt: 0, __v: 0, password: 0 } },
      // { $project: { positionsIds: 0, createdAt: 0, updatedAt: 0, __v: 0, password: 0 } },
      { $lookup: {
        from: "positions",
        let: { companyId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: [ "$company", "$$companyId" ] } } },
          { $lookup: {
            from: "companies",
            localField: "company",
            foreignField: "_id",
            as: "company" }
          },
          { $unwind: "$company" },
          { $project: {
            "__v": 0,
            "company.positions": 0,
            "company.password": 0,
            "company.createdAt": 0,
            "company.website": 0,
            "company.updatedAt": 0,
            "company.description": 0,
            "company.__v": 0,
            "company.email": 0, }
          }
        ],
        as: "positions" }
      }
    ]);

    res.status(200).json({
      type: 'success',
      companies
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, "there was an error fetching the companies"));
  }
};

const updateCompanyImages = async (req) => {
  if(req.files.length) { // new images for company
    let newUrls = []; 
    req.files.forEach(file => {
      let url = req.protocol + '://' + req.get('host');
      url = url + '/images/' + file.filename;
      newUrls.push(url);
    });
    const oldImages = req.query.oldImages.split('%%RandomjoiN&&');
    let updatedImageInd = 0, updatedImages = [];
    for(const index of Object.keys(oldImages)){
      if(oldImages[index]) {
        updatedImages.push(oldImages[index]);
      } else {
        updatedImages.push(newUrls[updatedImageInd]);
        updatedImageInd++;
        if(updatedImageInd >= newUrls.length) break;
      }
    }
    req.body.imagesPath = updatedImages;
  } else {
    const keptImages = req.query.oldImages.split('%%RandomjoiN&&').filter(val => !!val);
    if(keptImages.length) req.body.imagesPath = keptImages;
  }  
};

const getUpdateQuery = async (req) => {
  Reflect.deleteProperty(req.body, 'imagesPath');
  updateCompanyImages(req);
  // get an object with keys to delete from the company document (all keys that are null)
  const companyRemovableKeys = ['name', 'website', 'description'];
  const nullKeys = getNullKeysForUpdate(req, companyRemovableKeys);
  return await getBulkArrayForUpdate(req, nullKeys);
};


exports.updateCompany = async (req, res, next) => {
  try { 
    const routeErros = validation.handleValidationRoutesErrors(req);
    if(routeErros.type === 'failure') {
      return sendMessagesResponse(res, 422, routeErros.messages, 'failure');
    }
    const companyValid = await checkCompanyUpdateSignupValidation(req, signup = false);
    if(companyValid.type === 'failure'){
      return sendMessagesResponse(res, 422, companyValid.messages, 'failure');
    }
    const bulkRes = await Company.bulkWrite(await getUpdateQuery(req));
    if(!bulkRes.result.nMatched){
      throw new Error("trying to update a non exisitng company");
    }
    
    let updatedCompany = await Company.findById(req.body._id).select(
                            '-__v -createdAt -updatedAt -resetPassToken -resetPassTokenExpiration -password'
                          ).populate('positions');
                        
    // updatedCompany = updatedCompany.toObject();
    res.status(201).json({
      message: 'company updated successfully!',
      type: 'success',
      company: updatedCompany
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, "There was an error updating the company."));
  }
};


exports.acceptRejectPosition = async (req, res, next) => {
  try {
    await changeStatusOfAUserPosition(req, res, req.body.companyId, req.body.employeeId, req.body.positionId, req.body.status, 'company')
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, `There was an error updating the status of the wanted position.`));
  }
};





