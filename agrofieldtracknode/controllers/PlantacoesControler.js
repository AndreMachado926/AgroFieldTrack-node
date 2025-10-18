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


module.exports = { getAllPlantacoes};
