





const express = require('express')
const router = express.Router();
const { body } = require('express-validator');


const chatController = require('../controllers/chat');

// router.post('/postMessage', [
//   body('content')
//     .notEmpty()
//     .withMessage('You can\'t send an empty message.'),
//   body('recipients')
//     .notEmpty()
//     .withMessage('You need to choose who to send the message to.'),
// ], chatController.postMessage);


router.get('/fetchAllConversations', chatController.fetchConversations);

module.exports = router;














