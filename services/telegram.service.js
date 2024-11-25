const TelegramBot = require('node-telegram-bot-api');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE
);

class TelegramService {
    constructor() {
        this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
            webHook: {
                port: process.env.PORT || 3000
            }
        });

        this.bot.setWebHook(`${process.env.TELEGRAM_WEBHOOK_URL}`);
        this.setupCommands();
    }

    async setupCommands() {
        await this.bot.setMyCommands([
            { command: '/start', description: 'Начать работу с ботом' },
            { command: '/login', description: 'Войти в аккаунт' },
            { command: '/help', description: 'Получить помощь' }
        ]);
    }

    async handleStart(msg) {
        const chatId = msg.chat.id;
        const user = msg.from;
        
        try {
            // Проверяем, существует ли пользователь
            const { data: existingUser } = await supabase
                .from('telegram_users')
                .select()
                .eq('telegram_id', user.id)
                .single();

            if (!existingUser) {
                // Создаем нового пользователя
                const { data: newUser, error } = await supabase
                    .from('telegram_users')
                    .insert([
                        {
                            telegram_id: user.id,
                            username: user.username,
                            first_name: user.first_name,
                            last_name: user.last_name
                        }
                    ])
                    .single();

                if (error) throw error;
            }

            const token = jwt.sign(
                { telegram_id: user.id, username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
            );

            const loginUrl = `${process.env.APP_URL}/auth/telegram-callback?token=${token}`;

            await this.bot.sendMessage(
                chatId,
                `Привет, ${user.first_name}! 👋\n\nДля входа в систему перейдите по ссылке:\n${loginUrl}`,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Войти в GlobExPay', url: loginUrl }]
                        ]
                    }
                }
            );
        } catch (error) {
            console.error('Error in handleStart:', error);
            await this.bot.sendMessage(
                chatId,
                'Произошла ошибка при авторизации. Пожалуйста, попробуйте позже.'
            );
        }
    }

    async handleLogin(msg) {
        const chatId = msg.chat.id;
        const user = msg.from;

        try {
            const token = jwt.sign(
                { telegram_id: user.id, username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
            );

            const loginUrl = `${process.env.APP_URL}/auth/telegram-callback?token=${token}`;

            await this.bot.sendMessage(
                chatId,
                'Для входа в систему нажмите на кнопку ниже:',
                {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Войти в GlobExPay', url: loginUrl }]
                        ]
                    }
                }
            );
        } catch (error) {
            console.error('Error in handleLogin:', error);
            await this.bot.sendMessage(
                chatId,
                'Произошла ошибка при авторизации. Пожалуйста, попробуйте позже.'
            );
        }
    }

    async handleHelp(msg) {
        const chatId = msg.chat.id;
        await this.bot.sendMessage(
            chatId,
            'Доступные команды:\n' +
            '/start - Начать работу с ботом\n' +
            '/login - Войти в аккаунт\n' +
            '/help - Получить помощь\n\n' +
            'Если у вас возникли проблемы, обратитесь в поддержку: support@globexpay.ru'
        );
    }

    setupEventHandlers() {
        this.bot.onText(/\/start/, this.handleStart.bind(this));
        this.bot.onText(/\/login/, this.handleLogin.bind(this));
        this.bot.onText(/\/help/, this.handleHelp.bind(this));
    }
}

module.exports = new TelegramService();
