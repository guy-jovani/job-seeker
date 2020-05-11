

const express = require('express')
const router = express.Router();
const { query } = require('express-validator');


const autoCompleteController = require('../controllers/auto-complete');

router.get('/', [
  query('usedIds')
    .exists()
    .withMessage('Something went wrong while auto complete. Please try again later.'),
  query('query')
    .exists()
    .withMessage('Something went wrong while auto complete. Please try again later.'),
  query('searchDBs')
    .exists()
    .withMessage('Something went wrong while auto complete. Please try again later.'),
  query('searchFields')
    .exists()
    .withMessage('Something went wrong while auto complete. Please try again later.'),
], autoCompleteController.autoComplete);


module.exports = router;



