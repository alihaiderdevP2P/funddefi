/**
 * Creates the public Supabase storage bucket (campaign-images) + policies.
 * Run: npm run db:migrate:storage
 */
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
const { buildConfig, assertConfig } = require("./db-config");

const sql = fs.readFileSync(
  path.join(__dirname, "..", "database", "migrations", "add_storage_bucket.sql"),
  "utf8"
);

async function main() {
  const config = buildConfig();
  assertConfig(config);
  const client = new Client(config);

  try {
    await client.connect();
    console.log("Connected. Applying storage bucket migration...");
    await client.query(sql);
    console.log("Storage bucket migration applied successfully.");
    console.log('  - bucket "campaign-images" (public)');
    console.log("  - storage.objects policies (read/upload)");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
