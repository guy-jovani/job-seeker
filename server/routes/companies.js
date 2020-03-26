

const express = require('express')
const router = express.Router();
const { body } = require('express-validator');

const extractCompanyImages = require('../middleware/image-upload').extractCompanyImages;
const companyController = require('../controllers/companies');


router.get('/fetchCompanies', companyController.fetchCompanies  );
router.get('/fetchSingle', companyController.fetchSingle);

router.post('/update', extractCompanyImages,
  [
    body('name')
      .exists()
      .not()
      .isEmpty()
      .withMessage('The "name" field is a required one.'),
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email.'),
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
  


















