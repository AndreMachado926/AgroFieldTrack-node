const Animal = require('../models/AnimaisModel');

const getAllAnimais = async (req, res) => {
  try {
    const animais = await Animal.find().lean();
    return res.status(200).json({ success: true, count: animais.length, data: animais });
  } catch (err) {
    console.error('Erro ao obter animais:', err);
    return res.status(500).json({ success: false, message: 'Erro ao obter animais' });
  }
};

// função para adicionar um animal
const createAnimal = async (req, res) => {
  try {
    const { nome, raca, idade, localizacaoX, localizacaoY } = req.body;

    if (!nome || idade === undefined || !dono_id || raca === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: nome, idade, localizacaoX, localizacaoY, dono_id,raca'
      });
    }

    const animal = new Animal({
      nome: String(nome).trim(),
      idade: Number(idade),
      raca: String(raca),
      localizacaoX: Number(0),
      localizacaoY: Number(0),
      dono_id
    });

    await animal.save();

    return res.status(201).json({ success: true, data: animal });
  } catch (err) {
    console.error('Erro ao criar animal:', err);
    return res.status(500).json({ success: false, message: 'Erro ao criar animal' });
  }
};

module.exports = { getAllAnimais, createAnimal };