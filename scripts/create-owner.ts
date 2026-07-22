import fs from "node:fs";
import path from "node:path";

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const contents = fs.readFileSync(envPath, "utf-8");
  for (const line of contents.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvLocal();

import bcrypt from "bcryptjs";
import { connectToDatabase } from "../lib/db/connect";
import { AdminUserModel } from "../models/AdminUser";

// Bootstraps the very first admin account, with the "owner" role (full
// access, including managing other admin accounts). There's no self-service
// signup for the admin panel by design — this script is the one-time way in.
//
//   npx tsx scripts/create-owner.ts "Jane Doe" jane@example.com "a-strong-password"

async function run() {
  const [name, email, password] = process.argv.slice(2);
  if (!name || !email || !password) {
    console.error('Usage: npx tsx scripts/create-owner.ts "Full Name" email@example.com "password"');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  await connectToDatabase();

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await AdminUserModel.findOne({ email: normalizedEmail });
  if (existing) {
    console.error(`An admin account with email ${normalizedEmail} already exists (role: ${existing.role}).`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const owner = await AdminUserModel.create({
    name,
    email: normalizedEmail,
    passwordHash,
    role: "owner",
    isActive: true,
  });

  console.log(`Created owner account for ${owner.email} (id ${owner._id}). Sign in at /admin/login.`);
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal:", error);
    process.exit(1);
  });
