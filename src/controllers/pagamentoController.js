const Pagamento = require('../models/Pagamento');

exports.getAllPagamentos = async (req, res) => {
  const pagamentos = await Pagamento.getAll();
  res.json(pagamentos);
};

exports.createPagamento = async (req, res) => {
  const id = await Pagamento.create(req.body);
  res.status(201).json({ id });
};