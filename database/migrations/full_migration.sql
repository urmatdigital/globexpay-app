-- Создаем расширение для UUID
create extension if not exists "uuid-ossp";

-- Создаем типы для статусов и ролей
do $$
begin
    if not exists (select 1 from pg_type where typname = 'transaction_status') then
        create type transaction_status as enum (
            'pending',
            'processing',
            'completed',
            'failed',
            'cancelled'
        );
    end if;
end$$;

do $$
begin
    if not exists (select 1 from pg_type where typname = 'user_role') then
        create type user_role as enum (
            'admin',
            'user',
            'manager'
        );
    end if;
end$$;

-- Создаем таблицу пользователей
create table if not exists public.users (
    id uuid default uuid_generate_v4() primary key,
    email varchar(255) unique not null,
    password text not null,
    name varchar(255) not null,
    role user_role default 'user'::user_role not null,
    is_active boolean default true not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Создаем таблицу настроек пользователей
create table if not exists public.user_settings (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.users(id) on delete cascade,
    notification_email boolean default true,
    notification_sms boolean default false,
    language varchar(10) default 'ru',
    theme varchar(10) default 'light',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id)
);

-- Создаем таблицу инвойсов
create table if not exists public.invoices (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.users(id) on delete set null,
    invoice_number varchar(50) unique not null,
    amount decimal(15,2) not null,
    currency varchar(3) not null,
    description text,
    status transaction_status default 'pending'::transaction_status not null,
    due_date timestamp with time zone,
    file_path text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Создаем таблицу транзакций
create table if not exists public.transactions (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.users(id) on delete set null,
    invoice_id uuid references public.invoices(id) on delete set null,
    amount decimal(15,2) not null,
    fee decimal(15,2) default 0.00,
    currency_from varchar(3) not null,
    currency_to varchar(3) not null,
    exchange_rate decimal(15,6) not null,
    status transaction_status default 'pending'::transaction_status not null,
    payment_method varchar(50),
    transaction_reference varchar(100) unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Создаем таблицу курсов валют
create table if not exists public.exchange_rates (
    id uuid default uuid_generate_v4() primary key,
    currency_from varchar(3) not null,
    currency_to varchar(3) not null,
    rate decimal(15,6) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(currency_from, currency_to)
);

-- Создаем таблицу аудита
create table if not exists public.audit_logs (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.users(id) on delete set null,
    action varchar(255) not null,
    entity_type varchar(50) not null,
    entity_id uuid,
    details jsonb,
    ip_address varchar(45),
    user_agent text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Таблица для хранения Telegram данных пользователей
CREATE TABLE IF NOT EXISTS user_telegram_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    telegram_id BIGINT NOT NULL UNIQUE,
    telegram_username VARCHAR(255),
    telegram_first_name VARCHAR(255),
    telegram_last_name VARCHAR(255),
    is_verified BOOLEAN DEFAULT false,
    verification_code VARCHAR(6),
    verification_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_user_telegram_data_user_id ON user_telegram_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_telegram_data_telegram_id ON user_telegram_data(telegram_id);

-- Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_user_telegram_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_telegram_data_updated_at
    BEFORE UPDATE ON user_telegram_data
    FOR EACH ROW
    EXECUTE FUNCTION update_user_telegram_data_updated_at();

-- Создаем функцию для обновления updated_at
create or replace function update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$;

-- Создаем триггеры для обновления updated_at
drop trigger if exists update_users_updated_at on users;
create trigger update_users_updated_at
    before update on users
    for each row
    execute function update_updated_at_column();

drop trigger if exists update_user_settings_updated_at on user_settings;
create trigger update_user_settings_updated_at
    before update on user_settings
    for each row
    execute function update_updated_at_column();

drop trigger if exists update_invoices_updated_at on invoices;
create trigger update_invoices_updated_at
    before update on invoices
    for each row
    execute function update_updated_at_column();

drop trigger if exists update_transactions_updated_at on transactions;
create trigger update_transactions_updated_at
    before update on transactions
    for each row
    execute function update_updated_at_column();

drop trigger if exists update_exchange_rates_updated_at on exchange_rates;
create trigger update_exchange_rates_updated_at
    before update on exchange_rates
    for each row
    execute function update_updated_at_column();

-- Создаем индексы для оптимизации запросов
create index if not exists users_email_idx on public.users (email);
create index if not exists invoices_user_id_idx on public.invoices (user_id);
create index if not exists invoices_status_idx on public.invoices (status);
create index if not exists transactions_user_id_idx on public.transactions (user_id);
create index if not exists transactions_invoice_id_idx on public.transactions (invoice_id);
create index if not exists transactions_status_idx on public.transactions (status);
create index if not exists exchange_rates_currencies_idx on public.exchange_rates (currency_from, currency_to);
create index if not exists audit_logs_user_id_idx on public.audit_logs (user_id);
create index if not exists audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);

-- Включаем RLS для всех таблиц
alter table public.users enable row level security;
alter table public.user_settings enable row level security;
alter table public.invoices enable row level security;
alter table public.transactions enable row level security;
alter table public.exchange_rates enable row level security;
alter table public.audit_logs enable row level security;
alter table public.user_telegram_data enable row level security;

-- Политики для пользователей
drop policy if exists "Users can view their own data" on public.users;
create policy "Users can view their own data"
    on public.users for select
    using (id = auth.uid() or role = 'admin'::user_role);

drop policy if exists "Only admins can create users" on public.users;
create policy "Only admins can create users"
    on public.users for insert
    with check (role = 'admin'::user_role);

drop policy if exists "Users can update their own data" on public.users;
create policy "Users can update their own data"
    on public.users for update
    using (id = auth.uid() or role = 'admin'::user_role);

-- Политики для настроек пользователей
drop policy if exists "Users can view their own settings" on public.user_settings;
create policy "Users can view their own settings"
    on public.user_settings for select
    using (user_id = auth.uid() or exists (
        select 1 from public.users
        where users.id = auth.uid() and users.role = 'admin'::user_role
    ));

drop policy if exists "Users can update their own settings" on public.user_settings;
create policy "Users can update their own settings"
    on public.user_settings for update
    using (user_id = auth.uid() or exists (
        select 1 from public.users
        where users.id = auth.uid() and users.role = 'admin'::user_role
    ));

-- Политики для инвойсов
drop policy if exists "Users can view their own invoices" on public.invoices;
create policy "Users can view their own invoices"
    on public.invoices for select
    using (user_id = auth.uid() or exists (
        select 1 from public.users
        where users.id = auth.uid() and users.role = 'admin'::user_role
    ));

drop policy if exists "Users can create their own invoices" on public.invoices;
create policy "Users can create their own invoices"
    on public.invoices for insert
    with check (auth.uid() = user_id);

drop policy if exists "Users can update their own invoices" on public.invoices;
create policy "Users can update their own invoices"
    on public.invoices for update
    using (user_id = auth.uid() or exists (
        select 1 from public.users
        where users.id = auth.uid() and users.role = 'admin'::user_role
    ));

-- Политики для транзакций
drop policy if exists "Users can view their own transactions" on public.transactions;
create policy "Users can view their own transactions"
    on public.transactions for select
    using (user_id = auth.uid() or exists (
        select 1 from public.users
        where users.id = auth.uid() and users.role = 'admin'::user_role
    ));

drop policy if exists "Users can create their own transactions" on public.transactions;
create policy "Users can create their own transactions"
    on public.transactions for insert
    with check (auth.uid() = user_id);

-- Политики для курсов валют
drop policy if exists "Everyone can view exchange rates" on public.exchange_rates;
create policy "Everyone can view exchange rates"
    on public.exchange_rates for select
    using (true);

drop policy if exists "Only admins can modify exchange rates" on public.exchange_rates;
create policy "Only admins can modify exchange rates"
    on public.exchange_rates for all
    using (exists (
        select 1 from public.users
        where users.id = auth.uid() and users.role = 'admin'::user_role
    ));

-- Политики для Telegram данных пользователей
drop policy if exists "Users can view their own Telegram data" on public.user_telegram_data;
create policy "Users can view their own Telegram data"
    on public.user_telegram_data for select
    using (user_id = auth.uid() or exists (
        select 1 from public.users
        where users.id = auth.uid() and users.role = 'admin'::user_role
    ));

drop policy if exists "Users can update their own Telegram data" on public.user_telegram_data;
create policy "Users can update their own Telegram data"
    on public.user_telegram_data for update
    using (user_id = auth.uid() or exists (
        select 1 from public.users
        where users.id = auth.uid() and users.role = 'admin'::user_role
    ));

-- Создаем первого администратора
insert into public.users (email, password, name, role, is_active)
values (
    'admin@globexpay.com',
    -- пароль: admin123 (захешированный bcrypt)
    '$2a$10$mD9GE3YqWY5t3tQZ3/bqWe5H0KqD3p96kUKFYHDRGk3HGz0DNwzOi',
    'Administrator',
    'admin',
    true
) on conflict (email) do nothing;

-- Добавляем базовые курсы валют
insert into public.exchange_rates (currency_from, currency_to, rate)
values 
    ('USD', 'RUB', 90.50),
    ('EUR', 'RUB', 98.20),
    ('USD', 'EUR', 0.92),
    ('EUR', 'USD', 1.09)
on conflict (currency_from, currency_to) do update
set rate = excluded.rate, updated_at = timezone('utc'::text, now());
