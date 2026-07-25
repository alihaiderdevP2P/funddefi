/**
 * Applies campaign_updates and saved_campaigns tables.
 * Usage: node scripts/apply-engagement-migration.js
 */
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

async function main() {
  const sqlPath = path.join(
    __dirname,
    "..",
    "database",
    "migrations",
    "add_campaign_engagement.sql"
  );
  const sql = fs.readFileSync(sqlPath, "utf8");

  const client = new Client(
    process.env.DATABASE_URL
      ? {
          connectionString: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false },
        }
      : {
          host: process.env.DB_HOST || "localhost",
          port: Number.parseInt(process.env.DB_PORT || "5432", 10),
          user: process.env.DB_USERNAME || process.env.DB_USER || "postgres",
          password: process.env.DB_PASSWORD || "password",
          database: process.env.DB_NAME || "crowdfunding",
        }
  );

  await client.connect();
  try {
    await client.query(sql);
    console.log("Engagement migration applied successfully.");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
