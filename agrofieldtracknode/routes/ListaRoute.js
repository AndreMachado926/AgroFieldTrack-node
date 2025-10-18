const express = require('express');
const router = express.Router();
const { getAllAnimais, createAnimal } = require('../controllers/ListasController');

// Using route parameter - no colon in the actual URL when calling
router.get('/animais/:dono_id', getAllAnimais);
router.post('/animais', createAnimal);

module.exports = router;