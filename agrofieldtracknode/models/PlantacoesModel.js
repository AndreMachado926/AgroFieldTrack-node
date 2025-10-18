const mongoose = require('mongoose');
const { Schema } = mongoose;

const plantacoesSchema = new Schema({
    nome: { type: String, required: true, trim: true },
    pontosx: { type: [Number], required: true },
    pontosy: { type: [Number], required: true },
    dono_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// validação: arrays devem existir, ter mesmo comprimento e pelo menos 3 pontos
plantacoesSchema.pre('validate', function(next) {
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

// virtual que retorna o polígono como array de [x,y]
plantacoesSchema.virtual('polygon').get(function() {
  const px = this.pontosx || [];
  const py = this.pontosy || [];
  const pts = [];
  for (let i = 0; i < Math.min(px.length, py.length); i++) {
    pts.push([ px[i], py[i] ]);
  }
  return pts;
});

plantacoesSchema.set('toObject', { virtuals: true });
plantacoesSchema.set('toJSON', { virtuals: true });

const Plantacao = mongoose.model('Plantacao', plantacoesSchema);

module.exports = Plantacao;
