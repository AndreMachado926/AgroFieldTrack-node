const User = require('../models/UserModel');

// Obter o tipo de utilizador
const getUserType = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validar se userId foi fornecido
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID é obrigatório' });
    }

    // Buscar o utilizador no banco de dados
    const user = await User.findById(userId).select('type');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilizador não encontrado' });
    }

    res.status(200).json({ success: true, type: user.type });
  } catch (err) {
    console.error('Erro ao obter tipo de utilizador:', err);
    res.status(500).json({ success: false, message: 'Erro ao obter tipo de utilizador', error: err.message });
  }
};

module.exports = {
  getUserType
};
