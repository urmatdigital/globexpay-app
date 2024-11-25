const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE
);

// Обработка callback от Telegram
router.get('/telegram-callback', async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }

        // Проверяем JWT токен
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Получаем данные пользователя из Supabase
        const { data: user, error } = await supabase
            .from('telegram_users')
            .select()
            .eq('telegram_id', decoded.telegram_id)
            .single();

        if (error || !user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Создаем новый JWT токен для клиента
        const clientToken = jwt.sign(
            {
                id: user.id,
                telegram_id: user.telegram_id,
                username: user.username
            },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Сохраняем токен в cookie
        res.cookie('token', clientToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        // Перенаправляем на главную страницу
        res.redirect('/');
    } catch (error) {
        console.error('Error in telegram-callback:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Webhook для Telegram бота
router.post('/webhook', (req, res) => {
    try {
        const telegramService = require('../services/telegram.service');
        telegramService.bot.processUpdate(req.body);
        res.sendStatus(200);
    } catch (error) {
        console.error('Error in webhook:', error);
        res.sendStatus(500);
    }
});

module.exports = router;
