
const mongoose = require('mongoose');

const Company = require('../models/company');
const validation = require('../utils/validation');
const errorHandling = require('../utils/errorHandling');
const getBulkArrayForUpdate = require('../utils/shared').getBulkArrayForUpdate;
const getNullKeysForUpdate = require('../utils/shared').getNullKeysForUpdate;
const checkCompanyUpdateSignupValidation = require('../utils/shared').checkCompanyUpdateSignupValidation
const changeStatusOfAUserJob = require('../utils/shared').changeStatusOfAUserjob;
const skippedDocuments = require('../utils/shared').skippedDocuments;


/**
 * Send the client a company object with its jobs populated with the company name.
 * 
 * In case of an error - moving the error handling to the express error handling middleware
 * with a error code of 500, and an error message
 * @param {express request object} req - the req need to have query params: 
 *                                        {string} _id - the id of the wanted company.
 * @param {express respond object} res
 */
exports.fetchSingle = async (req, res, next) => {
  try { 
    let company = await Company.findById(req.query._id).select(
      '_id email name website description imagesPath jobs')
        .populate({
          path: 'jobs', 
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


/**
 * Send the client an object of an array of all the companies (excluded the user company),
 * based on the page the user is in, and the total number of companies.
 * 
 * Each company object is populated with the jobs of the company,
 * each job is populated with the name of the company.
 * 
 * In case of an error - moving the error handling to the express error handling middleware
 * with a error code of 500, and an error message
 * @param {express request object} req - the req need to have query params: 
 *                                        {string} _id - the id of the user.
 *                                        {string} kind - the kind of the user ('employee' | 'company').
 *                                        {string} page - the page the user is in.
 * @param {express respond object} res
 */
exports.fetchCompanies = async (req, res, next) => {
  try {
    const companies = await Company.aggregate([
      { $match: { _id: { $ne: mongoose.Types.ObjectId(req.query._id) } } },
      { $skip: skippedDocuments(req.query.page) },
      { $limit: +process.env.DOCS_PER_PAGE },
      { $project: { jobs: 0, createdAt: 0, updatedAt: 0, __v: 0, password: 0, applicants: 0 } },
      { $lookup: {
        from: "jobs",
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
            "company.jobs": 0,
            "company.applicants": 0,
            "company.imagesPath": 0,
            "company.profileImagePath": 0,
            "company.password": 0,
            "company.createdAt": 0,
            "company.website": 0,
            "company.updatedAt": 0,
            "company.description": 0,
            "company.__v": 0,
            "company.email": 0, }
          }
        ],
        as: "jobs" }
      }
    ]);

    const total = await Company.aggregate([
      { $match: { _id: { $ne: mongoose.Types.ObjectId(req.query._id) } } },
      { $count: 'email' }
    ]);

    res.status(200).json({
      type: 'success',
      companies,
      total: req.query.kind === 'company' ? total[0].email - 1 : total[0].email
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, "There was an error fetching the companies."));
  }
};


/**
 * If a file was recieved - adds its url (protcol and host) path to the body of the request 
 * as profileImagePath property.
 * 
 * @param {express request object} req
 * @param {Array} file - an array of files that will be empty or with one File object that
 *                            have a filename property.
 */
const getProfileImage = (req, file) => {
  if(file){
    let url = req.protocol + '://' + req.get('host');
    url = url + '/images/' + file[0].filename;
    req.body.profileImagePath = url;
  } 
};

/**
 * Decides if need to keep a company old images or replace them with new ones.
 * Adds the new images paths as an array to req.body.imagesPath or,
 * adds the old images path to req.body.imagesPath
 * 
 * depends if there are new images or not.
 * 
 * @param {express request object} req - the req need to have query params: 
 *                           {string} oldImages - a string of current paths to the company images,
 *                                                which every path is separated by '%%RandomjoiN&&'.
 * @param {object} files - object that has an imagesPath property which is
 *                                an array of paths to new images of the company.
 */
const getNonProfileImages = (req, files) => {
  if(files.imagesPath) { // new images for company
    let newUrls = []; 
    files.imagesPath.forEach(file => {
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


/**
 * Updates the body of the request object with new images of the company as an array of paths to them 
 * in req.body.imagesPath, or adds the old images path to req.body.imagesPath.
 * 
 * Also adds to req.body.profileImagePath the new profileImage of the company (if exists).
 * 
 * @param {express request object} req - the req need to have query params: 
 *                           {string} oldImages - a string of current paths to the company images,
 *                                                which every path is separated by '%%RandomjoiN&&'.
 */
const updateReqImages = async (req) => {
  getNonProfileImages(req, req.files);
  getProfileImage(req, req.files.profileImagePath);
};

const getUpdateQuery = async req => {
  Reflect.deleteProperty(req.body, 'imagesPath');
  updateReqImages(req);
  // get an object with keys to delete from the company document (all keys that are null)
  const companyRemovableKeys = ['name', 'website', 'description'];
  const nullKeys = getNullKeysForUpdate(req, companyRemovableKeys);

  if (req.body.profileImagePath === '') nullKeys['profileImagePath'] = '';
  return await getBulkArrayForUpdate(req, nullKeys);
};

exports.updateCompany = async (req, res, next) => {
  try { 
    const routeErrors = validation.handleValidationRoutesErrors(req);
    if(routeErrors.type === 'failure') {
      return sendMessagesResponse(res, 422, routeErrors.messages, 'failure');
    }
    const companyValid = await checkCompanyUpdateSignupValidation(req, signup = false);
    if(companyValid.type === 'failure'){
      return sendMessagesResponse(res, 422, companyValid.messages, 'failure');
    }

    const bulkRes = await Company.bulkWrite(await getUpdateQuery(req));
    if(!bulkRes.result.nMatched){
      throw new Error("Trying to update a non existing company");
    }
    
    let updatedCompany = await Company.findById(req.body._id).select(
                            '-__v -createdAt -updatedAt -resetPassToken -resetPassTokenExpiration -password'
                          ).populate('jobs');
                        
    res.status(201).json({
      message: 'company updated successfully!',
      type: 'success',
      company: updatedCompany
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, "There was an error updating the company."));
  }
};


exports.acceptRejectJob = async (req, res, next) => {
  try {
    await changeStatusOfAUserJob(req, res, req.body.companyId, req.body.employeeId, req.body.jobId, req.body.status, 'company')
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, `There was an error updating the status of the wanted job.`));
  }
};





