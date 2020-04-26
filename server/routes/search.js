

const express = require('express')
const router = express.Router();
const { query } = require('express-validator');


const searchController = require('../controllers/search');

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
], searchController.search);


module.exports = router;



