const jwt = require("jsonwebtoken");

/**
 * @function verifyToken
 * @description Middleware para verificar a validade de um token JWT e extrair os dados do usuário.
 * Este é o middleware base que você já tem.
 * @param {Object} req - Objeto de requisição do Express.
 * @param {Object} res - Objeto de resposta do Express.
 * @param {Function} next - Função de callback para passar o controle para o próximo middleware.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Acesso negado. Token não fornecido." });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Acesso negado. Token inválido ou mal formatado." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.userId = decoded.id; // Anexa o ID do usuário para facilitar o acesso
    next();
  } catch (error) {
    console.error("Erro na verificação do token:", error);
    return res
      .status(403)
      .json({ message: "Token inválido ou expirado. Acesso negado." });
  }
};

/**
 * @function verifyAdminToken
 * @description Middleware que primeiro verifica a validade do token e, em seguida,
 * verifica se o usuário autenticado possui o papel de 'admin'.
 * Requer que a role do usuário esteja presente no payload do JWT.
 * @param {Object} req - Objeto de requisição do Express.
 * @param {Object} res - Objeto de resposta do Express.
 * @param {Function} next - Função de callback para passar o controle para o próximo middleware.
 */
const verifyAdminToken = (req, res, next) => {
  // Primeiro, chama o middleware verifyToken para autenticar o usuário e decodificar o token.
  verifyToken(req, res, () => {
    // Se verifyToken passar (ou seja, `next()` for chamado por ele), `req.user` estará disponível.
    // Agora, verificamos o papel (role) do usuário.
    // É crucial que a role do usuário seja incluída no payload do JWT durante a geração.
    if (req.user && req.user.role === "admin") {
      next(); // Usuário é administrador, permite acesso.
    } else {
      // Usuário não é administrador ou a role não está definida.
      return res
        .status(403)
        .json({ message: "Acesso negado. Requer permissão de administrador." });
    }
  });
};

// Exporta ambos os middlewares, ou apenas o de admin se preferir organizar assim.
module.exports = {
  verifyToken,
  verifyAdminToken,
};