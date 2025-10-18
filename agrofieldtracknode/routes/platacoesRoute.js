const express = require('express');
const router = express.Router();
const { getAllplantacoes,createPlantacao } = require('../controllers/PlantacoesControler');


router.get('/plantacoes', getAllplantacoes);
router.post('/plantacoes', createPlantacao);

module.exports = router;