/**
 * Promote a user to superadmin by email.
 * Usage: node scripts/promote-superadmin.js alihaider@gmail.com
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

async function main() {
  const email = process.argv[2] || "alihaider@gmail.com";
  const host = process.env.DB_HOST || "localhost";
  const isSupabase =
    host.includes("supabase") || Boolean(process.env.SUPABASE_URL);

  const client = new Client(
    process.env.DATABASE_URL
      ? {
          connectionString: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false },
        }
      : {
          host,
          port: Number.parseInt(process.env.DB_PORT || "5432", 10),
          user: process.env.DB_USERNAME || process.env.DB_USER || "postgres",
          password: process.env.DB_PASSWORD || "password",
          database: process.env.DB_NAME || "postgres",
          ssl:
            process.env.DB_SSL === "true" || isSupabase
              ? { rejectUnauthorized: false }
              : false,
        }
  );

  await client.connect();
  const result = await client.query(
    `UPDATE users SET role = 'superadmin' WHERE email = $1 RETURNING email, role`,
    [email]
  );
  if (result.rowCount === 0) {
    console.error(`No user found with email: ${email}`);
    process.exitCode = 1;
  } else {
    console.log("Updated:", result.rows[0]);
  }
  await client.end();
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
