const { bot } = require('../../../config/telegram');

// Отправка приветственного сообщения
async function sendWelcomeMessage(chatId) {
    const keyboard = {
        inline_keyboard: [
            [{ text: 'Приложение', url: `${process.env.APP_URL}/telegram/auth/${chatId}` }]
        ]
    };

    await bot.sendMessage(
        chatId,
        'Добро пожаловать в GlobExpay! \n\n' +
        'Для подключения Telegram к вашему аккаунту, пожалуйста: \n' +
        '1. Нажмите кнопку "Приложение" ниже \n' +
        '2. Войдите в систему или зарегистрируйтесь \n' +
        '3. Подтвердите привязку Telegram',
        { reply_markup: keyboard }
    );
}

// Отправка уведомления о новой транзакции
async function sendTransactionNotification(telegramId, transaction) {
    const message = `🔔 Новая транзакция\n\n` +
        `Сумма: ${transaction.amount} ${transaction.currency}\n` +
        `Статус: ${transaction.status}\n` +
        `Дата: ${new Date(transaction.createdAt).toLocaleString()}`;

    await bot.sendMessage(telegramId, message);
}

// Отправка уведомления о входе в аккаунт
async function sendLoginNotification(telegramId, loginInfo) {
    const message = `🔐 Новый вход в аккаунт\n\n` +
        `IP: ${loginInfo.ip}\n` +
        `Устройство: ${loginInfo.device}\n` +
        `Дата: ${new Date().toLocaleString()}`;

    await bot.sendMessage(telegramId, message);
}

// Инициализация команд бота
function initializeBotCommands() {
    // Обработка команды /start
    bot.onText(/\/start/, async (msg) => {
        await sendWelcomeMessage(msg.chat.id);
    });

    // Обработка команды /help
    bot.onText(/\/help/, async (msg) => {
        const helpText = 
            'Доступные команды:\n\n' +
            '/start - Начать работу с ботом\n' +
            '/help - Показать это сообщение\n' +
            '/status - Проверить статус подключения';

        await bot.sendMessage(msg.chat.id, helpText);
    });

    // Обработка команды /status
    bot.onText(/\/status/, async (msg) => {
        const chatId = msg.chat.id;
        // TODO: Добавить проверку статуса подключения
        await bot.sendMessage(chatId, 'Функция в разработке');
    });
}

module.exports = {
    sendWelcomeMessage,
    sendTransactionNotification,
    sendLoginNotification,
    initializeBotCommands
};
