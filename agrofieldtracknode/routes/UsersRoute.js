const express = require('express');
const router = express.Router();
const { getUserType } = require('../controllers/UsersController');

// Rota para obter o tipo de utilizador
router.get('/users/:userId/type', getUserType);

module.exports = router;
