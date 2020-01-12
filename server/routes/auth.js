

const express = require('express')
const router = express.Router();

const { body } = require('express-validator');

const authController = require('../controllers/auth');

router.put('/signup', 
  [
    body('email')
    .isEmail()
    .withMessage('please provide a valid email')
    .normalizeEmail(),
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

router.post('/login', authController.login);

module.exports = router;