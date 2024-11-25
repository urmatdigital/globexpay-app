const { pool } = require('../../../config/database');
const jwt = require('jsonwebtoken');

// Поиск пользователя по Telegram ID
async function findUserByTelegramId(telegramId) {
    const result = await pool.query(
        'SELECT id, email FROM users WHERE telegram_id = $1',
        [telegramId]
    );
    return result.rows[0];
}

// Создание JWT токена для пользователя
function createUserToken(userId) {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
}

// Проверка существования телефона
async function checkPhoneExists(phone) {
    const result = await pool.query(
        'SELECT id FROM users WHERE phone = $1 AND is_phone_verified = true',
        [phone]
    );
    return result.rows.length > 0;
}

// Обновление телефона пользователя
async function updateUserPhone(userId, phone) {
    await pool.query(
        'UPDATE users SET phone = $1 WHERE id = $2',
        [phone, userId]
    );
}

// Привязка Telegram ID к пользователю
async function linkTelegramToUser(userId, telegramId) {
    await pool.query(
        'UPDATE users SET telegram_id = $1 WHERE id = $2',
        [telegramId, userId]
    );
}

// Отвязка Telegram от пользователя
async function unlinkTelegramFromUser(userId) {
    await pool.query(
        'UPDATE users SET telegram_id = NULL WHERE id = $1',
        [userId]
    );
}

module.exports = {
    findUserByTelegramId,
    createUserToken,
    checkPhoneExists,
    updateUserPhone,
    linkTelegramToUser,
    unlinkTelegramFromUser
};
