const User = require('../models/UserModel');
const bcrypt = require('bcrypt');

const settingsController = {

  // Update profile picture
  updateProfilePic: async (req, res) => {
    try {
      const userData = JSON.parse(req.body.user); // Parse o user do body
      const userId = userData._id;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      user.profilePic = req.file.location; // filename gerado pelo multer
      await user.save();

      console.log("user atualizado: ", user);

      res.json({ profilePic: req.file.location }); // só retorna o filename
    } catch (error) {
      console.error('Error updating profile picture:', error);
      res.status(500).json({ error: 'Error updating profile picture' });
    }
  },

  deleteAccount: async (req, res) => {
    try {
      const userId = res.locals.user._id;
      const password = req.body.password;
      console.log("password:", password)

      if (!password) {
        return res.status(400).json({ error: 'Missing password' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ error: 'Invalid password' });
      }

      await User.findByIdAndDelete(userId);
      res.status(200).json({ message: 'Account deleted successfully' });

    } catch (error) {
      console.error('Error deleting account:', error.message || error);
      res.status(500).json({ error: 'Error deleting account' });
    }
  },
  updateusername: async (req, res) => {
    try {
      const { id, username } = req.body;

      // Verifica se os dados foram enviados
      if (!id || !username) {
        return res.status(400).json({ message: "ID e username são obrigatórios." });
      }

      // Verifica se o username já existe
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(409).json({ message: "Username já está em uso." });
      }

      // Atualiza o username
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { username },
        { new: true } // Retorna o documento atualizado
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "Usuário não encontrado." });
      }

      return res.status(200).json({ username: updatedUser.username });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erro ao atualizar username." });
    }
  },
  editpassword: async (req, res) => {
    try {
      const { id, oldPassword, newPassword } = req.body;

      // Valida dados recebidos
      if (!id || !oldPassword || !newPassword) {
        return res.status(400).json({ message: "ID, senha antiga e nova senha são obrigatórios." });
      }

      // Busca usuário pelo ID
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado." });
      }

      // Verifica se a senha antiga confere
      const passwordMatches = await bcrypt.compare(oldPassword, user.password);
      if (!passwordMatches) {
        return res.status(401).json({ message: "Senha antiga incorreta." });
      }

      // Gera hash da nova senha
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Atualiza a senha
      user.password = hashedPassword;
      await user.save();

      return res.status(200).json({ message: "Senha alterada com sucesso!" });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erro ao alterar senha." });
    }
  },
  getuserinfo: async (req, res) => {
    try {
      const { id } = req.body; // ID enviado pelo front-end
      if (!id) {
        return res.status(400).json({ error: "ID do usuário é obrigatório" });
      }

      const user = await User.findById(id).select('-password'); // exclui senha do retorno
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      res.status(200).json(user); // retorna todas as informações do usuário (menos senha)
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro ao buscar informações do usuário" });
    }
  },
};

module.exports = settingsController; 