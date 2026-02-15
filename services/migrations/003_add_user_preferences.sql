-- Add preferences JSONB column to users table
-- Stores user settings like theme and display name
ALTER TABLE users ADD COLUMN preferences JSONB DEFAULT '{}'::jsonb NOT NULL;
