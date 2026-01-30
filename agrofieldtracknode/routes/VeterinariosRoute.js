const express = require('express');
const router = express.Router();
const { getAllVeterinarios, createVeterinario } = require('../controllers/veterinariosController');

// GET  /veterinarios       -> lista todos os veterinários
// POST /veterinarios       -> cria um novo usuário do tipo veterinario
router.get('/veterinarios', getAllVeterinarios);
router.post('/veterinarios', createVeterinario);
router.get('/veterinarios/:id/type', getusertype);

module.exports = router;