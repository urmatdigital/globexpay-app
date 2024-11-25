const express = require('express');
const router = express.Router();
const controllers = require('./controllers');
const { authMiddleware } = require('../../middleware/auth');

// Маршруты аутентификации
router.post('/register', (req, res) => controllers.register(req, res));
router.post('/login', (req, res) => controllers.login(req, res));
router.post('/logout', authMiddleware, (req, res) => controllers.logout(req, res));
router.get('/me', authMiddleware, (req, res) => controllers.getCurrentUser(req, res));

module.exports = router;
