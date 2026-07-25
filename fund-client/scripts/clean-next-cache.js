/**
 * Removes .next and ts build info to fix webpack cache OOM / corruption.
 * Run: npm run dev:clean
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const targets = [
  path.join(root, ".next"),
  path.join(root, "tsconfig.tsbuildinfo"),
];

for (const target of targets) {
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
    console.log(`Removed: ${path.relative(root, target)}`);
  }
}

console.log("Cache cleared. Start dev with: npm run dev");
