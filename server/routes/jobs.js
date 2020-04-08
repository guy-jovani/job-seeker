
const { body } = require('express-validator');
const express = require('express')
const router = express.Router();


const jobController = require('../controllers/jobs');

router.put('/create', [
    body('company')
      .exists()
      .not()
      .isEmpty()
      .withMessage('There was an error creating the job.'),
    body('title')
      .exists()
      .not()
      .isEmpty()
      .withMessage('Please provide a title for the job.'),
    body('description')
      .exists()
      .not()
      .isEmpty()
      .withMessage('Please provide a description for the job.'),
    body('requirements')
      .exists()
      .optional()
      .custom(requirements => {
        requirements.forEach(requirement => {
          if(!requirement.requirement) {
            throw new Error('All of the requirements fields must be filled.');
          }
        })
        return true;
      }),
  ], jobController.create);


router.get('/fetchJobs', jobController.fetchJobs);

router.get('/fetchSingle', [
  body('_id')
    .exists()
    .not()
    .isEmpty()
    .withMessage('There was an error fetching the job.'),
], jobController.fetchSingle);

router.post('/update', [
  body('_id')
    .exists()
    .not()
    .isEmpty()
    .withMessage('There was an error updating the job.'),
  body('company')
    .exists()
    .not()
    .isEmpty()
    .withMessage('There was an error updating the job.'),
  body('title')
    .exists()
    .not()
    .isEmpty()
    .withMessage('Please provide a title for the job.'),
  body('description')
    .exists()
    .not()
    .isEmpty()
    .withMessage('please provide a description for the job'),
], jobController.updateJob);


module.exports = router;


