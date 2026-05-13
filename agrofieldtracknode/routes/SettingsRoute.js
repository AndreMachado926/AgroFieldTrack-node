const express = require('express');
const router = express.Router();
const SettingsController = require('../controllers/settingsController');
const is_auth = require("../middleware/is_auth")

router.use(express.json({ limit: '10mb' }));
router.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rotas
router.post('/settings/profile-pic', SettingsController.updateProfilePic);
router.post('/settings/delete-account', SettingsController.deleteAccount);
router.post('/settings/username', SettingsController.updateusername);
router.post('/settings/request-email-change', SettingsController.requestEmailChange);
router.post('/settings/confirm-email-change', SettingsController.confirmEmailChange);
router.post('/settings/editpassword', SettingsController.editpassword);
router.post('/settings/getuserinfo', SettingsController.getuserinfo);
router.post('/settings/getusermode', SettingsController.getusermode);
router.post('/settings/updatemode', SettingsController.updatemode);
module.exports = router;
