const Remedio = require("../../models/remedio");
const Animal = require("../../models/AnimaisModel");
const mongoose = require("mongoose");


// LISTAR TODOS
const getAllRemedios = async (req, res) => {
    try {
        const remedios = await Remedio.find().populate('animal_id');
        const animais = await Animal.find();

        res.render("admin_remedios", { remedios, animais });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao carregar remédios");
    }
};


// ADICIONAR
const addRemedio = async (req, res) => {
    try {
        const { nome, animal_id, data, observacoes } = req.body;

        if (!nome || !animal_id || !data) {
            return res.json({ success: false, message: "Campos obrigatórios faltando!" });
        }

        const newRemedio = new Remedio({
            nome,
            animal_id,
            data,
            observacoes
        });

        await newRemedio.save();

        res.json({ success: true });

    } catch (err) {
        console.error(err);
        res.json({ success: false, message: err.message });
    }
};


// EDITAR
const editRemedio = async (req, res) => {
    try {
        const { id, nome, animal_id, data, observacoes } = req.body;

        const updateData = {
            nome,
            animal_id,
            data,
            observacoes
        };

        await Remedio.findByIdAndUpdate(id, updateData);

        res.json({ success: true });

    } catch (err) {
        console.error(err);
        res.status(400).json({ success: false, message: err.message });
    }
};


// DELETAR
const deleteRemedio = async (req, res) => {
    try {
        await Remedio.findByIdAndDelete(req.params.id);

        res.json({ success: true });

    } catch (err) {
        console.error(err);
        res.json({ success: false, message: err.message });
    }
};


module.exports = {
    getAllRemedios,
    addRemedio,
    editRemedio,
    deleteRemedio
};