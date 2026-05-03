const mongoose = require('mongoose');
const Animal = require('../models/AnimaisModel');
const Pasto = require('../models/pastasModel');

/**
 * Verifica se um ponto está dentro de um polígono
 */
function isInsidePolygon(point, polygon) {
  const x = point.lat;
  const y = point.lng;

  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];

    const intersect =
      ((yi > y) !== (yj > y)) &&
      (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);

    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Atualiza localização do animal e verifica geofence
 */
const updateAnimalLocation = async (req, res) => {
  try {
    const { animal_id, lat, lng } = req.body;

    // 📌 validação básica
    if (!animal_id || lat == null || lng == null) {
      return res.status(400).json({
        success: false,
        message: "animal_id, lat e lng são obrigatórios"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(animal_id)) {
      return res.status(400).json({
        success: false,
        message: "animal_id inválido"
      });
    }

    // 🐄 1. buscar animal
    const animal = await Animal.findById(animal_id);

    if (!animal) {
      return res.status(404).json({
        success: false,
        message: "Animal não encontrado"
      });
    }

    // 🌾 2. buscar pasto onde o animal está
    const pasto = await Pasto.findOne({
      animais_ids: animal_id
    });

    // 📍 estado atual
    let isInside = false;

    if (pasto) {
      const polygon = pasto.pontosx
        .map((x, i) => {
          const y = pasto.pontosy[i];
          if (y == null) return null;
          return [x, y];
        })
        .filter(Boolean);

      if (polygon.length >= 3) {
        isInside = isInsidePolygon({ lat, lng }, polygon);
      }
    }

    // 📌 estado anterior (IMPORTANTE)
    const wasInside = animal.last_location?.inside_pasto;

    // 💾 3. atualizar localização
    animal.last_location = {
      lat,
      lng,
      updatedAt: new Date(),
      inside_pasto: isInside
    };

    await animal.save();

    // 🚨 4. DETEÇÃO DE SAÍDA DO PASTO
    if (wasInside === true && isInside === false) {
      console.log("🚨 ANIMAL SAIU DO PASTO:", animal_id);

      // 👉 FUTURO: Firebase push notification
      // sendPushNotification(animal.dono_id, animal_id);
    }

    return res.status(200).json({
      success: true,
      inside_pasto: isInside,
      previous_state: wasInside,
      message: "Localização atualizada com sucesso"
    });

  } catch (err) {
    console.error("Erro location:", err);

    return res.status(500).json({
      success: false,
      message: "Erro ao atualizar localização",
      error: err.message
    });
  }
};

module.exports = { updateAnimalLocation };