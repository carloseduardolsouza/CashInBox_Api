// Importa a biblioteca jsonwebtoken para verificar JWTs.
const jwt = require("jsonwebtoken");

/**
 * @function verifyToken
 * @description Middleware para verificar a validade de um token JWT e extrair os dados do usuário.
 * @param {Object} req - Objeto de requisição do Express.
 * @param {Object} res - Objeto de resposta do Express.
 * @param {Function} next - Função de callback para passar o controle para o próximo middleware.
 */
const verifyToken = (req, res, next) => {
  // Pega o cabeçalho de autorização. O token geralmente vem no formato "Bearer TOKEN".
  const authHeader = req.headers["authorization"];

  // Se não houver cabeçalho de autorização, retorna 401 (Unauthorized).
  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Acesso negado. Token não fornecido." });
  }

  // Extrai o token da string "Bearer TOKEN".
  const token = authHeader.split(" ")[1]; // Pega a segunda parte após o espaço

  // Se o token não existir (após tentar extraí-lo), retorna 401.
  if (!token) {
    return res
      .status(401)
      .json({ message: "Acesso negado. Token inválido ou mal formatado." });
  }

  try {
    // Verifica o token usando o segredo do .env.
    // jwt.verify irá lançar um erro se o token for inválido ou expirado.
    // Certifique-se de que 'dotenv' esteja configurado no seu arquivo principal (ex: app.js/server.js)
    // para que process.env.JWT_SECRET esteja disponível.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Anexa os dados decodificados do usuário ao objeto 'req' para que
    // as rotas subsequentes possam acessá-los.
    req.user = decoded;
    req.userId = decoded.id; // Extrai o ID e anexa diretamente para facilitar o acesso

    // Chama next() para passar o controle para a próxima função middleware ou rota.
    next();
  } catch (error) {
    // Se a verificação falhar (token inválido, expirado, etc.), retorna 403 (Forbidden).
    console.error("Erro na verificação do token:", error);
    return res
      .status(403)
      .json({ message: "Token inválido ou expirado. Acesso negado." });
  }
};

// Exporta o middleware para que possa ser importado e usado em outras partes da aplicação.
module.exports = verifyToken;
