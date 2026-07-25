/**
 * Create the public Supabase Storage bucket for campaign images.
 * Run once: npm run storage:setup
 */
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

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

const url =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.SUPABASE_STORAGE_BUCKET || "campaign-images";

if (!url || !key) {
  console.error("Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === bucket);

  if (exists) {
    console.log(`Bucket "${bucket}" already exists.`);
    return;
  }

  const { error } = await supabase.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: 10485760,
    allowedMimeTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ],
  });

  if (error) {
    console.error("Failed to create bucket:", error.message);
    console.error(
      "Create it manually in Supabase Dashboard → Storage → New bucket:",
      bucket,
      "(public)",
    );
    process.exit(1);
  }

  console.log(`Created public bucket "${bucket}" successfully.`);
  console.log(
    "Campaign images will be stored under campaigns/ and URLs saved in image_url columns.",
  );
}

main();
