# Authentication Documentation

## Overview
Система аутентификации GlobexPay построена на основе JWT токенов и интеграции с Telegram. Поддерживает как классическую email/password аутентификацию, так и вход через Telegram.

## Components

### Controllers (`/src/routes/auth/controllers.js`)
Основные контроллеры аутентификации:

1. `register`
   - Регистрация нового пользователя
   - Принимает: email, password, firstName, lastName
   - Возвращает: JWT token и данные пользователя

2. `login`
   - Аутентификация существующего пользователя
   - Принимает: email, password
   - Возвращает: JWT token и данные пользователя

3. `logout`
   - Выход из системы
   - Требует: JWT token в заголовке

4. `getCurrentUser`
   - Получение данных текущего пользователя
   - Требует: JWT token в заголовке

### Middleware (`/src/middleware/auth.js`)
- Проверка JWT токена
- Добавление данных пользователя в `req.user`
- Защита маршрутов от неавторизованного доступа

### Database Schema
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Authentication Flow

### Email/Password Authentication
1. Пользователь отправляет email/password
2. Сервер проверяет учетные данные
3. При успехе генерируется JWT token
4. Token возвращается клиенту
5. Клиент сохраняет token в localStorage

### Telegram Authentication
1. Пользователь нажимает кнопку "Login with Telegram"
2. Открывается Telegram OAuth
3. После подтверждения, данные отправляются на сервер
4. Сервер создает/обновляет пользователя
5. Возвращается JWT token

## Security Considerations
1. Пароли хешируются с использованием bcrypt
2. JWT tokens имеют ограниченный срок действия (30 дней)
3. Все защищенные маршруты требуют валидный JWT token
4. Используется HTTPS для всех запросов

## Error Handling
Все ошибки аутентификации возвращают соответствующие HTTP статусы:
- 400: Неверные данные запроса
- 401: Неавторизован
- 403: Доступ запрещен
- 500: Внутренняя ошибка сервера

## Usage Examples

### Register User
```javascript
fetch('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'user@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
    })
});
```

### Login User
```javascript
fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'user@example.com',
        password: 'password123'
    })
});
```

### Protected Route
```javascript
fetch('/auth/me', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
});
```
