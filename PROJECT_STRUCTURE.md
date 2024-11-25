# GlobExPay - Платежная Система

## Обзор проекта
GlobExPay - это современная платежная система, построенная на Node.js и Express с интеграцией Telegram для аутентификации и уведомлений.

## Технологический стек
- **Backend**: Node.js с Express
- **База данных**: MongoDB
- **Аутентификация**: Telegram Login
- **Стили**: Bootstrap & Custom CSS
- **API**: REST API
- **Уведомления**: Telegram Bot API

## Структура проекта
```
globexpay/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── telegram.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── paymentController.js
│   ├── models/
│   │   ├── user.js
│   │   └── transaction.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── payment.js
│   └── utils/
│       └── validation.js
├── public/
│   ├── css/
│   ├── js/
│   └── images/
└── views/
    ├── auth/
    └── dashboard/
```

## Основные функции
1. **Аутентификация через Telegram**
   - Безопасный вход через Telegram
   - Автоматическая регистрация новых пользователей
   - Защищенные маршруты

2. **Уведомления в Telegram**
   - Мгновенные уведомления о транзакциях
   - Уведомления о входе в систему
   - Системные оповещения

3. **Панель управления**
   - Просмотр баланса
   - История транзакций
   - Управление профилем

## Запуск проекта

### Предварительные требования
1. Node.js 18+ и npm
2. MongoDB
3. Telegram Bot Token

### Переменные окружения
Создайте файл `.env` со следующими переменными:
```env
PORT=3000
MONGODB_URI=your_mongodb_uri
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_BOT_USERNAME=your_bot_username
JWT_SECRET=your_jwt_secret
```

### Шаги запуска
1. Установка зависимостей:
```bash
npm install
```

2. Запуск приложения:
```bash
# Режим разработки
npm run dev

# Продакшн режим
npm start
```

После запуска приложение будет доступно по адресу http://localhost:3000

## API Endpoints
- `/api/auth/telegram` - Telegram аутентификация
- `/api/auth/verify` - Верификация токена
- `/api/payments/create` - Создание платежа
- `/api/payments/history` - История платежей
- `/api/user/profile` - Профиль пользователя

## Безопасность
- JWT аутентификация
- Проверка Telegram данных
- Валидация входных данных
- Rate limiting
- CORS защита
- Безопасные заголовки HTTP

## Дальнейшее развитие
1. Добавление двухфакторной аутентификации
2. Интеграция с различными платежными системами
3. Расширенная аналитика транзакций
4. Настраиваемые уведомления
5. Мультиязычность

## Поддержка
При возникновении проблем или вопросов, создайте issue в репозитории проекта.
