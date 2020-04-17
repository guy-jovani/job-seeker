

const express = require('express')
const router = express.Router();
const { body, query } = require('express-validator');

const extractCompanyImages = require('../middleware/image-upload').extractCompanyImages;
const companyController = require('../controllers/companies');


router.get('/fetchCompanies', [
  query('_id')
    .exists()
    .not()
    .isEmpty()
    .withMessage('Something went wrong while trying to get the companies. Please try again later.'),
  query('page')
    .isInt({ gt: 0 })
    .withMessage('The "page" field should be a positive number.'),
  query('kind').custom((value, { req }) => {
    if (value !== 'employee' && value !== 'company') {
      throw new Error('Invalid value of \'kind\' field.');
    }
    return true;
  })
], companyController.fetchCompanies  );


router.get('/fetchSingle', [
  query('_id')
    .exists()
    .not()
    .isEmpty()
    .withMessage('Something went wrong while trying to get the company. Please try again later.'),
], companyController.fetchSingle);

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
    query('oldImages')
      .optional()
      .exists()
      .isString()
      .withMessage('The "oldImages" should be a string.'),
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
  


















