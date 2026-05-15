const { sendMessageToLLM, isOpenAIAvailable, getAvailableModels, OPENAI_MODEL, OPENAI_API_KEY_CONFIGURED } = require('../services/aiservice');

/**
 * POST /ai/chat
 * Envia uma mensagem para o agente de IA
 */
const sendMessage = async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    // Validar entrada
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Mensagem inválida'
      });
    }

    // Verificar se OpenAI está disponível
    const available = await isOpenAIAvailable();
    if (!available) {
      return res.status(503).json({
        success: false,
        error: 'Serviço de IA indisponível. OpenAI não respondeu.',
        details: 'Verifique a variável de ambiente OPENAI_API_KEY e a conectividade com a API da OpenAI.',
        openaiKeyConfigured: OPENAI_API_KEY_CONFIGURED
      });
    }

    console.log('[AgentController] Processando mensagem do utilizador:', message.substring(0, 50) + '...');

    // Enviar para LLM
    const response = await sendMessageToLLM(message.trim(), conversationHistory || []);

    return res.json({
      success: true,
      response: response,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('[AgentController] Erro:', err.message);
    return res.status(500).json({
      success: false,
      error: err.message || 'Erro ao processar pergunta'
    });
  }
};

/**
 * GET /ai/status
 * Verifica o status do serviço de IA
 */
const getStatus = async (req, res) => {
  try {
    const available = await isOpenAIAvailable();
    const models = available ? await getAvailableModels() : [];

    return res.json({
      success: true,
      status: {
        openaiAvailable: available,
        serviceRunning: available,
        openaiKeyConfigured: OPENAI_API_KEY_CONFIGURED,
        models: models.map(m => ({
          name: m.id || m.name || m.model || null,
          size: m.size || null,
          modifiedAt: m.modified_at || m.created || null
        })),
        defaultModel: OPENAI_MODEL || 'gpt-3.5-turbo'
      }
    });

  } catch (err) {
    console.error('[AgentController] Erro ao verificar status:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Erro ao verificar status do serviço'
    });
  }
};

/**
 * GET /ai/models
 * Obtém lista de modelos disponíveis
 */
const getModels = async (req, res) => {
  try {
    const available = await isOpenAIAvailable();

    if (!available) {
      return res.status(503).json({
        success: false,
        error: 'OpenAI não está disponível',
        models: []
      });
    }

    const models = await getAvailableModels();
    
    return res.json({
      success: true,
      models: models.map(m => ({
        name: m.id || m.name || m.model || null,
        size: m.size || null,
        modifiedAt: m.modified_at || m.created || null
      }))
    });

  } catch (err) {
    console.error('[AgentController] Erro ao obter modelos:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Erro ao obter lista de modelos'
    });
  }
};

module.exports = {
  sendMessage,
  getStatus,
  getModels
};
