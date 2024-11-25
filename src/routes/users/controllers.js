const { pool } = require('../../config/database');

// Контроллер для получения списка пользователей
async function getUsers(req, res) {
    try {
        const result = await pool.query(
            `SELECT id, email, first_name, last_name, role, created_at
            FROM users
            ORDER BY created_at DESC`
        );

        res.json({ users: result.rows });
    } catch (err) {
        console.error('Ошибка при получении списка пользователей:', err);
        res.status(500).json({ error: err.message });
    }
}

// Контроллер для получения конкретного пользователя
async function getUser(req, res) {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `SELECT id, email, first_name, last_name, role, created_at
            FROM users
            WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        res.json({ user: result.rows[0] });
    } catch (err) {
        console.error('Ошибка при получении пользователя:', err);
        res.status(500).json({ error: err.message });
    }
}

// Контроллер для обновления пользователя
async function updateUser(req, res) {
    const { id } = req.params;
    const { firstName, lastName, role } = req.body;

    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Проверяем существование пользователя
            const checkResult = await client.query(
                'SELECT id FROM users WHERE id = $1',
                [id]
            );

            if (checkResult.rows.length === 0) {
                throw new Error('Пользователь не найден');
            }

            // Обновляем данные пользователя
            const result = await client.query(
                `UPDATE users
                SET first_name = COALESCE($1, first_name),
                    last_name = COALESCE($2, last_name),
                    role = COALESCE($3, role),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $4
                RETURNING id, email, first_name, last_name, role`,
                [firstName, lastName, role, id]
            );

            await client.query('COMMIT');

            res.json({
                message: 'Пользователь успешно обновлен',
                user: result.rows[0]
            });
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Ошибка при обновлении пользователя:', err);
        res.status(400).json({ error: err.message });
    }
}

// Контроллер для удаления пользователя
async function deleteUser(req, res) {
    const { id } = req.params;

    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Проверяем существование пользователя
            const checkResult = await client.query(
                'SELECT id FROM users WHERE id = $1',
                [id]
            );

            if (checkResult.rows.length === 0) {
                throw new Error('Пользователь не найден');
            }

            // Удаляем пользователя
            await client.query(
                'DELETE FROM users WHERE id = $1',
                [id]
            );

            await client.query('COMMIT');

            res.json({ message: 'Пользователь успешно удален' });
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Ошибка при удалении пользователя:', err);
        res.status(400).json({ error: err.message });
    }
}

module.exports = {
    getUsers,
    getUser,
    updateUser,
    deleteUser
};
