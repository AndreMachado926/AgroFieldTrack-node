const Users = require("../../models/UserModel");
const Animal = require("../../models/AnimaisModel");
const jwt = require('jsonwebtoken');
const jwtKey = process.env.JWT_KEY || 'jkdoamnwpa';
const mongoose = require('mongoose');

const parseDecimal = value => {
    if (value === undefined || value === null) return NaN;
    if (typeof value === 'string') {
        value = value.trim().replace(',', '.');
    }
    return Number(value);
};

const getAllanimais = async (req, res) => {
    try {
        const animais = await Animal.find().populate('dono_id').exec();
        const users = await Users.find().exec();
        res.render("admin_animais", { animais, users });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao carregar animais");
    }
};
const addanimal = async (req, res) => {
    try {
        const body = req.body || {};
        const { nome, idade, raca, localizacaoX, localizacaoY, dono_id } = body;
        const parsedIdade = parseDecimal(idade);
        const parsedX = parseDecimal(localizacaoX);
        const parsedY = parseDecimal(localizacaoY);

        if (!nome || isNaN(parsedIdade) || !raca || isNaN(parsedX) || isNaN(parsedY) || !dono_id) {
            return res.json({ success: false, message: "Campos obrigatórios faltando ou inválidos!" });
        }

        const newAnimal = new Animal({
            nome,
            idade: parsedIdade,
            raca,
            localizacaoX: parsedX,
            localizacaoY: parsedY,
            dono_id
        });

        await newAnimal.save();
        res.json({ success: true });

    } catch (err) {
        console.error(err);
        res.json({ success: false, message: err.message });
    }
};
const editAnimal = async (req, res) => {
    try {
        const { id, nome, idade, raca, localizacaoX, localizacaoY, dono_id } = req.body;
        const parsedIdade = parseDecimal(idade);
        const parsedX = parseDecimal(localizacaoX);
        const parsedY = parseDecimal(localizacaoY);

        const updateData = {
            nome,
            idade: parsedIdade,
            raca,
            localizacaoX: parsedX,
            localizacaoY: parsedY,
            dono_id
        };

        if (!id || !nome || isNaN(parsedIdade) || !raca || isNaN(parsedX) || isNaN(parsedY) || !dono_id) {
            return res.status(400).json({ success: false, message: 'Campos obrigatórios faltando ou inválidos!' });
        }

        await Animal.findByIdAndUpdate(id, updateData);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(400).json({ success: false, message: err.message });
    }
};
const deleteAnimal = async (req, res) => {
    try {
        await Animal.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: err.message });
    }
};
module.exports = {
    getAllanimais,
    addanimal,
    editAnimal,
    deleteAnimal,
};
