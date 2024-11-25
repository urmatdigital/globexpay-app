const botService = require('../services/bot');
const userService = require('../services/users');

// Обработка webhook от Telegram
async function handleWebhook(req, res) {
    try {
        const update = req.body;

        // Обработка различных типов обновлений
        if (update.message) {
            const chatId = update.message.chat.id;
            const text = update.message.text;

            if (text === '/start') {
                await botService.sendWelcomeMessage(chatId);
            }
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('Ошибка при обработке webhook:', error);
        res.sendStatus(500);
    }
}

// Привязка Telegram к аккаунту
async function linkTelegram(req, res) {
    try {
        const { telegramId } = req.body;
        const userId = req.user.id;

        // Проверяем, не привязан ли уже этот Telegram к другому аккаунту
        const existingUser = await userService.findUserByTelegramId(telegramId);
        if (existingUser && existingUser.id !== userId) {
            return res.status(400).json({
                error: 'Этот Telegram аккаунт уже привязан к другому пользователю'
            });
        }

        // Привязываем Telegram к пользователю
        await userService.linkTelegramToUser(userId, telegramId);

        res.json({ message: 'Telegram успешно привязан к аккаунту' });
    } catch (error) {
        console.error('Ошибка при привязке Telegram:', error);
        res.status(500).json({ error: 'Ошибка при привязке Telegram' });
    }
}

// Отвязка Telegram от аккаунта
async function unlinkTelegram(req, res) {
    try {
        const userId = req.user.id;

        // Отвязываем Telegram от пользователя
        await userService.unlinkTelegramFromUser(userId);

        res.json({ message: 'Telegram успешно отвязан от аккаунта' });
    } catch (error) {
        console.error('Ошибка при отвязке Telegram:', error);
        res.status(500).json({ error: 'Ошибка при отвязке Telegram' });
    }
}

module.exports = {
    handleWebhook,
    linkTelegram,
    unlinkTelegram
};
