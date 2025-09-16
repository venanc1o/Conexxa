const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho do banco de dados SQLite
const dbPath = path.resolve(__dirname, '../../../database/connexa.db');
const db = new sqlite3.Database(dbPath);

// Função para validar e-mail institucional
function validarEmailInstitucional(email) {
  return /^([a-zA-Z0-9_.+-]+)@universidade\.edu\.br$/.test(email);
}

// Função para validar força da senha
function validarSenha(senha) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(senha);
}

exports.cadastrarUsuario = async (req, res) => {
  const { nomeCompleto, email, curso, semestre, senha } = req.body;

  // Validação dos campos obrigatórios
  if (!nomeCompleto || !email || !curso || !semestre || !senha) {
    return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' });
  }

  // Validação do e-mail institucional
  if (!validarEmailInstitucional(email)) {
    return res.status(400).json({ mensagem: 'O e-mail informado não é um e-mail institucional válido.' });
  }

  // Validação da senha
  if (!validarSenha(senha)) {
    return res.status(400).json({ mensagem: 'A senha deve ter no mínimo 8 caracteres, incluindo uma letra maiúscula, uma minúscula e um número.' });
  }

  // Verificar se o e-mail já existe
  db.get('SELECT id FROM usuarios WHERE email = ?', [email], async (err, row) => {
    if (err) {
      return res.status(500).json({ mensagem: 'Erro ao acessar o banco de dados.' });
    }
    if (row) {
      return res.status(409).json({ mensagem: 'O e-mail informado já está cadastrado.' });
    }

    // Hash da senha
    const hash = await bcrypt.hash(senha, 10);

    // Inserir usuário
    db.run(
      'INSERT INTO usuarios (nomeCompleto, email, curso, semestre, senha) VALUES (?, ?, ?, ?, ?)',
      [nomeCompleto, email, curso, semestre, hash],
      function (err) {
        if (err) {
          return res.status(500).json({ mensagem: 'Erro ao cadastrar usuário.' });
        }
        return res.status(201).json({ id: this.lastID, mensagem: 'Usuário cadastrado com sucesso.' });
      }
    );
  });
};
