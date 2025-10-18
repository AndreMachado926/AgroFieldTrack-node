const mongoose = require("mongoose");
const Comentario = require('../models/ComentarioModel');  // Isso já está correto, você está importando o modelo corretamente

const MarketSchema = new mongoose.Schema({
    author: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        username: { type: String,ref: 'User', required: false }
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    tags: {
        type: [String],
        required: false
    },
    imagens: {
        type: String,
        required: false
    },
    preco:{
        type: Number,
        required: false
    },
    publication_type: {
        type: String,
        required: true,
        default: "publi"
    },
    comentarios: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'comentarios' 
    }]
}, { timestamps: true });


const Market = mongoose.model("market", MarketSchema);
module.exports = Market;