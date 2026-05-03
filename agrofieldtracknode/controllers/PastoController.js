const Pasto = require('../models/pastasModel');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const jwtKey = process.env.JWT_KEY || 'jkdoamnwpa';

const getPastos = async (req, res) => {
  try {
    console.log('getPastos called - params:', req.params, 'query:', req.query);

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
      if (!ownerId) {
        return res.status(400).json({ success: false, message: 'user_id não encontrado no token' });
      }
    }

    let ownerFilter = ownerId;
    if (typeof ownerId === 'string' && mongoose.Types.ObjectId.isValid(ownerId)) {
      ownerFilter = new mongoose.Types.ObjectId(ownerId);
    }

    const pastos = await Pasto.find({ dono_id: ownerFilter }).lean().exec();
    return res.status(200).json({ success: true, count: pastos.length, data: pastos });
  } catch (err) {
    console.error('Erro ao obter pastos:', err);
    return res.status(500).json({ success: false, message: 'Erro ao obter pastos', error: err.message || String(err) });
  }
};

const getPastoById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID do pasto é obrigatório' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID inválido' });
    }

    // Obter ownerId do body/query ou token
    let ownerId = req.query?.user_id || req.body?.user_id || null;

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
      if (!ownerId) {
        return res.status(400).json({ success: false, message: 'user_id não encontrado no token' });
      }
    }

    let ownerFilter = ownerId;
    if (typeof ownerId === 'string' && mongoose.Types.ObjectId.isValid(ownerId)) {
      ownerFilter = new mongoose.Types.ObjectId(ownerId);
    }

    const pasto = await Pasto.findOne({ _id: id, dono_id: ownerFilter }).exec();
    if (!pasto) {
      return res.status(404).json({ success: false, message: 'Pasto não encontrado ou não pertence ao usuário' });
    }

    return res.status(200).json(pasto);
  } catch (err) {
    console.error('Erro ao obter pasto:', err);
    return res.status(500).json({ success: false, message: 'Erro ao obter pasto', error: err.message || String(err) });
  }
};

const validatePontoArrays = (pontosx, pontosy) => {
  if (!Array.isArray(pontosx) || !Array.isArray(pontosy)) {
    return 'pontosx e pontosy devem ser arrays';
  }
  if (pontosx.length !== pontosy.length) {
    return 'pontosx e pontosy devem ter o mesmo número de pontos';
  }
  if (pontosx.length < 3) {
    return 'São necessários pelo menos 3 pontos para definir uma área';
  }
  return null;
};

const validateObjectIdArray = (ids) => {
  if (!Array.isArray(ids)) {
    return 'animais_ids deve ser um array de ids';
  }
  for (const id of ids) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return `ID inválido em animais_ids: ${id}`;
    }
  }
  return null;
};

const createPasto = async (req, res) => {
  try {
    const { nome, pontosx, pontosy, dono_id, animais_ids = [] } = req.body;

    if (!nome || !pontosx || !pontosy || !dono_id) {
      return res.status(400).json({ success: false, message: 'nome, pontosx, pontosy e dono_id são obrigatórios' });
    }

    const pontosErro = validatePontoArrays(pontosx, pontosy);
    if (pontosErro) {
      return res.status(400).json({ success: false, message: pontosErro });
    }

    if (animais_ids && animais_ids.length > 0) {
      const animaisErro = validateObjectIdArray(animais_ids);
      if (animaisErro) {
        return res.status(400).json({ success: false, message: animaisErro });
      }
    }

    const novoPasto = new Pasto({
      nome: nome.trim(),
      pontosx,
      pontosy,
      dono_id,
      animais_ids
    });

    await novoPasto.save();
    return res.status(201).json({ success: true, message: 'Pasto criado com sucesso', data: novoPasto });
  } catch (err) {
    console.error('Erro ao criar pasto:', err);
    return res.status(500).json({ success: false, message: 'Erro ao criar pasto', error: err.message || String(err) });
  }
};

const editPasto = async (req, res) => {
  try {
    const { id, nome, pontosx, pontosy, animais_ids, dono_id } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: 'ID do pasto é obrigatório' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID inválido' });
    }

    // Obter ownerId do body ou token
    let ownerId = req.body?.user_id || dono_id || null;

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
      if (!ownerId) {
        return res.status(400).json({ success: false, message: 'user_id não encontrado no token' });
      }
    }

    let ownerFilter = ownerId;
    if (typeof ownerId === 'string' && mongoose.Types.ObjectId.isValid(ownerId)) {
      ownerFilter = new mongoose.Types.ObjectId(ownerId);
    }

    const pasto = await Pasto.findOne({ _id: id, dono_id: ownerFilter });
    if (!pasto) {
      return res.status(404).json({ success: false, message: 'Pasto não encontrado ou não pertence ao usuário' });
    }

    if (nome) {
      pasto.nome = nome.trim();
    }
    if (dono_id) {
      pasto.dono_id = dono_id;
    }

    if ((pontosx && !pontosy) || (!pontosx && pontosy)) {
      return res.status(400).json({ success: false, message: 'pontosx e pontosy devem ser enviados juntos' });
    }

    if (pontosx && pontosy) {
      const pontosErro = validatePontoArrays(pontosx, pontosy);
      if (pontosErro) {
        return res.status(400).json({ success: false, message: pontosErro });
      }
      pasto.pontosx = pontosx;
      pasto.pontosy = pontosy;
    }

    if (animais_ids) {
      const animaisErro = validateObjectIdArray(animais_ids);
      if (animaisErro) {
        return res.status(400).json({ success: false, message: animaisErro });
      }
      pasto.animais_ids = animais_ids;
    }

    await pasto.save();
    return res.status(200).json({ success: true, message: 'Pasto editado com sucesso', data: pasto });
  } catch (err) {
    console.error('Erro ao editar pasto:', err);
    return res.status(500).json({ success: false, message: 'Erro ao editar pasto', error: err.message || String(err) });
  }
};

const deletePasto = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID do pasto é obrigatório' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID inválido' });
    }

    // Obter ownerId do query/body ou token
    let ownerId = req.query?.user_id || req.body?.user_id || null;

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
      if (!ownerId) {
        return res.status(400).json({ success: false, message: 'user_id não encontrado no token' });
      }
    }

    let ownerFilter = ownerId;
    if (typeof ownerId === 'string' && mongoose.Types.ObjectId.isValid(ownerId)) {
      ownerFilter = new mongoose.Types.ObjectId(ownerId);
    }

    const pasto = await Pasto.findOneAndDelete({ _id: id, dono_id: ownerFilter });
    if (!pasto) {
      return res.status(404).json({ success: false, message: 'Pasto não encontrado ou não pertence ao usuário' });
    }

    return res.status(200).json({ success: true, message: 'Pasto excluído com sucesso', data: pasto });
  } catch (err) {
    console.error('Erro ao excluir pasto:', err);
    return res.status(500).json({ success: false, message: 'Erro ao excluir pasto', error: err.message || String(err) });
  }
};

module.exports = { getPastos, getPastoById, createPasto, editPasto, deletePasto };
