const express = require("express");
const app = express();
const MarketController = require('../controllers/MarketController');
const {upload, uploadPeixe} = require('../middleware/storage');


const verifyToken = require("../middleware/is_auth");

app.get('/comunidade',verifyToken, MarketController.getPublications);
app.post('/insertcomunidade',verifyToken,upload.single('file'), MarketController.createPublication);
app.get('/detalhescomunidade/:id',verifyToken, MarketController.getPublicationDetails);
app.post('/deletecomunidade/:id',verifyToken, MarketController.deletePublication);
app.post('/updatecomunidade/:id',verifyToken, upload.single('file'), MarketController.updatePublication);
app.post('/comentario/:id',verifyToken, upload.array('file', 5), MarketController.addComentario);
app.put('/comentarios/:id/editar',verifyToken,upload.array('file', 5), MarketController.editarComentario);
app.delete('/comentarios/:id/remover',verifyToken, MarketController.removerComentario);

module.exports = app;