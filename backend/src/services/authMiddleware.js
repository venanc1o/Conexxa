const jwt = require('jsonwebtoken');
const JWT_SECRET = 'sua_chave_secreta'; // Use uma chave segura em produção

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ mensagem: 'Token de autenticação não fornecido.' });
  }

  jwt.verify(token, JWT_SECRET, (err, usuario) => {
    if (err) {
      return res.status(401).json({ mensagem: 'Token inválido ou expirado.' });
    }
    req.usuario = usuario;
    next();
  });
};
