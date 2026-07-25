/**
 * Creates campaign_updates and saved_campaigns tables.
 * Run: npm run db:migrate:engagement
 */
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

const sql = `
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

CREATE INDEX IF NOT EXISTS idx_saved_campaigns_user_id ON saved_campaigns(user_id);

DROP TRIGGER IF EXISTS update_saved_campaigns_updated_at ON saved_campaigns;
CREATE TRIGGER update_saved_campaigns_updated_at
    BEFORE UPDATE ON saved_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_campaign_updates_updated_at ON campaign_updates;
CREATE TRIGGER update_campaign_updates_updated_at
    BEFORE UPDATE ON campaign_updates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set in .env");
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("Connected. Applying campaign engagement migration...");
    await client.query(sql);
    console.log("Migration applied successfully.");
    console.log("  - campaign_updates");
    console.log("  - saved_campaigns");
    console.log("Try posting an update or saving a campaign again.");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
