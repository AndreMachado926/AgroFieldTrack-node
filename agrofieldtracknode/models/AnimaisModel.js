const mongoose = require('mongoose');
const { Schema } = mongoose;

const LocationEntrySchema = new Schema({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  at: { type: Date, default: Date.now }
}, { _id: false });

const AnimaisSchema = new Schema({
    nome: { type: String, required: true, trim: true },
    idade: { type: Number, required: true, min: 0 },
    raca: { type: String, required: true },  // corrigido: required dentro do objeto
    localizacaoX: { type: Number, required: true },
    localizacaoY: { type: Number, required: true },
    dono_id: { type: Schema.Types.ObjectId, ref: 'users' },

    // histórico de localizações anteriores
    locationHistory: { type: [LocationEntrySchema], default: [] },
}, { timestamps: true });

/**
 * Atualiza localizacao guardando as anteriores no array locationHistory.
 * Só adiciona ao histórico se x ou y mudarem.
 *
 * Uso:
 *   await Animal.updateLocationWithHistory(id, newX, newY);
 */
AnimaisSchema.statics.updateLocationWithHistory = async function(animalId, newX, newY) {
  if (!animalId) throw new Error('animalId é obrigatório');

  const doc = await this.findById(animalId).select('localizacaoX localizacaoY');
  if (!doc) throw new Error('Animal não encontrado');

  const prevX = doc.localizacaoX;
  const prevY = doc.localizacaoY;

  const parsedNewX = newX !== undefined ? Number(newX) : prevX;
  const parsedNewY = newY !== undefined ? Number(newY) : prevY;

  if (parsedNewX === prevX && parsedNewY === prevY) {
    return doc;
  }

  const updated = await this.findByIdAndUpdate(
    animalId,
    {
      $push: { locationHistory: { x: prevX, y: prevY, at: new Date() } },
      $set: { localizacaoX: parsedNewX, localizacaoY: parsedNewY }
    },
    { new: true }
  );

  return updated;
};

const Animal = mongoose.model('Animal', AnimaisSchema);

module.exports = Animal;
