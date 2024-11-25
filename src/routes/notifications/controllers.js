const { pool } = require('../../config/database');
const { bot } = require('../../config/telegram');

// Создание уведомления
async function createNotification(userId, type, title, message, data = null) {
    const client = await pool.connect();
    try {
        const result = await client.query(
            `INSERT INTO notifications (user_id, type, title, message, data)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [userId, type, title, message, data]
        );

        // Отправляем уведомление в Telegram, если пользователь подключил его
        const telegramResult = await client.query(
            `SELECT telegram_id 
            FROM user_telegram_data 
            WHERE user_id = $1 AND is_verified = true`,
            [userId]
        );

        if (telegramResult.rows.length > 0) {
            const { telegram_id } = telegramResult.rows[0];
            bot.sendMessage(telegram_id,
                `📢 ${title}\n\n${message}`,
                { parse_mode: 'Markdown' }
            );
        }

        return result.rows[0];
    } finally {
        client.release();
    }
}

// Получение списка уведомлений пользователя
async function getNotifications(req, res) {
    const userId = req.user.id;
    const { limit = 20, offset = 0, unreadOnly = false } = req.query;

    try {
        const query = {
            text: `
                SELECT id, type, title, message, data, is_read, created_at
                FROM notifications
                WHERE user_id = $1
                ${unreadOnly ? 'AND is_read = false' : ''}
                ORDER BY created_at DESC
                LIMIT $2 OFFSET $3
            `,
            values: [userId, limit, offset]
        };

        const result = await pool.query(query);

        // Получаем общее количество уведомлений
        const countQuery = {
            text: `
                SELECT COUNT(*) as total
                FROM notifications
                WHERE user_id = $1
                ${unreadOnly ? 'AND is_read = false' : ''}
            `,
            values: [userId]
        };

        const countResult = await pool.query(countQuery);

        res.json({
            notifications: result.rows,
            total: parseInt(countResult.rows[0].total),
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    } catch (err) {
        console.error('Ошибка при получении уведомлений:', err);
        res.status(500).json({ error: err.message });
    }
}

// Отметка уведомления как прочитанного
async function markAsRead(req, res) {
    const userId = req.user.id;
    const { id } = req.params;

    try {
        const result = await pool.query(
            `UPDATE notifications
            SET is_read = true
            WHERE id = $1 AND user_id = $2
            RETURNING *`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Уведомление не найдено' });
        }

        res.json({ notification: result.rows[0] });
    } catch (err) {
        console.error('Ошибка при отметке уведомления:', err);
        res.status(500).json({ error: err.message });
    }
}

// Отметка всех уведомлений как прочитанных
async function markAllAsRead(req, res) {
    const userId = req.user.id;

    try {
        await pool.query(
            `UPDATE notifications
            SET is_read = true
            WHERE user_id = $1 AND is_read = false`,
            [userId]
        );

        res.json({ message: 'Все уведомления отмечены как прочитанные' });
    } catch (err) {
        console.error('Ошибка при отметке уведомлений:', err);
        res.status(500).json({ error: err.message });
    }
}

// Удаление уведомления
async function deleteNotification(req, res) {
    const userId = req.user.id;
    const { id } = req.params;

    try {
        const result = await pool.query(
            `DELETE FROM notifications
            WHERE id = $1 AND user_id = $2
            RETURNING id`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Уведомление не найдено' });
        }

        res.json({ message: 'Уведомление удалено' });
    } catch (err) {
        console.error('Ошибка при удалении уведомления:', err);
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    createNotification,
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
};
