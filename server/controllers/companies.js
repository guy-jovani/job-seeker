
const mongoose = require('mongoose');

const Company = require('../models/company');
const validation = require('../utils/validation');
const errorHandling = require('../utils/errorHandling');
const getBulkArrayForUpdate = require('../utils/shared').getBulkArrayForUpdate;
const getNullKeysForUpdate = require('../utils/shared').getNullKeysForUpdate;
const chackCompanyUpdateSignupValidation = require('../utils/shared').chackCompanyUpdateSignupValidation

exports.fetchSingle = async (req, res, next) => {
  try { 
    let company = await Company.findById(req.query._id).select(
      '_id email name website description imagePath positionsIds').populate('positionsIds');

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
    const companies = await Company.aggregate([
      { $match: { _id: { $ne: mongoose.Types.ObjectId(req.query._id)} } },
      { $project: { positionsIds: 0, createdAt: 0, updatedAt: 0, __v: 0, password: 0 } },
      { $lookup: {
        from: "positions",
        let: { company_id: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: [ "$companyId", "$$company_id" ] } } },
          { $lookup: {
            from: "companies",
            localField: "companyId",
            foreignField: "_id",
            as: "companyId" }
          },
          { $unwind: "$companyId" },
          { $project: {
            "__v": 0,
            "companyId.positionsIds": 0,
            "companyId.password": 0,
            "companyId.createdAt": 0,
            "companyId.updatedAt": 0,
            "companyId.description": 0,
            "companyId.__v": 0,
            "companyId.email": 0, }
          }
        ],
        as: "positions" }
      }
    ])

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
    const routeErros = validation.handleValidationRoutesErrors(req);
    if(routeErros.type === 'failure') {
      return sendMessagesResponse(res, 422, routeErros.messages, 'failure');
    }
    const companyValid = await chackCompanyUpdateSignupValidation(req, signup = false);
    if(companyValid.type === 'failure'){
      return sendMessagesResponse(res, 422, companyValid.messages, 'failure');
    }
    
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









