const express = require('express');
const app = express();
const verificationController = require('../controllers/VerificationController');
app.get('/verification', verificationController.verifyEmail);
module.exports = app;
