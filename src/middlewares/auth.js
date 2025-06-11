const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'segreto';

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ erro: 'Token não fornecido' });

  const [, token] = authHeader.split(' ');
  if (!token) return res.status(401).json({ erro: 'Token inválido' });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
};