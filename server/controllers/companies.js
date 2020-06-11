


const Company = require('../models/company');
const validation = require('../utils/validation');
const errorHandling = require('../utils/errorHandling');
const getBulkArrayForUpdate = require('../utils/shared').getBulkArrayForUpdate;
const getNullKeysForUpdate = require('../utils/shared').getNullKeysForUpdate;
const checkCompanyUpdateSignupValidation = require('../utils/shared').checkCompanyUpdateSignupValidation
const changeStatusOfAUserJob = require('../utils/shared').changeStatusOfAUserJob;
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
        .populate({ path: 'jobs', select: '-__v'});

    company = company.toObject();
    
    res.status(200).json({
      type: 'success',
      company: company
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, "There was an error fetching the company."));
  }
};

getPrevDays = days => {
  const today = new Date();
  const lastDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - days);
  return lastDate;
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
 *                                        {string} page - the page the user is in.
 * @param {express respond object} res
 */
exports.fetchCompanies = async (req, res, next) => {
  try {
    const routeErrors = validation.handleValidationRoutesErrors(req);
    if(routeErrors.type === 'failure') {
      return sendMessagesResponse(res, 422, routeErrors.messages, 'failure');
    }
    
    let companyQuery = {};
    if (req.query.searchQuery) {
      const search = JSON.parse(req.query.searchQuery);
      if(search.name) {
        companyQuery['name'] = search.name;
      }
      if(search.job) {
        companyQuery['jobs.title'] = search.job;
      }
      if (search.published) {
        switch(search.published) {
          case 'day':
            companyQuery['jobs.date'] = { '$gt': getPrevDays(1) };
            break;
          case 'week':
            companyQuery['jobs.date'] = { '$gt': getPrevDays(7) };
            break;
          case 'month':
            companyQuery['jobs.date'] = { '$gt': getPrevDays(30) };
            break;
        }
      }
    }

    const lookupJobs = { $lookup: {
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
          "company.refreshToken": 0,
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
    };
    
    const companies = await Company.aggregate([
      lookupJobs,
      { $match: companyQuery },
      { $skip: skippedDocuments(req.query.page) },
      { $limit: +process.env.DOCS_PER_PAGE },
      { $project: { createdAt: 0, updatedAt: 0, __v: 0, password: 0, applicants: 0, refreshToken: 0 } },
    ]);
        
    let total = await Company.aggregate([
      lookupJobs,
      { $match: companyQuery },
      { $count: 'email' }
    ]);
    total = total[0] ? total[0].email : 0;
    res.status(200).json({
      type: 'success',
      companies,
      total
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, "There was an error fetching the companies."));
  }
};


/**
 * If a file was received - adds its url (protocol and host) path to the body of the request 
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
 *                                                which every path is separated by env.process.SPLIT_COMPANY_OLD_IMAGES_BY.
 * @param {object} files - object that has an imagesPath property which is
 *                                an array of paths to new images of the company.
 */
const getNonProfileImages = (req, files) => {
  if(files.imagesPath || req.body.firebaseImagesUrl) { 
    const newUrls = []; 
    if (process.env.NODE_ENV === 'production') {
      newUrls.push(...req.body.firebaseImagesUrl.split(process.env.SPLIT_COMPANY_OLD_IMAGES_BY));
    } else {
      files.imagesPath.forEach(file => {
        let url = req.protocol + '://' + req.get('host');
        url = url + '/images/' + file.filename;
        newUrls.push(url);
      });
    }
    const oldImages = req.query.oldImages.split(process.env.SPLIT_COMPANY_OLD_IMAGES_BY);
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
    const keptImages = req.query.oldImages.split(process.env.SPLIT_COMPANY_OLD_IMAGES_BY).filter(val => !!val);
    req.body.imagesPath = keptImages;
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
 *                                                which every path is separated by env.process.SPLIT_COMPANY_OLD_IMAGES_BY.
 */
const updateReqImages = (req) => {
  getNonProfileImages(req, req.files);
  getProfileImage(req, req.files.profileImagePath);
};

const getUpdateQuery = async req => {
  Reflect.deleteProperty(req.body, 'imagesPath');
  updateReqImages(req);
  // get an object with keys to delete from the company document (all keys that are null)
  const companyRemovableKeys = ['website', 'description'];
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
    
    for (let [key, value] of Object.entries(req.body)) {
      req.body[key] = typeof value === 'string' && key !== 'profileImagePath' ? value.toLowerCase() : value;
    }

    const bulkRes = await Company.bulkWrite(await getUpdateQuery(req));
    if(!bulkRes.result.nMatched){
      throw new Error("Trying to update a non existing company");
    }
    
    let updatedCompany = await Company.findById(req.body._id).select(
                            '-__v -createdAt -updatedAt -resetPassToken -resetPassTokenExpiration -password -refreshToken -jobs -applicants'
                          );
                          
    res.status(201).json({
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






