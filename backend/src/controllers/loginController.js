const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const jwt = require('jsonwebtoken');

const dbPath = path.resolve(__dirname, '../../../database/connexa.db');
const db = new sqlite3.Database(dbPath);

const JWT_SECRET = 'sua_chave_secreta'; // Troque por uma chave segura em produção
const TEMPO_SESSAO = 30 * 60; // 30 minutos em segundos
const MAX_TENTATIVAS = 5;
const TEMPO_BLOQUEIO = 10 * 60 * 1000; // 10 minutos em ms

// Armazenamento temporário de tentativas (ideal: usar Redis ou DB)
const tentativasLogin = {};

function validarEmailInstitucional(email) {
  return /^([a-zA-Z0-9_.+-]+)@universidade\.edu\.br$/.test(email);
}

exports.loginUsuario = (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ mensagem: 'E-mail e senha são obrigatórios.' });
  }

  if (!validarEmailInstitucional(email)) {
    return res.status(401).json({ mensagem: 'O e-mail informado não é institucional.' });
  }

  // Controle de tentativas
  const agora = Date.now();
  if (!tentativasLogin[email]) tentativasLogin[email] = { count: 0, bloqueadoAte: 0 };
  if (tentativasLogin[email].bloqueadoAte > agora) {
    return res.status(429).json({ mensagem: 'Muitas tentativas inválidas. Tente novamente em alguns minutos.' });
  }

  db.get('SELECT * FROM usuarios WHERE email = ?', [email], (err, usuario) => {
    if (err) {
      return res.status(500).json({ mensagem: 'Erro ao acessar o banco de dados.' });
    }
    if (!usuario) {
      tentativasLogin[email].count++;
      if (tentativasLogin[email].count >= MAX_TENTATIVAS) {
        tentativasLogin[email].bloqueadoAte = agora + TEMPO_BLOQUEIO;
        return res.status(429).json({ mensagem: 'Muitas tentativas inválidas. Tente novamente em alguns minutos.' });
      }
      return res.status(401).json({ mensagem: 'E-mail ou senha inválidos.' });
    }

    bcrypt.compare(senha, usuario.senha, (err, resultado) => {
      if (err || !resultado) {
        tentativasLogin[email].count++;
        if (tentativasLogin[email].count >= MAX_TENTATIVAS) {
          tentativasLogin[email].bloqueadoAte = agora + TEMPO_BLOQUEIO;
          return res.status(429).json({ mensagem: 'Muitas tentativas inválidas. Tente novamente em alguns minutos.' });
        }
        return res.status(401).json({ mensagem: 'E-mail ou senha inválidos.' });
      }
      // Login bem-sucedido
      tentativasLogin[email] = { count: 0, bloqueadoAte: 0 };
      const token = jwt.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, { expiresIn: TEMPO_SESSAO });
      return res.status(200).json({ token, mensagem: 'Login realizado com sucesso.' });
    });
  });
};
