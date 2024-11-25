-- Включаем RLS для всех таблиц
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

create policy "Users can update their own data"
    on public.users for update
    using (id = auth.uid() or role = 'admin'::user_role);

-- Политики для настроек пользователей
create policy "Users can view their own settings"
    on public.user_settings for select
    using (user_id = auth.uid() or exists (
        select 1 from public.users
        where users.id = auth.uid() and users.role = 'admin'::user_role
    ));

create policy "Users can update their own settings"
    on public.user_settings for update
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

create policy "Users can create their own invoices"
    on public.invoices for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own invoices"
    on public.invoices for update
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

create policy "Users can create their own transactions"
    on public.transactions for insert
    with check (auth.uid() = user_id);

-- Политики для курсов валют
create policy "Everyone can view exchange rates"
    on public.exchange_rates for select
    using (true);

create policy "Only admins can modify exchange rates"
    on public.exchange_rates for all
    using (exists (
        select 1 from public.users
        where users.id = auth.uid() and users.role = 'admin'::user_role
    ));
