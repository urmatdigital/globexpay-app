-- Создаем первого администратора
insert into public.users (email, password, name, role, is_active)
values (
    'admin@globexpay.com',
    -- пароль: admin123 (захешированный bcrypt)
    '$2a$10$XKzRwpLX8Q4Y5XzR5Z5Z5O5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z',
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
