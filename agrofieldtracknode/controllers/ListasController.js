const Animal = require('../models/AnimaisModel');
const User = require('../models/UserModel');
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
const updateAnimalLocation = async (req, res) => {
  try {
    const animalId = req.params?.id || req.body?.id;
    if (!animalId) return res.status(400).json({ success: false, message: 'animal id obrigatório (params.id ou body.id)' });

    const newX = req.body?.localizacaoX;
    const newY = req.body?.localizacaoY;
    if (newX === undefined && newY === undefined) {
      return res.status(400).json({ success: false, message: 'Pelo menos localizacaoX ou localizacaoY obrigatório' });
    }

    // buscar documento atual
    const doc = await Animal.findById(animalId).select('localizacaoX localizacaoY locationHistory');
    if (!doc) return res.status(404).json({ success: false, message: 'Animal não encontrado' });

    const prevX = doc.localizacaoX;
    const prevY = doc.localizacaoY;
    const parsedNewX = newX !== undefined ? Number(newX) : prevX;
    const parsedNewY = newY !== undefined ? Number(newY) : prevY;

    // se não mudou, devolve sem alterações
    if (parsedNewX === prevX && parsedNewY === prevY) {
      return res.status(200).json({ success: true, message: 'Coordenadas inalteradas', data: doc });
    }

    // atômico: push histórico e set novas coordenadas
    const updated = await Animal.findByIdAndUpdate(
      animalId,
      {
        $push: { locationHistory: { x: prevX, y: prevY, at: new Date() } },
        $set: { localizacaoX: parsedNewX, localizacaoY: parsedNewY }
      },
      { new: true }
    ).lean();

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error('Erro ao actualizar localização:', err);
    return res.status(500).json({ success: false, message: 'Erro ao actualizar localização' });
  }
};

module.exports = { getAllAnimais, createAnimal, updateAnimalLocation, }