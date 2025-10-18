const Plantacoes = require('../models/PlantacoesModel');

const getAllplantacoes = async (req, res) => {
  try {
    const plantacoes = await Plantacoes.find().lean();
    return res.status(200).json({ success: true, count: plantacoes.length, data: plantacoes });
  } catch (err) {
    console.error('Erro ao obter platações:', err);
    return res.status(500).json({ success: false, message: 'Erro ao obter platações' });
  }
};

// função para adicionar um animal
const createPlantacao = async (req, res) => {
  try {
    const { planta, localizacaoX, localizacaoY, dono_id } = req.body;

    // Validação dos campos obrigatórios
    if (!planta) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: planta, localizacaoX, localizacaoY, dono_id'
      });
    }

    const plantacao = new Plantacoes({
      planta: String(planta).trim(),
      localizacaoX: Number(0),
      localizacaoY: Number(0),
      dono_id:Number(1)
    });

    await plantacao.save();

    return res.status(201).json({ success: true, data: plantacao });
  } catch (err) {
    console.error('Erro ao criar plantação:', err);
    return res.status(500).json({ success: false, message: 'Erro ao criar plantação' });
  }
};

module.exports = {getAllplantacoes ,createPlantacao};