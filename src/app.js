require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');

// Маршруты
const telegramRoutes = require('./routes/telegram/routes');

const app = express();

// Middleware
app.use(cors({
    origin: process.env.APP_URL,
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статические файлы
app.use(express.static(path.join(__dirname, '../public')));

// Основной маршрут
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// API маршруты
app.use('/api/telegram', telegramRoutes);

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
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
