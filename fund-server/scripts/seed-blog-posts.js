/**
 * Seeds sample blog posts for FundFlow.
 * Run: npm run db:seed:blog
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

const SAMPLE_POSTS = [
  {
    slug: "future-of-crowdfunding-blockchain",
    title: "The Future of Crowdfunding: How Blockchain is Revolutionizing Fundraising",
    excerpt:
      "Explore how blockchain technology is transforming the crowdfunding landscape, offering transparency, security, and global accessibility like never before.",
    content: `# Introduction to Blockchain in Crowdfunding

Blockchain technology is revolutionizing crowdfunding by providing unprecedented transparency, security, and global accessibility.

## How Blockchain Solves Traditional Problems

### 1. Transparency
Every transaction is recorded on the blockchain, creating an immutable record that anyone can verify.

### 2. Lower Fees
By eliminating intermediaries, blockchain-based platforms can significantly reduce fees.

### 3. Smart Contracts
Automated smart contracts ensure that funds are released only when predetermined milestones are met.`,
    category: "Technology",
    tags: ["blockchain", "crowdfunding", "web3", "innovation"],
    image_url: "/quantum-computing-concept.png",
    featured: true,
    views: 1250,
    likes: 89,
  },
  {
    slug: "10-tips-successful-crowdfunding-campaign",
    title: "10 Essential Tips for Creating a Successful Crowdfunding Campaign",
    excerpt:
      "Learn the proven strategies and best practices that successful campaign creators use to reach their funding goals.",
    content: `# 10 Essential Tips

Creating a successful crowdfunding campaign requires careful planning, compelling storytelling, and strategic promotion.

- Set a realistic funding goal
- Tell a compelling story with video
- Offer attractive reward tiers
- Engage your community early
- Leverage social media consistently`,
    category: "Guide",
    tags: ["campaign", "tips", "success", "marketing"],
    image_url: "/solar-charging-station.jpg",
    featured: true,
    views: 2100,
    likes: 156,
  },
  {
    slug: "case-study-techstart-2m-30-days",
    title: "Case Study: How TechStart Raised $2M in 30 Days",
    excerpt:
      "TechStart's campaign serves as a perfect example of how proper planning and execution can lead to extraordinary results.",
    content: `# Case Study: TechStart

TechStart's campaign serves as a perfect example of how proper planning and execution can lead to extraordinary results in blockchain crowdfunding.

## Key Success Factors

- Strong pre-launch community building
- Transparent milestone-based fund release
- Active campaign updates throughout the 30-day period`,
    category: "Case Study",
    tags: ["case-study", "success", "tech", "fundraising"],
    image_url: "/modern-tech-office.png",
    featured: true,
    views: 3200,
    likes: 234,
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

    const adminResult = await client.query(
      `SELECT id, name FROM users WHERE role IN ('admin', 'superadmin') LIMIT 1`
    );

    if (adminResult.rows.length === 0) {
      console.error("No admin user found. Create a superadmin first.");
      process.exit(1);
    }

    const authorId = adminResult.rows[0].id;
    console.log(`Using author: ${adminResult.rows[0].name} (${authorId})`);

    for (const post of SAMPLE_POSTS) {
      const existing = await client.query(
        `SELECT id FROM blog_posts WHERE slug = $1`,
        [post.slug]
      );

      if (existing.rows.length > 0) {
        console.log(`  Skipping (exists): ${post.slug}`);
        continue;
      }

      const readTime = Math.max(1, Math.ceil(post.content.split(/\s+/).length / 200));

      await client.query(
        `INSERT INTO blog_posts (
          slug, title, excerpt, content, author_id, category, tags,
          image_url, status, featured, views, likes, read_time_minutes, published_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'published', $9, $10, $11, $12, NOW())`,
        [
          post.slug,
          post.title,
          post.excerpt,
          post.content,
          authorId,
          post.category,
          post.tags,
          post.image_url,
          post.featured,
          post.views,
          post.likes,
          readTime,
        ]
      );
      console.log(`  Seeded: ${post.slug}`);
    }

    console.log("Blog seed complete.");
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
