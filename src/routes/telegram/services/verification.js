const { pool } = require('../../../config/database');
const { bot } = require('../../../config/telegram');

// Генерация кода подтверждения
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Отправка кода подтверждения через Telegram
async function sendVerificationCodeToUser(telegramId, code) {
    await bot.sendMessage(
        telegramId,
        `Ваш код подтверждения: ${code}\n\nОн действителен в течение 5 минут.`
    );
}

// Сохранение кода верификации в базе данных
async function saveVerificationCode(userId, code) {
    await pool.query(
        `UPDATE users 
         SET verification_code = $1, 
             verification_code_expires = NOW() + INTERVAL '5 minutes'
         WHERE id = $2`,
        [code, userId]
    );
}

// Проверка кода верификации
async function checkVerificationCode(userId, code) {
    const result = await pool.query(
        `SELECT verification_code, verification_code_expires 
         FROM users 
         WHERE id = $1`,
        [userId]
    );

    if (result.rows.length === 0) {
        throw new Error('Пользователь не найден');
    }

    const user = result.rows[0];

    if (!user.verification_code || user.verification_code !== code) {
        throw new Error('Неверный код');
    }

    if (new Date() > new Date(user.verification_code_expires)) {
        throw new Error('Код истек');
    }

    return true;
}

// Подтверждение телефона пользователя
async function confirmUserPhone(userId) {
    await pool.query(
        `UPDATE users 
         SET is_phone_verified = true,
             verification_code = NULL,
             verification_code_expires = NULL
         WHERE id = $1`,
        [userId]
    );
}

module.exports = {
    generateVerificationCode,
    sendVerificationCodeToUser,
    saveVerificationCode,
    checkVerificationCode,
    confirmUserPhone
};
