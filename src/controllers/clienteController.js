const Cliente = require('../models/Cliente');

exports.getAllClientes = async (req, res) => {
  const clientes = await Cliente.getAll();
  res.json(clientes);
};

exports.createCliente = async (req, res) => {
  const id = await Cliente.create(req.body);
  res.status(201).json({ id });
};