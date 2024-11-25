-- Удаляем старый тип и создаем новый
DROP TYPE IF EXISTS notification_type CASCADE;

CREATE TYPE notification_type AS ENUM (
    'PAYMENT_RECEIVED',
    'PAYMENT_SENT',
    'INVOICE_CREATED',
    'INVOICE_PAID',
    'SYSTEM_MESSAGE',
    'TEST'
);

-- Пересоздаем таблицу уведомлений
DROP TABLE IF EXISTS notifications CASCADE;

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создаем индексы
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Создаем триггер для автоматического обновления updated_at
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
