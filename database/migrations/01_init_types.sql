-- Создаем расширение для UUID
create extension if not exists "uuid-ossp";

-- Создаем типы для статусов и ролей
do $$ begin
    create type transaction_status as enum (
        'pending',
        'processing',
        'completed',
        'failed',
        'cancelled'
    );
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type user_role as enum (
        'admin',
        'user',
        'manager'
    );
exception
    when duplicate_object then null;
end $$;
