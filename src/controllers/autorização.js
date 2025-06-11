const express = require('express');
const router = express.Router();

const Cliente = require('../models/Cliente');
const Plano = require('../models/Plano');
const Pagamento = require('../models/Pagamento');

const autorizarTarefa = async (req, res) => {
  try {
    const { clienteId, tarefa } = req.body;

    // Busca o cliente (aqui adapte se não tiver findById)
    const cliente = await Cliente.findById(clienteId);
    if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado' });

    // Busca o plano do cliente
    const plano = await Plano.findById(cliente.plano_id);
    if (!plano) return res.status(404).json({ error: 'Plano do cliente não encontrado' });

    // Verifica se a tarefa está permitida no plano (supondo que seja um array)
    if (!plano.tarefasPermitidas.includes(tarefa)) {
      return res.status(403).json({ error: 'Tarefa não permitida no plano do cliente' });
    }

    // Verifica pagamento
    const pagamento = await Pagamento.verificarStatus(clienteId);
    if (!pagamento.emDia) {
      return res.status(403).json({ error: 'Pagamento não está em dia' });
    }

    // Autorização liberada
    return res.json({ autorizado: true, mensagem: 'Tarefa autorizada' });
  } catch (error) {
    console.error('Erro na autorização de tarefa:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};


module.exports = {
    autorizarTarefa
};
