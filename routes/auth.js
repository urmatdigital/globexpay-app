const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Регистрация
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Проверка существования пользователя
        const { data: existingUser } = await supabase
            .from('users')
            .select()
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
        }

        // Хеширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);

        // Создание пользователя в Supabase
        const { data: newUser, error } = await supabase
            .from('users')
            .insert([
                { email, password: hashedPassword, name }
            ])
            .select()
            .single();

        if (error) throw error;

        // Создание JWT токена
        const token = jwt.sign(
            { userId: newUser.id, email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name
            },
            token
        });
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        res.status(500).json({ error: 'Ошибка при регистрации пользователя' });
    }
});

// Авторизация
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Поиск пользователя
        const { data: user } = await supabase
            .from('users')
            .select()
            .eq('email', email)
            .single();

        if (!user) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        // Проверка пароля
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        // Создание JWT токена
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            },
            token
        });
    } catch (error) {
        console.error('Ошибка при авторизации:', error);
        res.status(500).json({ error: 'Ошибка при авторизации' });
    }
});

// Получение информации о текущем пользователе
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Необходима авторизация' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { data: user } = await supabase
            .from('users')
            .select('id, email, name')
            .eq('id', decoded.userId)
            .single();

        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        res.json(user);
    } catch (error) {
        console.error('Ошибка при получении данных пользователя:', error);
        res.status(500).json({ error: 'Ошибка при получении данных пользователя' });
    }
});

module.exports = router;
