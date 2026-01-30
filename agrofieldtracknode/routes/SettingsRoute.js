const express = require('express');
const app = express();
const SettingsController = require('../controllers/settingsController');
const is_auth = require("../middleware/is_auth")
const path = require('path');
const { upload, uploadPeixe } = require('../middleware/storage');

// Rotas
app.post('/settings/profile-pic',upload.single('file'), SettingsController.updateProfilePic);
app.post('/settings/delete-account', SettingsController.deleteAccount);
app.post('/settings/username', SettingsController.updateusername);
app.post('/settings/editpassword', SettingsController.editpassword);
app.post('/settings/getuserinfo', SettingsController.getuserinfo);
module.exports = app;
