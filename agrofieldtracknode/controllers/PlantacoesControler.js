const Plantacao = require('../models/PlantacoesModel'); // ajuste se o nome do model for diferente
const jwt = require('jsonwebtoken');
const jwtKey = process.env.JWT_KEY || 'jkdoamnwpa';

const getAllPlantacoes = async (req, res) => {
  try {
    let donoId = req.params?.dono_id || null;

    // se não veio param, tenta token no cookie/authorization
    if (!donoId) {
      const token = req.cookies?.auth || (req.headers.authorization ? req.headers.authorization.split(' ')[1] : null);
      if (!token) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }
      let decoded;
      try {
        decoded = jwt.verify(token, jwtKey);
      } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }
      donoId = decoded.user_id || decoded.id || decoded._id || decoded.sub;
      if (!donoId) return res.status(401).json({ success: false, message: 'Invalid token payload' });
    }

    const plantacoes = await Plantacao.find({ dono_id: donoId }).lean();
    return res.status(200).json({ success: true, count: plantacoes.length, data: plantacoes });
  } catch (err) {
    console.error('Erro ao obter plantações:', err);
    return res.status(500).json({ success: false, message: 'Erro ao obter plantações' });
  }
};

const createPlantacao = async (req, res) => {
  try {
    const { planta, localizacaoX, localizacaoY } = req.body;
    let dono_id = req.body?.dono_id || null;

    if (!dono_id) {
      const token = req.cookies?.auth || (req.headers.authorization ? req.headers.authorization.split(' ')[1] : null);
      if (token) {
        try {
          const decoded = jwt.verify(token, jwtKey);
          dono_id = decoded.user_id || decoded.id || decoded._id || decoded.sub;
        } catch (err) {
          // ignore - will validate below
        }
      }
    }

    if (!planta || !dono_id) {
      return res.status(400).json({ success: false, message: 'Campos obrigatórios: planta, dono_id' });
    }

    const nova = new Plantacao({
      planta: String(planta).trim(),
      localizacaoX: Number(localizacaoX || 0),
      localizacaoY: Number(localizacaoY || 0),
      dono_id
    });

    await nova.save();
    return res.status(201).json({ success: true, data: nova });
  } catch (err) {
    console.error('Erro ao criar plantação:', err);
    return res.status(500).json({ success: false, message: 'Erro ao criar plantação' });
  }
};

module.exports = { getAllPlantacoes, createPlantacao };