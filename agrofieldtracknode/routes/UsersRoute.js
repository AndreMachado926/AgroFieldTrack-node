const express = require('express');
const router = express.Router();
const { getUserType } = require('../controllers/UsersController');
const { isAuth } = require('../middleware/is_auth');

// Rota para obter o tipo de utilizador
router.get('/users/:userId/type', isAuth, getUserType);

module.exports = router;
