const { bot } = require('../../config/telegram');
const { pool } = require('../../config/database');
const jwt = require('jsonwebtoken');

// Обработка данных из Telegram Web App
async function handleWebAppData(req, res) {
    try {
        const { initData } = req.body;
        
        // Проверяем данные от Telegram Web App
        // TODO: добавить проверку подписи initData

        const parsedInitData = new URLSearchParams(initData);
        const user = JSON.parse(parsedInitData.get('user'));
        
        // Проверяем существование пользователя с таким telegram_id
        const result = await pool.query(
            'SELECT id, email FROM users WHERE telegram_id = $1',
            [user.id]
        );

        if (result.rows.length > 0) {
            // Если пользователь уже существует, создаем для него токен
            const token = jwt.sign(
                { userId: result.rows[0].id },
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
            );

            return res.json({
                token,
                user: result.rows[0]
            });
        }

        // Если пользователя нет, возвращаем данные из Telegram
        res.json({
            telegramUser: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                username: user.username,
                photoUrl: user.photo_url
            }
        });

    } catch (error) {
        console.error('Ошибка при обработке данных Telegram Web App:', error);
        res.status(400).json({ error: 'Ошибка при обработке данных' });
    }
}

// Отправка кода подтверждения
async function sendVerificationCode(req, res) {
    try {
        const { phone } = req.body;
        const userId = req.user.id;

        // Генерируем код подтверждения
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Сохраняем код в базе
        await pool.query(
            `UPDATE users 
             SET verification_code = $1, 
                 verification_code_expires = NOW() + INTERVAL '5 minutes',
                 phone = $2
             WHERE id = $3`,
            [code, phone, userId]
        );

        // Отправляем код через Telegram бота
        await bot.sendMessage(
            req.user.telegram_id,
            `Ваш код подтверждения: ${code}\n\nОн действителен в течение 5 минут.`
        );

        res.json({ message: 'Код подтверждения отправлен' });
    } catch (error) {
        console.error('Ошибка при отправке кода:', error);
        res.status(500).json({ error: 'Ошибка при отправке кода' });
    }
}

// Проверка кода подтверждения
async function verifyCode(req, res) {
    try {
        const { code } = req.body;
        const userId = req.user.id;

        // Проверяем код
        const result = await pool.query(
            `SELECT verification_code, verification_code_expires 
             FROM users 
             WHERE id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        const user = result.rows[0];

        if (!user.verification_code || user.verification_code !== code) {
            return res.status(400).json({ error: 'Неверный код' });
        }

        if (new Date() > new Date(user.verification_code_expires)) {
            return res.status(400).json({ error: 'Код истек' });
        }

        // Подтверждаем телефон
        await pool.query(
            `UPDATE users 
             SET is_phone_verified = true,
                 verification_code = NULL,
                 verification_code_expires = NULL
             WHERE id = $1`,
            [userId]
        );

        res.json({ message: 'Телефон подтвержден' });
    } catch (error) {
        console.error('Ошибка при проверке кода:', error);
        res.status(500).json({ error: 'Ошибка при проверке кода' });
    }
}

// Проверка существования телефона
async function checkPhone(req, res) {
    try {
        const { phone } = req.body;

        const result = await pool.query(
            'SELECT id FROM users WHERE phone = $1 AND is_phone_verified = true',
            [phone]
        );

        res.json({ exists: result.rows.length > 0 });
    } catch (error) {
        console.error('Ошибка при проверке телефона:', error);
        res.status(500).json({ error: 'Ошибка при проверке телефона' });
    }
}

// Контроллер для привязки Telegram к аккаунту
async function linkTelegram(req, res) {
    const { telegramId } = req.body;
    const userId = req.user.id;

    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Проверяем, не привязан ли уже этот Telegram ID к другому пользователю
            const existingLink = await client.query(
                'SELECT user_id FROM user_telegram_data WHERE telegram_id = $1',
                [telegramId]
            );

            if (existingLink.rows.length > 0) {
                throw new Error('Этот Telegram аккаунт уже привязан к другому пользователю');
            }

            // Генерируем код подтверждения
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            const verificationExpiresAt = new Date(Date.now() + 30 * 60 * 1000);

            // Сохраняем данные в базу
            await client.query(
                `INSERT INTO user_telegram_data 
                (user_id, telegram_id, verification_code, verification_expires_at)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (telegram_id) DO UPDATE
                SET verification_code = $3,
                    verification_expires_at = $4,
                    is_verified = false`,
                [userId, telegramId, verificationCode, verificationExpiresAt]
            );

            await client.query('COMMIT');

            // Отправляем код подтверждения в Telegram
            bot.sendMessage(telegramId,
                'Для подтверждения привязки введите код: ' +
                `\`${verificationCode}\`\n\n` +
                'Код действителен в течение 30 минут.',
                { parse_mode: 'Markdown' }
            );

            res.json({ message: 'Код подтверждения отправлен в Telegram' });
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Ошибка при привязке Telegram:', err);
        res.status(400).json({ error: err.message });
    }
}

