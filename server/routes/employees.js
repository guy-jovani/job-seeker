

const express = require('express')
const router = express.Router();
const { body } = require('express-validator');


const employeeController = require('../controllers/employees');

router.get('/fetchAll', employeeController.getEmployees);
router.get('/fetchSingle', employeeController.getEmployee);

router.post('/update', [
  body('email')
    .isEmail()
    .withMessage('please provide a valid email'),
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
    .withMessage('Something went wrong with the edit process, please refresh the page and try again. If the error still hapennig please notify the admins.')
]
,employeeController.updateEmployee);



module.exports = router;






// router.post('/store', employeeController.postEmployee);
// router.post('/delete', employeeController.deleteEmployee);