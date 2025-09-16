const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// Endpoint de cadastro de usuário
router.post('/cadastro', usuarioController.cadastrarUsuario);

module.exports = router;
