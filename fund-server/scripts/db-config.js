/**
 * Shared DB connection config for migration scripts.
 * Supports DATABASE_URL or DB_HOST/DB_* from .env.
 */
const fs = require("fs");
const path = require("path");

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) return;
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

function buildConfig() {
  loadEnv();

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

function assertConfig(config) {
  if (
    !config.connectionString &&
    !process.env.DB_HOST &&
    !process.env.DB_PASSWORD
  ) {
    console.error("Set DATABASE_URL or DB_HOST/DB_* in .env");
    process.exit(1);
  }
}

module.exports = { loadEnv, buildConfig, assertConfig };
