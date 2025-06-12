// Importa os modelos Sequelize. Ajuste os caminhos se seus arquivos estiverem em locais diferentes.
const Assinatura = require("../models/assinaturaModels"); // Corrigido de 'assinaturaModels' para 'Assinatura'
const Usuario = require("../models/usuariosModels");     // Corrigido de 'usuariosModels' para 'Usuario'
const Plano = require("../models/planosModels");         // Corrigido de 'planosModels' para 'Plano'

/**
 * @function cadastrarAssinatura
 * @description Cria uma nova assinatura para um usuário em um plano específico.
 * @param {Object} req - Objeto de requisição do Express. Espera usuario_id, plano_id e opcionalmente data_fim no corpo.
 * @param {Object} res - Objeto de resposta do Express.
 */
const cadastrarAssinatura = async (req, res) => {
  try {
    const { usuario_id, plano_id, data_fim } = req.body;

    // Validação básica
    if (!usuario_id || !plano_id) {
      return res.status(400).json({
        message:
          "ID do usuário e ID do plano são obrigatórios para criar uma assinatura.",
      });
    }

    // Verificar se o usuário e o plano existem no banco de dados
    const usuarioExiste = await Usuario.findByPk(usuario_id);
    const planoExiste = await Plano.findByPk(plano_id);

    if (!usuarioExiste) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }
    if (!planoExiste) {
      return res.status(404).json({ message: "Plano não encontrado." });
    }

    // Opcional: Verificar se o usuário já possui uma assinatura ATIVA para o mesmo plano
    // Isso evita múltiplas assinaturas ativas indesejadas para o mesmo usuário/plano.
    const assinaturaExistente = await Assinatura.findOne({
      where: {
        usuario_id: usuario_id,
        plano_id: plano_id,
        status: "ativa", // Verifica se já existe uma assinatura ativa
      },
    });

    if (assinaturaExistente) {
      return res.status(409).json({
        message: "Este usuário já possui uma assinatura ativa para este plano.",
      });
    }

    // Cria a nova entrada de assinatura no banco de dados
    const novaAssinatura = await Assinatura.create({
      usuario_id,
      plano_id,
      data_fim: data_fim || null, // A data de fim pode ser opcional ou definida posteriormente
      status: "inativa", // Assinatura começa como 'inativa' até que o pagamento seja confirmado (via webhook, por exemplo)
      status_pagamento: "pendente", // O status inicial do pagamento é 'pendente'
      data_inicio: new Date(), // Define a data de início da assinatura como o momento atual
    });

    res.status(201).json({
      message: "Assinatura criada com sucesso! Aguardando confirmação de pagamento.",
      assinatura: novaAssinatura,
    });
  } catch (error) {
    console.error("Erro ao cadastrar assinatura:", error);
    // Trata erros específicos do Sequelize, como validação ou chave única, se aplicável.
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: 'Erro de validação ao cadastrar assinatura.', errors: error.errors.map(err => err.message) });
    }
    res.status(500).json({
      message: "Ocorreu um erro interno ao tentar cadastrar a assinatura.",
      error: error.message,
    });
  }
};

/**
 * @function listarAssinaturas
 * @description Lista todas as assinaturas ou filtra por ID de usuário/plano.
 * @param {Object} req - Objeto de requisição do Express. Pode ter query params usuario_id ou plano_id.
 * @param {Object} res - Objeto de resposta do Express.
 */
