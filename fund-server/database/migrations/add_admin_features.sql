-- Admin: moderation reports and user suspension
-- Run against your crowdfunding database when deploying admin features.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE;

DO $$ BEGIN
  CREATE TYPE moderation_severity AS ENUM ('low', 'medium', 'high');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE moderation_report_status AS ENUM ('open', 'investigating', 'resolved', 'dismissed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS moderation_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    campaign_title VARCHAR(255) NOT NULL,
    reason TEXT NOT NULL,
    reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reporter_name VARCHAR(255),
    severity moderation_severity DEFAULT 'medium',
    status moderation_report_status DEFAULT 'open',
    admin_notes TEXT,
    resolved_at TIMESTAMP,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_moderation_reports_status ON moderation_reports(status);
CREATE INDEX IF NOT EXISTS idx_moderation_reports_campaign_id ON moderation_reports(campaign_id);
CREATE INDEX IF NOT EXISTS idx_users_is_suspended ON users(is_suspended);
