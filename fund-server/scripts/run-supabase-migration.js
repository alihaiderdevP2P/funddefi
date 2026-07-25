/**
 * Run database/supabase-init.sql against Supabase Postgres.
 * Uses direct host (db.*.supabase.co) when pooler fails with ENOIDENTIFIER.
 */
const dns = require("dns");
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

// Prefer IPv4 — Node often fails ENOTFOUND on Supabase hosts otherwise
try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  /* Node < 16.0 */
}

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

function resolveProjectRef() {
  const fromUrl = (process.env.SUPABASE_URL || "").match(
    /https?:\/\/([a-z0-9]+)\.supabase\.co/i
  );
  if (fromUrl) return fromUrl[1];

  const user = process.env.DB_USERNAME || process.env.DB_USER || "";
  const fromUser = user.match(/^postgres\.([a-z0-9]+)$/i);
  if (fromUser) return fromUser[1];

  const host = process.env.DB_HOST || "";
  const fromHost = host.match(
    /(?:db|aws-0-[a-z0-9-]+)\.([a-z0-9]+)\.supabase\.co/i
  );
  if (fromHost) return fromHost[1];

  return null;
}

function buildConfig() {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    };
  }

  const hostEnv = process.env.DB_HOST || "localhost";
  const isSupabase =
    hostEnv.includes("supabase") || Boolean(process.env.SUPABASE_URL);
  const projectRef = resolveProjectRef();
  // Prefer pooler from .env; only switch to direct when DB_USE_DIRECT=true
  const useDirect = process.env.DB_USE_DIRECT === "true";

  let host = hostEnv;
  let user = process.env.DB_USERNAME || process.env.DB_USER || "postgres";
  let port = Number.parseInt(process.env.DB_PORT || "5432", 10);

  if (useDirect && projectRef) {
    host = `db.${projectRef}.supabase.co`;
    port = 5432;
    // Direct connection uses postgres, not postgres.<ref>
    if (user.startsWith("postgres.")) user = "postgres";
  }

  return {
    host,
    port,
    user,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "postgres",
    ssl:
      process.env.DB_SSL === "true" || isSupabase
        ? { rejectUnauthorized: false }
        : false,
  };
}

async function main() {
  const sqlPath = path.join(__dirname, "..", "database", "supabase-init.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");
  const config = buildConfig();
  const client = new Client(config);

  console.log(
    "Connecting to",
    config.connectionString ? "DATABASE_URL" : `${config.host} as ${config.user}`
  );
  await client.connect();
  console.log("Running supabase-init.sql...");
  await client.query(sql);
  await client.end();
  console.log("Migration completed successfully.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
