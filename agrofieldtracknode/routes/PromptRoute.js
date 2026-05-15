const express = require('express');
const router = express.Router();
const { createPrompt, getPromptsByUser, getPromptById } = require('../controllers/PromptController');

router.post('/prompts', createPrompt);
router.get('/prompts/user/:user_id', getPromptsByUser);
router.get('/prompts/:id', getPromptById);

module.exports = router;
