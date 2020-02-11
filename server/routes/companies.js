

const express = require('express')
const router = express.Router();
const { body } = require('express-validator');

const extractImage = require('../middleware/image-upload');
const companyController = require('../controllers/companies');


router.get('/fetchAll', companyController.getCompanies);
router.get('/fetchSingle', companyController.getCompany);

router.post('/update', extractImage,
  [
    body('name')
    .exists()
      .withMessage('the "name" field is a required one')
  ], 
  companyController.updateCompany);
  
  
module.exports = router;
  
  
  // router.post('/register', multer({storage: fileStorage, fileFilter}).single('imagePath'), [ 
  //     body('name')
  //     .exists(),
  //     // body('company.website')
  //     //   .exists()
  //     //   .optional()
  //     //   .custom((value, { req }) => {
  //     //     if (!validUrl.isWebUri(value)) {
  //     //       throw new Error('Please enter a valid URL');
  //     //     }
  //     //     return true;
  //     //   })
  //   ],
  //   companyController.register);




















