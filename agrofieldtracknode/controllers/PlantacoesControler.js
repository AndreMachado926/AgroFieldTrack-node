const Plantacao = require('../models/PlantacoesModel'); // ajuste se o nome do model for diferente
const jwt = require('jsonwebtoken');
const jwtKey = process.env.JWT_KEY || 'jkdoamnwpa';
const mongoose = require('mongoose');

const getPlantacoes = async (req, res) => {
  try {
    console.log('getPlantacoes called - params:', req.params, 'query:', req.query);

    // try sources: param, query, body, token/cookie
    let ownerId = req.params?.user_id || req.query?.user_id || req.body?.user_id || null;

    if (!ownerId) {
      const token = req.cookies?.auth || (req.headers.authorization ? req.headers.authorization.split(' ')[1] : null);
      if (!token) {
        return res.status(400).json({ success: false, message: 'user_id ou token obrigatórios' });
      }
      let decoded;
      try {
        decoded = jwt.verify(token, jwtKey);
      } catch (err) {
        console.warn('JWT verify failed:', err && err.message);
        return res.status(401).json({ success: false, message: 'Token inválido' });
      }
      ownerId = decoded?.user_id || decoded?.id || decoded?._id || decoded?.sub || null;
      if (!ownerId) return res.status(400).json({ success: false, message: 'user_id não encontrado no token' });
    }

    // monta filtro (ObjectId quando aplicável)
    let ownerFilter = ownerId;
    if (typeof ownerId === 'string' && mongoose.Types.ObjectId.isValid(ownerId)) {
      ownerFilter = new mongoose.Types.ObjectId(ownerId);
    }

    console.log('Querying plantacoes for owner:', ownerFilter);
    const plantacoes = await Plantacao.find({ dono_id: ownerFilter }).lean().exec();

    console.log(`Found ${plantacoes.length} plantacoes for owner ${ownerId}`);
    return res.status(200).json({ success: true, count: plantacoes.length, data: plantacoes });
  } catch (err) {
    console.error('Erro ao obter plantações (detalhado):', err);
    return res.status(500).json({ success: false, message: 'Erro ao obter plantações', error: err.message || String(err) });
  }
};

const createPlantacao = async (req, res) => {
  try {
    // Extrai dados do body
    const { nome, planta, pontosx, pontosy, dono_id } = req.body;

    // Validações básicas
    if (!nome || !planta || !pontosx || !pontosy || !dono_id) {
      return res.status(400).json({
        success: false,
        message: 'Todos os campos são obrigatórios: nome, planta, pontosx, pontosy, dono_id'
      });
    }

    // Valida arrays de pontos
    if (!Array.isArray(pontosx) || !Array.isArray(pontosy)) {
      return res.status(400).json({
        success: false,
        message: 'pontosx e pontosy devem ser arrays'
      });
    }

    // Valida quantidade mínima de pontos
    if (pontosx.length < 3 || pontosy.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'São necessários pelo menos 3 pontos para definir uma área'
      });
    }

    // Valida se arrays têm mesmo tamanho
    if (pontosx.length !== pontosy.length) {
      return res.status(400).json({
        success: false,
        message: 'pontosx e pontosy devem ter o mesmo número de pontos'
      });
    }

    // Cria nova plantação
    const novaPlantacao = new Plantacao({
      nome: nome.trim(),
      planta: planta.trim(),
      pontosx,
      pontosy,
      dono_id
    });

    // Salva no banco
    await novaPlantacao.save();

    // Retorna sucesso
    return res.status(201).json({
      success: true,
      message: 'Plantação criada com sucesso',
      data: novaPlantacao
    });

  } catch (error) {
    console.error('Erro ao criar plantação:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao criar plantação',
      error: error.message
    });
  }
};
const editplantacoes = async (req, res) => {
  try {
    const { id, nome, planta, pontosx, pontosy } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: 'ID da plantação é obrigatório' });
    }

    const plantacao = await Plantacao.findById(id);
    if (!plantacao) {
      return res.status(404).json({ success: false, message: 'Plantação não encontrada' });
    }

    if (nome) plantacao.nome = nome.trim();
    if (planta) plantacao.planta = planta.trim();

    // Validação de pontos
    if ((pontosx && !Array.isArray(pontosx)) || (pontosy && !Array.isArray(pontosy))) {
      return res.status(400).json({ success: false, message: 'pontosx e pontosy devem ser arrays' });
    }

    if (pontosx && pontosy) {
      if (pontosx.length !== pontosy.length) {
        return res.status(400).json({ success: false, message: 'pontosx e pontosy devem ter o mesmo tamanho' });
      }
      if (pontosx.length < 3) {
        return res.status(400).json({ success: false, message: 'São necessários pelo menos 3 pontos' });
      }
      plantacao.pontosx = pontosx;
      plantacao.pontosy = pontosy;
    }

    await plantacao.save();
    return res.status(200).json({ success: true, message: 'Plantação editada com sucesso', data: plantacao });

  } catch (error) {
    console.error('Erro ao editar plantação:', error);
    return res.status(500).json({ success: false, message: 'Erro ao editar plantação', error: error.message });
  }
};

module.exports = { getPlantacoes, createPlantacao, editplantacoes };
