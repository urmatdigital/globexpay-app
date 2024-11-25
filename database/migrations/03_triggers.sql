-- Создаем функцию для автоматического обновления updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Создаем триггеры для обновления updated_at
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
