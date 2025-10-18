const express = require('express');
const router = express.Router();
const { getRemediosByAnimal, createRemedio } = require('../controllers/RemediosController');

router.get('/remedios/animal/:animal_id', getRemediosByAnimal);

router.get('/remedios', getRemediosByAnimal);

router.post('/remedios', createRemedio);

module.exports = router;