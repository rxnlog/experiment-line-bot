-- 001_initial_schema.sql

-- Enable UUID extension if needed (optional, but good for IDs if we switch from VARCHAR)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
-- Stores LINE user profiles and their bot interaction state.
CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(255) PRIMARY KEY, -- LINE User ID
    display_name VARCHAR(255),
    picture_url TEXT,
    is_bot_active BOOLEAN DEFAULT TRUE, -- Toggle for auto-reply
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Messages Table
-- Stores conversation history for both inbound (user) and outbound (bot/human) messages.
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(user_id),
    content TEXT NOT NULL,
    direction VARCHAR(20) CHECK (direction IN ('inbound', 'outbound')), -- 'inbound' = from User, 'outbound' = from Bot/Support
    sender_type VARCHAR(20) DEFAULT 'user', -- 'user', 'bot', 'human'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bot Settings Table
-- Stores the bot's persona and configuration.
-- simplified to a single row for now, but scalable.
CREATE TABLE IF NOT EXISTS bot_settings (
    id SERIAL PRIMARY KEY,
    bot_name VARCHAR(255) DEFAULT 'AI Assistant',
    bot_avatar_url TEXT,
    system_prompt_template TEXT DEFAULT 'You are a helpful assistant.',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default bot setting if not exists
INSERT INTO bot_settings (id, bot_name, system_prompt_template)
VALUES (1, 'Vibe Bot', 'You are a friendly and helpful assistant for Vibe.')
ON CONFLICT DO NOTHING;
