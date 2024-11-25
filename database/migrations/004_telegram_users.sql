-- Создаем таблицу для данных Telegram пользователей
create table if not exists public.telegram_users (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.users(id) on delete cascade,
    telegram_id bigint unique not null,
    username varchar(255),
    first_name varchar(255),
    last_name varchar(255),
    photo_url text,
    auth_date timestamp with time zone,
    is_verified boolean default false,
    verification_code varchar(6),
    verification_code_expires_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id)
);

-- Создаем индекс для быстрого поиска по telegram_id
create index if not exists idx_telegram_users_telegram_id on public.telegram_users(telegram_id);

-- Триггер для обновления updated_at
create trigger update_telegram_users_updated_at
    before update on public.telegram_users
    for each row
    execute function update_updated_at_column();

-- Добавляем поле для уведомлений Telegram в настройки пользователя
alter table public.user_settings
add column if not exists notification_telegram boolean default true;
