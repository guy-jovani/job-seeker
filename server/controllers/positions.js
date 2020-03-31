


const Position = require('../models/position');
const Company = require('../models/company');
const validation = require('../utils/validation');
const errorHandling = require('../utils/errorHandling');
const sendMessagesResponse = require('../utils/shared').sendMessagesResponse;


exports.create = async (req, res, next) => {
  try {
    const routeErros = validation.handleValidationRoutesErrors(req);
    if(routeErros.type === 'failure') {
      return sendMessagesResponse(res, 422, routeErros.messages, 'failure');
    }
    req.body.title = req.body.title.trim();
    const titleExist = await validation.positionTitleExistForCompanyValidation(
      req.body.title, req.body.company._id, req.body._id );
    if(titleExist.type === 'failure'){
      return sendMessagesResponse(res, 422, titleExist.messages, 'failure');
    }
    let position = new Position({ 
      title: req.body.title, description: req.body.description, 
      company: req.body.company._id, requirements: req.body.requirements, date: new Date() });

    position = await position.save();
    await Company.findOneAndUpdate(
      { _id: req.body.company._id }, 
      { $push: {'positions' : position._id } },
      { new: true }
    );
    
    position = await Position.populate(position, { path: 'company', select: 'name date' } );
    Reflect.deleteProperty(position, '__v');
    res.status(200).json({
      type: 'success',
      position
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, "There was an error creating the position."));
  }
};

exports.updatePosition = async (req, res, next) => {
  try {
    const routeErros = validation.handleValidationRoutesErrors(req);
    if(routeErros.type === 'failure') {
      return sendMessagesResponse(res, 422, routeErros.messages, 'failure');
    }
    req.body.title = req.body.title.trim();
    const titleExist = await validation.positionTitleExistForCompanyValidation(
      req.body.title, req.body.company._id, req.body._id );
    if(titleExist.type === 'failure'){
      return sendMessagesResponse(res, 422, titleExist.messages, 'failure');
    }
    
    await Position.findOneAndUpdate(
      { _id: req.body._id }, 
      { ...req.body, date: new Date() }
    ); 
    res.status(200).json({
      type: 'success',
      position: {...req.body, date: new Date()}
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, "there was an error updating the position"));
  }
};

exports.fetchSingle = async (req, res, next) => {
  try {throw "111"
    const position = await Position.findById({ _id: req.query._id} ).select('-__v')
                .populate({path: 'company', select: '_id name'});
    res.status(200).json({
      type: 'success',
      position
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, "there was an error fetching the position"));
  }
};

exports.fetchAll = async (req, res, next) => {
  try {
    const positions = await Position.find()
        .select('_id title company description requirements date')
        .populate({ path: 'company', select: '_id name' });
    res.status(200).json({
      type: 'success',
      positions
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, "there was an error fetching the positions"));
  }
};






















