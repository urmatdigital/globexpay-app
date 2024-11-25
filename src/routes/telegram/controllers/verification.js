const verificationService = require('../services/verification');
const userService = require('../services/users');

// Отправка кода подтверждения
async function sendVerificationCode(req, res) {
    try {
        const { phone } = req.body;
        const userId = req.user.id;

        // Проверяем, не занят ли телефон
        const phoneExists = await userService.checkPhoneExists(phone);
        if (phoneExists) {
            return res.status(400).json({
                error: 'Этот номер телефона уже зарегистрирован'
            });
        }

        // Генерируем и сохраняем код
        const code = verificationService.generateVerificationCode();
        await verificationService.saveVerificationCode(userId, code);

        // Обновляем телефон пользователя
        await userService.updateUserPhone(userId, phone);

        // Отправляем код через Telegram
        await verificationService.sendVerificationCodeToUser(req.user.telegram_id, code);

        res.json({ message: 'Код подтверждения отправлен' });
    } catch (error) {
        console.error('Ошибка при отправке кода:', error);
        res.status(500).json({ error: 'Ошибка при отправке кода' });
    }
}

// Проверка кода подтверждения
async function verifyCode(req, res) {
    try {
        const { code } = req.body;
        const userId = req.user.id;

        // Проверяем код
        await verificationService.checkVerificationCode(userId, code);

        // Подтверждаем телефон
        await verificationService.confirmUserPhone(userId);

        res.json({ message: 'Телефон подтвержден' });
    } catch (error) {
        console.error('Ошибка при проверке кода:', error);
        res.status(400).json({ error: error.message });
    }
}

// Проверка существования телефона
async function checkPhone(req, res) {
    try {
        const { phone } = req.body;
        const exists = await userService.checkPhoneExists(phone);
        res.json({ exists });
    } catch (error) {
        console.error('Ошибка при проверке телефона:', error);
        res.status(500).json({ error: 'Ошибка при проверке телефона' });
    }
}

module.exports = {
    sendVerificationCode,
    verifyCode,
    checkPhone
};
