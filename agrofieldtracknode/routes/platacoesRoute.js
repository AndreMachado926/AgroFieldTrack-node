const express = require('express');
const router = express.Router();
// ajuste para o nome do ficheiro do controller que tens (PlantacoesControler.js)
const { getAllPlantacoes, createPlantacao } = require('../controllers/PlantacoesControler');

router.get('/plantacoes/:dono_id', getAllPlantacoes);
router.get('/plantacoes', getAllPlantacoes); 

module.exports = router;