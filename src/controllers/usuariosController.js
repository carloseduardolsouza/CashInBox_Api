const usuariosModels = require("../models/usuariosModels");
const bcrypt = require("bcrypt");

const cadastrar = async (req, res) => {
  try {
    // Desestrutura os campos esperados do corpo da requisição JSON.
    const { nome, email, senha, role, ativo, cpf_cnpj, estado, cidade, rua } =
      req.body;

    // --- Validação Básica ---
    // Verifica se os campos obrigatórios estão presentes.
    if (!nome || !email || !senha) {
      return res
        .status(400)
        .json({ message: "Nome, email e senha são campos obrigatórios." });
    }

    // --- Hashing de Senha ---
    // Antes de salvar a senha no banco de dados, ela deve ser "hashed" (criptografada de forma unidirecional).
    // Isso é crucial para a segurança. Nunca armazene senhas em texto puro!
    // O '10' é o "salt rounds", que define a complexidade do hashing. Um valor entre 10 e 12 é comum.
    const senha_hash = await bcrypt.hash(senha, 10);

    // --- Criação do Usuário no Banco de Dados ---
    // Usa o método 'create' do modelo Sequelize para inserir um novo registro na tabela 'usuarios'.
    const novoUsuario = await usuariosModels.create({
      nome,
      email,
      senha_hash, // Salva o hash da senha, não a senha em texto puro
      role: role || "user", // Se 'role' não for fornecido, define o padrão como 'user'
      ativo: ativo !== undefined ? ativo : 1, // Se 'ativo' não for fornecido, define o padrão como 1 (true)
      rua,
      cidade,
      estado,
      cpf_cnpj,
    });

    // --- Preparação da Resposta ---
    // Converte a instância do Sequelize para um objeto JSON plano para facilitar a manipulação.
    const usuarioRetorno = novoUsuario.toJSON();
    // REMOVE o hash da senha do objeto de retorno para garantir que ele não seja enviado ao cliente.
    delete usuarioRetorno.senha_hash;

    // Retorna uma resposta de sucesso (status 201 Created) com os dados do novo usuário (sem a senha).
    res.status(201).json(usuarioRetorno);
  } catch (error) {
    // --- Tratamento de Erros ---
    // Loga o erro completo no console do servidor para depuração.
    console.error("Erro ao cadastrar usuário:", error);

    // Trata erros específicos, como violação de unicidade (ex: email já cadastrado).
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message:
          "O email fornecido já está cadastrado. Por favor, use outro email.",
        error: error.message,
      });
    }

    // Para outros erros, retorna um status 500 (Erro Interno do Servidor).
    res.status(500).json({
      message: "Ocorreu um erro ao tentar cadastrar o usuário.",
      error: error.message,
    });
  }
};

const listar = async (req, res) => {
  try {
    // Busca todos os usuários no banco de dados usando o método findAll() do Sequelize
    const usuarios = await usuariosModels.findAll(); // Corrected from find() to findAll()

    // Retorna os usuários encontrados em formato JSON
    res.json(usuarios);
  } catch (error) {
    // Se der erro, retorna status 500 e mensagem de erro
    console.error("Erro ao buscar usuários:", error); // It's good practice to log the error
    res
      .status(500)
      .json({ message: "Erro ao buscar usuários", error: error.message }); // Send error.message for less verbose client-side errors
  }
};

const editar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, senha, ativo, cpf_cnpj, estado, cidade, rua } =
      req.body;

    const usuario = await usuariosModels.findByPk(id);

    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    const dadosParaAtualizar = {};

    if (nome !== undefined) dadosParaAtualizar.nome = nome;
    if (email !== undefined) dadosParaAtualizar.email = email;
    if (ativo !== undefined) dadosParaAtualizar.ativo = ativo;
    if (cpf_cnpj !== undefined) dadosParaAtualizar.cpf_cnpj = cpf_cnpj;
    if (estado !== undefined) dadosParaAtualizar.estado = estado;
    if (cidade !== undefined) dadosParaAtualizar.cidade = cidade;
    if (rua !== undefined) dadosParaAtualizar.rua = rua;

    if (senha !== undefined && senha !== null && senha.trim() !== "") {
      dadosParaAtualizar.senha_hash = await bcrypt.hash(senha, 10);
    }

    await usuario.update(dadosParaAtualizar);

    const usuarioAtualizado = usuario.toJSON();
    delete usuarioAtualizado.senha_hash;

    res.status(200).json({
      message: "Usuário atualizado com sucesso!",
      usuario: usuarioAtualizado,
    });
  } catch (error) {
    console.error("Erro ao editar usuário:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message: "O email fornecido já está cadastrado para outro usuário.",
        error: error.message,
      });
    }

    res.status(500).json({
      message: "Ocorreu um erro ao tentar editar o usuário.",
      error: error.message,
    });
  }
};

const excluir = async (req, res) => {
  try {
    // Pega o ID do usuário dos parâmetros da URL (ex: /usuarios/123)
    const { id } = req.params;

    // --- Encontrar e Excluir o Usuário ---
    // Usa o método 'destroy' do modelo, que permite excluir registros com base em condições.
    // Retorna o número de registros excluídos (1 se encontrado e excluído, 0 se não encontrado).
    const deletedRowCount = await usuariosModels.destroy({
      where: {
        id: id, // Exclui o usuário onde o 'id' corresponde ao ID fornecido
      },
    });

    // Se nenhum registro foi excluído, significa que o usuário não foi encontrado
    if (deletedRowCount === 0) {
      return res
        .status(404)
        .json({ message: "Usuário não encontrado para exclusão." });
    }

    // Se 1 ou mais registros foram excluídos (espera-se 1 para ID único)
    res.status(200).json({ message: "Usuário excluído com sucesso!" });
  } catch (error) {
    // --- Tratamento de Erros ---
    console.error("Erro ao excluir usuário:", error);

    // Para outros erros, retorna um status 500 (Erro Interno do Servidor).
    res.status(500).json({
      message: "Ocorreu um erro ao tentar excluir o usuário.",
      error: error.message,
    });
  }
};

module.exports = {
  cadastrar,
  listar,
  editar,
  excluir,
};
