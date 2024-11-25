const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { bot, generateVerificationCode, VERIFICATION_CODE_LIFETIME } = require('../config/telegram');
const { authMiddleware } = require('../middleware/auth');

// Обработка команды /start в Telegram
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const keyboard = {
        inline_keyboard: [
            [{ text: 'Приложение', url: `${process.env.APP_URL}/telegram/auth/${chatId}` }]
        ]
    };

    bot.sendMessage(chatId, 
        'Добро пожаловать в GlobExpay! \n\n' +
        'Для подключения Telegram к вашему аккаунту, пожалуйста: \n' +
        '1. Нажмите кнопку "Приложение" ниже \n' +
        '2. Войдите в систему или зарегистрируйтесь \n' +
        '3. Подтвердите привязку Telegram',
        { reply_markup: keyboard }
    );
});

// Привязка Telegram к аккаунту
router.post('/link', authMiddleware, async (req, res) => {
    const { telegramId } = req.body;
    const userId = req.user.id;

    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Проверяем, не привязан ли уже этот Telegram ID к другому пользователю
            const existingLink = await client.query(
                'SELECT user_id FROM user_telegram_data WHERE telegram_id = $1',
                [telegramId]
            );

            if (existingLink.rows.length > 0) {
                throw new Error('Этот Telegram аккаунт уже привязан к другому пользователю');
            }

            // Генерируем код подтверждения
            const verificationCode = generateVerificationCode();
            const verificationExpiresAt = new Date(Date.now() + VERIFICATION_CODE_LIFETIME);

            // Сохраняем данные в базу
            await client.query(
                `INSERT INTO user_telegram_data 
                (user_id, telegram_id, verification_code, verification_expires_at)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (telegram_id) DO UPDATE
                SET verification_code = $3,
                    verification_expires_at = $4,
                    is_verified = false`,
                [userId, telegramId, verificationCode, verificationExpiresAt]
            );

            await client.query('COMMIT');

            // Отправляем код подтверждения в Telegram
            bot.sendMessage(telegramId,
                'Для подтверждения привязки введите код: ' +
                `\`${verificationCode}\`\n\n` +
                'Код действителен в течение 30 минут.',
                { parse_mode: 'Markdown' }
            );

            res.json({ message: 'Код подтверждения отправлен в Telegram' });
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Ошибка при привязке Telegram:', err);
        res.status(400).json({ error: err.message });
    }
});

// Подтверждение кода из Telegram
router.post('/verify', authMiddleware, async (req, res) => {
    const { code } = req.body;
    const userId = req.user.id;

    try {
        const client = await pool.connect();
        try {
            // Проверяем код
            const result = await client.query(
                `SELECT telegram_id, verification_expires_at 
                FROM user_telegram_data 
                WHERE user_id = $1 AND verification_code = $2`,
                [userId, code]
            );

            if (result.rows.length === 0) {
                throw new Error('Неверный код подтверждения');
            }

            const { verification_expires_at, telegram_id } = result.rows[0];

            if (new Date() > new Date(verification_expires_at)) {
                throw new Error('Срок действия кода истек');
            }

            // Подтверждаем привязку
            await client.query(
                `UPDATE user_telegram_data 
                SET is_verified = true,
                    verification_code = null,
                    verification_expires_at = null
                WHERE user_id = $1`,
                [userId]
            );

            // Отправляем подтверждение в Telegram
            bot.sendMessage(telegram_id,
                '✅ Ваш Telegram аккаунт успешно привязан к GlobExpay!\n\n' +
                'Теперь вы будете получать уведомления о важных событиях.'
            );

            res.json({ message: 'Telegram успешно подтвержден' });
        } catch (err) {
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Ошибка при подтверждении Telegram:', err);
        res.status(400).json({ error: err.message });
    }
});

// Отвязка Telegram
router.post('/unlink', authMiddleware, async (req, res) => {
    const userId = req.user.id;

    try {
        const client = await pool.connect();
        try {
            // Получаем Telegram ID перед удалением
            const result = await client.query(
                'SELECT telegram_id FROM user_telegram_data WHERE user_id = $1',
                [userId]
            );

            if (result.rows.length > 0) {
                const { telegram_id } = result.rows[0];

                // Удаляем привязку
                await client.query(
                    'DELETE FROM user_telegram_data WHERE user_id = $1',
                    [userId]
                );

                // Отправляем уведомление в Telegram
                bot.sendMessage(telegram_id,
                    'Ваш Telegram аккаунт был отвязан от GlobExpay.\n' +
                    'Если вы хотите снова привязать аккаунт, используйте команду /start'
                );
            }

            res.json({ message: 'Telegram успешно отвязан' });
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Ошибка при отвязке Telegram:', err);
        res.status(400).json({ error: err.message });
    }
});

// Получение статуса привязки Telegram
router.get('/status', authMiddleware, async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await pool.query(
            `SELECT telegram_id, is_verified, telegram_username, 
            telegram_first_name, telegram_last_name
            FROM user_telegram_data 
            WHERE user_id = $1`,
            [userId]
        );

        res.json({
            isLinked: result.rows.length > 0,
            isVerified: result.rows[0]?.is_verified || false,
            telegramData: result.rows[0] || null
        });
    } catch (err) {
        console.error('Ошибка при получении статуса Telegram:', err);
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
