const { pool } = require('./src/config/database');
const { createNotification } = require('./src/routes/notifications/controllers');

async function testNotification() {
    try {
        // Получаем ваш user_id из базы данных по telegram_id
        const userResult = await pool.query(
            `SELECT user_id as id 
            FROM user_telegram_data 
            WHERE telegram_username = $1 AND is_verified = true`,
            ['urmatdigital']
        );

        if (userResult.rows.length === 0) {
            console.error('Верифицированный пользователь Telegram не найден');
            process.exit(1);
        }

        const userId = userResult.rows[0].id;

        // Создаем тестовое уведомление
        const notification = await createNotification(
            userId,
            'test',
            '🎉 Тестовое уведомление',
            'Привет! Это тестовое уведомление для проверки системы.\n\nЕсли вы получили это сообщение в Telegram, значит система работает корректно!'
        );

        console.log('Уведомление успешно создано:', notification);
        process.exit(0);
    } catch (error) {
        console.error('Ошибка при создании уведомления:', error);
        process.exit(1);
    }
}

testNotification();
