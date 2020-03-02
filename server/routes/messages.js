





const express = require('express')
const router = express.Router();
const { body } = require('express-validator');


const messagesController = require('../controllers/messages');

router.post('/', [
  body('message')
    .notEmpty()
    .withMessage('You can\'t send an empty message.'),
  body('recipients')
    .notEmpty()
    .withMessage('You need to choose who to send the message to.'),
], messagesController.postMessage);


module.exports = router;














