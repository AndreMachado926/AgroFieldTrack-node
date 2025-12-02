const express = require('express');
const app = express();
const SettingsController = require('../controllers/settingsController');
const is_auth = require("../middleware/is_auth")
const path = require('path');
const { upload, uploadPeixe } = require('../middleware/storage');

// Rotas
app.post('/settings/profile-pic', is_auth,upload.single('file'), SettingsController.updateProfilePic);
app.post('/settings/delete-account',is_auth, SettingsController.deleteAccount);
app.put('/settings/profile', is_auth, SettingsController.updateProfile);
app.post('/settings/editpassword', is_auth, SettingsController.editpassword);

module.exports = app;
