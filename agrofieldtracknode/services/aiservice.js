const axios = require('axios');

// Configuração do Ollama local
const OLLAMA_API = process.env.OLLAMA_API || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llava';

/**
 * Envia uma mensagem para o modelo Llava via Ollama
 * @param {string} message - Mensagem do utilizador
 * @param {Array} conversationHistory - Histórico da conversa (opcional)
 * @returns {Promise<string>} - Resposta do modelo
 */
const sendMessageToLLM = async (message, conversationHistory = []) => {
  try {
    // Construir o contexto com histórico
    let prompt = message;
    
    if (conversationHistory.length > 0) {
      // Adicionar histórico recente para manter contexto
      const recentHistory = conversationHistory.slice(-4); // Últimas 4 mensagens
      prompt = recentHistory
        .map(msg => `${msg.sender === 'user' ? 'Utilizador' : 'Assistente'}: ${msg.text}`)
        .join('\n');
      prompt += `\nUtilizador: ${message}`;
    }

    console.log('[AI Service] Enviando para Ollama:', {
      model: OLLAMA_MODEL,
      messageLength: message.length,
      historyLength: conversationHistory.length
    });

    const response = await axios.post(`${OLLAMA_API}/api/generate`, {
      model: OLLAMA_MODEL,
      prompt: prompt,
      stream: false,
      temperature: 0.7,
      top_p: 0.9,
      top_k: 40,
      context_window: 2048
    }, {
      timeout: 120000 // 2 minutos timeout
    });

    if (!response.data || !response.data.response) {
      throw new Error('Resposta vazia do Ollama');
    }

    console.log('[AI Service] Resposta recebida com sucesso');
    return response.data.response.trim();

  } catch (err) {
    console.error('[AI Service] Erro ao comunicar com Ollama:', {
      message: err.message,
      code: err.code,
      endpoint: `${OLLAMA_API}/api/generate`
    });

    // Verificar se é problema de conexão
    if (err.code === 'ECONNREFUSED') {
      throw new Error(
        'Não consegui conectar ao Ollama. Certifique-se que:\n' +
        '1. Ollama está em execução (ollama serve)\n' +
        '2. O modelo "llava" está disponível (ollama pull llava)\n' +
        `3. A API está acessível em ${OLLAMA_API}`
      );
    }

    throw new Error(`Erro ao processar pergunta: ${err.message}`);
  }
};

/**
 * Verifica se o Ollama está disponível
 * @returns {Promise<boolean>}
 */
const isOllamaAvailable = async () => {
  try {
    const response = await axios.get(`${OLLAMA_API}/api/tags`, {
      timeout: 5000
    });
    return response.status === 200;
  } catch (err) {
    console.warn('[AI Service] Ollama não está disponível:', err.message);
    return false;
  }
};

/**
 * Obtém lista de modelos disponíveis no Ollama
 * @returns {Promise<Array>}
 */
const getAvailableModels = async () => {
  try {
    const response = await axios.get(`${OLLAMA_API}/api/tags`, {
      timeout: 5000
    });
    return response.data.models || [];
  } catch (err) {
    console.error('[AI Service] Erro ao obter modelos:', err.message);
    return [];
  }
};

module.exports = {
  sendMessageToLLM,
  isOllamaAvailable,
  getAvailableModels,
  OLLAMA_API,
  OLLAMA_MODEL
};
