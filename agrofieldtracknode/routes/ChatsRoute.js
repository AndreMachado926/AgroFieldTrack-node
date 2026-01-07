const express = require('express');
const router = express.Router();
const ChatsController = require('../controllers/ChatsController');

router.get('/chat/:user1_id/:user1_type/:user2_id/:user2_type', ChatsController.getOrCreateChat);
router.post('/chat/:chatId', ChatsController.createMessage);
module.exports = router;

