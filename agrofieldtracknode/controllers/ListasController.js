const Animal = require('../models/AnimaisModel');
const jwt = require('jsonwebtoken');
const jwtKey = process.env.JWT_KEY || 'jkdoamnwpa';

const getAllAnimais = async (req, res) => {
  try {
    // allow explicit dono_id via route param (/animais/:dono_id)
    const paramDonoId = req.params?.dono_id;
    let donoId = paramDonoId;

    // if no param, try token from cookie or Authorization header
    if (!donoId) {
      const token = req.cookies?.jwt || (req.headers.authorization ? req.headers.authorization.split(' ')[1] : null);
      if (!token) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }
      let decoded;
      try {
        decoded = jwt.verify(token, jwtKey);
      } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }
      donoId = decoded.user_id || decoded.id || decoded._id;
      if (!donoId) {
        return res.status(401).json({ success: false, message: 'Invalid token payload' });
      }
    }

    const animais = await Animal.find({ dono_id: donoId }).lean();
    return res.status(200).json({
      success: true,
      count: animais.length,
      data: animais
    });
  } catch (err) {
    console.error('Erro ao obter animais:', err);
    return res.status(500).json({
      success: false,
      message: 'Erro ao obter animais'
    });
  }
};

// função para adicionar um animal
const createAnimal = async (req, res) => {
  try {
    const { nome, raca, idade, localizacaoX, localizacaoY } = req.body;

    // get dono_id from body or from token
    let dono_id = req.body?.dono_id;
    if (!dono_id) {
      const token = req.cookies?.jwt || (req.headers.authorization ? req.headers.authorization.split(' ')[1] : null);
      if (token) {
        try {
          const decoded = jwt.verify(token, jwtKey);
          dono_id = decoded.user_id || decoded.id || decoded._id;
        } catch (err) {
          // ignore here, will validate below
        }
      }
    }

    if (!nome || idade === undefined || !dono_id || raca === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: nome, idade, localizacaoX, localizacaoY, dono_id, raca'
      });
    }

    const animal = new Animal({
      nome: String(nome).trim(),
      idade: Number(idade),
      raca: String(raca),
      localizacaoX: Number(localizacaoX || 0),
      localizacaoY: Number(localizacaoY || 0),
      dono_id
    });

    await animal.save();

    return res.status(201).json({ success: true, data: animal });
  } catch (err) {
    console.error('Erro ao criar animal:', err);
    return res.status(500).json({ success: false, message: 'Erro ao criar animal' });
  }
};

module.exports = { getAllAnimais, createAnimal };