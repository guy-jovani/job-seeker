





const express = require('express')
const router = express.Router();


const chatController = require('../controllers/chat');


router.get('/fetchAllConversations', chatController.fetchConversations);

module.exports = router;














