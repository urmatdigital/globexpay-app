const telegramService = require('../services/telegram.service');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

// Инициализация Supabase клиента
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE
);

class TelegramController {
    // Обработка данных из Telegram Web App
    async handleWebAppData(req, res) {
        try {
            const { initData } = req.body;

            if (!telegramService.validateTelegramData(initData)) {
                return res.status(400).json({ error: 'Недействительные данные' });
            }

            const parsedInitData = new URLSearchParams(initData);
            const user = JSON.parse(parsedInitData.get('user'));

            // Проверяем существование пользователя
            const existingUser = await telegramService.findUserByTelegramId(user.id);

            if (existingUser) {
                // Создаем JWT токен для существующего пользователя
                const token = jwt.sign(
                    { userId: existingUser.id },
                    process.env.JWT_SECRET,
                    { expiresIn: '30d' }
                );

                return res.json({
                    token,
                    user: existingUser
                });
            }

            // Если пользователя нет, возвращаем данные из Telegram
            res.json({
                telegramUser: {
                    id: user.id,
                    username: user.username,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    photoUrl: user.photo_url
                }
            });
        } catch (error) {
            console.error('Ошибка при обработке данных Telegram Web App:', error);
            res.status(400).json({ error: 'Ошибка при обработке данных' });
        }
    }

    // Привязка Telegram к существующему аккаунту
    async linkTelegram(req, res) {
        try {
            const userId = req.user.id;
            const { telegramData } = req.body;

            await telegramService.linkTelegramToUser(userId, telegramData);

            res.json({ message: 'Код подтверждения отправлен в Telegram' });
        } catch (error) {
            console.error('Ошибка при привязке Telegram:', error);
            res.status(400).json({ error: error.message });
        }
    }

    // Подтверждение кода верификации
    async verifyCode(req, res) {
        try {
            const userId = req.user.id;
            const { code } = req.body;

            await telegramService.verifyTelegramCode(userId, code);

            res.json({ message: 'Telegram успешно подтвержден' });
        } catch (error) {
            console.error('Ошибка при подтверждении кода:', error);
            res.status(400).json({ error: error.message });
        }
    }

    // Отвязка Telegram от аккаунта
    async unlinkTelegram(req, res) {
        try {
            const userId = req.user.id;

            await telegramService.unlinkTelegram(userId);

            res.json({ message: 'Telegram успешно отвязан' });
        } catch (error) {
            console.error('Ошибка при отвязке Telegram:', error);
            res.status(400).json({ error: error.message });
        }
    }

    // Получение статуса привязки Telegram
    async getTelegramStatus(req, res) {
        try {
            const userId = req.user.id;

            const status = await telegramService.getTelegramStatus(userId);

            res.json(status);
        } catch (error) {
            console.error('Ошибка при получении статуса Telegram:', error);
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new TelegramController();
