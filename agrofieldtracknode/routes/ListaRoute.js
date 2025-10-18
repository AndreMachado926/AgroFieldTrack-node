const express = require('express');
const router = express.Router();
const { getAllAnimais, createAnimal } = require('../controllers/ListasController');

console.log('ListaRoute carregada'); // <--- confirma no console que o router foi importado

router.get('/animais', getAllAnimais);
router.post('/animais', createAnimal);

module.exports = router;