const express = require('express');
const router = express.Router();
const { getPlantacoes, createPlantacao } = require('../controllers/PlantacoesControler');

// GET /plantacoes           -> retorna plantações do user via token ou query
router.get('/plantacoes', getPlantacoes);
// GET /plantacoes/:user_id  -> retorna plantações do user especificado
router.get('/plantacoes/:user_id', getPlantacoes);
// POST /plantacoes          -> cria plantação
router.post('/plantacoes', createPlantacao);



module.exports = router;module.exports = router;