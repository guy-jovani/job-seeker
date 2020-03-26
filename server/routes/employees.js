

const express = require('express')
const router = express.Router();
const { body } = require('express-validator');
const extractProfileImage = require('../middleware/image-upload').extractProfileImage;


const employeeController = require('../controllers/employees');

router.get('/fetchEmployees', employeeController.fetchEmployees);
router.get('/fetchSingle', employeeController.fetchSingle);

router.post('/update', extractProfileImage, [
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



module.exports = router;






// router.post('/store', employeeController.postEmployee);
// router.post('/delete', employeeController.deleteEmployee);