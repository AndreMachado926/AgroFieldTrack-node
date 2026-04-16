const Users = require('../models/UserModel');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Chats = require('../models/ChatsModel');

const getAllVeterinarios = async (req, res) => {
  try {
    const vets = await Users.find({ type: 'veterinario' }).select('-password').lean();
    return res.status(200).json({ success: true, count: vets.length, data: vets });
  } catch (err) {
    console.error('Erro ao obter veterinários:', err);
    return res.status(500).json({ success: false, message: 'Erro ao obter veterinários' });
  }
};

const createVeterinario = async (req, res) => {
  try {
    const { username, email, password, nome_completo, descricao, especializacao, telefone, profilePic } = req.body;

    if (!username || !email || !password || !nome_completo || !descricao || !especializacao || !telefone) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: username, email, password, nome_completo, descricao, especializacao, telefone'
      });
    }

    // Verifica existência por email ou username
    const exists = await Users.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return res.status(409).json({ success: false, message: 'Usuário com esse email ou username já existe' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const vet = new Users({
      username,
      email,
      password: hashed,
      type: 'veterinario',
      nome_completo,
      descricao,
      especializacao,
      telefone,
      profilePic: profilePic || ''
    });

    await vet.save();

    const vetObj = vet.toObject();
    delete vetObj.password;

    return res.status(201).json({ success: true, data: vetObj });
  } catch (err) {
    console.error('Erro ao criar veterinário:', err);
    return res.status(500).json({ success: false, message: 'Erro ao criar veterinário' });
  }
};
const getusertype = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await Users.findById(userId).select('type').lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }
    return res.status(200).json({ success: true, type: user.type });
  } catch (err) {
    console.error('Erro ao obter tipo de usuário:', err);
    return res.status(500).json({ success: false, message: 'Erro ao obter tipo de usuário' });
  }
}
const getveterinarioschats = async (req, res) => {
  try {
    const vetId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(vetId)) {
      return res.status(400).json({ success: false, message: 'ID de veterinário inválido' });
    }

    const chats = await Chats.find({
      $and: [
        {
          $or: [
            { user1_id: vetId },
            { user2_id: vetId }
          ]
        },
        {
          mensagens: {
            $elemMatch: {
              sender_id: { $ne: vetId }
            }
          }
        }
      ]
    })
      .populate('user1_id', 'username email profilePic type nome_completo telefone')
      .populate('user2_id', 'username email profilePic type nome_completo telefone')
      .lean();

    return res.status(200).json({ success: true, count: chats.length, data: chats });
  } catch (err) {
    console.error('Erro ao obter chats do veterinário:', err);
    return res.status(500).json({ success: false, message: 'Erro ao obter chats do veterinário' });
  }
};
const getSharedAnimalsForVeterinario = async (req, res) => {
  try {
    const vetId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(vetId)) {
      return res.status(400).json({ success: false, message: 'ID de veterinário inválido' });
    }

    const chats = await Chats.find({
      $and: [
        {
          $or: [
            { user1_id: vetId },
            { user2_id: vetId }
          ]
        },
        {
          mensagens: {
            $elemMatch: {
              animal_id: { $ne: null },
              sender_id: { $ne: vetId }
            }
          }
        }
      ]
    })
      .populate({
        path: 'mensagens.animal_id',
        populate: {
          path: 'dono_id',
          select: 'nome_completo username'
        }
      })
      .lean();

    const animalsById = new Map();

    chats.forEach(chat => {
      if (!Array.isArray(chat.mensagens)) return;
      chat.mensagens.forEach(mensagem => {
        if (!mensagem || !mensagem.animal_id) return;
        const animal = mensagem.animal_id;
        const senderId = mensagem.sender_id?.toString();
        const animalId = animal._id?.toString();

        if (!animalId || senderId === vetId) return;
        animalsById.set(animalId, animal);
      });
    });

    const animals = Array.from(animalsById.values());
    return res.status(200).json({ success: true, count: animals.length, data: animals });
  } catch (err) {
    console.error('Erro ao obter animais compartilhados para veterinário:', err);
    return res.status(500).json({ success: false, message: 'Erro ao obter animais compartilhados para veterinário' });
  }
};
module.exports = { getAllVeterinarios, createVeterinario, getusertype, getveterinarioschats, getSharedAnimalsForVeterinario };