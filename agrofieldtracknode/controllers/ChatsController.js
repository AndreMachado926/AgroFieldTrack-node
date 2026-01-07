const Users = require("../models/UserModel");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const jwtKey = process.env.JWT_KEY || 'jkdoamnwpa';
const { sendVerificationEmail } = require("../services/emailservice");
const ChatsController = {

    getOrCreateChat: async (req, res) => {
        const Chats = require("../models/ChatsModel");
        const { user1_id, user1_type, user2_id, user2_type } = req.params;

        try {
            // procura chat existente, independente da ordem dos usuários
            let chat = await Chats.findOne({
                $or: [
                    { user1_id, user1_type, user2_id, user2_type },
                    { user1_id: user2_id, user1_type: user2_type, user2_id: user1_id, user2_type: user1_type }
                ]
            });

            // se não existir, cria um novo chat
            if (!chat) {
                chat = new Chats({
                    user1_id,
                    user1_type,
                    user2_id,
                    user2_type,
                    mensagens: []
                });
                await chat.save();
            }

            res.status(200).json(chat);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message || "Erro no servidor" });
        }
    },
    createMessage: async (req, res) => {
        const Chats = require("../models/ChatsModel");
        const { chatId } = req.params;
        const { sender_id, sender_type, text } = req.body; // usar 'text' para ser consistente

        if (!sender_id || !sender_type || !text) {
            return res.status(400).json({ message: "Campos sender_id, sender_type e text são obrigatórios" });
        }

        try {
            const chat = await Chats.findById(chatId);
            if (!chat) {
                return res.status(404).json({ message: "Chat não encontrado" });
            }

            chat.mensagens.push({
                sender_id,
                sender_type,
                text,
                createdAt: new Date() // garante timestamp
            });

            await chat.save();
            res.status(200).json(chat);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message || "Erro no servidor" });
        }
    }
};


module.exports = ChatsController;