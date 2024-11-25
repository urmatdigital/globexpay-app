const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth');
const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
} = require('./controllers');

// Все маршруты требуют аутентификации
router.use(authMiddleware);

// Получение списка уведомлений
router.get('/', getNotifications);

// Отметка уведомления как прочитанного
router.put('/:id/read', markAsRead);

// Отметка всех уведомлений как прочитанных
router.put('/read-all', markAllAsRead);

// Удаление уведомления
router.delete('/:id', deleteNotification);

module.exports = router;
