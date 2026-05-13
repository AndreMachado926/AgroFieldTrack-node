const express = require('express');
const router = express.Router();
const SettingsController = require('../controllers/settingsController');
const is_auth = require("../middleware/is_auth")
const { testEmailService } = require('../services/emailservice');

router.use(express.json({ limit: '10mb' }));
router.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rota de teste para verificar serviço de email
router.post('/settings/test-email', async (req, res) => {
  try {
    const { testEmail } = req.body;
    if (!testEmail) {
      return res.status(400).json({ error: 'testEmail is required' });
    }
    
    const result = await testEmailService(testEmail);
    res.json(result);
  } catch (error) {
    console.error('Error testing email service:', error);
    res.status(500).json({ error: 'Error testing email service', details: error.message });
  }
});

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
