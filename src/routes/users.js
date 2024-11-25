const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const db = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Получение списка пользователей (только для админов)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const query = `
            SELECT 
                u.id,
                u.email,
                u.name,
                u.role,
                u.is_active,
                u.created_at,
                json_build_object(
                    'notification_email', us.notification_email,
                    'notification_sms', us.notification_sms,
                    'language', us.language,
                    'theme', us.theme
                ) as settings
            FROM users u
            LEFT JOIN user_settings us ON u.id = us.user_id
            ORDER BY u.created_at DESC
        `;

        const { rows } = await db.query(query);
        res.json({ users: rows });
    } catch (error) {
        console.error('Ошибка при получении списка пользователей:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получение информации о конкретном пользователе
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        // Проверяем права доступа
        if (req.user.id !== req.params.id) {
            const { rows } = await db.query(
                'SELECT role FROM users WHERE id = $1',
                [req.user.id]
            );
            if (!rows[0] || rows[0].role !== 'admin') {
                return res.status(403).json({ error: 'Доступ запрещен' });
            }
        }

        const query = `
            SELECT 
                u.id,
                u.email,
                u.name,
                u.role,
                u.is_active,
                u.created_at,
                json_build_object(
                    'notification_email', us.notification_email,
                    'notification_sms', us.notification_sms,
                    'language', us.language,
                    'theme', us.theme
                ) as settings
            FROM users u
            LEFT JOIN user_settings us ON u.id = us.user_id
            WHERE u.id = $1
        `;

        const { rows } = await db.query(query, [req.params.id]);
        
        if (!rows[0]) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        res.json({ user: rows[0] });
    } catch (error) {
        console.error('Ошибка при получении информации о пользователе:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Обновление информации о пользователе
router.put('/:id', authMiddleware, async (req, res) => {
    const client = await db.getClient();
    
    try {
        // Проверяем права доступа
        if (req.user.id !== req.params.id) {
            const { rows } = await client.query(
                'SELECT role FROM users WHERE id = $1',
                [req.user.id]
            );
            if (!rows[0] || rows[0].role !== 'admin') {
                return res.status(403).json({ error: 'Доступ запрещен' });
            }
        }

        const { name, is_active, settings } = req.body;

        await client.query('BEGIN');

        // Обновляем основную информацию о пользователе
        const updateUserQuery = `
            UPDATE users 
            SET 
                name = COALESCE($1, name),
                is_active = COALESCE($2, is_active),
                updated_at = NOW()
            WHERE id = $3
            RETURNING id, email, name, role, is_active, created_at, updated_at
        `;

        const { rows: [updatedUser] } = await client.query(updateUserQuery, [
            name,
            is_active,
            req.params.id
        ]);

        // Если есть настройки для обновления
        if (settings) {
            const updateSettingsQuery = `
                INSERT INTO user_settings (
                    user_id,
                    notification_email,
                    notification_sms,
                    language,
                    theme,
                    updated_at
                )
                VALUES ($1, $2, $3, $4, $5, NOW())
                ON CONFLICT (user_id) DO UPDATE SET
                    notification_email = EXCLUDED.notification_email,
                    notification_sms = EXCLUDED.notification_sms,
                    language = EXCLUDED.language,
                    theme = EXCLUDED.theme,
                    updated_at = NOW()
                RETURNING *
            `;

            await client.query(updateSettingsQuery, [
                req.params.id,
                settings.notification_email,
                settings.notification_sms,
                settings.language,
                settings.theme
            ]);
        }

        await client.query('COMMIT');

        res.json({
            message: 'Информация обновлена успешно',
            user: updatedUser
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Ошибка при обновлении информации о пользователе:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    } finally {
        client.release();
    }
});

// Удаление пользователя (только для админов)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    const client = await db.getClient();
    
    try {
        // Проверяем, не пытается ли админ удалить сам себя
        if (req.user.id === req.params.id) {
            return res.status(400).json({ error: 'Нельзя удалить свой собственный аккаунт' });
        }

        await client.query('BEGIN');

        // Удаляем пользователя из Auth
        const { error: authError } = await supabase.auth.admin.deleteUser(req.params.id);
        if (authError) throw authError;

        // Удаляем пользователя из базы данных
        const deleteQuery = `
            DELETE FROM users 
            WHERE id = $1 
            RETURNING id
        `;
        
        const { rows } = await client.query(deleteQuery, [req.params.id]);
        
        if (!rows[0]) {
            throw new Error('Пользователь не найден');
        }

        await client.query('COMMIT');
        res.json({ message: 'Пользователь успешно удален' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Ошибка при удалении пользователя:', error);
        
        if (error.message === 'Пользователь не найден') {
            return res.status(404).json({ error: error.message });
        }
        
        res.status(500).json({ error: 'Ошибка сервера' });
    } finally {
        client.release();
    }
});

module.exports = router;
