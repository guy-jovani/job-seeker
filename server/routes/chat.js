




const { query } = require('express-validator');
const express = require('express')
const router = express.Router();


const chatController = require('../controllers/chat');


router.get('/fetchAllConversations', [
  query('_id')
    .exists()
    .not()
    .isEmpty()
    .withMessage('There was an error fetching the conversations.'),
], chatController.fetchConversations);

module.exports = router;














