# GlobexPay Documentation

## Overview
GlobexPay - это современная платежная система, предоставляющая удобный интерфейс для управления финансовыми операциями и документами. Система включает в себя веб-интерфейс и интеграцию с Telegram для удобства пользователей.

## Project Structure
Проект разделен на логические компоненты, каждый из которых описан в отдельном документе:

1. [Authentication](/docs/auth/README.md)
   - Система аутентификации и авторизации
   - Управление пользовательскими сессиями

2. [API Routes](/docs/routes/README.md)
   - Описание всех доступных API endpoints
   - Структура запросов и ответов

3. [Database](/docs/database/README.md)
   - Схема базы данных
   - Миграции и управление данными

4. [Frontend](/docs/frontend/README.md)
   - Компоненты пользовательского интерфейса
   - Стили и ассеты

5. [Telegram Integration](/docs/telegram/README.md)
   - Бот и его функционал
   - Webhook обработчики

6. [Configuration](/docs/config/README.md)
   - Переменные окружения
   - Настройки сервера

## Getting Started

### Prerequisites
- Node.js v22.11.0 или выше
- PostgreSQL
- Telegram Bot Token
- Supabase account

### Installation
1. Клонировать репозиторий
2. Установить зависимости: `npm install`
3. Настроить переменные окружения (см. [Configuration](/docs/config/README.md))
4. Запустить миграции: `npm run migrate`
5. Запустить сервер: `npm run dev`

## Development Guidelines
- Следуйте структуре проекта при добавлении новых компонентов
- Используйте TypeScript для новых файлов
- Следуйте принципам компонентного подхода
- Документируйте новый функционал в соответствующих разделах

## Contributing
1. Создайте ветку для новой функциональности
2. Внесите изменения
3. Создайте pull request с описанием изменений

## Support
По вопросам поддержки обращайтесь в Telegram или создавайте Issue в репозитории.
