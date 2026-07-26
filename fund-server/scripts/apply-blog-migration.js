/**
 * Applies blog_posts schema.
 * Run: npm run db:migrate:blog
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

const sqlPath = path.join(
  __dirname,
  "..",
  "database",
  "migrations",
  "add_blog_posts.sql"
);
const sql = fs.readFileSync(sqlPath, "utf8");

function buildConfig() {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    };
  }

  const host = process.env.DB_HOST || "localhost";
  const isSupabase =
    host.includes("supabase") || Boolean(process.env.SUPABASE_URL);

  return {
    host,
    port: Number.parseInt(process.env.DB_PORT || "5432", 10),
    user: process.env.DB_USERNAME || process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "crowdfunding",
    ssl:
      process.env.DB_SSL === "true" || isSupabase
        ? { rejectUnauthorized: false }
        : false,
  };
}

async function main() {
  const config = buildConfig();
  if (!config.connectionString && !process.env.DB_HOST && !process.env.DB_PASSWORD) {
    console.error("Set DATABASE_URL or DB_HOST/DB_* in .env");
    process.exit(1);
  }

  const client = new Client(config);

  try {
    await client.connect();
    console.log("Connected. Applying blog migration...");
    await client.query(sql);
    console.log("Blog migration applied successfully.");
    console.log("  - blog_post_status enum");
    console.log("  - blog_posts table");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
