const mongoose = require('mongoose');
const { Schema } = mongoose;

const AnimaisSchema = new Schema({
    nome: { type: String, required: true, trim: true },
    idade: { type: Number, required: true, min: 0 },
    raca: { type: String, required: true },  // corrigido: required dentro do objeto
    localizacaoX: { type: Number, required: true },
    localizacaoY: { type: Number, required: true },
    dono_id: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Animal = mongoose.model('Animal', AnimaisSchema);

module.exports = Animal;
