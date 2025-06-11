const Plano = require('../models/Plano');

exports.getAllPlanos = async (req, res) => {
  const planos = await Plano.getAll();
  res.json(planos);
};

exports.createPlano = async (req, res) => {
  const id = await Plano.create(req.body);
  res.status(201).json({ id });
};