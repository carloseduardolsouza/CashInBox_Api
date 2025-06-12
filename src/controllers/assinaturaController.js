const Assinatura = require("../models/assinaturaModels"); // Ajuste o caminho conforme a estrutura do seu projeto
const Usuario = require("../models/usuariosModels");     // Importe o modelo Usuario para associação
const Plano = require("../models/planosModels");         // Importe o modelo Plano para associação

// --- Função para cadastrar uma nova assinatura ---
async function cadastrar(req, res) {
  try {
    const {
      usuario_id,
      plano_id,
      renovado_em,      // Conforme a nova estrutura
      vencimento_em,    // Conforme a nova estrutura
      status,
      status_pagamento,
    } = req.body;

    // Validação básica para campos obrigatórios
    if (!usuario_id || !plano_id || !status || !status_pagamento) {
      return res.status(400).json({ message: "Campos obrigatórios ausentes: usuario_id, plano_id, status, status_pagamento." });
    }

    // Opcional: Verificar se o usuário e o plano existem antes de criar a assinatura
    const usuarioExistente = await Usuario.findByPk(usuario_id);
    const planoExistente = await Plano.findByPk(plano_id);

    if (!usuarioExistente) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }
    if (!planoExistente) {
      return res.status(404).json({ message: "Plano não encontrado." });
    }

    const novaAssinatura = await Assinatura.create({
      usuario_id,
      plano_id,
      renovado_em,
      vencimento_em,
      status,
      status_pagamento,
    });

    return res.status(201).json(novaAssinatura);
  } catch (error) {
    console.error("Erro ao cadastrar assinatura:", error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}

// --- Função para listar assinaturas ---
async function listar(req, res) {
  try {
    const { usuario_id, plano_id, status, status_pagamento } = req.query;
    const whereClause = {};

    if (usuario_id) {
      whereClause.usuario_id = usuario_id;
    }
    if (plano_id) {
      whereClause.plano_id = plano_id;
    }
    if (status) {
      whereClause.status = status;
    }
    if (status_pagamento) {
      whereClause.status_pagamento = status_pagamento;
    }

    const assinaturas = await Assinatura.findAll({
      where: whereClause,
      include: [
        { model: Usuario, as: "usuario", attributes: ["id", "nome", "email"] }, // Inclui informações do usuário
        { model: Plano, as: "plano", attributes: ["id", "nome", "valor"] },   // Inclui informações do plano
      ],
    });

    if (assinaturas.length === 0) {
      return res.status(404).json({ message: "Nenhuma assinatura encontrada com os critérios fornecidos." });
    }

    return res.status(200).json(assinaturas);
  } catch (error) {
    console.error("Erro ao listar assinaturas:", error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}

// --- Função para editar uma assinatura existente ---
async function editar(req, res) {
  try {
    const { id } = req.params; // ID da assinatura a ser editada
    const {
      renovado_em,
      vencimento_em,
      status,
      status_pagamento,
      usuario_id, // Opcional: permitir edição de FKs
      plano_id,   // Opcional: permitir edição de FKs
    } = req.body;

    const assinatura = await Assinatura.findByPk(id);

    if (!assinatura) {
      return res.status(404).json({ message: "Assinatura não encontrada." });
    }

    // Atualiza apenas os campos fornecidos no corpo da requisição
    await assinatura.update({
      usuario_id,
      plano_id,
      renovado_em,
      vencimento_em,
      status,
      status_pagamento,
    });

    return res.status(200).json(assinatura);
  } catch (error) {
    console.error("Erro ao editar assinatura:", error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}

// --- Função para excluir uma assinatura ---
async function excluir(req, res) {
  try {
    const { id } = req.params; // ID da assinatura a ser excluída

    const assinaturaExcluida = await Assinatura.destroy({
      where: { id },
    });

    if (assinaturaExcluida === 0) {
      return res.status(404).json({ message: "Assinatura não encontrada." });
    }

    return res.status(200).json({ message: "Assinatura excluída com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir assinatura:", error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}

module.exports = {
  cadastrar,
  listar,
  editar,
  excluir,
};