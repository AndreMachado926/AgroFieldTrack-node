const express = require('express');
const router = express.Router();
const { getAllAnimais, createAnimal, updateAnimalLocation,getusernamebydio } = require('../controllers/ListasController');

// GET  /animais/:dono_id  -> lista animais do dono
router.get('/animais/:dono_id', getAllAnimais);
// POST /animais           -> cria animal
router.post('/animais', createAnimal);
// PUT  /animais/:id/localizacao -> atualiza localizacao e guarda histórico
router.put('/animais/:id/localizacao', updateAnimalLocation);

// opcional: aceitar id no body
router.put('/animais/localizacao', updateAnimalLocation);

module.exports = router;

