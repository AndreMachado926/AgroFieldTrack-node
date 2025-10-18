const mongoose = require('mongoose');
const { Schema } = mongoose;

const RemedioSchema = new Schema({
  nome: { type: String, required: true, trim: true },
  animal_id: { type: Schema.Types.ObjectId, ref: 'Animal', required: true },
  data: { type: Date, required: true },
  observacoes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Remedio', RemedioSchema);