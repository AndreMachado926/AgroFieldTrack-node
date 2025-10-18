const Plantacao = require('../models/PlantacoesModel'); // ajuste se o nome do model for diferente
const jwt = require('jsonwebtoken');
const jwtKey = process.env.JWT_KEY || 'jkdoamnwpa';

const getPlantacoes = async (req, res) => {
  try {
    // aceita: /plantacoes/:user_id  ou query ?user_id=...  ou token (cookie Authorization)
    let ownerId = req.params?.user_id || req.params?.dono_id || req.query?.user_id || req.query?.dono_id || null;

    if (!ownerId) {
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
      ownerId = decoded.user_id || decoded.id || decoded._id || decoded.sub;
      if (!ownerId) return res.status(401).json({ success: false, message: 'Invalid token payload' });
    }

    const plantacoes = await Plantacao.find({ dono_id: ownerId }).lean();
    return res.status(200).json({ success: true, count: plantacoes.length, data: plantacoes });
  } catch (err) {
    console.error('Erro ao obter plantações:', err);
    return res.status(500).json({ success: false, message: 'Erro ao obter plantações' });
  }
};


const createPlantacao = async (req, res) => {
  // ...existing createPlantacao implementation or placeholder...
};

module.exports = { getPlantacoes, createPlantacao };
