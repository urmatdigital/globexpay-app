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
