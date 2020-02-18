
const { body } = require('express-validator');
const express = require('express')
const router = express.Router();


const positionController = require('../controllers/positions');

router.put('/create', [
    body('companyId')
      .exists()
      .not()
      .isEmpty()
      .withMessage('there was an error creating the position'),
    body('title')
      .exists()
      .not()
      .isEmpty()
      .withMessage('please provide a title for the position'),
    body('description')
      .exists()
      .not()
      .isEmpty()
      .withMessage('please provide a description for the position'),
    body('requirements')
      .exists()
      .optional()
      .custom((requirements, { req }) => {
        for(let i=0; i < requirements.length; i++){
          if (!requirements[i].years || !requirements[i].skill) {
            throw new Error('All of the requirements fields must be filled');
          }
        }
        return true;
      }),
  ], positionController.create);


router.get('/fetchAll', positionController.fetchAll);

router.get('/fetchSingle', [
  body('_id')
    .exists()
    .not()
    .isEmpty()
    .withMessage('there was an error fetching the position'),
], positionController.fetchSingle);

router.post('/update', [
  body('_id')
    .exists()
    .not()
    .isEmpty()
    .withMessage('there was an error updating the position'),
  body('companyId')
    .exists()
    .not()
    .isEmpty()
    .withMessage('there was an error updating the position'),
  body('title')
    .exists()
    .not()
    .isEmpty()
    .withMessage('please provide a title for the position'),
  body('description')
    .exists()
    .not()
    .isEmpty()
    .withMessage('please provide a description for the position'),
], positionController.updatePosition);


module.exports = router;






// router.post('/store', employeeController.postEmployee);
// router.post('/delete', employeeController.deleteEmployee);