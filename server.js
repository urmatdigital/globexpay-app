const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const telegramRoutes = require('./src/routes/telegram');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Статические файлы
app.use(express.static(path.join(__dirname, 'public')));

// Маршрут для Telegram авторизации
app.get('/telegram/auth/:telegramId', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/telegram-auth.html'));
});

// API маршруты
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/telegram', telegramRoutes);

// Простой эндпоинт для проверки работоспособности
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Маршруты
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoints
app.post('/api/upload-invoice', (req, res) => {
    // Здесь будет логика обработки загрузки инвойса
    res.json({ message: 'Invoice upload endpoint' });
});

app.post('/api/calculate', (req, res) => {
    // Здесь будет логика калькулятора
    res.json({ message: 'Calculator endpoint' });
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    // Проверяем тип ошибки
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ error: 'Требуется авторизация' });
    }
    
    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
    }
    
    // Общая ошибка сервера
    res.status(500).json({ 
        error: 'Внутренняя ошибка сервера',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Обработка несуществующих маршрутов
app.use((req, res) => {
    res.status(404).json({ error: 'Маршрут не найден' });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
