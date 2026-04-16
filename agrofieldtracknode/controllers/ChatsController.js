const Users = require("../models/UserModel");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const jwtKey = process.env.JWT_KEY || 'jkdoamnwpa';
const { sendVerificationEmail } = require("../services/emailservice");
const Chats = require("../models/ChatsModel");
const Animal = require("../models/AnimaisModel");

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
        const { sender_id, sender_type, text, animal_id } = req.body;

        console.log("createMessage received payload:", { sender_id, sender_type, text, animal_id, chatId }); // Debug log

        // Validação: sender_id e sender_type são obrigatórios
        if (!sender_id || !sender_type) {
            console.log("Validation failed: missing sender_id or sender_type");
            return res.status(400).json({ message: "Campos sender_id e sender_type são obrigatórios" });
        }

        // Pelo menos text ou animal_id deve estar presente e não vazio
        const hasText = text && text.trim().length > 0;
        const hasAnimalId = animal_id && animal_id.trim().length > 0;

        if (!hasText && !hasAnimalId) {
            console.log("Validation failed: neither text nor animal_id provided");
            return res.status(400).json({ message: "Pelo menos text ou animal_id é obrigatório" });
        }

        try {
            const chat = await Chats.findById(chatId);
            if (!chat) {
                return res.status(404).json({ message: "Chat não encontrado" });
            }

            const message = {
                sender_id,
                sender_type,
                text: text || "",
                createdAt: new Date()
            };

            // Validar e adicionar animal_id se fornecido
            if (hasAnimalId) {
                const animal = await Animal.findById(animal_id).select("-__v");
                if (!animal) {
                    return res.status(404).json({ message: "Animal não encontrado" });
                }
                message.animal_id = animal_id;
                console.log("Animal adicionado à mensagem:", { animal_id }); // Debug log
            }

            chat.mensagens.push(message);
            await chat.save();
            console.log("Mensagem guardada com sucesso:", message); // Debug log
            
            // Retornar as mensagens populadas
            const updatedChat = await Chats.findById(chatId).populate("mensagens.animal_id", "-__v");
            res.status(200).json(updatedChat.mensagens);
        } catch (err) {
            console.error("Erro ao criar mensagem:", err);
            res.status(500).json({ message: err.message || "Erro no servidor" });
        }
    },
    getChatMessages: async (req, res) => {
        const { chatId } = req.params;

        try {
            const chat = await Chats.findById(chatId)
                .select("mensagens")
                .populate("mensagens.animal_id", "-__v");

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

        if (!user_id) {
            return res.status(400).json({ message: 'user_id é obrigatório' });
        }

        try {
            // Buscar todos os chats onde o user_id participa
            const chats = await Chats.find({
                $or: [
                    { user1_id: user_id },
                    { user2_id: user_id }
                ]
            }).lean();

            // Mapear os IDs das pessoas com quem ele tem chat e remover duplicados
            const contactIds = new Set();
            const normalizedUserId = user_id.toString();

            for (const chat of chats) {
                const user1 = chat.user1_id?.toString();
                const user2 = chat.user2_id?.toString();

                if (user1 === normalizedUserId && user2) {
                    contactIds.add(user2);
                } else if (user2 === normalizedUserId && user1) {
                    contactIds.add(user1);
                }
            }

            if (contactIds.size === 0) {
                return res.status(200).json([]);
            }

            // Buscar informações desses usuários: username + email + profilePic + type
            const contacts = await Users.find({ _id: { $in: Array.from(contactIds) } })
                .select("_id username email profilePic type");

            res.status(200).json(contacts);

        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message || "Erro no servidor" });
        }
    },
    
    getAllChatsForUser: async (req, res) => {
        const { user_id } = req.params;

        try {
            // Buscar todos os chats onde o user_id participa
            const chats = await Chats.find({
                $or: [
                    { user1_id: user_id },
                    { user2_id: user_id }
                ]
            }).sort({ updatedAt: -1 });

            // Para cada chat, adicionar informações do outro utilizador
            const chatsWithContacts = await Promise.all(
                chats.map(async (chat) => {
                    const otherUserId = chat.user1_id === user_id ? chat.user2_id : chat.user1_id;
                    const otherUser = await Users.findById(otherUserId)
                        .select("_id username email profilePic type");

                    return {
                        _id: chat._id,
                        chatId: chat._id,
                        user1_id: chat.user1_id,
                        user2_id: chat.user2_id,
                        otherUser: otherUser,
                        lastMessage: chat.mensagens && chat.mensagens.length > 0 
                            ? chat.mensagens[chat.mensagens.length - 1] 
                            : null,
                        createdAt: chat.createdAt,
                        updatedAt: chat.updatedAt
                    };
                })
            );

            res.status(200).json(chatsWithContacts);

        } catch (err) {
            console.error("Erro ao buscar chats do utilizador:", err);
            res.status(500).json({ message: err.message || "Erro no servidor" });
        }
    }

};


module.exports = ChatsController;