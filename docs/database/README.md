# Database Documentation

## Overview
GlobexPay использует PostgreSQL в качестве основной базы данных. База данных содержит все необходимые таблицы для хранения информации о пользователях, документах, транзакциях и настройках.

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user',
    telegram_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Documents Table
```sql
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Notifications Table
```sql
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### User Settings Table
```sql
CREATE TABLE user_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    notification_email BOOLEAN DEFAULT TRUE,
    notification_telegram BOOLEAN DEFAULT TRUE,
    theme VARCHAR(20) DEFAULT 'light',
    language VARCHAR(10) DEFAULT 'ru',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Indexes
```sql
-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_telegram_id ON users(telegram_id);

-- Documents indexes
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_status ON documents(status);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
```

## Relationships

### Users
- One-to-Many с Documents
- One-to-Many с Notifications
- One-to-One с User Settings

### Documents
- Many-to-One с Users

### Notifications
- Many-to-One с Users

## Migrations
Миграции находятся в директории `/src/database/migrations/`:
```
├── migrations/
│   ├── 001_create_users.sql
│   ├── 002_create_documents.sql
│   ├── 003_create_notifications.sql
│   └── 004_create_user_settings.sql
```

### Running Migrations
```bash
npm run migrate:up    # Применить миграции
npm run migrate:down  # Откатить миграции
npm run migrate:reset # Сбросить и применить заново
```

## Backup and Restore

### Backup
```bash
pg_dump -U username -d database_name > backup.sql
```

### Restore
```bash
psql -U username -d database_name < backup.sql
```

## Connection Pool
```javascript
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    max: 20, // Максимальное количество соединений
    idleTimeoutMillis: 30000
});
```

## Query Examples

### Select User with Settings
```sql
SELECT u.*, us.*
FROM users u
LEFT JOIN user_settings us ON u.id = us.user_id
WHERE u.id = $1;
```

### Get User Documents with Status
```sql
SELECT d.*
FROM documents d
WHERE d.user_id = $1 AND d.status = $2
ORDER BY d.created_at DESC;
```

### Get Unread Notifications
```sql
SELECT n.*
FROM notifications n
WHERE n.user_id = $1 AND n.read = FALSE
ORDER BY n.created_at DESC;
```

## Development Guidelines
1. Всегда используйте миграции для изменения схемы
2. Создавайте индексы для часто используемых полей
3. Используйте транзакции для сложных операций
4. Следите за производительностью запросов
