-- Создаем enum для статусов транзакций
create type transaction_status as enum (
    'pending',
    'processing',
    'completed',
    'failed',
    'cancelled'
);

-- Создаем enum для типов пользователей
create type user_role as enum (
    'admin',
    'user',
    'manager'
);
