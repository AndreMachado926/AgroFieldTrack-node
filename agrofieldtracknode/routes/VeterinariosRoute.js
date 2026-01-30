const express = require('express');
const router = express.Router();
const veterinariosController = require('../controllers/veterinariosController');

// GET  /veterinarios       -> lista todos os veterinários
// POST /veterinarios       -> cria um novo usuário do tipo veterinario
router.get('/veterinarios', veterinariosController.getAllVeterinarios);
router.post('/veterinarios', veterinariosController.createVeterinario);
router.get('/veterinarios/:id/type', veterinariosController.getusertype);

module.exports = router;