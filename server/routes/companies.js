

const express = require('express')
const router = express.Router();
const { body } = require('express-validator');

const extractImage = require('../middleware/image-upload');
const companyController = require('../controllers/companies');


router.get('/fetchAll', companyController.fetchAll);
router.get('/fetchSingle', companyController.fetchSingle);
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
  
  
router.post('/acceptRejectPosition', [ 
  body('employeeId')
    .exists()
    .withMessage('There was an error updating the status of the wanted position, please refresh the page and try again. If the error is still happening please notify the admins.'),
  body('positionId')
    .exists()
    .withMessage('There was an error updating the status of the wanted position, please refresh the page and try again. If the error is still happening please notify the admins.'),
  body('companyId')
    .exists()
    .withMessage('There was an error updating the status of the wanted position, please refresh the page and try again. If the error is still happening please notify the admins.'),
  body('status').custom(value => {
    if (value !== 'accepted' && value !== 'rejected') {
      throw new Error('Illegal status value.');
    }
    return true;
  }),
], companyController.acceptRejectPosition);



module.exports = router;
  


















