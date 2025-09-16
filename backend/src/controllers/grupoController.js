const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../../database/connexa.db');
const db = new sqlite3.Database(dbPath);

// Matérias válidas (exemplo)
const materiasValidas = [
  'Matemática', 'Física', 'Química', 'Biologia', 'História', 'Geografia', 'Programação', 'Direito', 'Administração'
];

function validarGrupo(dados) {
  const erros = [];
  const agora = new Date();

  // nomeGrupo
  if (!dados.nomeGrupo || dados.nomeGrupo.length < 5 || dados.nomeGrupo.length > 100) {
    erros.push('O nome do grupo deve ter entre 5 e 100 caracteres.');
  }
  // materia
  if (!dados.materia || !materiasValidas.includes(dados.materia)) {
    erros.push('Matéria inválida ou não informada.');
  }
  // descricao
  if (dados.descricao && dados.descricao.length > 500) {
    erros.push('A descrição deve ter no máximo 500 caracteres.');
  }
  // local
  if (!dados.local || !['Online', 'Presencial'].includes(dados.local)) {
    erros.push('O local deve ser "Online" ou "Presencial".');
  }
  // dataEncontro
  if (!dados.dataEncontro) {
    erros.push('A data do encontro é obrigatória.');
  } else {
    const dataEncontro = new Date(dados.dataEncontro);
    if (isNaN(dataEncontro.getTime()) || dataEncontro < agora) {
      erros.push('A data do encontro deve ser futura e válida.');
    }
  }
  // limiteParticipantes
  if (!dados.limiteParticipantes || isNaN(dados.limiteParticipantes) || dados.limiteParticipantes < 2 || dados.limiteParticipantes > 50) {
    erros.push('O limite de participantes deve ser entre 2 e 50.');
  }
  // linkVideoConferencia
  if (dados.local === 'Online' && !dados.linkVideoConferencia) {
    erros.push('O link de videoconferência é obrigatório para grupos online.');
  }
  return erros;
}

exports.criarGrupo = (req, res) => {
  const dados = req.body;
  const usuarioId = req.usuario.id;

  // Validação dos dados
  const erros = validarGrupo(dados);
  if (erros.length > 0) {
    return res.status(400).json({ erros });
  }

  // Inserir grupo
  db.run(
    'INSERT INTO grupos (nomeGrupo, materia, descricao, local, dataEncontro, limiteParticipantes, linkVideoConferencia, criadorId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      dados.nomeGrupo,
      dados.materia,
      dados.descricao || '',
      dados.local,
      dados.dataEncontro,
      dados.limiteParticipantes,
      dados.linkVideoConferencia || '',
      usuarioId
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ mensagem: 'Erro ao criar grupo.' });
      }
      const grupoId = this.lastID;
      // Adicionar criador como primeiro participante
      db.run(
        'INSERT INTO participantes (grupoId, usuarioId) VALUES (?, ?)',
        [grupoId, usuarioId],
        function (err2) {
          if (err2) {
            return res.status(500).json({ mensagem: 'Grupo criado, mas erro ao adicionar participante.' });
          }
          return res.status(201).json({
            id: grupoId,
            nomeGrupo: dados.nomeGrupo,
            materia: dados.materia,
            descricao: dados.descricao || '',
            local: dados.local,
            dataEncontro: dados.dataEncontro,
            limiteParticipantes: dados.limiteParticipantes,
            linkVideoConferencia: dados.linkVideoConferencia || '',
            criadorId: usuarioId
          });
        }
      );
    }
  );
};

// Endpoint para participar de grupo
exports.participarGrupo = (req, res) => {
  const grupoId = req.params.id;
  const usuarioId = req.usuario.id;

  // Verificar se grupo existe e vagas
  db.get('SELECT limiteParticipantes FROM grupos WHERE id = ?', [grupoId], (err, grupo) => {
    if (err) return res.status(500).json({ mensagem: 'Erro ao acessar grupo.' });
    if (!grupo) return res.status(404).json({ mensagem: 'Grupo não encontrado.' });

    db.all('SELECT COUNT(*) AS total FROM participantes WHERE grupoId = ?', [grupoId], (err2, rows) => {
      if (err2) return res.status(500).json({ mensagem: 'Erro ao verificar participantes.' });
      const total = rows[0]?.total || 0;
      if (total >= grupo.limiteParticipantes) {
        return res.status(409).json({ mensagem: 'Este grupo está cheio.' });
      }
      // Verificar se já é participante
      db.get('SELECT id FROM participantes WHERE grupoId = ? AND usuarioId = ?', [grupoId, usuarioId], (err3, participante) => {
        if (err3) return res.status(500).json({ mensagem: 'Erro ao verificar participação.' });
        if (participante) return res.status(400).json({ mensagem: 'Você já é participante deste grupo.' });
        // Adicionar participante
        db.run('INSERT INTO participantes (grupoId, usuarioId) VALUES (?, ?)', [grupoId, usuarioId], function (err4) {
          if (err4) return res.status(500).json({ mensagem: 'Erro ao participar do grupo.' });
          // Aqui pode ser 200 (adicionado direto) ou 202 (solicitação enviada)
          return res.status(200).json({ mensagem: 'Participação confirmada.' });
        });
      });
    });
  });
};

// Endpoint para sair de grupo
exports.sairGrupo = (req, res) => {
  const grupoId = req.params.id;
  const usuarioId = req.usuario.id;

  // Verificar se é participante
  db.get('SELECT id FROM participantes WHERE grupoId = ? AND usuarioId = ?', [grupoId, usuarioId], (err, participante) => {
    if (err) return res.status(500).json({ mensagem: 'Erro ao acessar participantes.' });
    if (!participante) return res.status(400).json({ mensagem: 'Você não é participante deste grupo.' });
    // Remover participante
    db.run('DELETE FROM participantes WHERE grupoId = ? AND usuarioId = ?', [grupoId, usuarioId], function (err2) {
      if (err2) return res.status(500).json({ mensagem: 'Erro ao sair do grupo.' });
      return res.status(200).json({ mensagem: 'Você saiu do grupo com sucesso.' });
    });
  });
};
