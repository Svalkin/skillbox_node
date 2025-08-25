-- Создаём таблицу timers
CREATE TABLE IF NOT EXISTS timers (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  description TEXT,
  duration BIGINT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  stopped_at TIMESTAMP WITH TIME ZONE
);

-- Индекс по user_id и is_active для ускорения запросов
CREATE INDEX IF NOT EXISTS idx_timers_user_active ON timers(user_id, is_active);