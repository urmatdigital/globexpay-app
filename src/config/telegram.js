const TelegramBot = require('node-telegram-bot-api');
const crypto = require('crypto');

// Создаем экземпляр бота
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { 
    polling: false  // Отключаем polling по умолчанию
});

// Если мы в production, настраиваем webhook
if (process.env.NODE_ENV === 'production') {
    bot.setWebHook(`${process.env.APP_URL}/telegram/webhook`);
}

// Генерация случайного кода подтверждения
const generateVerificationCode = () => {
    return crypto.randomInt(100000, 999999).toString();
};

// Время жизни кода подтверждения (30 минут)
const VERIFICATION_CODE_LIFETIME = 30 * 60 * 1000;

module.exports = {
    bot,
    generateVerificationCode,
    VERIFICATION_CODE_LIFETIME
};
