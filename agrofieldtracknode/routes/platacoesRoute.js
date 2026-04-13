const express = require('express');
const router = express.Router();
const { getPlantacoes, getPlantacaoById, createPlantacao, editplantacoes } = require('../controllers/PlantacoesControler');

// Rotas
// suportar GET /plantacoes (usa token/cookie) e GET /plantacoes/user/:user_id (param)
router.get('/plantacoes', getPlantacoes);
router.get('/plantacoes/user/:user_id', getPlantacoes);
router.get('/plantacoes/:id', getPlantacaoById);
router.post('/plantacoes', createPlantacao);
router.post('/editplantacoes', editplantacoes);

module.exports = router;