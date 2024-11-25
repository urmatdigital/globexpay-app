const express = require('express');
const router = express.Router();
const telegramController = require('../controllers/telegram.controller');
const { authMiddleware } = require('../middleware/auth');
const { bot } = require('../config/telegram');

// Обработка команды /start
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const keyboard = {
        inline_keyboard: [
            [{ text: 'Войти через GlobExpay', web_app: { url: `${process.env.APP_URL}/auth/telegram` } }]
        ]
    };

    bot.sendMessage(chatId,
        'Добро пожаловать в GlobExpay! 👋\n\n' +
        'Вы можете:\n' +
        '1️⃣ Войти через существующий аккаунт\n' +
        '2️⃣ Зарегистрироваться с помощью Telegram\n\n' +
        'Нажмите кнопку ниже, чтобы начать:',
        { reply_markup: keyboard }
    );
});

// Маршруты для веб-приложения
router.post('/webapp-data', telegramController.handleWebAppData);

// Маршруты для управления привязкой Telegram (требуют авторизации)
router.post('/link', authMiddleware, telegramController.linkTelegram);
router.post('/verify', authMiddleware, telegramController.verifyCode);
router.post('/unlink', authMiddleware, telegramController.unlinkTelegram);
router.get('/status', authMiddleware, telegramController.getTelegramStatus);

module.exports = router;
