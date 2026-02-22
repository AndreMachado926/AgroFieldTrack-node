const express = require("express");
const router = express.Router();
const users = require("../controllers/backofice/users");
const animais = require("../controllers/backofice/animais");
const plantacoes = require("../controllers/backofice/plantaçoes");
// Listar usuários
router.get("/users", users.getAllUsers);
router.get("/animais", animais.getAllanimais);
router.get("/plantacoes", plantacoes.getAllPlantacoes);
// Adicionar usuário
router.post("/users/add", users.addUser);
router.post("/animais/add", animais.addanimal);
router
// Editar usuário (id vem no body)
router.post("/users/edit", users.editUser);
router.post("/animais/edit", animais.editAnimal);
router.post("/plantacoes/add", plantacoes.addPlantacao);
// Deletar usuário
router.delete("/users/delete/:id", users.deleteUser);
router.delete("/animais/delete/:id", animais.deleteAnimal);
router.delete("/plantacoes/delete/:id", plantacoes.deletePlantacao);
module.exports = router;
