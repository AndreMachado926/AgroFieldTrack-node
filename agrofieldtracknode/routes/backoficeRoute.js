const express = require("express");
const router = express.Router();
const { getAllUsers, addUser, editUser, deleteUser } = require("../controllers/Backoficecontroller");

// Listar usuários
router.get("/users", getAllUsers);

// Adicionar usuário
router.post("/users/add", addUser);

// Editar usuário (id vem no body)
router.post("/users/edit", editUser);

// Deletar usuário
router.delete("/users/delete/:id", deleteUser);

module.exports = router;
