# Telegram Integration Documentation

## Overview
GlobexPay интегрирован с Telegram для обеспечения удобного доступа к функционалу системы через мессенджер. Интеграция включает в себя бота для взаимодействия и систему авторизации через Telegram.

## Components

### Telegram Bot (`/src/config/telegram.js`)
```javascript
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
```

### Webhook Handler (`/src/routes/telegram/webhook.js`)
Обрабатывает входящие сообщения и команды от пользователей Telegram.

### Authentication Flow (`/src/routes/telegram/auth.js`)
Управляет процессом авторизации пользователей через Telegram.

## Bot Commands

### Available Commands
```
/start - Начало работы с ботом
/help - Получение справки
/login - Авторизация в системе
/status - Проверка статуса документов
/notify - Управление уведомлениями
/profile - Просмотр профиля
/settings - Настройки уведомлений
```

### Command Handlers
```javascript
// Пример обработчика команды
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, 'Добро пожаловать в GlobexPay!');
});
```

## Authentication Process

### Web Authentication
1. Пользователь нажимает "Login with Telegram"
2. Открывается Telegram OAuth виджет
3. Пользователь подтверждает доступ
4. Данные отправляются на сервер
5. Создается или обновляется пользователь
6. Возвращается JWT token

### Bot Authentication
1. Пользователь отправляет команду /login
2. Бот генерирует уникальный код
3. Пользователь вводит код на сайте
4. Происходит связывание аккаунтов

## Notification System

### Types of Notifications
- Статус документов
- Системные уведомления
- Напоминания
- Важные обновления

### Notification Format
```javascript
{
    type: 'document_status',
    message: 'Ваш документ был одобрен',
    data: {
        documentId: '123',
        status: 'approved'
    }
}
```

## Security

### Token Validation
- Проверка Telegram данных
- Валидация webhook запросов
- Защита от спама

### User Data Protection
- Шифрование sensitive данных
- Ограничение доступа к командам
- Проверка прав доступа

## Error Handling

### Bot Errors
```javascript
bot.on('polling_error', (error) => {
    console.error('Polling error:', error);
});
```

### Webhook Errors
```javascript
try {
    // Обработка webhook
} catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
}
```

## Development Guidelines

### Setting Up Bot
1. Создать бота через @BotFather
2. Получить TOKEN
3. Настроить команды бота
4. Установить webhook URL

### Testing
```bash
# Тестирование webhook
curl -X POST https://your-domain.com/telegram/webhook \
     -H "Content-Type: application/json" \
     -d '{"update_id":1,"message":{"text":"/start"}}'
```

### Deployment
1. Настроить SSL сертификат
2. Установить webhook URL
3. Проверить работу команд
4. Мониторить ошибки

## Useful Links
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Telegram Login Widget](https://core.telegram.org/widgets/login)
- [Bot Father](https://t.me/botfather)
