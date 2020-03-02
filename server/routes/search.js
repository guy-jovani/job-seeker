

const express = require('express')
const router = express.Router();
// const { body } = require('express-validator');


const searchController = require('../controllers/search');

router.get('/', searchController.search);


module.exports = router;



