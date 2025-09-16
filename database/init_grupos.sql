CREATE TABLE IF NOT EXISTS grupos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nomeGrupo TEXT NOT NULL,
  materia TEXT NOT NULL,
  descricao TEXT,
  local TEXT NOT NULL,
  dataEncontro TEXT NOT NULL,
  limiteParticipantes INTEGER NOT NULL,
  linkVideoConferencia TEXT,
  criadorId INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS participantes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  grupoId INTEGER NOT NULL,
  usuarioId INTEGER NOT NULL,
  FOREIGN KEY (grupoId) REFERENCES grupos(id),
  FOREIGN KEY (usuarioId) REFERENCES usuarios(id)
);
