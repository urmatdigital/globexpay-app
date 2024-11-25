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
