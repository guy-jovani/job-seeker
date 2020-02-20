


const Position = require('../models/position');
const Company = require('../models/company');
const validation = require('../utils/validation');
const errorHandling = require('../utils/errorHandling')
// const getBulkArrayForUpdate = require('../utils/shared').getBulkArrayForUpdate;
// const getNullKeysForUpdate = require('../utils/shared').getNullKeysForUpdate;



exports.create = async (req, res, next) => {
  try {
    if(validation.handleValidationRoutesErrors(req, res)) return;
    if(await validation.positionTitleExistForCompanyValidation(req.body.title, res, req.body.companyId)) return;

    let position = new Position({ 
      title: req.body.title, description: req.body.description, 
      companyId: req.body.companyId, requirements: req.body.requirements });

    position = await position.save();
    await Company.findOneAndUpdate(
      { _id: req.body.companyId }, 
      { $push: {'positionsIds' : position._id }
    });  
    res.status(200).json({
      type: 'success',
      position
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, "there was an error creating the position"));
  }
};

exports.updatePosition = async (req, res, next) => {
  try {
    if(validation.handleValidationRoutesErrors(req, res)) return;
    if(await validation.positionTitleExistForCompanyValidation(
                req.body.title, res, req.body.companyId, req.body._id )) return;
    console.log(req.body)
    
    await Position.findOneAndUpdate(
      { _id: req.body._id }, 
      { ...req.body }
    ); 
    res.status(200).json({
      type: 'success',
      position: req.body
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, "there was an error creating the position"));
  }
};

exports.fetchSingle = async (req, res, next) => {
  try {
    const position = await Position.findById({ _id: req.query._id} ).select('-__v')
                .populate({path: 'companyId', select: 'name'});
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
        .select('_id title companyId description requirements')
        .populate({path: 'companyId', select: '_id email name website description imagePath positionsIds' });
    res.status(200).json({
      type: 'success',
      positions
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, "there was an error fetching the positions"));
  }
};






















