const express = require('express');
const router = express.Router();
const { getPastos, getPastoById, createPasto, editPasto, deletePasto } = require('../controllers/PastoController');

router.get('/pastos', getPastos);
router.get('/pastos/user/:user_id', getPastos);
router.get('/pastos/:id', getPastoById);
router.post('/pastos', createPasto);
router.post('/pastos/edit', editPasto);
router.delete('/pastos/delete/:id', deletePasto);

module.exports = router;
