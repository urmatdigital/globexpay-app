const fs = require('fs').promises;
const path = require('path');
const { pool } = require('./src/config/database');

async function runMigrations() {
    try {
        const migrationsDir = path.join(__dirname, 'migrations');
        const files = await fs.readdir(migrationsDir);
        
        // Сортируем файлы по номеру
        const sortedFiles = files.sort();

        for (const file of sortedFiles) {
            if (file.endsWith('.sql')) {
                console.log(`Applying migration: ${file}`);
                const filePath = path.join(migrationsDir, file);
                const sql = await fs.readFile(filePath, 'utf8');
                
                try {
                    await pool.query(sql);
                    console.log(`✅ Migration ${file} applied successfully`);
                } catch (err) {
                    // Игнорируем ошибки о том, что объект уже существует
                    if (err.code === '42710' || err.code === '42P07') {
                        console.log(`⚠️ Some objects in ${file} already exist, continuing...`);
                    } else {
                        throw err;
                    }
                }
            }
        }

        console.log('All migrations completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error running migrations:', error);
        process.exit(1);
    }
}

runMigrations();
