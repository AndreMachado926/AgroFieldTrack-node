const express = require('express');
const router = express.Router();
const { sendMessage, getStatus, getModels } = require('../controllers/AiController');

/**
 * POST /ai/chat
 * Envia mensagem para o agente de IA
 * Body: { message: string, conversationHistory?: Array }
 */
router.post('/ai/chat', sendMessage);

/**
 * GET /ai/status
 * Verifica status do serviço de IA
 */
router.get('/ai/status', getStatus);

/**
 * GET /ai/models
 * Obtém lista de modelos disponíveis
 */
router.get('/ai/models', getModels);

module.exports = router;
