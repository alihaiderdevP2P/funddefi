-- Campaign updates (creator posts) and saved campaigns (user bookmarks)

CREATE TABLE IF NOT EXISTS campaign_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_campaign_updates_campaign_id ON campaign_updates(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_updates_created_at ON campaign_updates(created_at DESC);

CREATE TABLE IF NOT EXISTS saved_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, campaign_id)
);

DROP TRIGGER IF EXISTS update_saved_campaigns_updated_at ON saved_campaigns;
CREATE TRIGGER update_saved_campaigns_updated_at
    BEFORE UPDATE ON saved_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_saved_campaigns_user_id ON saved_campaigns(user_id);

DROP TRIGGER IF EXISTS update_campaign_updates_updated_at ON campaign_updates;
CREATE TRIGGER update_campaign_updates_updated_at
    BEFORE UPDATE ON campaign_updates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
