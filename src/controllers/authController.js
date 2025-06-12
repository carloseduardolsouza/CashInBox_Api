// Importa o modelo Usuario. Ajuste o caminho conforme a estrutura do seu projeto.
const Usuario = require("../models/usuariosModels");

// Importa a biblioteca bcrypt para comparar senhas hashed.
const bcrypt = require("bcrypt");

// Importa a biblioteca jsonwebtoken para gerar JWTs.
const jwt = require("jsonwebtoken");

/**
 * @function login
 * @description Autentica um usuário e retorna um token JWT.
 * @param {Object} req - Objeto de requisição do Express. Espera 'email' e 'senha' no corpo.
 * @param {Object} res - Objeto de resposta do Express.
 */
const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    // --- Validação Básica ---
    if (!email || !senha) {
      return res
        .status(400)
        .json({ message: "Email e senha são obrigatórios." });
    }

    // --- 1. Buscar o Usuário pelo Email ---
    const usuario = await Usuario.findOne({ where: { email } });

    // Se o usuário não for encontrado, retorna erro de credenciais inválidas.
    if (!usuario) {
      return res.status(401).json({
        message: "Credenciais inválidas. Verifique seu email ou senha.",
      });
    }

    // --- 2. Comparar a Senha Fornecida com o Hash Salvo ---
    // Usa bcrypt.compare para verificar se a senha fornecida corresponde ao hash armazenado.
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

    // Se a senha não for válida, retorna erro de credenciais inválidas.
    if (!senhaValida) {
      return res.status(401).json({
        message: "Credenciais inválidas. Verifique seu email ou senha.",
      });
    }

    // --- 3. Gerar um JSON Web Token (JWT) ---
    // A chave secreta é carregada das variáveis de ambiente (process.env.JWT_SECRET).
    // Certifique-se de que 'dotenv' esteja configurado e que JWT_SECRET esteja no seu .env.
    // O payload do token inclui informações que podem ser úteis para autorização (id, email, role).
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        role: usuario.role,
      },
      process.env.JWT_SECRET, // O segredo deve estar definido no seu arquivo .env
      { expiresIn: "3d" } // O token expira em 3 dias (ajuste conforme necessário)
    );

    // --- 4. Retornar o Token JWT ---
    // Em caso de sucesso, retorna o token para o cliente.
    res.status(200).json({ message: "Login bem-sucedido!", token });
  } catch (error) {
    // --- Tratamento de Erros ---
    console.error("Erro no processo de login:", error);
    res.status(500).json({
      message: "Ocorreu um erro interno no servidor durante o login.",
      error: error.message,
    });
  }
};

// Exporta a função de login para ser usada em suas rotas.
module.exports = {
  login,
};
