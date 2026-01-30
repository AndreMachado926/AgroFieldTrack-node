const express = require('express');
const router = express.Router();
const ChatsController = require('../controllers/ChatsController');

router.get('/chat/:chatId/messages', ChatsController.getChatMessages);
router.get('/chat/:user1_id/:user2_id', ChatsController.getOrCreateChat);
router.post('/chat/:chatId', ChatsController.createMessage);

module.exports = router;

