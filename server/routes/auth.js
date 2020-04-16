

const express = require('express')
const router = express.Router();

const { body } = require('express-validator');

const authController = require('../controllers/auth');

router.put('/signup', 
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email.'),
    body('password')
      .isLength(3)
      .withMessage('The password need to be more than 3 characters long.'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password.');
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

router.post('/refreshToken', 
  [
    body('refreshToken')
      .exists()
      .not()
      .isEmpty()
      .withMessage('No Refresh Token was provided.'),
  ], 
  authController.refreshToken);

router.post('/logout', 
  [
    body('kind').custom((value, { req }) => {
      if (value !== 'employee' && value !== 'company') {
        throw new Error('Something went wrong while trying to logout. Please refresh the page and try again.');
      }
      return true;
    }),
    body('_id')
      .exists()
      .withMessage('Something went wrong while trying to logout. Please refresh the page and try again.')
  ], 
  authController.logout);

router.post('/resetPasswordEmail', 
  [
    body('email')
      .isEmail()
      .not()
      .isEmpty()
      .withMessage('Please provide a valid email.'),
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

router.post('/changePassword', [
  body('currPassword')
    .exists()
    .not()
    .isEmpty()
    .withMessage('Please provide your current password.'),
  body('newPassword')
    .exists()
    .not()
    .isEmpty()
    .withMessage('Please provide your new password.'),
  body('newPassword')
    .isLength(3)
    .withMessage('The password need to be more than 3 characters long.'),
  body('confirmNewPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Password confirmation does not match password.');
    }
    return true;
  }),
  body('kind').custom(value => {
    if (value !== 'employee' && value !== 'company') {
      throw new Error('Something went wrong while trying to change the password.');
    }
    return true;
  }),
  body('_id')
    .exists()
    .withMessage('Something went wrong while trying to change the password.'),
], authController.changePassword);

module.exports = router;