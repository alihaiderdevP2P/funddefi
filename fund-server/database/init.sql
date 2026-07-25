-- Create database
CREATE DATABASE crowdfunding;

-- Connect to the database
\c crowdfunding;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'funded', 'expired', 'cancelled');
CREATE TYPE campaign_category AS ENUM ('technology', 'creative', 'community', 'business', 'environment', 'health', 'education');
CREATE TYPE funding_status AS ENUM ('pending', 'confirmed', 'failed', 'refunded');
CREATE TYPE user_role AS ENUM ('user', 'admin', 'superadmin');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    wallet_address VARCHAR(255),
    avatar VARCHAR(500),
    bio TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    role user_role DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campaigns table
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    summary TEXT NOT NULL,
    goal_amount DECIMAL(18,8) NOT NULL,
    raised_amount DECIMAL(18,8) DEFAULT 0,
    end_date TIMESTAMP NOT NULL,
    status campaign_status DEFAULT 'draft',
    category campaign_category NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    video_url VARCHAR(500),
    contract_address VARCHAR(255),
    backers_count INTEGER DEFAULT 0,
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rewards table
CREATE TABLE rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    min_amount DECIMAL(18,8) NOT NULL,
    delivery_date TIMESTAMP,
    max_backers INTEGER,
    current_backers INTEGER DEFAULT 0,
    image_url VARCHAR(500),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fundings table
CREATE TABLE fundings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    amount DECIMAL(18,8) NOT NULL,
    transaction_hash VARCHAR(255) NOT NULL,
    status funding_status DEFAULT 'pending',
    message TEXT,
    backer_info JSONB,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    reward_id UUID REFERENCES rewards(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_campaigns_creator_id ON campaigns(creator_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_category ON campaigns(category);
CREATE INDEX idx_campaigns_end_date ON campaigns(end_date);
CREATE INDEX idx_rewards_campaign_id ON rewards(campaign_id);
CREATE INDEX idx_fundings_user_id ON fundings(user_id);
CREATE INDEX idx_fundings_campaign_id ON fundings(campaign_id);
CREATE INDEX idx_fundings_reward_id ON fundings(reward_id);
CREATE INDEX idx_fundings_status ON fundings(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rewards_updated_at BEFORE UPDATE ON rewards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fundings_updated_at BEFORE UPDATE ON fundings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
