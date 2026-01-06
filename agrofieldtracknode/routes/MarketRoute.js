const express = require("express");
const app = express();
const MarketController = require('../controllers/MarketController');
const {upload, uploadPeixe} = require('../middleware/storage');


const verifyToken = require("../middleware/is_auth");

app.get('/comunidade', MarketController.getPublications);
app.post('/insertcomunidade',upload.single('file'), MarketController.createPublication);
app.get('/detalhescomunidade/:id', MarketController.getPublicationDetails);
app.post('/deletecomunidade/:id', MarketController.deletePublication);
app.post('/updatecomunidade/:id', upload.single('file'), MarketController.updatePublication);
app.post('/comentario/:id', upload.array('file', 5), MarketController.addComentario);
app.put('/comentarios/:id/editar',upload.array('file', 5), MarketController.editarComentario);
app.delete('/comentarios/:id/remover', MarketController.removerComentario);

module.exports = app;