const listarAssinaturas = async (req, res) => {
  try {
    const { usuario_id, plano_id } = req.query;
    let whereClause = {};

    // Constrói a cláusula WHERE baseada nos parâmetros de consulta
    if (usuario_id) {
      whereClause.usuario_id = usuario_id;
    }
    if (plano_id) {
      whereClause.plano_id = plano_id;
    }

    // Busca as assinaturas no banco de dados, incluindo os dados completos do usuário e do plano associados.
    const assinaturas = await Assinatura.findAll({
      where: whereClause,
      include: [
        { model: Usuario, as: "usuario", attributes: ["id", "nome", "email"] }, // Inclui dados do usuário associado, selecionando atributos específicos
        { model: Plano, as: "plano", attributes: ["id", "nome", "valor"] }, // Inclui dados do plano associado, selecionando atributos específicos
      ],
    });

    res.status(200).json(assinaturas);
  } catch (error) {
    console.error("Erro ao listar assinaturas:", error);
    res.status(500).json({
      message: "Ocorreu um erro interno ao tentar listar as assinaturas.",
      error: error.message,
    });
  }
};

/**
 * @function atualizarStatusPagamento
 * @description ATUALIZA O STATUS DE PAGAMENTO E O STATUS DA ASSINATURA.
 * Esta função é tipicamente acionada por um WEBHOOK de uma gateway de pagamento (ex: Pagar.me).
 * @param {Object} req - Objeto de requisição do Express. Espera id_transacao_pagarme, novo_status_pagamento, valor_pago, data_pagamento e proximo_vencimento no corpo.
 * @param {Object} res - Objeto de resposta do Express.
 */
const atualizarStatusPagamento = async (req, res) => {
  try {
    const {
      id_transacao_pagarme,
      novo_status_pagamento,
      valor_pago,
      data_pagamento,
      proximo_vencimento,
    } = req.body;

    // IMPORTANTE: Em um ambiente de produção com webhooks, você DEVE verificar
    // a autenticidade da requisição (ex: verificando a assinatura do webhook)
    // para garantir que ela realmente veio da gateway de pagamento e não é forjada.

    if (!id_transacao_pagarme || !novo_status_pagamento) {
      return res.status(400).json({
        message: "ID da transação e novo status de pagamento são obrigatórios.",
      });
    }

    // Busca a assinatura pelo ID da transação Pagar.me.
    // Isso é crucial para vincular a atualização do webhook à assinatura correta.
    let assinatura = await Assinatura.findOne({
      where: { id_transacao_pagarme: id_transacao_pagarme },
    });

    if (!assinatura) {
      // Se a assinatura não for encontrada por este ID de transação,
      // pode ser um webhook para uma transação inicial que ainda não foi vinculada a uma assinatura,
      // ou um erro. A lógica de criação da assinatura e vinculação ao ID da transação
      // deve ocorrer após a resposta da gateway de pagamento na criação da transação.
      return res.status(404).json({
        message:
          "Assinatura não encontrada para este ID de transação Pagar.me.",
      });
    }

    // Objeto para armazenar os dados a serem atualizados na assinatura
    const dadosParaAtualizar = {
      status_pagamento: novo_status_pagamento,
      data_ultimo_pagamento: data_pagamento || new Date(), // Usa a data do pagamento fornecida ou a data atual
      proximo_vencimento: proximo_vencimento || null, // Atualiza o próximo vencimento para pagamentos recorrentes
    };

    if (valor_pago !== undefined) {
      dadosParaAtualizar.valor_pago = valor_pago;
    }

    // Lógica para atualizar o status da assinatura com base no status do pagamento
    if (novo_status_pagamento === "pago") {
      dadosParaAtualizar.status = "ativa"; // Se o pagamento foi bem-sucedido, a assinatura está ativa
      // TODO: Implementar lógica para estender a 'data_fim' da assinatura
      // se for um plano recorrente (ex: adicionar 1 mês, 1 ano, etc.)
      // Exemplo:
      // if (assinatura.data_fim) {
      //   const novaDataFim = new Date(assinatura.data_fim);
      //   novaDataFim.setMonth(novaDataFim.getMonth() + 1); // Exemplo: adicionar 1 mês
      //   dadosParaAtualizar.data_fim = novaDataFim;
      // }
    } else if (
      ["falhou", "atrasado", "estornado", "recusado"].includes(novo_status_pagamento)
    ) {
      // Se o pagamento falhou ou está com problemas, a assinatura pode ser suspensa ou inativa.
      dadosParaAtualizar.status = "suspensa"; // Ou 'inativa', conforme a sua regra de negócio
    }

    // Realiza a atualização da assinatura no banco de dados
    await assinatura.update(dadosParaAtualizar);

    res.status(200).json({
      message: "Status de pagamento da assinatura atualizado com sucesso!",
      assinatura,
    });
  } catch (error) {
    console.error(
      "Erro ao atualizar status de pagamento da assinatura:",
      error
    );
    res.status(500).json({
      message: "Ocorreu um erro interno ao tentar atualizar o status de pagamento.",
      error: error.message,
    });
  }
};

