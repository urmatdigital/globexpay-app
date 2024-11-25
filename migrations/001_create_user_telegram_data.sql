-- Создаем таблицу для хранения данных Telegram пользователей
CREATE TABLE IF NOT EXISTS user_telegram_data (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    telegram_id BIGINT UNIQUE NOT NULL,
    telegram_username TEXT,
    telegram_first_name TEXT,
    telegram_last_name TEXT,
    verification_code TEXT,
    verification_expires_at TIMESTAMP WITH TIME ZONE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создаем индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_user_telegram_data_user_id ON user_telegram_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_telegram_data_telegram_id ON user_telegram_data(telegram_id);

-- Создаем триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_telegram_data_updated_at
    BEFORE UPDATE ON user_telegram_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
