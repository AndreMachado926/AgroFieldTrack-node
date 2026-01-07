const mongoose = require("mongoose");

const MensagemSchema = new mongoose.Schema({
    sender_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "users" },
    sender_type: { type: String, enum: ["user", "admin", "veterinario"], required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const ChatsSchema = new mongoose.Schema({
    user1_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "users" },
    user1_type: { type: String, enum: ["user", "admin", "veterinario"], required: true },

    user2_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "users" },
    user2_type: { type: String, enum: ["user", "admin", "veterinario"], required: true },

    mensagens: { type: [MensagemSchema], default: [] }
}, { timestamps: true });

const Chats = mongoose.model("chats", ChatsSchema);
module.exports = Chats;
