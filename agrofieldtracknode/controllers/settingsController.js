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
        const { username } = req.body;
        const userId = res.locals.user._id;

        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        user.username = username;
        await user.save();

        res.status(200).json({ message: 'Username updated successfully', user });
      } catch (error) {
        console.error('Error updating username:', error);
        res.status(500).json({ error: 'Error updating username' });
      }
    },

  // Edit password only (dedicated route)
  editpassword: async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      const userId = res.locals.user._id;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Verify old password
      const validPassword = await bcrypt.compare(oldPassword, user.password);
      if (!validPassword) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      // Hash and update new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();

      res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Error updating password:', error);
      res.status(500).json({ error: 'Error updating password' });
    }
  },

};

module.exports = settingsController; 