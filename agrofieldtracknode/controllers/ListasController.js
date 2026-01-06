// controllers/ListasController.js
import Animal from '../models/AnimaisModel.js';
import User from '../models/UserModel.js';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import mongoose from 'mongoose';

const jwtKey = process.env.JWT_KEY || 'jkdoamnwpa';

// Retorna todos os animais de um usuário
export const getAllAnimais = async (req, res) => {
  try {
    const dono_id = req.params.dono_id;

    if (!dono_id) {
      return res.status(400).json({ message: "Dono ID é obrigatório" });
    }

    const animais = await Animal.find({ dono_id });

    if (!animais || animais.length === 0) {
      return res.status(200).json({ data: [], message: "Nenhum animal encontrado para este usuário" });
    }

    return res.status(200).json({ data: animais });
  } catch (err) {
    console.error("Erro ao buscar animais:", err);
    return res.status(500).json({ message: "Erro interno no servidor" });
  }
};

// Cria um novo animal
export const createAnimal = async (req, res) => {
  try {
    const { nome, raca, idade, localizacaoX, localizacaoY } = req.body;

    let dono_id = req.body?.dono_id;
    if (!dono_id) {
      const token = req.cookies?.jwt || (req.headers.authorization ? req.headers.authorization.split(' ')[1] : null);
      if (token) {
        try {
          const decoded = jwt.verify(token, jwtKey);
          dono_id = decoded.user_id || decoded.id || decoded._id;
        } catch (err) {
          // ignore
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
      localizacaoX: localizacaoX ?? 0,
      localizacaoY: localizacaoY ?? 0,
      dono_id
    });

    await animal.save();

    return res.status(201).json({ success: true, data: animal });
  } catch (err) {
    console.error('Erro ao criar animal:', err);
    return res.status(500).json({ success: false, message: 'Erro ao criar animal' });
  }
};

// Atualiza a localização do animal
export const updateAnimalLocation = async (req, res) => {
  try {
    const animalId = req.params?.id || req.body?.id;
    if (!animalId) return res.status(400).json({ success: false, message: 'animal id obrigatório (params.id ou body.id)' });

    const newX = req.body?.localizacaoX;
    const newY = req.body?.localizacaoY;
    if (newX === undefined && newY === undefined) {
      return res.status(400).json({ success: false, message: 'Pelo menos localizacaoX ou localizacaoY obrigatório' });
    }

    const doc = await Animal.findById(animalId).select('localizacaoX localizacaoY locationHistory');
    if (!doc) return res.status(404).json({ success: false, message: 'Animal não encontrado' });

    const prevX = doc.localizacaoX;
    const prevY = doc.localizacaoY;
    const parsedNewX = newX !== undefined ? Number(newX) : prevX;
    const parsedNewY = newY !== undefined ? Number(newY) : prevY;

    if (parsedNewX === prevX && parsedNewY === prevY) {
      return res.status(200).json({ success: true, message: 'Coordenadas inalteradas', data: doc });
    }

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
