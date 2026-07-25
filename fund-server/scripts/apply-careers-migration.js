/**
 * Applies careers schema (job_postings, job_applications, career_inquiries).
 * Run: npm run db:migrate:careers
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
  "add_careers.sql"
);
const sql = fs.readFileSync(sqlPath, "utf8");

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
    console.log("Connected. Applying careers migration...");
    await client.query(sql);
    console.log("Careers migration applied successfully.");
    console.log("  - job_posting_status enum");
    console.log("  - job_application_status enum");
    console.log("  - career_inquiry_status enum");
    console.log("  - job_postings table");
    console.log("  - job_applications table");
    console.log("  - career_inquiries table");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
