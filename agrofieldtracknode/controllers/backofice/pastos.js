const Pasto = require("../../models/pastosModel");

const getAllPastos = async (req, res) => {
    try {
        const pastos = await Pasto.find().populate('dono_id').exec();
        res.render("admin_pastos", { pastos });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao carregar pastos");
    }
};

const addPasto = async (req, res) => {
    try {
        const { nome, dono_id, pontosx, pontosy, animais_ids } = req.body;

        if (!nome || !dono_id || !pontosx || !pontosy) {
            return res.json({ success: false, message: "Campos obrigatórios faltando!" });
        }

        if (!Array.isArray(pontosx) || !Array.isArray(pontosy)) {
            return res.json({ success: false, message: "pontosx e pontosy devem ser arrays!" });
        }

        if (pontosx.length !== pontosy.length) {
            return res.json({ success: false, message: "pontosx e pontosy devem ter o mesmo tamanho!" });
        }

        if (pontosx.length < 3) {
            return res.json({ success: false, message: "É necessário pelo menos 3 pontos para definir uma área!" });
        }

        const newPasto = new Pasto({
            nome,
            pontosx,
            pontosy,
            dono_id,
            animais_ids: animais_ids || []
        });

        await newPasto.save();
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: err.message });
    }
};

const editPasto = async (req, res) => {
    try {
        const { id, nome, dono_id, pontosx, pontosy, animais_ids } = req.body;

        if (!Array.isArray(pontosx) || !Array.isArray(pontosy)) {
            return res.json({ success: false, message: "pontosx e pontosy devem ser arrays!" });
        }

        if (pontosx.length !== pontosy.length) {
            return res.json({ success: false, message: "pontosx e pontosy devem ter o mesmo tamanho!" });
        }

        if (pontosx.length < 3) {
            return res.json({ success: false, message: "É necessário pelo menos 3 pontos para definir uma área!" });
        }

        const updateData = {
            nome,
            pontosx,
            pontosy,
            dono_id,
            animais_ids: animais_ids || []
        };

        await Pasto.findByIdAndUpdate(id, updateData);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(400).json({ success: false, message: err.message });
    }
};

const deletePasto = async (req, res) => {
    try {
        await Pasto.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: err.message });
    }
};

module.exports = {
    getAllPastos,
    addPasto,
    editPasto,
    deletePasto
};
