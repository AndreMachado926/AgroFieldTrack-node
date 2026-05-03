const express = require('express');
const router = express.Router();

const { updateAnimalLocation } = require('../controllers/AnimaisController');

router.post('/animal/location', updateAnimalLocation);

module.exports = router;