const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { supabase } = require('../../../config/supabase');

const controllers = {
    // Регистрация пользователя по email
    register: async (req, res) => {
        const { email, password, firstName, lastName, role = 'user' } = req.body;

        try {
            // Проверяем, существует ли пользователь с таким email
            const { data, error } = await supabase
                .from('users')
                .select('id')
                .eq('email', email);

            if (error) {
                console.error('Ошибка при регистрации:', error);
                return res.status(500).json({ error: 'Ошибка при регистрации пользователя' });
            }

            if (data.length > 0) {
                return res.status(400).json({
                    error: 'Пользователь с таким email уже существует'
                });
            }

            // Хешируем пароль
            const hashedPassword = await bcrypt.hash(password, 10);

            // Создаем пользователя
            const { data: userData, error: createUserError } = await supabase
                .from('users')
                .insert([
                    {
                        email,
                        password: hashedPassword,
                        first_name: firstName,
                        last_name: lastName,
                        role,
                    },
                ])
                .select('id, email, role, first_name, last_name');

            if (createUserError) {
                console.error('Ошибка при регистрации:', createUserError);
                return res.status(500).json({ error: 'Ошибка при регистрации пользователя' });
            }

            const user = userData[0];

            // Создаем JWT токен
            const token = jwt.sign(
                { userId: user.id },
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
            );

            res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    firstName: user.first_name,
                    lastName: user.last_name
                }
            });

        } catch (error) {
            console.error('Ошибка при регистрации:', error);
            res.status(500).json({ error: 'Ошибка при регистрации пользователя' });
        }
    },

    // Вход пользователя по email
    login: async (req, res) => {
        const { email, password } = req.body;

        try {
            // Ищем пользователя
            const { data, error } = await supabase
                .from('users')
                .select('id, password, role, first_name, last_name')
                .eq('email', email);

            if (error) {
                console.error('Ошибка при входе:', error);
                return res.status(500).json({ error: 'Ошибка при входе в систему' });
            }

            if (data.length === 0) {
                return res.status(401).json({
                    error: 'Неверный email или пароль'
                });
            }

            const user = data[0];

            // Проверяем пароль
            const validPassword = await bcrypt.compare(password, user.password);

            if (!validPassword) {
                return res.status(401).json({
                    error: 'Неверный email или пароль'
                });
            }

            // Создаем JWT токен
            const token = jwt.sign(
                { userId: user.id },
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
            );

            res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    firstName: user.first_name,
                    lastName: user.last_name
                }
            });

        } catch (error) {
            console.error('Ошибка при входе:', error);
            res.status(500).json({ error: 'Ошибка при входе в систему' });
        }
    },

    // Контроллер для выхода из системы
    logout: async (req, res) => {
        try {
            res.json({ message: 'Выход выполнен успешно' });
        } catch (err) {
            console.error('Ошибка при выходе:', err);
            res.status(500).json({ error: err.message });
        }
    },

    // Контроллер для проверки текущего пользователя
    getCurrentUser: async (req, res) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Получаем данные пользователя
            const { data, error } = await supabase
                .from('users')
                .select('id, email, role, first_name, last_name')
                .eq('id', decoded.userId);

            if (error) {
                console.error('Ошибка при получении данных пользователя:', error);
                return res.status(401).json({ error: 'Не авторизован' });
            }

            const user = data[0];

            res.json({
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    firstName: user.first_name,
                    lastName: user.last_name
                }
            });
        } catch (err) {
            console.error('Ошибка при получении данных пользователя:', err);
            res.status(401).json({ error: 'Не авторизован' });
        }
    }
};

module.exports = controllers;
