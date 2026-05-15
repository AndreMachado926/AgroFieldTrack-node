const Prompt = require('../models/prompt');
const jwt = require('jsonwebtoken');
const jwtKey = process.env.JWT_KEY || 'jkdoamnwpa';

const resolveUserPayload = (req) => {
  let token = null;
  if (req.cookies?.auth) {
    token = req.cookies.auth;
  } else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return null;

  try {
    return jwt.verify(token, jwtKey);
  } catch (err) {
    return null;
  }
};

const createPrompt = async (req, res) => {
  try {
    const { user_id, user_type, texto, imagem } = req.body;
    const decoded = resolveUserPayload(req);
    const promptOwnerId = decoded?.user_id || user_id;
    const promptUserType = decoded?.type || user_type;

    if (!promptOwnerId) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
    }

    if (!promptUserType || !['user', 'admin', 'veterinario'].includes(promptUserType)) {
      return res.status(400).json({ success: false, error: 'Tipo de usuário inválido' });
    }

    if (!texto || typeof texto !== 'string' || !texto.trim()) {
      return res.status(400).json({ success: false, error: 'Texto do prompt é obrigatório' });
    }

    const promptData = {
      user_id: promptOwnerId,
      user_type: promptUserType,
      texto: texto.trim(),
    };

    if (imagem && typeof imagem === 'string') {
      promptData.imagem = imagem;
    }

    const prompt = await Prompt.create(promptData);

    return res.status(201).json({ success: true, data: prompt });
  } catch (err) {
    console.error('[PromptController] createPrompt error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Erro ao salvar prompt' });
  }
};

const getPromptsByUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    if (!user_id) {
      return res.status(400).json({ success: false, error: 'ID do usuário é obrigatório' });
    }

    const prompts = await Prompt.find({ user_id }).sort({ createdAt: -1 });
    return res.json({ success: true, data: prompts });
  } catch (err) {
    console.error('[PromptController] getPromptsByUser error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Erro ao obter prompts' });
  }
};

const getPromptById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: 'ID do prompt é obrigatório' });
    }

    const prompt = await Prompt.findById(id);
    if (!prompt) {
      return res.status(404).json({ success: false, error: 'Prompt não encontrado' });
    }

    return res.json({ success: true, data: prompt });
  } catch (err) {
    console.error('[PromptController] getPromptById error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Erro ao obter prompt' });
  }
};

module.exports = {
  createPrompt,
  getPromptsByUser,
  getPromptById,
};
