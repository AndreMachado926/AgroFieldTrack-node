const express = require("express");
const router = express.Router();
const users = require("../controllers/backofice/users");
const animais = require("../controllers/backofice/animais");
const plantacoes = require("../controllers/backofice/plantaçoes");
const remedios = require("../controllers/backofice/remedios");
const chats = require("../controllers/backofice/chats");
const pastos = require("../controllers/backofice/pastos");

router.get("/users", users.getAllUsers);
router.get("/animais", animais.getAllanimais);
router.get("/plantacoes", plantacoes.getAllPlantacoes);
router.get("/remedios", remedios.getAllRemedios);
router.get("/chats", chats.getAllChats);
router.get("/pastos", pastos.getAllPastos);


router.post("/users/add", users.addUser);
router.post("/animais/add", animais.addanimal);
router.post("/plantacoes/add", plantacoes.addPlantacao);
router.post("/remedios/add", remedios.addRemedio);
router.post("/chats/add", chats.addChat);
router.post("/pastos/add", pastos.addPasto);


router.post("/users/edit", users.editUser);
router.post("/animais/edit", animais.editAnimal);
router.post("/plantacoes/edit", plantacoes.editPlantacao);
router.post("/remedios/edit", remedios.editRemedio);
router.post("/chats/edit", chats.editChat);
router.post("/pastos/edit", pastos.editPasto);


router.delete("/users/delete/:id", users.deleteUser);
router.delete("/animais/delete/:id", animais.deleteAnimal);
router.delete("/plantacoes/delete/:id", plantacoes.deletePlantacao);
router.delete("/remedios/delete/:id", remedios.deleteRemedio);
router.delete("/chats/delete/:id", chats.deleteChat);
router.delete("/pastos/delete/:id", pastos.deletePasto);
module.exports = router;
