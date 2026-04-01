-- Database Schema for NLLC
-- Run this in your PostgreSQL database instance

-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    role VARCHAR(50) DEFAULT 'USER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Preferences table
CREATE TABLE IF NOT EXISTS preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dark_mode BOOLEAN DEFAULT FALSE,
    sound_effects BOOLEAN DEFAULT TRUE,
    learning_language VARCHAR(50) DEFAULT 'tl',
    daily_goal INTEGER DEFAULT 20
);

-- Create Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    daily_reminders BOOLEAN DEFAULT TRUE,
    friend_activity BOOLEAN DEFAULT TRUE,
    weekly_report BOOLEAN DEFAULT TRUE
);