// Контроллер для подтверждения кода
async function verifyCode(req, res) {
    const { code } = req.body;
    const userId = req.user.id;

    try {
        const client = await pool.connect();
        try {
            // Проверяем код
            const result = await client.query(
                `SELECT telegram_id, verification_expires_at 
                FROM user_telegram_data 
                WHERE user_id = $1 AND verification_code = $2`,
                [userId, code]
            );

            if (result.rows.length === 0) {
                throw new Error('Неверный код подтверждения');
            }

            const { verification_expires_at, telegram_id } = result.rows[0];

            if (new Date() > new Date(verification_expires_at)) {
                throw new Error('Срок действия кода истек');
            }

            // Подтверждаем привязку
            await client.query(
                `UPDATE user_telegram_data 
                SET is_verified = true,
                    verification_code = null,
                    verification_expires_at = null
                WHERE user_id = $1`,
                [userId]
            );

            // Отправляем подтверждение в Telegram
            bot.sendMessage(telegram_id,
                '✅ Ваш Telegram аккаунт успешно привязан к GlobExpay!\n\n' +
                'Теперь вы будете получать уведомления о важных событиях.'
            );

            res.json({ message: 'Telegram успешно подтвержден' });
        } catch (err) {
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Ошибка при подтверждении Telegram:', err);
        res.status(400).json({ error: err.message });
    }
}

// Контроллер для отвязки Telegram
async function unlinkTelegram(req, res) {
    const userId = req.user.id;

    try {
        const client = await pool.connect();
        try {
            // Получаем Telegram ID перед удалением
            const result = await client.query(
                'SELECT telegram_id FROM user_telegram_data WHERE user_id = $1',
                [userId]
            );

            if (result.rows.length > 0) {
                const { telegram_id } = result.rows[0];

                // Удаляем привязку
                await client.query(
                    'DELETE FROM user_telegram_data WHERE user_id = $1',
                    [userId]
                );

                // Отправляем уведомление в Telegram
                bot.sendMessage(telegram_id,
                    'Ваш Telegram аккаунт был отвязан от GlobExpay.\n' +
                    'Если вы хотите снова привязать аккаунт, используйте команду /start'
                );
            }

            res.json({ message: 'Telegram успешно отвязан' });
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Ошибка при отвязке Telegram:', err);
        res.status(400).json({ error: err.message });
    }
}

// Контроллер для получения статуса привязки
async function getTelegramStatus(req, res) {
    const userId = req.user.id;

    try {
        const result = await pool.query(
            `SELECT telegram_id, is_verified, telegram_username, 
            telegram_first_name, telegram_last_name
            FROM user_telegram_data 
            WHERE user_id = $1`,
            [userId]
        );

        res.json({
            isLinked: result.rows.length > 0,
            isVerified: result.rows[0]?.is_verified || false,
            telegramData: result.rows[0] || null
        });
    } catch (err) {
        console.error('Ошибка при получении статуса Telegram:', err);
        res.status(400).json({ error: err.message });
    }
}

// Состояния пользователя в процессе регистрации
const userStates = new Map();

// Команды бота
const COMMANDS = {
    START: '/start',
    REGISTER: '/register',
    HELP: '/help'
};

// Шаги регистрации
const REGISTRATION_STEPS = {
    EMAIL: 'EMAIL',
    PASSWORD: 'PASSWORD',
    CONFIRM: 'CONFIRM'
};

// Обработчик команды /start
async function handleStart(msg) {
    const chatId = msg.chat.id;
    const welcomeMessage = `
Добро пожаловать в GlobExpay! 🌟

Я помогу вам зарегистрироваться и управлять вашим аккаунтом.

Для начала регистрации используйте команду /register
Для получения помощи используйте /help
    `;
    
    await bot.sendMessage(chatId, welcomeMessage);
}

// Обработчик команды /help
async function handleHelp(msg) {
    const chatId = msg.chat.id;
    const helpMessage = `
Доступные команды:

/start - Начать работу с ботом
/register - Начать регистрацию
/help - Показать это сообщение

При возникновении проблем обратитесь в поддержку.
    `;
    
    await bot.sendMessage(chatId, helpMessage);
}

// Начало процесса регистрации
async function startRegistration(msg) {
    const chatId = msg.chat.id;
    
    userStates.set(chatId, {
        step: REGISTRATION_STEPS.EMAIL,
        data: {}
    });
    
    await bot.sendMessage(
        chatId,
        'Для регистрации введите ваш email:'
    );
}

// Проверка email
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Обработка email
async function handleEmail(msg) {
    const chatId = msg.chat.id;
    const email = msg.text.trim();
    
    if (!isValidEmail(email)) {
        await bot.sendMessage(
            chatId,
            'Неверный формат email. Пожалуйста, введите корректный email:'
        );
        return;
    }
    
    // Проверяем, не занят ли email
    const result = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
    );
    
    if (result.rows.length > 0) {
        await bot.sendMessage(
            chatId,
            'Этот email уже зарегистрирован. Пожалуйста, используйте другой email:'
        );
        return;
    }
    
    const state = userStates.get(chatId);
    state.data.email = email;
    state.step = REGISTRATION_STEPS.PASSWORD;
    userStates.set(chatId, state);
    
    await bot.sendMessage(
        chatId,
        'Отлично! Теперь введите пароль (минимум 8 символов):'
    );
}

// Обработка пароля
async function handlePassword(msg) {
    const chatId = msg.chat.id;
    const password = msg.text.trim();
    
    if (password.length < 8) {
        await bot.sendMessage(
            chatId,
            'Пароль должен содержать минимум 8 символов. Попробуйте еще раз:'
        );
        return;
    }
    
    const state = userStates.get(chatId);
    state.data.password = password;
    state.step = REGISTRATION_STEPS.CONFIRM;
    userStates.set(chatId, state);
    
    await bot.sendMessage(
        chatId,
        'Подтвердите пароль:'
    );
}

// Завершение регистрации
async function handleConfirmPassword(msg) {
    const chatId = msg.chat.id;
    const confirmPassword = msg.text.trim();
    const state = userStates.get(chatId);
    
    if (confirmPassword !== state.data.password) {
        await bot.sendMessage(
            chatId,
            'Пароли не совпадают. Введите пароль заново:'
        );
        state.step = REGISTRATION_STEPS.PASSWORD;
        userStates.set(chatId, state);
        return;
    }
    
    try {
        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(state.data.password, 10);
        
        // Создаем пользователя
        const result = await pool.query(
            'INSERT INTO users (email, password, telegram_id, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id',
            [state.data.email, hashedPassword, chatId]
        );
        
        const userId = result.rows[0].id;
        
        // Создаем JWT токен
        const token = jwt.sign(
            { userId, telegramId: chatId },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        // Отправляем сообщение об успешной регистрации
        await bot.sendMessage(
            chatId,
            `
✅ Регистрация успешно завершена!

Ваш email: ${state.data.email}
            
Теперь вы можете использовать веб-интерфейс GlobExpay.
Для входа используйте ваш email и пароль.

Ваш токен доступа (сохраните его):
${token}
            `
        );
        
        // Очищаем состояние пользователя
        userStates.delete(chatId);
        
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        await bot.sendMessage(
            chatId,
            'Произошла ошибка при регистрации. Пожалуйста, попробуйте позже или обратитесь в поддержку.'
        );
        userStates.delete(chatId);
    }
}

// Основной обработчик сообщений
async function handleMessage(msg) {
    const chatId = msg.chat.id;
    const text = msg.text;
    
    // Обработка команд
    if (text === COMMANDS.START) {
        await handleStart(msg);
        return;
    }
    
    if (text === COMMANDS.HELP) {
        await handleHelp(msg);
        return;
    }
    
    if (text === COMMANDS.REGISTER) {
        await startRegistration(msg);
        return;
    }
    
    // Обработка шагов регистрации
    const state = userStates.get(chatId);
    if (!state) {
        await bot.sendMessage(
            chatId,
            'Используйте /register для начала регистрации или /help для получения списка команд.'
        );
        return;
    }
    
    switch (state.step) {
        case REGISTRATION_STEPS.EMAIL:
            await handleEmail(msg);
            break;
        case REGISTRATION_STEPS.PASSWORD:
            await handlePassword(msg);
            break;
        case REGISTRATION_STEPS.CONFIRM:
            await handleConfirmPassword(msg);
            break;
        default:
            await bot.sendMessage(
                chatId,
                'Что-то пошло не так. Используйте /register для начала регистрации заново.'
            );
            userStates.delete(chatId);
    }
}

// Webhook handler
async function handleWebhook(req, res) {
    try {
        const update = req.body;
        
        if (update.message) {
            await handleMessage(update.message);
        }
        
        res.sendStatus(200);
    } catch (error) {
        console.error('Ошибка в webhook handler:', error);
        res.sendStatus(500);
    }
}

module.exports = {
    handleWebAppData,
    sendVerificationCode,
    verifyCode,
    checkPhone,
    linkTelegram,
    verifyCode,
    unlinkTelegram,
    getTelegramStatus,
    handleWebhook,
    handleMessage
};
