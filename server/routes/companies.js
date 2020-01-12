

const express = require('express')
const router = express.Router();
const { body } = require('express-validator');
const multer = require('multer');
const companyController = require('../controllers/companies');


const fileStorage = multer.diskStorage({
  destination: function(req, file, cb) {
      cb(null, 'images');
  },
  filename: function(req, file, cb) {
    cb(null, 
      file.originalname.split('.')[0] + 
      '-' + 
      new Date().toISOString().replace(/:/g, '-') + 
      '.' +
      file.originalname.split('.')[1])
  }
});

const fileFilter = (req, file, cb) => {
  if(file.mimetype === 'image/png' || 
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ){
    cb(null, true);
  } else {
    cb("try upload wrong mime type", false);
  }
};


router.get('/fetchAll', companyController.getCompanies);
router.get('/fetchSingle', companyController.getCompany);
router.post('/register', multer({storage: fileStorage, fileFilter}).single('image'), [ 
    body('name')
    .exists(),
    // body('company.website')
    //   .exists()
    //   .optional()
    //   .custom((value, { req }) => {
    //     if (!validUrl.isWebUri(value)) {
    //       throw new Error('Please enter a valid URL');
    //     }
    //     return true;
    //   })
  ],
  companyController.register);
router.post('/update', multer({storage: fileStorage, fileFilter}).single('image'),
  [
    body('name')
      .exists()
      .withMessage('the "name" field is a required one'),
    // body('company.website')
    //   .exists()
    //   .optional()
    //   .custom((value, { req }) => {
    //     if (!validUrl.isUri(values)) {
    //       throw new Error('Please enter a valid URL');
    //     }
    //     return true;
    //   })
  ], 
  companyController.updateCompany);



module.exports = router;