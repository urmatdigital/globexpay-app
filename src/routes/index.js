const express = require('express');
const router = express.Router();

// Импортируем маршруты
const authRoutes = require('./auth/routes');
const userRoutes = require('./users/routes');
const telegramRoutes = require('./telegram/routes');
const notificationRoutes = require('./notifications/routes');

// Маршруты аутентификации
router.use('/auth', authRoutes);

// Маршруты пользователей
router.use('/users', userRoutes);

// Маршруты для Telegram
router.use('/telegram', telegramRoutes);

// Маршруты для уведомлений
router.use('/notifications', notificationRoutes);

module.exports = router;
