const { sendMessageToLLM, isOllamaAvailable, getAvailableModels } = require('../services/aiservice');
const { jwtDecode } = require('jwt-decode');

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

    // Verificar se Ollama está disponível
    const available = await isOllamaAvailable();
    if (!available) {
      return res.status(503).json({
        success: false,
        error: 'Serviço de IA indisponível. Ollama não está em execução.',
        details: 'Certifique-se de que o Ollama está iniciado localmente com "ollama serve"'
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
    const available = await isOllamaAvailable();
    const models = available ? await getAvailableModels() : [];

    return res.json({
      success: true,
      status: {
        ollamaAvailable: available,
        serviceRunning: available,
        models: models.map(m => ({
          name: m.name,
          size: m.size,
          modifiedAt: m.modified_at
        })),
        defaultModel: 'llava'
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
    const available = await isOllamaAvailable();
    
    if (!available) {
      return res.status(503).json({
        success: false,
        error: 'Ollama não está disponível',
        models: []
      });
    }

    const models = await getAvailableModels();
    
    return res.json({
      success: true,
      models: models.map(m => ({
        name: m.name,
        size: m.size,
        modifiedAt: m.modified_at
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
