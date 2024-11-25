const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Middleware для проверки JWT токена
async function authMiddleware(req, res, next) {
    try {
        // Получаем токен из заголовка
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'Не авторизован' });
        }

        // Проверяем токен
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Получаем данные пользователя из базы
        const result = await pool.query(
            'SELECT id, email, role FROM users WHERE id = $1',
            [decoded.userId]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Пользователь не найден' });
        }

        // Добавляем данные пользователя в объект запроса
        req.user = result.rows[0];
        next();
    } catch (error) {
        console.error('Ошибка аутентификации:', error);
        res.status(401).json({ error: 'Не авторизован' });
    }
}

// Middleware для проверки прав администратора
async function adminMiddleware(req, res, next) {
    try {
        // Сначала проверяем аутентификацию
        await authMiddleware(req, res, async () => {
            // Проверяем роль пользователя
            if (req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Доступ запрещен. Требуются права администратора.' });
            }
            next();
        });
    } catch (error) {
        console.error('Ошибка проверки прав администратора:', error);
        res.status(403).json({ error: 'Доступ запрещен' });
    }
}

module.exports = {
    authMiddleware,
    adminMiddleware
};
