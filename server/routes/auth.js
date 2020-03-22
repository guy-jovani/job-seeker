

const express = require('express')
const router = express.Router();

const { body } = require('express-validator');

const authController = require('../controllers/auth');

router.put('/signup', 
  [
    body('email')
      .isEmail()
      .withMessage('please provide a valid email'),
    body('password')
      .isLength(3)
      .withMessage('The password need to be more than 3 characters long.'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    })
  ], 
  authController.signup);

router.post('/login', [
  body('email')
    .exists()
    .not()
    .isEmpty()
    .withMessage('Please provide a valid email.'),
  body('password')
    .isLength(3)
    .withMessage('The password need to be more than 3 characters long.')
], authController.login);

router.post('/resetPasswordEmail', 
  [
    body('email')
      .isEmail()
      .not()
      .isEmpty()
      .withMessage('please provide a valid email'),
  ], 
  authController.resetPasswordEmail);

router.post('/resetToNewPassword', 
  [
    body('password')
      .isLength(3)
      .withMessage('The password need to be more than 3 characters long.'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    })
  ], 
  authController.resetToNewPassword);

module.exports = router;