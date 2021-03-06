

const express = require('express')
const router = express.Router();
const { body, query } = require('express-validator');
const checkAuth = require('../middleware/check-auth');
const extractProfileImage = require('../middleware/image-upload').extractProfileImage;


const employeeController = require('../controllers/employees');

router.get('/fetchEmployees', [
  query('page')
    .isInt({ gt: 0 })
    .withMessage('The "page" field should be a positive number.'),
], employeeController.fetchEmployees);

router.get('/fetchSingle', [
  query('_id')
    .exists()
    .not()
    .isEmpty()
    .withMessage('Something went wrong while trying to get the wanted person. Please try again later.'),
],  employeeController.fetchSingle);

router.post('/update', checkAuth, extractProfileImage, [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email.'),
  body('firstName')
    .exists()
    .optional()
    .isLength(2)
    .withMessage('The first name need to be more than 2 characters long.'),
  body('lastName')
    .exists()
    .optional()
    .isLength(2)
    .withMessage('The last name need to be more than 2 characters long.'),
  body('password')
    .optional()
    .isLength(3)
    .withMessage('The password need to be more than 3 characters long.'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  }),
  body('_id')
    .exists()
    .withMessage('Something went wrong with the edit process.')
], employeeController.updateEmployee);

router.post('/createWork', checkAuth, [
  body('title')
    .exists()
    .notEmpty()
    .withMessage('"Title" is a required field.'),
  body('company')
    .exists()
    .notEmpty()
    .withMessage('"Company" is a required field.'),
  body('startDate').custom((value, { req }) => {
    if (!value || value.trim() === '') {
      throw new Error('"Start Date" is a required field.');
    }
    if (new Date(value) > new Date()) {
      throw new Error('"Start Date" can\'t be in the future.');
    }
    return true;
  }),
  body('endDate').custom((value, { req }) => {
    if (!req.body.present && (!value || value.trim() === '')) {
      throw new Error('"End Date" is a required field - unless it is your current work place.');
    }
    if (!req.body.present && new Date(value) < new Date(req.body.startDate)) {
      throw new Error('"End Date" can\'t be before "Start Date".');
    }
    return true;
  }),
  body('_id')
    .exists()
    .withMessage('Something went wrong while trying to create the experience.')
], employeeController.createWork);

router.post('/updateWork', checkAuth, [
  body('title')
    .exists()
    .notEmpty()
    .withMessage('"Title" is a required field.'),
  body('company')
    .exists()
    .notEmpty()
    .withMessage('"Company" is a required field.'),
  body('startDate').custom((value, { req }) => {
    if (!value || value.trim() === '') {
      throw new Error('"Start Date" is a required field.');
    }
    
    if (new Date(value) > new Date()) {
      throw new Error('"Start Date" can\'t be in the future.');
    }
    return true;
  }),
  body('endDate').custom((value, { req }) => {
    if (!req.body.present && (!value || value.trim() === '')) {
      throw new Error('"End Date" is a required field - unless it is your current work place.');
    }
    if (!req.body.present && new Date(value) < new Date(req.body.startDate)) {
      throw new Error('"End Date" can\'t be before "Start Date".');
    }
    return true;
  }),
  body('_id')
    .exists()
    .withMessage('Something went wrong while trying to update the experience.'),
  body('workId')
    .exists()
    .withMessage('Something went wrong while trying to update the experience.')
], employeeController.updateWork);

router.delete('/deleteWork', checkAuth, [
  query('_id')
    .exists()
    .withMessage('Something went wrong while trying to delete the experience.'),
  query('workId')
    .exists()
    .withMessage('Something went wrong while trying to delete the experience.')
], employeeController.deleteWork);



module.exports = router;


