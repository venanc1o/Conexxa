const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

// Endpoint de login
router.post('/login', loginController.loginUsuario);

module.exports = router;
