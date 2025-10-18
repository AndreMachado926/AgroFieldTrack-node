const mongoose = require('mongoose');
const { Schema } = mongoose;

const plantacoesSchema = new Schema({
    planta: { type: String, required: true, trim: true },
    localizacaoX: { type: Number, required: true },
    localizacaoY: { type: Number, required: true },
    dono_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const Plantacao = mongoose.model('Plantacao', plantacoesSchema);

module.exports = Plantacao;
