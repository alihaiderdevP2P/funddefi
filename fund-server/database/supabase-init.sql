-- Supabase / hosted Postgres schema (no CREATE DATABASE or \c)
-- Image files live in Supabase Storage; tables store URLs in image_url / avatar columns.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'funded', 'expired', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE campaign_category AS ENUM ('technology', 'creative', 'community', 'business', 'environment', 'health', 'education');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE funding_status AS ENUM ('pending', 'confirmed', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'admin', 'superadmin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS users (
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

CREATE TABLE IF NOT EXISTS campaigns (
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

CREATE TABLE IF NOT EXISTS rewards (
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

CREATE TABLE IF NOT EXISTS fundings (
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

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_campaigns_creator_id ON campaigns(creator_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_category ON campaigns(category);
CREATE INDEX IF NOT EXISTS idx_campaigns_end_date ON campaigns(end_date);
CREATE INDEX IF NOT EXISTS idx_rewards_campaign_id ON rewards(campaign_id);
CREATE INDEX IF NOT EXISTS idx_fundings_user_id ON fundings(user_id);
CREATE INDEX IF NOT EXISTS idx_fundings_campaign_id ON fundings(campaign_id);
CREATE INDEX IF NOT EXISTS idx_fundings_reward_id ON fundings(reward_id);
CREATE INDEX IF NOT EXISTS idx_fundings_status ON fundings(status);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rewards_updated_at ON rewards;
CREATE TRIGGER update_rewards_updated_at BEFORE UPDATE ON rewards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_fundings_updated_at ON fundings;
CREATE TRIGGER update_fundings_updated_at BEFORE UPDATE ON fundings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
