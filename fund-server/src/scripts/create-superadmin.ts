/**
 * Script to create initial superadmin accounts
 * Run this once to create 2-3 superadmin accounts
 *
 * Usage:
 *   ts-node src/scripts/create-superadmin.ts
 *
 * Or compile and run:
 *   npm run build
 *   node dist/scripts/create-superadmin.js
 */

import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { UsersService } from "../users/users.service";
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createSuperAdmin() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  console.log("\n=== Superadmin Account Creation ===\n");
  console.log("This script will help you create 2-3 superadmin accounts.");
  console.log("These accounts will have full control over the platform.\n");

  const superadmins = [];
  const count = await question(
    "How many superadmins do you want to create? (2-3): "
  );
  const adminCount = parseInt(count, 10);

  if (adminCount < 2 || adminCount > 3) {
    console.error("❌ Please enter 2 or 3.");
    process.exit(1);
  }

  for (let i = 1; i <= adminCount; i++) {
    console.log(`\n--- Creating Superadmin ${i}/${adminCount} ---`);

    const email = await question(`Email: `);
    const name = await question(`Full Name: `);
    const password = await question(`Password: `);

    // Check if user already exists
    const existing = await usersService.findByEmail(email);
    if (existing) {
      console.error(`❌ User with email ${email} already exists. Skipping...`);
      continue;
    }

    try {
      const user = await usersService.createAdmin(
        {
          email,
          name,
          password,
          walletAddress: undefined,
          avatar: undefined,
          bio: undefined,
        },
        "superadmin"
      );

      console.log(`✅ Superadmin ${i} created successfully!`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      superadmins.push(user);
    } catch (error: any) {
      console.error(`❌ Error creating superadmin ${i}:`, error.message);
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Created ${superadmins.length} superadmin account(s):`);
  superadmins.forEach((admin, index) => {
    console.log(`  ${index + 1}. ${admin.name} (${admin.email})`);
  });

  console.log(`\n✅ Done! Remember to keep these credentials secure.`);
  await app.close();
  rl.close();
}

createSuperAdmin().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
