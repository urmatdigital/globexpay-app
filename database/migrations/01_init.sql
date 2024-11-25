-- Включаем расширение для UUID
create extension if not exists "uuid-ossp";

-- Создаем enum типы
create type transaction_status as enum (
    'pending',
    'processing',
    'completed',
    'failed',
    'cancelled'
);

create type user_role as enum (
    'admin',
    'user',
    'manager'
);

-- Создаем таблицы
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

create table if not exists public.exchange_rates (
    id uuid default uuid_generate_v4() primary key,
    currency_from varchar(3) not null,
    currency_to varchar(3) not null,
    rate decimal(15,6) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(currency_from, currency_to)
);

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
