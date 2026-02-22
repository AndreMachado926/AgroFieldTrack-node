const Plantacao = require("../../models/PlantacoesModel");
const Users = require("../../models/UserModel");
const jwt = require('jsonwebtoken');
const jwtKey = process.env.JWT_KEY || 'jkdoamnwpa';
const mongoose = require('mongoose');

const getAllPlantacoes = async (req, res) => {
    try {
        const plantacoes = await Plantacao.find().populate('dono_id');
        const users = await Users.find();
        res.render("admin_plantacoes", { plantacoes, users });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao carregar plantações");
    }
};
const addPlantacao = async (req, res) => {
    try {
        const body = req.body || {};
        const { nome, planta, pontosx, pontosy, dono_id } = body;
        if (!nome || !planta || !pontosx || !pontosy || !dono_id) {
            return res.json({ success: false, message: "Campos obrigatórios faltando!" });
        }

        const newPlantacao = new Plantacao({
            nome,
            planta,
            pontosx: JSON.parse(pontosx), // assuming it's sent as JSON string
            pontosy: JSON.parse(pontosy),
            dono_id
        });

        await newPlantacao.save();
        res.json({ success: true });

    } catch (err) {
        console.error(err);
        res.json({ success: false, message: err.message });
    }
};
const editPlantacao = async (req, res) => {
    try {
        const { id, nome, planta, pontosx, pontosy, dono_id } = req.body;

        const updateData = { nome, planta, pontosx: JSON.parse(pontosx), pontosy: JSON.parse(pontosy), dono_id };

        await Plantacao.findByIdAndUpdate(id, updateData);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(400).json({ success: false, message: err.message });
    }
};
const deletePlantacao = async (req, res) => {
    try {
        await Plantacao.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: err.message });
    }
};

module.exports = {
    getAllPlantacoes,
    addPlantacao,
    editPlantacao,
    deletePlantacao,
};