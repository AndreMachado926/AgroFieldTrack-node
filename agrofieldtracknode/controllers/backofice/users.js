const Users = require("../../models/UserModel");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const jwtKey = process.env.JWT_KEY || 'jkdoamnwpa';
const mongoose = require('mongoose');

const getAllUsers = async (req, res) => {
    try {
        const users = await Users.find();
        res.render("admin_users", { users });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao carregar usuários");
    }
};
const addUser = async (req, res) => {
    try {
        const body = req.body || {};
        const { username, email, type, password, descricao, especializacao, nome_completo, telefone } = body;

        if (!username || !email || !password || !type) {
            return res.json({ success: false, message: "Campos obrigatórios faltando!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new Users({
            username,
            email,
            type,
            password: hashedPassword,
            descricao,
            especializacao,
            nome_completo,
            telefone
        });

        await newUser.save();
        res.json({ success: true });

    } catch (err) {
        console.error(err);
        res.json({ success: false, message: err.message });
    }
};
const editUser = async (req, res) => {
    try {
        const { id, username, email, type, ativo, nome_completo, telefone, descricao, especializacao, password } = req.body;

        const updateData = { username, email, type, ativo, nome_completo, telefone, descricao, especializacao };
        if (password && password.trim() !== "") {
            updateData.password = await bcrypt.hash(password, 10); // criptografa senha na edição também
        }

        await Users.findByIdAndUpdate(id, updateData);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(400).json({ success: false, message: err.message });
    }
};
const deleteUser = async (req, res) => {
    try {
        await Users.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: err.message });
    }
};

module.exports = {
    getAllUsers,
    addUser,
    editUser,
    deleteUser
};