const userService = require('../services/users');

// Обработка данных из Telegram Web App
async function handleWebAppData(req, res) {
    try {
        const { initData } = req.body;
        
        // Проверяем данные от Telegram Web App
        // TODO: добавить проверку подписи initData

        const parsedInitData = new URLSearchParams(initData);
        const user = JSON.parse(parsedInitData.get('user'));
        
        // Проверяем существование пользователя
        const existingUser = await userService.findUserByTelegramId(user.id);

        if (existingUser) {
            // Если пользователь существует, создаем токен
            const token = userService.createUserToken(existingUser.id);

            return res.json({
                token,
                user: existingUser
            });
        }

        // Если пользователя нет, возвращаем данные из Telegram
        res.json({
            telegramUser: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                username: user.username,
                photoUrl: user.photo_url
            }
        });

    } catch (error) {
        console.error('Ошибка при обработке данных Telegram Web App:', error);
        res.status(400).json({ error: 'Ошибка при обработке данных' });
    }
}

module.exports = {
    handleWebAppData
};
