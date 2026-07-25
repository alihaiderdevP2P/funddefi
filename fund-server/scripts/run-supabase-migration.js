/**
 * Run database/supabase-init.sql against Supabase Postgres.
 * Uses direct host (db.*.supabase.co) when pooler fails with ENOIDENTIFIER.
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

const projectRef = "wmisztjcuknanjxtwejz";

function buildConfig() {
  if (process.env.DATABASE_URL) {
    return { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } };
  }
  const useDirect =
    process.env.DB_USE_DIRECT === "true" ||
    (process.env.DB_HOST || "").includes("pooler");
  const host = useDirect
    ? `db.${projectRef}.supabase.co`
    : process.env.DB_HOST || "localhost";
  return {
    host,
    port: Number.parseInt(process.env.DB_PORT || "5432", 10),
    user: process.env.DB_USERNAME || process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "postgres",
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  };
}

async function main() {
  const sqlPath = path.join(__dirname, "..", "database", "supabase-init.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");
  const config = buildConfig();
  const client = new Client(config);

  console.log("Connecting to", config.connectionString ? "DATABASE_URL" : config.host);
  await client.connect();
  console.log("Running supabase-init.sql...");
  await client.query(sql);
  await client.end();
  console.log("Migration completed successfully.");
}

main().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
