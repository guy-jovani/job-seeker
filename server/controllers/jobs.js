


const Job = require('../models/job');
const Company = require('../models/company');
const validation = require('../utils/validation');
const errorHandling = require('../utils/errorHandling');
const sendMessagesResponse = require('../utils/shared').sendMessagesResponse;
const skippedDocuments = require('../utils/shared').skippedDocuments;



/**
 * Creates a new job and send it back to the client, populated with the company name.
 * 
 * In case of an error - moving the error handling to the express error handling middleware
 * with a error code of 500, and an error message
 * 
 * @param {express request object} req - the req need to have a body with: 
 *                                {string} _id - the id of the user (should be of a Company).
 *                                {string} title - the title of the job.
 *                                {string} company - a company object with the company _id.
 *                                {Array} requirements - array of string representing the requirements.
 * @param {express respond object} res
 */
exports.create = async (req, res, next) => {
  try {
    const routeErrors = validation.handleValidationRoutesErrors(req);
    if(routeErrors.type === 'failure') {
      return sendMessagesResponse(res, 422, routeErrors.messages, 'failure');
    }
    title = req.body.title.trim();
    const titleExist = await validation.jobTitleExistForCompanyValidation(
      title, req.body.company._id, req.body._id );
    if(titleExist.type === 'failure'){
      return sendMessagesResponse(res, 422, titleExist.messages, 'failure');
    }
    let job = new Job({ 
      title: title, description: req.body.description, 
      company: req.body.company._id, requirements: req.body.requirements, date: new Date() });

    job = await job.save();
    
    await Company.findOneAndUpdate(
      { _id: req.body.company._id }, 
      { $push: {'jobs' : job._id } },
      { new: true }
    );
    
    job = await Job.populate(job, { path: 'company', select: 'name' } );
    Reflect.deleteProperty(job, '__v');
    res.status(200).json({
      type: 'success',
      job
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, "There was an error creating the job."));
  }
};


/**
 * Updates a Job and send it back to the client, populated with the company name.
 * 
 * In case of an error - moving the error handling to the express error handling middleware
 * with a error code of 500, and an error message
 * 
 * @param {express request object} req - the req need to have a body with: 
 *                                {string} _id - the id of the user (should be of a Company).
 *                                {string} title - the title of the job.
 *                                {string} company - a company object with the company _id.
 * @param {express respond object} res
 */
exports.updateJob = async (req, res, next) => {
  try {
    const routeErrors = validation.handleValidationRoutesErrors(req);
    if(routeErrors.type === 'failure') {
      return sendMessagesResponse(res, 422, routeErrors.messages, 'failure');
    }
    title = req.body.title.trim();
    const titleExist = await validation.jobTitleExistForCompanyValidation(
      title, req.body.company._id, req.body._id );
    if(titleExist.type === 'failure'){
      return sendMessagesResponse(res, 422, titleExist.messages, 'failure');
    }
    
    await Job.findOneAndUpdate(
      { _id: req.body._id }, 
      { ...req.body, title: title, date: new Date() }
    ); 
    res.status(200).json({
      type: 'success',
      job: {...req.body, date: new Date()}
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, "There was an error updating the job."));
  }
};


/**
 * Send the client a job object populated with the company name.
 * 
 * In case of an error - moving the error handling to the express error handling middleware
 * with a error code of 500, and an error message
 * @param {express request object} req - the req need to have query params: 
 *                                        {string} _id - the id of the wanted job.
 * @param {express respond object} res
 */
exports.fetchSingle = async (req, res, next) => {
  try {throw "111"
    const job = await Job.findById({ _id: req.query._id} ).select('-__v')
                .populate({path: 'company', select: 'name'});
    res.status(200).json({
      type: 'success',
      job
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, "There was an error fetching the job."));
  }
};



/**
 * Send the client an object of an array of all the jobs populated with their company name.
 * 
 * In case of an error - moving the error handling to the express error handling middleware
 * with a error code of 500, and an error message
 * @param {express request object} req
 * @param {express respond object} res
 */
exports.fetchJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find()
        .skip(skippedDocuments(req.query.page))
        .limit(+process.env.DOCS_PER_PAGE)
        .select('_id title company description requirements date')
        .populate({ path: 'company', select: 'name' });

    const total = await Job.aggregate([
      { $count: 'title' }
    ]);

    res.status(200).json({
      type: 'success',
      jobs,
      total: total[0].title
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, "There was an error fetching the jobs."));
  }
};






















