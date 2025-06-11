const Assinatura = require('../models/Assinatura');

exports.getAllAssinaturas = async (req, res) => {
  const assinaturas = await Assinatura.getAll();
  res.json(assinaturas);
};

exports.createAssinatura = async (req, res) => {
  const id = await Assinatura.create(req.body);
  res.status(201).json({ id });
};