/**
 * @function cancelarAssinatura
 * @description Cancela uma assinatura de um usuário (definindo o status como 'cancelada').
 * @param {Object} req - Objeto de requisição do Express. Espera o ID da assinatura nos parâmetros da URL.
 * @param {Object} res - Objeto de resposta do Express.
 */
const cancelarAssinatura = async (req, res) => {
  try {
    const { id } = req.params; // ID da assinatura a ser cancelada

    const assinatura = await Assinatura.findByPk(id);

    if (!assinatura) {
      return res.status(404).json({ message: "Assinatura não encontrada." });
    }

    // Altera o status da assinatura para 'cancelada'
    await assinatura.update({ status: "cancelada" });

    res
      .status(200)
      .json({ message: "Assinatura cancelada com sucesso!", assinatura });
  } catch (error) {
    console.error("Erro ao cancelar assinatura:", error);
    res.status(500).json({
      message: "Ocorreu um erro interno ao tentar cancelar a assinatura.",
      error: error.message,
    });
  }
};

/**
 * @function verificarStatusAssinatura
 * @description Verifica o status de assinatura de um usuário logado.
 * @param {Object} req - Objeto de requisição do Express. Espera o ID do usuário em req.userId (definido pelo middleware JWT).
 * @param {Object} res - Objeto de resposta do Express.
 */
const verificarStatusAssinatura = async (req, res) => {
  try {
    const userId = req.userId; // ID do usuário vindo do token JWT

    if (!userId) {
      return res
        .status(401)
        .json({ message: "ID do usuário não fornecido. Acesso negado." });
    }

    // Busca todas as assinaturas ativas e com pagamento em dia para o usuário logado.
    const assinaturasAtivas = await Assinatura.findAll({
      where: {
        usuario_id: userId,
        status: "ativa",
        status_pagamento: "pago", // Considera apenas assinaturas que estão ativas e com pagamento confirmado
      },
      include: { model: Plano, as: "plano" }, // Inclui os detalhes do plano associado
    });

    if (assinaturasAtivas.length > 0) {
      res.status(200).json({
        message: "Usuário possui assinaturas ativas e pagas.",
        assinaturas: assinaturasAtivas.map((a) => ({
          id: a.id,
          plano: {
            id: a.plano.id,
            nome: a.plano.nome,
            valor: a.plano.valor,
          },
          data_inicio: a.data_inicio,
          data_fim: a.data_fim,
          status: a.status,
          status_pagamento: a.status_pagamento,
          proximo_vencimento: a.proximo_vencimento,
        })),
      });
    } else {
      res.status(200).json({
        message: "Usuário não possui assinaturas ativas e pagas.",
        assinaturas: [],
      });
    }
  } catch (error) {
    console.error("Erro ao verificar status de assinatura:", error);
    res.status(500).json({
      message: "Ocorreu um erro interno ao tentar verificar o status da assinatura.",
      error: error.message,
    });
  }
};

// Exporta todas as funções para que possam ser usadas em suas rotas Express.
module.exports = {
  cadastrarAssinatura,
  listarAssinaturas,
  atualizarStatusPagamento,
  cancelarAssinatura,
  verificarStatusAssinatura,
};