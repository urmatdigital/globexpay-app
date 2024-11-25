# API Routes Documentation

## Overview
API маршруты GlobexPay организованы по модульному принципу. Каждый модуль отвечает за определенный функционал и находится в отдельной директории.

## Route Structure

### Authentication Routes (`/src/routes/auth`)
Маршруты для аутентификации и управления пользователями:
```
POST /auth/register - Регистрация нового пользователя
POST /auth/login - Вход в систему
POST /auth/logout - Выход из системы
GET /auth/me - Получение данных текущего пользователя
```

### User Routes (`/src/routes/users`)
Маршруты для управления пользовательскими данными:
```
GET /users/profile - Профиль пользователя
PUT /users/profile - Обновление профиля
GET /users/documents - Список документов пользователя
POST /users/documents - Загрузка нового документа
```

### Telegram Routes (`/src/routes/telegram`)
Маршруты для интеграции с Telegram:
```
POST /telegram/webhook - Webhook для обработки сообщений
GET /telegram/login - Авторизация через Telegram
POST /telegram/verify - Верификация Telegram данных
```

### Notification Routes (`/src/routes/notifications`)
Маршруты для управления уведомлениями:
```
GET /notifications - Список уведомлений
POST /notifications/read - Отметить уведомления как прочитанные
POST /notifications/settings - Настройки уведомлений
```

## Middleware

### Authentication Middleware
- Проверяет наличие и валидность JWT токена
- Добавляет информацию о пользователе в request
- Используется для защищенных маршрутов

### Validation Middleware
- Проверяет входящие данные
- Возвращает ошибки валидации
- Предотвращает некорректные запросы

### Error Handling Middleware
- Обрабатывает ошибки приложения
- Форматирует ответы об ошибках
- Логирует ошибки для отладки

## Response Format

### Success Response
```json
{
    "success": true,
    "data": {
        // Данные ответа
    },
    "message": "Операция выполнена успешно"
}
```

### Error Response
```json
{
    "success": false,
    "error": {
        "code": "ERROR_CODE",
        "message": "Описание ошибки"
    }
}
```

## Rate Limiting
- 100 запросов в минуту для обычных пользователей
- 1000 запросов в минуту для администраторов
- Блокировка IP при превышении лимита

## Security
1. Все маршруты используют HTTPS
2. Защита от CSRF атак
3. Валидация входящих данных
4. Санитизация выходных данных

## Testing
Каждый маршрут имеет соответствующие тесты в директории `/tests/routes/`:
- Unit тесты для контроллеров
- Integration тесты для API endpoints
- End-to-end тесты для критических путей

## Development Guidelines
1. Следуйте структуре маршрутов
2. Документируйте новые endpoints
3. Добавляйте тесты для нового функционала
4. Используйте middleware для общей логики
