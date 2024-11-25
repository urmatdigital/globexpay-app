const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const { bot } = require('../config/telegram');

// Инициализация Supabase клиента
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE
);

class TelegramService {
    // Генерация кода верификации
    generateVerificationCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Проверка данных от Telegram
    validateTelegramData(initData) {
        const data = new URLSearchParams(initData);
        const hash = data.get('hash');
        data.delete('hash');
        data.sort();

        const dataCheckString = Array.from(data.entries())
            .map(([key, value]) => `${key}=${value}`)
            .join('\n');

        const secretKey = crypto
            .createHmac('sha256', 'WebAppData')
            .update(process.env.TELEGRAM_BOT_TOKEN)
            .digest();

        const calculatedHash = crypto
            .createHmac('sha256', secretKey)
            .update(dataCheckString)
            .digest('hex');

        return calculatedHash === hash;
    }

    // Привязка Telegram к пользователю
    async linkTelegramToUser(userId, telegramData) {
        const verificationCode = this.generateVerificationCode();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 30); // Код действителен 30 минут

        const { data, error } = await supabase
            .from('telegram_users')
            .upsert({
                user_id: userId,
                telegram_id: telegramData.id,
                username: telegramData.username,
                first_name: telegramData.first_name,
                last_name: telegramData.last_name,
                photo_url: telegramData.photo_url,
                verification_code: verificationCode,
                verification_code_expires_at: expiresAt.toISOString(),
                is_verified: false
            }, {
                onConflict: 'user_id',
                returning: 'minimal'
            });

        if (error) throw error;

        // Отправляем код подтверждения в Telegram
        await bot.sendMessage(
            telegramData.id,
            `Ваш код подтверждения: ${verificationCode}\n\nКод действителен в течение 30 минут.`
        );

        return true;
    }

    // Подтверждение кода верификации
    async verifyTelegramCode(userId, code) {
        const { data, error } = await supabase
            .from('telegram_users')
            .select('*')
            .eq('user_id', userId)
            .eq('verification_code', code)
            .single();

        if (error) throw error;
        if (!data) throw new Error('Неверный код подтверждения');

        const now = new Date();
        const expiresAt = new Date(data.verification_code_expires_at);

        if (now > expiresAt) {
            throw new Error('Срок действия кода истек');
        }

        // Подтверждаем привязку
        const { error: updateError } = await supabase
            .from('telegram_users')
            .update({
                is_verified: true,
                verification_code: null,
                verification_code_expires_at: null
            })
            .eq('user_id', userId);

        if (updateError) throw updateError;

        // Отправляем подтверждение в Telegram
        await bot.sendMessage(
            data.telegram_id,
            '✅ Ваш Telegram аккаунт успешно привязан к GlobExpay!\n\n' +
            'Теперь вы будете получать уведомления о важных событиях.'
        );

        return true;
    }

    // Отвязка Telegram от пользователя
    async unlinkTelegram(userId) {
        const { error } = await supabase
            .from('telegram_users')
            .delete()
            .eq('user_id', userId);

        if (error) throw error;
        return true;
    }

    // Получение статуса привязки Telegram
    async getTelegramStatus(userId) {
        const { data, error } = await supabase
            .from('telegram_users')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        return {
            isLinked: !!data,
            isVerified: data?.is_verified || false,
            telegramData: data ? {
                username: data.username,
                firstName: data.first_name,
                lastName: data.last_name,
                photoUrl: data.photo_url
            } : null
        };
    }

    // Поиск пользователя по Telegram ID
    async findUserByTelegramId(telegramId) {
        const { data, error } = await supabase
            .from('telegram_users')
            .select(`
                *,
                user:users (
                    id,
                    email,
                    name,
                    role
                )
            `)
            .eq('telegram_id', telegramId)
            .eq('is_verified', true)
            .single();

        if (error) throw error;
        return data?.user || null;
    }
}

module.exports = new TelegramService();
