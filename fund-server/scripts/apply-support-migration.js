/**
 * Applies support schema (support_tickets, help_articles).
 * Run: npm run db:migrate:support
 */
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
const { buildConfig, assertConfig } = require("./db-config");

const sql = fs.readFileSync(
  path.join(__dirname, "..", "database", "migrations", "add_support.sql"),
  "utf8"
);

async function main() {
  const config = buildConfig();
  assertConfig(config);
  const client = new Client(config);

  try {
    await client.connect();
    console.log("Connected. Applying support migration...");
    await client.query(sql);
    console.log("Support migration applied successfully.");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
