const express = require('express');
const router = express.Router();
const ChatsController = require('../controllers/ChatsController');

router.get('/chat/:chatId/messages', ChatsController.getChatMessages);
router.get('/chat/:user1_id/:user2_id', ChatsController.getOrCreateChat);
router.get("/chats/contacts/:user_id", ChatsController.getContactsForUser);
router.get("/chats/user/:user_id", ChatsController.getAllChatsForUser);
router.post('/chat/:chatId', ChatsController.createMessage);

module.exports = router;

