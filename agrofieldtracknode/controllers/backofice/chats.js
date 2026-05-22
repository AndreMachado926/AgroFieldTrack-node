const Chats = require("../../models/ChatsModel");

const getAllChats = async (req, res) => {
    try {
        const chats = await Chats.find().exec();
        res.render("admin_chats", { chats });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao carregar chats");
    }
};

const addChat = async (req, res) => {
    try {
        const { chatType, participantes_ids } = req.body;

        if (!chatType) {
            return res.json({ success: false, message: "Chat type é obrigatório!" });
        }

        const newChat = new Chats({
            chatType,
            participantes: participantes_ids || [],
            mensagens: []
        });

        await newChat.save();
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: err.message });
    }
};

const editChat = async (req, res) => {
    try {
        const { id, chatType, participantes_ids } = req.body;

        const updateData = {
            chatType,
            participantes: participantes_ids || []
        };

        await Chats.findByIdAndUpdate(id, updateData);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(400).json({ success: false, message: err.message });
    }
};

const deleteChat = async (req, res) => {
    try {
        await Chats.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: err.message });
    }
};

module.exports = {
    getAllChats,
    addChat,
    editChat,
    deleteChat
};
