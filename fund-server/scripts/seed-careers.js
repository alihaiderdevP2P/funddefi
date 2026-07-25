/**
 * Seeds sample job postings for FundFlow Careers.
 * Run: npm run db:seed:careers
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

const SAMPLE_JOBS = [
  {
    slug: "senior-blockchain-developer",
    title: "Senior Blockchain Developer",
    department: "Engineering",
    location: "Remote",
    job_type: "Full-time",
    description:
      "Lead the development of our blockchain infrastructure and smart contracts.",
    requirements: [
      "5+ years blockchain experience",
      "Solidity expertise",
      "DeFi knowledge",
    ],
    status: "published",
  },
  {
    slug: "frontend-developer",
    title: "Frontend Developer",
    department: "Engineering",
    location: "San Francisco, CA",
    job_type: "Full-time",
    description:
      "Build beautiful, responsive user interfaces for our crowdfunding platform.",
    requirements: [
      "React/Next.js expertise",
      "TypeScript",
      "UI/UX design sense",
    ],
    status: "published",
  },
  {
    slug: "product-manager",
    title: "Product Manager",
    department: "Product",
    location: "New York, NY",
    job_type: "Full-time",
    description:
      "Drive product strategy and roadmap for our crowdfunding platform.",
    requirements: [
      "3+ years PM experience",
      "Fintech background",
      "User research skills",
    ],
    status: "published",
  },
  {
    slug: "community-manager",
    title: "Community Manager",
    department: "Marketing",
    location: "Remote",
    job_type: "Part-time",
    description: "Build and engage our community of creators and backers.",
    requirements: [
      "Social media expertise",
      "Community building",
      "Crypto knowledge",
    ],
    status: "published",
  },
];

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
    console.log("Connected. Seeding job postings...");

    for (const job of SAMPLE_JOBS) {
      const existing = await client.query(
        "SELECT id FROM job_postings WHERE slug = $1",
        [job.slug]
      );
      if (existing.rows.length > 0) {
        console.log(`  Skipping ${job.slug} (already exists)`);
        continue;
      }

      await client.query(
        `INSERT INTO job_postings
          (slug, title, department, location, job_type, description, requirements, status, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
        [
          job.slug,
          job.title,
          job.department,
          job.location,
          job.job_type,
          job.description,
          job.requirements,
          job.status,
        ]
      );
      console.log(`  Created ${job.title}`);
    }

    console.log("Careers seed completed.");
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
