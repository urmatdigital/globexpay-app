const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Регистрация нового пользователя (только для админов)
router.post('/register', async (req, res) => {
    const client = await db.getClient();
    try {
        const { email, password, name, role = 'user' } = req.body;

        // Создаем пользователя в Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password
        });

        if (authError) {
            throw new Error(authError.message);
        }

        await client.query('BEGIN');

        // Хешируем пароль для хранения в нашей БД
        const hashedPassword = await bcrypt.hash(password, 10);

        // Создаем запись в таблице users
        const insertUserQuery = `
            INSERT INTO users (id, email, password, name, role)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, email, name, role, is_active, created_at
        `;

        const { rows: [user] } = await client.query(insertUserQuery, [
            authData.user.id,
            email,
            hashedPassword,
            name,
            role
        ]);

        // Создаем настройки пользователя по умолчанию
        const insertSettingsQuery = `
            INSERT INTO user_settings (user_id)
            VALUES ($1)
            RETURNING *
        `;

        await client.query(insertSettingsQuery, [user.id]);
        await client.query('COMMIT');

        res.status(201).json({
            message: 'Пользователь успешно зарегистрирован',
            user
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Ошибка при регистрации:', error);

        if (error.message.includes('duplicate key')) {
            return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
        }

        res.status(500).json({ error: 'Ошибка сервера при регистрации' });
    } finally {
        client.release();
    }
});

// Вход в систему
router.post('/login', async (req, res) => {
    const client = await db.getClient();
    try {
        const { email, password } = req.body;

        // Получаем пользователя из базы данных
        const { rows: [user] } = await client.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (!user) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        // Проверяем пароль
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        // Аутентификация через Supabase
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (authError) {
            throw new Error(authError.message);
        }

        // Получаем настройки пользователя
        const { rows: [settings] } = await client.query(
            'SELECT * FROM user_settings WHERE user_id = $1',
            [user.id]
        );

        // Убираем пароль из ответа
        delete user.password;

        res.json({
            token: authData.session.access_token,
            user: {
                ...user,
                settings
            }
        });
    } catch (error) {
        console.error('Ошибка при входе:', error);
        res.status(500).json({ error: 'Ошибка сервера при входе' });
    } finally {
        client.release();
    }
});

// Выход из системы
router.post('/logout', authMiddleware, async (req, res) => {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            throw new Error(error.message);
        }

        res.json({ message: 'Выход выполнен успешно' });
    } catch (error) {
        console.error('Ошибка при выходе:', error);
        res.status(500).json({ error: 'Ошибка сервера при выходе' });
    }
});

// Получение информации о текущем пользователе
router.get('/me', authMiddleware, async (req, res) => {
    const client = await db.getClient();
    try {
        // Получаем пользователя из базы данных
        const { rows: [user] } = await client.query(
            'SELECT id, email, name, role, is_active, created_at FROM users WHERE id = $1',
            [req.user.id]
        );

        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        // Получаем настройки пользователя
        const { rows: [settings] } = await client.query(
            'SELECT * FROM user_settings WHERE user_id = $1',
            [user.id]
        );

        res.json({
            user: {
                ...user,
                settings
            }
        });
    } catch (error) {
        console.error('Ошибка при получении данных пользователя:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    } finally {
        client.release();
    }
});

module.exports = router;
