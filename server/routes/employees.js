

const express = require('express')
const router = express.Router();
const { body } = require('express-validator');

const employeeController = require('../controllers/employees');

router.get('/fetchAll', employeeController.getEmployees);
// router.get('/fetchOne', employeeController.getEmployee);
// router.post('/store', employeeController.postEmployee);
// router.post('/delete', employeeController.deleteEmployee);
router.post('/update', [
  body('newEmployee.email')
    .isEmail()
    .withMessage('please provide a valid email')
    .normalizeEmail(),
  body('newEmployee.firstName')
    .exists()
    .optional()
    .isLength(2)
    .withMessage('The first name need to be more than 2 characters long.'),
  body('newEmployee.lastName')
    .exists()
    .optional()
    .isLength(2)
    .withMessage('The last name need to be more than 2 characters long.'),
  body('newEmployee._id')
    .exists()
    .withMessage('Something went wrong with the edit process, please refresh the page and try again. If the error still hapennig please notify the admins.')
]
,employeeController.updateEmployee);



module.exports = router;