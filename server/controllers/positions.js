


const Position = require('../models/position');
const Company = require('../models/company');
const validation = require('../utils/validation');
const errorHandling = require('../utils/errorHandling');
const sendMessagesResponse = require('../utils/shared').sendMessagesResponse;



/**
 * Creates a new Position and send it back to the client, populated with the company name.
 * 
 * In case of an error - moving the error handling to the express error handling middleware
 * with a error code of 500, and an error message
 * 
 * @param {express request object} req - the req need to have a body with: 
 *                                {string} _id - the id of the user (should be of a Company).
 *                                {string} title - the title of the position.
 *                                {string} company - a company object with the company _id.
 *                                {Array} requirements - array of string representing the requirements.
 * @param {express respond object} res
 */
exports.create = async (req, res, next) => {
  try {
    const routeErros = validation.handleValidationRoutesErrors(req);
    if(routeErros.type === 'failure') {
      return sendMessagesResponse(res, 422, routeErros.messages, 'failure');
    }
    title = req.body.title.trim();
    const titleExist = await validation.positionTitleExistForCompanyValidation(
      title, req.body.company._id, req.body._id );
    if(titleExist.type === 'failure'){
      return sendMessagesResponse(res, 422, titleExist.messages, 'failure');
    }
    let position = new Position({ 
      title: title, description: req.body.description, 
      company: req.body.company._id, requirements: req.body.requirements, date: new Date() });

    position = await position.save();
    await Company.findOneAndUpdate(
      { _id: req.body.company._id }, 
      { $push: {'positions' : position._id } },
      { new: true }
    );
    
    position = await Position.populate(position, { path: 'company', select: 'name' } );
    Reflect.deleteProperty(position, '__v');
    res.status(200).json({
      type: 'success',
      position
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, "There was an error creating the position."));
  }
};


/**
 * Updates a Position and send it back to the client, populated with the company name.
 * 
 * In case of an error - moving the error handling to the express error handling middleware
 * with a error code of 500, and an error message
 * 
 * @param {express request object} req - the req need to have a body with: 
 *                                {string} _id - the id of the user (should be of a Company).
 *                                {string} title - the title of the position.
 *                                {string} company - a company object with the company _id.
 * @param {express respond object} res
 */
exports.updatePosition = async (req, res, next) => {
  try {
    const routeErros = validation.handleValidationRoutesErrors(req);
    if(routeErros.type === 'failure') {
      return sendMessagesResponse(res, 422, routeErros.messages, 'failure');
    }
    title = req.body.title.trim();
    const titleExist = await validation.positionTitleExistForCompanyValidation(
      title, req.body.company._id, req.body._id );
    if(titleExist.type === 'failure'){
      return sendMessagesResponse(res, 422, titleExist.messages, 'failure');
    }
    
    await Position.findOneAndUpdate(
      { _id: req.body._id }, 
      { ...req.body, title: title, date: new Date() }
    ); 
    res.status(200).json({
      type: 'success',
      position: {...req.body, date: new Date()}
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, "There was an error updating the position."));
  }
};


/**
 * Send the client a position object populated with the company name.
 * 
 * In case of an error - moving the error handling to the express error handling middleware
 * with a error code of 500, and an error message
 * @param {express request object} req - the req need to have query params: 
 *                                        {string} _id - the id of the wanted position.
 * @param {express respond object} res
 */
exports.fetchSingle = async (req, res, next) => {
  try {throw "111"
    const position = await Position.findById({ _id: req.query._id} ).select('-__v')
                .populate({path: 'company', select: 'name'});
    res.status(200).json({
      type: 'success',
      position
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, "There was an error fetching the position."));
  }
};



/**
 * Send the client an object of an array of all the positions populated with their company name.
 * 
 * In case of an error - moving the error handling to the express error handling middleware
 * with a error code of 500, and an error message
 * @param {express request object} req
 * @param {express respond object} res
 */
exports.fetchAll = async (req, res, next) => {
  try {
    const positions = await Position.find()
        .select('_id title company description requirements date')
        .populate({ path: 'company', select: 'name' });
    res.status(200).json({
      type: 'success',
      positions
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, "There was an error fetching the positions."));
  }
};






















