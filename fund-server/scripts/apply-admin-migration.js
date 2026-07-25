/**
 * Applies admin dashboard schema (is_suspended + moderation_reports).
 * Run: npm run db:migrate:admin
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
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE;

DO $$ BEGIN
  CREATE TYPE moderation_severity AS ENUM ('low', 'medium', 'high');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE moderation_report_status AS ENUM ('open', 'investigating', 'resolved', 'dismissed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS moderation_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    console.log("Connected. Applying admin migration...");
    await client.query(sql);
    console.log("Migration applied successfully.");
    console.log("  - users.is_suspended");
    console.log("  - moderation_reports table");
    console.log("Restart is not required; try logging in again.");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
