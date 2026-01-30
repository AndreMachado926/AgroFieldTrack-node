const Users = require("../models/UserModel");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const jwtKey = process.env.JWT_KEY || 'jkdoamnwpa';
const { sendVerificationEmail } = require("../services/emailservice");
const Chats = require("../models/ChatsModel");

const ChatsController = {

    getOrCreateChat: async (req, res) => {
        const { user1_id, user2_id } = req.params;

        try {
            // 1️⃣ Procurar chat existente (ordem indiferente)
            let chat = await Chats.findOne({
                $or: [
                    { user1_id, user2_id },
                    { user1_id: user2_id, user2_id: user1_id }
                ]
            });

            if (chat) {
                return res.status(200).json(chat);
            }

            // 2️⃣ Buscar utilizadores
            const user1 = await Users.findById(user1_id).select("type");
            const user2 = await Users.findById(user2_id).select("type");

            if (!user1 || !user2) {
                return res.status(404).json({
                    message: "Um ou ambos os utilizadores não existem"
                });
            }

            // 3️⃣ Criar novo chat
            chat = new Chats({
                user1_id,
                user1_type: user1.type,
                user2_id,
                user2_type: user2.type,
                mensagens: []
            });

            await chat.save();

            res.status(201).json(chat);

        } catch (err) {
            console.error("Erro getOrCreateChat:", err);
            res.status(500).json({
                message: err.message || "Erro no servidor"
            });
        }
    },
    createMessage: async (req, res) => {
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
    },
    getChatMessages: async (req, res) => {
        const { chatId } = req.params;

        try {
            const chat = await Chats.findById(chatId).select("mensagens");

            if (!chat) {
                return res.status(404).json({ message: "Chat não encontrado" });
            }

            res.status(200).json(chat.mensagens);
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: err.message || "Erro ao obter mensagens do chat",
            });
        }
    },
    getContactsForUser: async (req, res) => {
        const { user_id } = req.params;

        try {
            // Buscar todos os chats onde o user_id participa
            const chats = await Chats.find({
                $or: [
                    { user1_id: user_id },
                    { user2_id: user_id }
                ]
            });

            // Mapear os IDs das pessoas com quem ele tem chat
            const contactsIds = chats.map(chat =>
                chat.user1_id === user_id ? chat.user2_id : chat.user1_id
            );

            // Buscar informações desses usuários: username + email + profilePic + type
            const contacts = await Users.find({ _id: { $in: contactsIds } })
                .select("_id username email profilePic type");

            res.status(200).json(contacts);

        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message || "Erro no servidor" });
        }
    }

};


module.exports = ChatsController;