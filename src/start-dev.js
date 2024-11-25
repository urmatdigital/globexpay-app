const ngrok = require('ngrok');
const { spawn } = require('child_process');
require('dotenv').config();

async function startDevelopment() {
    // Запускаем основное приложение
    const app = spawn('npm', ['run', 'dev'], {
        stdio: 'inherit',
        shell: true
    });

    try {
        // Запускаем ngrok с постоянным доменом
        const url = await ngrok.connect({
            addr: process.env.PORT || 3000,
            domain: process.env.NGROK_DOMAIN,
            authtoken: '2pLY5wwbJtbMewUieULrsDn3Nds_7vAfcdGk7bECPehDWosFd',
            region: 'eu'
        });

        console.log('\n=== Development Server Started ===');
        console.log(`Local: http://localhost:${process.env.PORT || 3000}`);
        console.log(`Public: ${url}`);
        console.log('===============================\n');

        // Обновляем APP_URL в .env
        const fs = require('fs');
        const envContent = fs.readFileSync('.env', 'utf8');
        const updatedContent = envContent.replace(
            /APP_URL=.*/,
            `APP_URL=${url}`
        );
        fs.writeFileSync('.env', updatedContent);
        console.log('APP_URL в .env обновлен\n');

    } catch (err) {
        console.error('Ошибка при запуске ngrok:', err);
        process.exit(1);
    }

    // Обработка завершения процесса
    process.on('SIGTERM', async () => {
        console.log('Завершение работы...');
        await ngrok.kill();
        app.kill();
        process.exit(0);
    });
}

startDevelopment();
