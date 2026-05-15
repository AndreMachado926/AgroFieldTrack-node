const axios = require('axios');

// Read OpenAI API key from environment. On Render set the env var `OPENAI_API_KEY`.
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || null;
const OPENAI_API = 'https://api.openai.com/v1';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
const MAX_PROMPT_COST_EUR = 5;

if (!OPENAI_API_KEY) {
  console.warn('[AI Service] WARNING: OPENAI_API_KEY is not set. Set the environment variable on your host (e.g., Render) as `OPENAI_API_KEY`.');
}

const getModelPricePerThousandTokens = (model) => {
  if (model.includes('gpt-4')) {
    return 0.12; // euro per 1000 tokens (estimate for gpt-4 family)
  }
  return 0.002; // euro per 1000 tokens for gpt-3.5-turbo (approximate)
};

const estimateTokens = (text) => {
  if (!text) return 0;
  // Estimativa conservadora: 1 token ~= 4 caracteres
  return Math.ceil(text.length / 4);
};

const sendMessageToLLM = async (message, conversationHistory = []) => {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('Chave OpenAI não configurada');
    }

    const messages = [];
    const recentHistory = conversationHistory.slice(-6);
    if (recentHistory.length > 0) {
      recentHistory.forEach(msg => {
        messages.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        });
      });
    }
    messages.push({ role: 'user', content: message });

    const promptText = messages.map(msg => msg.content).join('\n');
    const estimatedPromptTokens = estimateTokens(promptText);
    const pricePerThousandTokens = getModelPricePerThousandTokens(OPENAI_MODEL);
    const totalAllowedTokens = Math.floor((MAX_PROMPT_COST_EUR / pricePerThousandTokens) * 1000);
    const maxCompletionTokens = Math.max(Math.min(1000, totalAllowedTokens - estimatedPromptTokens), 0);

    if (maxCompletionTokens <= 0) {
      throw new Error('Prompt muito grande para o limite de 5 euros. Reduza o tamanho do texto.')
    }

    console.log('[AI Service] Enviando para OpenAI:', {
      model: OPENAI_MODEL,
      messageLength: message.length,
      historyLength: conversationHistory.length
    });

    const response = await axios.post(`${OPENAI_API}/chat/completions`, {
      model: OPENAI_MODEL,
      messages,
      temperature: 0.7,
      top_p: 0.9,
      max_tokens: maxCompletionTokens,
      n: 1,
      stream: false,
    }, {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 120000
    });

    const completion = response.data?.choices?.[0]?.message?.content;
    if (!completion) {
      throw new Error('Resposta vazia da OpenAI');
    }

    console.log('[AI Service] Resposta recebida com sucesso');
    return completion.trim();

  } catch (err) {
    console.error('[AI Service] Erro ao comunicar com OpenAI:', {
      message: err.message,
      code: err.code,
      endpoint: `${OPENAI_API}/chat/completions`
    });

    if (err.response?.status === 401) {
      throw new Error('Chave OpenAI inválida ou não autorizada');
    }

    throw new Error(`Erro ao processar pergunta: ${err.message}`);
  }
};

const isOpenAIAvailable = async () => {
  if (!OPENAI_API_KEY) return false;

  try {
    const response = await axios.get(`${OPENAI_API}/models`, {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      timeout: 5000
    });
    return response.status === 200;
  } catch (err) {
    console.warn('[AI Service] OpenAI não está disponível:', err.message);
    return false;
  }
};

const getAvailableModels = async () => {
  if (!OPENAI_API_KEY) return [];

  try {
    const response = await axios.get(`${OPENAI_API}/models`, {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      timeout: 5000
    });
    return response.data?.data || [];
  } catch (err) {
    console.error('[AI Service] Erro ao obter modelos:', err.message);
    return [];
  }
};

module.exports = {
  sendMessageToLLM,
  isOpenAIAvailable,
  getAvailableModels,
  OPENAI_API,
  OPENAI_MODEL
};

// Backwards compatibility alias
module.exports.isOllamaAvailable = module.exports.isOpenAIAvailable;

