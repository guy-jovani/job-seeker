

const express = require('express')
const router = express.Router();
const { body } = require('express-validator');

const extractImage = require('../middleware/image-upload');
const companyController = require('../controllers/companies');


router.get('/fetchAll', companyController.fetchAll);
router.get('/fetchSingle', companyController.fetchSingle);

router.post('/update', extractImage,
  [
    body('name')
      .exists()
      .not()
      .isEmpty()
      .withMessage('the "name" field is a required one'),
    body('email')
      .isEmail()
      .withMessage('please provide a valid email'),
    body('password')
      .exists()
      .optional()
      .isLength(3)
      .withMessage('The password need to be more than 3 characters long.'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    })
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




















