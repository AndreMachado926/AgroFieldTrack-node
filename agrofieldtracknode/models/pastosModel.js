const mongoose = require('mongoose');
const { Schema } = mongoose;

const pastoSchema = new Schema({
  nome: { type: String, required: true, trim: true },
  pontosx: { type: [Number], required: true },
  pontosy: { type: [Number], required: true },
  dono_id: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  animais_ids: [{ type: Schema.Types.ObjectId, ref: 'Animal' }],
}, { timestamps: true });

pastoSchema.pre('validate', function(next) {
  if (!Array.isArray(this.pontosx) || !Array.isArray(this.pontosy)) {
    return next(new Error('pontosx e pontosy são obrigatórios e devem ser arrays de Number'));
  }
  if (this.pontosx.length !== this.pontosy.length) {
    return next(new Error('pontosx e pontosy devem ter o mesmo comprimento'));
  }
  if (this.pontosx.length < 3) {
    return next(new Error('é necessário pelo menos 3 pontos para definir uma área'));
  }
  next();
});

pastoSchema.virtual('polygon').get(function() {
  const px = this.pontosx || [];
  const py = this.pontosy || [];
  const pts = [];
  for (let i = 0; i < Math.min(px.length, py.length); i++) {
    pts.push([ px[i], py[i] ]);
  }
  return pts;
});

pastoSchema.set('toObject', { virtuals: true });
pastoSchema.set('toJSON', { virtuals: true });

const Pasto = mongoose.model('Pasto', pastoSchema);

module.exports = Pasto;
