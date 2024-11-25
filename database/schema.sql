-- Включаем расширение для UUID
create extension if not exists "uuid-ossp";

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

-- Таблица пользователей
create table if not exists public.users (
    id uuid default uuid_generate_v4() primary key,
    email varchar(255) unique not null,
    password varchar(255) not null,
    name varchar(255) not null,
    role user_role default 'user'::user_role not null,
    company_name varchar(255),
    phone varchar(50),
    is_active boolean default true,
    last_login timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Таблица для хранения настроек пользователей
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

-- Таблица для инвойсов
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

-- Таблица для транзакций
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

-- Таблица для курсов валют
create table if not exists public.exchange_rates (
    id uuid default uuid_generate_v4() primary key,
    currency_from varchar(3) not null,
    currency_to varchar(3) not null,
    rate decimal(15,6) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(currency_from, currency_to)
);

-- Таблица для аудита действий
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

-- Создаем индексы
create index if not exists users_email_idx on public.users (email);
create index if not exists invoices_user_id_idx on public.invoices (user_id);
create index if not exists invoices_status_idx on public.invoices (status);
create index if not exists transactions_user_id_idx on public.transactions (user_id);
create index if not exists transactions_invoice_id_idx on public.transactions (invoice_id);
create index if not exists transactions_status_idx on public.transactions (status);
create index if not exists exchange_rates_currencies_idx on public.exchange_rates (currency_from, currency_to);
create index if not exists audit_logs_user_id_idx on public.audit_logs (user_id);
create index if not exists audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);

-- Функция для обновления updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Триггеры для обновления updated_at
create trigger update_users_updated_at
    before update on users
    for each row
    execute function update_updated_at_column();

create trigger update_user_settings_updated_at
    before update on user_settings
    for each row
    execute function update_updated_at_column();

create trigger update_invoices_updated_at
    before update on invoices
    for each row
    execute function update_updated_at_column();

create trigger update_transactions_updated_at
    before update on transactions
    for each row
    execute function update_updated_at_column();

create trigger update_exchange_rates_updated_at
    before update on exchange_rates
    for each row
    execute function update_updated_at_column();

-- Создаем RLS (Row Level Security) политики
alter table public.users enable row level security;
alter table public.user_settings enable row level security;
alter table public.invoices enable row level security;
alter table public.transactions enable row level security;
alter table public.exchange_rates enable row level security;
alter table public.audit_logs enable row level security;

-- Политики для пользователей
create policy "Users can view their own data"
    on public.users for select
    using (id = auth.uid() or role = 'admin'::user_role);

create policy "Only admins can create users"
    on public.users for insert
    with check (role = 'admin'::user_role);

-- Политики для настроек пользователей
create policy "Users can view their own settings"
    on public.user_settings for select
    using (user_id = auth.uid() or exists (
        select 1 from public.users
        where users.id = auth.uid() and users.role = 'admin'::user_role
    ));

-- Политики для инвойсов
create policy "Users can view their own invoices"
    on public.invoices for select
    using (user_id = auth.uid() or exists (
        select 1 from public.users
        where users.id = auth.uid() and users.role = 'admin'::user_role
    ));

-- Политики для транзакций
create policy "Users can view their own transactions"
    on public.transactions for select
    using (user_id = auth.uid() or exists (
        select 1 from public.users
        where users.id = auth.uid() and users.role = 'admin'::user_role
    ));
