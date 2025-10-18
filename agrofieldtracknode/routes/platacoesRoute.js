const express = require('express');
const router = express.Router();
const { getPlantacoes, createPlantacao } = require('../controllers/PlantacoesControler');

// Rotas
// suportar GET /plantacoes (usa token/cookie) e GET /plantacoes/:user_id (param)
router.get('/plantacoes', getPlantacoes);
router.get('/plantacoes/:user_id', getPlantacoes);
router.post('/plantacoes', createPlantacao);

module.exports = router;