-- Migration: Add role column to users table
-- This script adds the role column to the existing users table

-- Add role column to users table
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';

-- Create enum type for user roles
CREATE TYPE user_role AS ENUM ('user', 'admin', 'superadmin');

-- Update the column to use the enum type
ALTER TABLE users ALTER COLUMN role TYPE user_role USING role::user_role;

-- Set default value for existing users
UPDATE users SET role = 'user' WHERE role IS NULL;

-- Make the role column NOT NULL
ALTER TABLE users ALTER COLUMN role SET NOT NULL;

-- Create an index for better performance on role queries
CREATE INDEX idx_users_role ON users(role);

-- Add a comment to the column
COMMENT ON COLUMN users.role IS 'User role: user, admin, or superadmin';
