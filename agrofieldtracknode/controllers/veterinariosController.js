const Users = require('../models/UserModel');
const bcrypt = require('bcrypt');

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
module.exports = { getAllVeterinarios, createVeterinario, getusertype };