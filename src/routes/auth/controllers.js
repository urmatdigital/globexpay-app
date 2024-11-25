const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { pool } = require('../../config/database');

const controllers = {
    // Регистрация пользователя по email
    register: async (req, res) => {
        const { email, password, firstName, lastName, role = 'user' } = req.body;

        try {
            // Проверяем, существует ли пользователь с таким email
            const existingUser = await pool.query(
                'SELECT id FROM users WHERE email = $1',
                [email]
            );

            if (existingUser.rows.length > 0) {
                return res.status(400).json({
                    error: 'Пользователь с таким email уже существует'
                });
            }

            // Хешируем пароль
            const hashedPassword = await bcrypt.hash(password, 10);

            // Создаем пользователя
            const result = await pool.query(
                `INSERT INTO users (email, password, first_name, last_name, role, created_at)
                 VALUES ($1, $2, $3, $4, $5, NOW())
                 RETURNING id, email, role, first_name, last_name`,
                [email, hashedPassword, firstName, lastName, role]
            );

            const user = result.rows[0];

            // Создаем JWT токен
            const token = jwt.sign(
                { userId: user.id },
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
            );

            res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    firstName: user.first_name,
                    lastName: user.last_name
                }
            });

        } catch (error) {
            console.error('Ошибка при регистрации:', error);
            res.status(500).json({ error: 'Ошибка при регистрации пользователя' });
        }
    },

    // Вход пользователя по email
    login: async (req, res) => {
        const { email, password } = req.body;

        try {
            // Ищем пользователя
            const result = await pool.query(
                'SELECT id, password, role, first_name, last_name FROM users WHERE email = $1',
                [email]
            );

            if (result.rows.length === 0) {
                return res.status(401).json({
                    error: 'Неверный email или пароль'
                });
            }

            const user = result.rows[0];

            // Проверяем пароль
            const validPassword = await bcrypt.compare(password, user.password);

            if (!validPassword) {
                return res.status(401).json({
                    error: 'Неверный email или пароль'
                });
            }

            // Создаем JWT токен
            const token = jwt.sign(
                { userId: user.id },
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
            );

            res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    firstName: user.first_name,
                    lastName: user.last_name
                }
            });

        } catch (error) {
            console.error('Ошибка при входе:', error);
            res.status(500).json({ error: 'Ошибка при входе в систему' });
        }
    },

    // Контроллер для выхода из системы
    logout: async (req, res) => {
        try {
            res.json({ message: 'Выход выполнен успешно' });
        } catch (err) {
            console.error('Ошибка при выходе:', err);
            res.status(500).json({ error: err.message });
        }
    },

    // Контроллер для проверки текущего пользователя
    getCurrentUser: async (req, res) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Получаем данные пользователя
            const result = await pool.query(
                'SELECT id, email, role, first_name, last_name FROM users WHERE id = $1',
                [decoded.userId]
            );

            const user = result.rows[0];

            res.json({
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    firstName: user.first_name,
                    lastName: user.last_name
                }
            });
        } catch (err) {
            console.error('Ошибка при получении данных пользователя:', err);
            res.status(401).json({ error: 'Не авторизован' });
        }
    }
};

module.exports = controllers;
