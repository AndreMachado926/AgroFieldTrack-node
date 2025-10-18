const Remedio = require('../models/remedio');
const Animal = require('../models/AnimaisModel');

const getRemediosByAnimal = async (req, res) => {
  try {
    const animalId = req.params?.animal_id || req.params?.id || req.query?.animal_id || req.body?.animal_id;
    if (!animalId) return res.status(400).json({ success: false, message: 'animal_id obrigatório' });

    const animal = await Animal.findById(animalId).select('_id nome');
    if (!animal) return res.status(404).json({ success: false, message: 'Animal não encontrado' });

    const remedios = await Remedio.find({ animal_id: animalId }).sort({ data: -1 }).lean();
    return res.status(200).json({ success: true, count: remedios.length, data: remedios });
  } catch (err) {
    console.error('Erro ao obter remédios:', err);
    return res.status(500).json({ success: false, message: 'Erro ao obter remédios' });
  }
};

const createRemedio = async (req, res) => {
  try {
    const { nome, animal_id, observacoes } = req.body;
    if (!nome || !animal_id) {
      return res.status(400).json({ success: false, message: 'Campos obrigatórios: nome, animal_id' });
    }

    const animal = await Animal.findById(animal_id).select('_id');
    if (!animal) return res.status(404).json({ success: false, message: 'Animal não encontrado' });

    const remedio = new Remedio({
      nome: String(nome).trim(),
      animal_id,
      data: new Date(), // usa data atual
      observacoes: observacoes ? String(observacoes).trim() : ''
    });

    await remedio.save();
    return res.status(201).json({ success: true, data: remedio });
  } catch (err) {
    console.error('Erro ao criar remédio:', err);
    return res.status(500).json({ success: false, message: 'Erro ao criar remédio' });
  }
};

module.exports = { getRemediosByAnimal, createRemedio };
