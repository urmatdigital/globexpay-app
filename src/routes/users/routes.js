const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../../middleware/auth');
const {
    getUsers,
    getUser,
    updateUser,
    deleteUser
} = require('./controllers');

// Все маршруты защищены и требуют права администратора
router.use(authMiddleware, adminMiddleware);

router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
