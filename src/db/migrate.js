const fs = require('fs').promises;
const path = require('path');
const { pool } = require('../config/database');

async function migrate() {
    try {
        // Создаем таблицу для отслеживания миграций, если она не существует
        await pool.query(`
            CREATE TABLE IF NOT EXISTS migrations (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Получаем список всех SQL файлов в папке migrations
        const migrationsDir = path.join(__dirname, 'migrations');
        const files = await fs.readdir(migrationsDir);
        const sqlFiles = files.filter(f => f.endsWith('.sql')).sort();

        // Получаем список уже примененных миграций
        const { rows: appliedMigrations } = await pool.query(
            'SELECT name FROM migrations'
        );
        const appliedMigrationNames = appliedMigrations.map(m => m.name);

        // Применяем новые миграции
        for (const file of sqlFiles) {
            if (!appliedMigrationNames.includes(file)) {
                console.log(`Применяем миграцию: ${file}`);
                
                const filePath = path.join(migrationsDir, file);
                const sql = await fs.readFile(filePath, 'utf-8');
                
                await pool.query(sql);
                await pool.query(
                    'INSERT INTO migrations (name) VALUES ($1)',
                    [file]
                );
                
                console.log(`Миграция ${file} успешно применена`);
            }
        }

        console.log('Все миграции успешно применены');
        process.exit(0);
    } catch (error) {
        console.error('Ошибка при применении миграций:', error);
        process.exit(1);
    }
}

migrate();
