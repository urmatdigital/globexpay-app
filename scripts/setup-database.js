require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Создаем клиент Supabase
const supabaseUrl = 'https://akduwbigcggqwsxdhcgh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrZHV3YmlnY2dncXdzeGRoY2doIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjM2NDk4NywiZXhwIjoyMDQ3OTQwOTg3fQ.KDGlNkcThuvePCQyFmOCRb6tKiD8e9axCqwlYkCAMNw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQL(query) {
    try {
        const { data, error } = await supabase.rpc('exec_sql', { query });
        if (error) {
            console.error('Ошибка выполнения SQL:', error);
            return false;
        }
        console.log('SQL выполнен успешно');
        return true;
    } catch (err) {
        console.error('Ошибка:', err);
        return false;
    }
}

async function setupDatabase() {
    const migrations = [
        '01_init_types.sql',
        '02_init_tables.sql',
        '03_init_triggers.sql',
        '04_init_indexes.sql',
        '05_init_policies.sql',
        '06_init_data.sql'
    ];

    console.log('Начинаем настройку базы данных...');

    for (const migration of migrations) {
        console.log(`\nВыполняем миграцию: ${migration}`);
        const sqlContent = fs.readFileSync(
            path.join(__dirname, '..', 'database', 'migrations', migration),
            'utf8'
        );

        // Разделяем на отдельные команды и фильтруем пустые строки и комментарии
        const commands = sqlContent
            .split(';')
            .map(cmd => cmd.trim())
            .filter(cmd => cmd && !cmd.startsWith('--'));

        for (const command of commands) {
            if (command) {
                console.log(`Выполняем команду...`);
                const success = await executeSQL(command + ';');
                if (!success) {
                    console.error('Ошибка при выполнении команды:', command);
                    // Продолжаем выполнение, так как некоторые ошибки могут быть некритичными
                }
            }
        }
    }

    console.log('\nНастройка базы данных завершена!');
}

setupDatabase();
