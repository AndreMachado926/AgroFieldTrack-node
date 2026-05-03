const Pasto = require('../models/pastasModel');
const mongoose = require('mongoose');

/**
 * GET TODOS OS PASTOS
 */
const getPastos = async (req, res) => {
  try {
    const ownerId = req.params?.user_id || req.query?.user_id || req.body?.user_id;

    if (!ownerId) {
      return res.status(400).json({ success: false, message: 'user_id é obrigatório' });
    }

    const ownerFilter =
      mongoose.Types.ObjectId.isValid(ownerId)
        ? new mongoose.Types.ObjectId(ownerId)
        : ownerId;

    const pastos = await Pasto.find({ dono_id: ownerFilter }).lean();

    return res.status(200).json({
      success: true,
      count: pastos.length,
      data: pastos
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao obter pastos',
      error: err.message
    });
  }
};

/**
 * GET PASTO BY ID
 */
const getPastoById = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.query?.user_id || req.body?.user_id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID inválido' });
    }

    if (!ownerId) {
      return res.status(400).json({ success: false, message: 'user_id é obrigatório' });
    }

    const pasto = await Pasto.findOne({
      _id: id,
      dono_id: ownerId
    });

    if (!pasto) {
      return res.status(404).json({
        success: false,
        message: 'Pasto não encontrado'
      });
    }

    return res.status(200).json(pasto);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao obter pasto',
      error: err.message
    });
  }
};

/**
 * CREATE
 */
const createPasto = async (req, res) => {
  try {
    const { nome, pontosx, pontosy, dono_id, animais_ids = [] } = req.body;

    if (!nome || !pontosx || !pontosy || !dono_id) {
      return res.status(400).json({
        success: false,
        message: 'nome, pontosx, pontosy e dono_id são obrigatórios'
      });
    }

    const novoPasto = new Pasto({
      nome: nome.trim(),
      pontosx,
      pontosy,
      dono_id,
      animais_ids
    });

    await novoPasto.save();

    return res.status(201).json({
      success: true,
      message: 'Pasto criado com sucesso',
      data: novoPasto
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao criar pasto',
      error: err.message
    });
  }
};

/**
 * EDIT
 */
const editPasto = async (req, res) => {
  try {
    const { id, nome, pontosx, pontosy, animais_ids, dono_id } = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID inválido' });
    }

    const ownerId = dono_id || req.body?.user_id;

    if (!ownerId) {
      return res.status(400).json({ success: false, message: 'user_id é obrigatório' });
    }

    const pasto = await Pasto.findOne({
      _id: id,
      dono_id: ownerId
    });

    if (!pasto) {
      return res.status(404).json({
        success: false,
        message: 'Pasto não encontrado'
      });
    }

    if (nome) pasto.nome = nome.trim();
    if (dono_id) pasto.dono_id = dono_id;

    if (pontosx && pontosy) {
      pasto.pontosx = pontosx;
      pasto.pontosy = pontosy;
    }

    if (animais_ids) {
      pasto.animais_ids = animais_ids;
    }

    await pasto.save();

    return res.status(200).json({
      success: true,
      message: 'Pasto atualizado com sucesso',
      data: pasto
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao editar pasto',
      error: err.message
    });
  }
};

/**
 * DELETE
 */
const deletePasto = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.query?.user_id || req.body?.user_id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID inválido' });
    }

    if (!ownerId) {
      return res.status(400).json({ success: false, message: 'user_id é obrigatório' });
    }

    const pasto = await Pasto.findOneAndDelete({
      _id: id,
      dono_id: ownerId
    });

    if (!pasto) {
      return res.status(404).json({
        success: false,
        message: 'Pasto não encontrado'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Pasto eliminado com sucesso',
      data: pasto
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao eliminar pasto',
      error: err.message
    });
  }
};

module.exports = {
  getPastos,
  getPastoById,
  createPasto,
  editPasto,
  deletePasto
};