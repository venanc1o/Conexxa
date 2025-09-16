const express = require('express');
const bodyParser = require('body-parser');
const usuarioRoutes = require('./routes/usuarioRoutes');

const loginRoutes = require('./routes/loginRoutes');

const app = express();
app.use(bodyParser.json());

const cors = require('./cors');
app.use(cors);

const grupoRoutes = require('./routes/grupoRoutes');

// Rotas de usuário
app.use('/api/usuarios', usuarioRoutes);

// Rotas de login
app.use('/api/usuarios', loginRoutes);

// Rotas de grupos
app.use('/api/grupos', grupoRoutes);

// Porta padrão
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
