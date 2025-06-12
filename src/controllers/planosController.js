const planosModels = require("../models/planosModels");

/**
 * @function cadastrar
 * @description Cadastra um novo plano no banco de dados.
 * @param {Object} req - Objeto de requisição do Express. Espera nome, valor e tarefas_inclusas no corpo.
 * @param {Object} res - Objeto de resposta do Express.
 */
const cadastrar = async (req, res) => {
  try {
    // Desestrutura os campos esperados do corpo da requisição JSON.
    const { nome, valor, tarefas_inclusas } = req.body;

    // --- Validação Básica ---
    // Verifica se os campos obrigatórios estão presentes.
    if (!nome || valor === undefined || valor === null) {
      return res.status(400).json({
        message: "Nome e valor são campos obrigatórios para o plano.",
      });
    }

    // --- Criação do Plano no Banco de Dados ---
    // Usa o método 'create' do modelo Sequelize para inserir um novo registro na tabela 'planos'.
    const novoPlano = await planosModels.create({
      nome,
      valor,
      tarefas_inclusas: tarefas_inclusas || null, // Permite que seja nulo se não fornecido
    });

    // Retorna uma resposta de sucesso (status 201 Created) com os dados do novo plano.
    res.status(201).json(novoPlano);
  } catch (error) {
    // --- Tratamento de Erros ---
    console.error("Erro ao cadastrar plano:", error);

    // Trata erros específicos de validação do Sequelize
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Erro de validação ao cadastrar plano.",
        errors: error.errors.map((err) => err.message),
      });
    }
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message: "Um plano com este nome já existe.",
        error: error.message,
      });
    }

    // Para outros erros, retorna um status 500 (Erro Interno do Servidor).
    res.status(500).json({
      message: "Ocorreu um erro ao tentar cadastrar o plano.",
      error: error.message,
    });
  }
};

/**
 * @function listar
 * @description Busca todos os planos no banco de dados.
 * @param {Object} req - Objeto de requisição do Express.
 * @param {Object} res - Objeto de resposta do Express.
 */
const listar = async (req, res) => {
  try {
    // Busca todos os planos no banco de dados usando o método findAll() do Sequelize.
    const planos = await planosModels.findAll();

    // Retorna os planos encontrados em formato JSON.
    res.json(planos);
  } catch (error) {
    // Se der erro, retorna status 500 e mensagem de erro.
    console.error("Erro ao buscar planos:", error);
    res
      .status(500)
      .json({ message: "Erro ao buscar planos", error: error.message });
  }
};

/**
 * @function editar
 * @description Edita um plano existente no banco de dados.
 * @param {Object} req - Objeto de requisição do Express. Espera o ID do plano nos parâmetros da URL e os campos a serem atualizados no corpo.
 * @param {Object} res - Objeto de resposta do Express.
 */
const editar = async (req, res) => {
  try {
    // Pega o ID do plano dos parâmetros da URL (ex: /planos/123)
    const { id } = req.params;
    // Pega os dados a serem atualizados do corpo da requisição
    const { nome, valor, tarefas_inclusas } = req.body;

    // --- Encontrar o Plano ---
    // Busca o plano no banco de dados pelo ID (Primary Key)
    const plano = await planosModels.findByPk(id);

    // Se o plano não for encontrado, retorna um status 404 (Not Found)
    if (!plano) {
      return res.status(404).json({ message: "Plano não encontrado." });
    }

    // --- Preparar Dados para Atualização ---
    const dadosParaAtualizar = {};

    if (nome !== undefined) {
      dadosParaAtualizar.nome = nome;
    }
    if (valor !== undefined) {
      dadosParaAtualizar.valor = valor;
    }
    if (tarefas_inclusas !== undefined) {
      dadosParaAtualizar.tarefas_inclusas = tarefas_inclusas;
    }

    // --- Atualizar o Plano ---
    // Usa o método 'update' da instância do modelo para aplicar as mudanças.
    await plano.update(dadosParaAtualizar);

    // Retorna uma resposta de sucesso (status 200 OK) com os dados do plano atualizado.
    res.status(200).json({ message: "Plano atualizado com sucesso!", plano });
  } catch (error) {
    // --- Tratamento de Erros ---
    console.error("Erro ao editar plano:", error);

    // Trata erros de violação de unicidade (ex: tentar atualizar para um nome de plano já existente).
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message: "Um plano com este nome já existe. Por favor, use outro nome.",
        error: error.message,
      });
    }
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Erro de validação ao editar plano.",
        errors: error.errors.map((err) => err.message),
      });
    }

    // Para outros erros, retorna um status 500 (Erro Interno do Servidor).
    res.status(500).json({
      message: "Ocorreu um erro ao tentar editar o plano.",
      error: error.message,
    });
  }
};

/**
 * @function excluir
 * @description Exclui um plano do banco de dados.
 * @param {Object} req - Objeto de requisição do Express. Espera o ID do plano nos parâmetros da URL.
 * @param {Object} res - Objeto de resposta do Express.
 */
const excluir = async (req, res) => {
  try {
    // Pega o ID do plano dos parâmetros da URL (ex: /planos/123)
    const { id } = req.params;

    // --- Encontrar e Excluir o Plano ---
    // Usa o método 'destroy' do modelo para excluir um registro com base em condições.
    // Retorna o número de registros excluídos (1 se encontrado e excluído, 0 se não encontrado).
    const deletedRowCount = await planosModels.destroy({
      where: {
        id: id, // Exclui o plano onde o 'id' corresponde ao ID fornecido
      },
    });

    // Se nenhum registro foi excluído, significa que o plano não foi encontrado
    if (deletedRowCount === 0) {
      return res
        .status(404)
        .json({ message: "Plano não encontrado para exclusão." });
    }

    // Se 1 ou mais registros foram excluídos (espera-se 1 para ID único)
    res.status(200).json({ message: "Plano excluído com sucesso!" });
  } catch (error) {
    // --- Tratamento de Erros ---
    console.error("Erro ao excluir plano:", error);

    // Para outros erros, retorna um status 500 (Erro Interno do Servidor).
    res.status(500).json({
      message: "Ocorreu um erro ao tentar excluir o plano.",
      error: error.message,
    });
  }
};

// Exporta todas as funções para que possam ser usadas em suas rotas Express.
module.exports = {
  cadastrar,
  listar,
  editar,
  excluir,
};
