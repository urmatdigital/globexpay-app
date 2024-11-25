const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'globexpay', '.env') });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Импортируем основной маршрутизатор
const routes = require('./src/routes');
const { bot } = require('./src/config/telegram');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Статические файлы
app.use(express.static(path.join(__dirname, 'public')));

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Маршрут для Telegram авторизации
app.get('/telegram/auth/:telegramId', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/telegram-auth.html'));
});

// API маршруты
app.use('/api', routes);

// Простой эндпоинт для проверки работоспособности
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

const PORT = process.env.PORT || 3000;

// Функция для запуска сервера
async function startServer() {
    try {
        // Запускаем сервер
        app.listen(PORT, () => {
            console.log(`Сервер запущен на порту ${PORT}`);
            console.log(`Telegram бот @${process.env.TELEGRAM_BOT_USERNAME || 'globexpay_bot'} активен`);
        });
    } catch (error) {
        console.error('Ошибка при запуске сервера:', error);
        process.exit(1);
    }
}

startServer();
