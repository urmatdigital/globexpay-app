const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false },
    max: 20, // максимальное количество клиентов в пуле
    idleTimeoutMillis: 30000, // время простоя клиента
    connectionTimeoutMillis: 2000, // время ожидания подключения
});

// Обработка ошибок подключения
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Функция для выполнения запросов
const query = (text, params) => pool.query(text, params);

module.exports = {
    query,
    pool
};
