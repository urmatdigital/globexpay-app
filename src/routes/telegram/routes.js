const express = require('express');
const router = express.Router();
const TelegramBot = require('node-telegram-bot-api');
const cookieParser = require('cookie-parser');

// Инициализация бота
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Хранилище сессий (в реальном проекте использовать Redis или БД)
const sessions = new Map();

// Middleware для обработки cookies
router.use(cookieParser());

// Обработка команды /start
bot.onText(/\/start/, async (msg) => {
    try {
        const chatId = msg.chat.id;
        const username = msg.from.username;
        
        // Создаем уникальный код авторизации
        const authCode = Math.random().toString(36).substring(7);
        
        // Сохраняем код авторизации и данные пользователя
        sessions.set(authCode, {
            telegramId: chatId,
            username: username,
            timestamp: Date.now()
        });

        // Формируем ссылку для авторизации
        const authLink = `${process.env.APP_URL}/api/telegram/auth?code=${authCode}`;

        // Отправляем сообщение с кнопкой
        await bot.sendMessage(chatId, 'Нажмите кнопку ниже для входа:', {
            reply_markup: {
                inline_keyboard: [[
                    {
                        text: 'Войти в GlobExPay',
                        url: authLink
                    }
                ]]
            }
        });
    } catch (error) {
        console.error('Ошибка при обработке команды /start:', error);
    }
});

// Маршрут для авторизации через Telegram
router.get('/auth', async (req, res) => {
    try {
        const { code } = req.query;
        
        if (!code) {
            return res.status(400).json({ error: 'Отсутствует код авторизации' });
        }

        // Получаем данные сессии
        const sessionData = sessions.get(code);
        
        if (!sessionData) {
            return res.status(400).json({ error: 'Недействительный код авторизации' });
        }

        // Проверяем время жизни кода (30 минут)
        if (Date.now() - sessionData.timestamp > 30 * 60 * 1000) {
            sessions.delete(code);
            return res.status(400).json({ error: 'Код авторизации истек' });
        }

        // Создаем сессию пользователя
        const sessionId = Math.random().toString(36).substring(7);
        sessions.set(sessionId, {
            telegramId: sessionData.telegramId,
            username: sessionData.username
        });

        // Удаляем использованный код авторизации
        sessions.delete(code);

        // Устанавливаем cookie
        res.cookie('session_id', sessionId, {
            maxAge: 24 * 60 * 60 * 1000, // 24 часа
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        });

        // Отправляем уведомление в Telegram
        await bot.sendMessage(sessionData.telegramId, 'Вы успешно вошли в систему!');

        // Перенаправляем на дашборд
        res.redirect('/dashboard.html');
    } catch (error) {
        console.error('Ошибка при авторизации:', error);
        res.status(500).json({ error: 'Ошибка сервера при авторизации' });
    }
});

// Проверка авторизации
router.get('/check-auth', (req, res) => {
    const sessionId = req.cookies.session_id;
    const session = sessions.get(sessionId);

    if (session) {
        res.json({ 
            authorized: true, 
            username: session.username,
            telegramId: session.telegramId 
        });
    } else {
        res.json({ authorized: false });
    }
});

// Выход из системы
router.post('/logout', (req, res) => {
    const sessionId = req.cookies.session_id;
    if (sessionId) {
        sessions.delete(sessionId);
    }
    res.clearCookie('session_id');
    res.json({ success: true });
});

module.exports = router;
