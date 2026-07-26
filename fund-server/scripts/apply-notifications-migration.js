/**
 * Applies notifications schema (notification_preferences, notifications).
 * Run: npm run db:migrate:notifications
 */
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
const { buildConfig, assertConfig } = require("./db-config");

const sql = fs.readFileSync(
  path.join(__dirname, "..", "database", "migrations", "add_notifications.sql"),
  "utf8"
);

async function main() {
  const config = buildConfig();
  assertConfig(config);
  const client = new Client(config);

  try {
    await client.connect();
    console.log("Connected. Applying notifications migration...");
    await client.query(sql);
    console.log("Notifications migration applied successfully.");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
