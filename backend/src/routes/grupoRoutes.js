const express = require('express');
const router = express.Router();
const grupoController = require('../controllers/grupoController');
const authMiddleware = require('../services/authMiddleware');

// Endpoint protegido para criar grupo
router.post('/criar', authMiddleware, grupoController.criarGrupo);

// Endpoint protegido para participar de grupo
router.post('/:id/participar', authMiddleware, grupoController.participarGrupo);

// Endpoint protegido para sair de grupo
router.delete('/:id/sair', authMiddleware, grupoController.sairGrupo);

module.exports = router;
