#!/usr/bin/env node
/**
 * One-time seed: create supervisor accounts for gelaran-v1
 *
 *   Username  → internal email              Password
 *   Alvin     → Alvin@gelaran.local         Admin
 *   Khairul   → Khairul@gelaran.local       Admin
 *
 * Usage:
 *   DATABASE_URL="postgres://..." node scripts/seed-supervisors.mjs
 *
 * Safe to re-run (upserts user + credential account, sets role=supervisor).
 */

import pg from "pg";
import { randomBytes, scryptSync } from "node:crypto";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL is required");
  console.error('   Example: DATABASE_URL="postgres://..." node scripts/seed-supervisors.mjs');
  process.exit(1);
}

const SUPERVISORS = [
  { name: "Alvin", email: "Alvin@gelaran.local", password: "Admin" },
  { name: "Khairul", email: "Khairul@gelaran.local", password: "Admin" },
];

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;

/**
 * Better Auth default password hasher (scrypt)
 * Format: salt:key  (both hex)
 * Params: N=16384, r=16, p=1, dkLen=64
 */
function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(password.normalize("NFKC"), salt, 64, {
    N: 16384,
    r: 16,
    p: 1,
    maxmem: 128 * 16384 * 16 * 2,
  });
  return `${salt}:${key.toString("hex")}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectWithRetry(pool) {
  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const client = await pool.connect();
      if (attempt > 1) console.log(`✓ Connected on attempt ${attempt}`);
      return client;
    } catch (err) {
      lastError = err;
      console.error(`⚠ Connection attempt ${attempt}/${MAX_RETRIES} failed: ${err.message}`);

      if (attempt === MAX_RETRIES) break;

      const delay = BASE_DELAY_MS * 2 ** (attempt - 1);
      console.log(`  retrying in ${delay / 1000}s...`);
      await sleep(delay);
    }
  }

  console.error("\n❌ Failed to connect after retries");
  console.error(`   ${lastError?.message}`);
  if (lastError?.code) console.error(`   code: ${lastError.code}`);
  console.error("\nCheck that:");
  console.error("  • DATABASE_URL is correct");
  console.error("  • Neon database is running");
  console.error("  • Your IP is allowed (if using IP allow-list)");
  process.exit(1);
}

async function main() {
  const pool = new pg.Pool({
    connectionString: DATABASE_URL,
    max: 1,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 5_000,
  });

  let client;

  try {
    client = await connectWithRetry(pool);

    // ── Ensure Better Auth tables + role column exist ────────────────
    await client.query(`
      -- Core user table (idempotent)
      CREATE TABLE IF NOT EXISTS "user" (
        "id" text PRIMARY KEY,
        "name" text NOT NULL,
        "email" text NOT NULL UNIQUE,
        "emailVerified" boolean NOT NULL,
        "image" text,
        "createdAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Account table (where passwords live)
      CREATE TABLE IF NOT EXISTS "account" (
        "id" text PRIMARY KEY,
        "accountId" text NOT NULL,
        "providerId" text NOT NULL,
        "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "accessToken" text,
        "refreshToken" text,
        "idToken" text,
        "accessTokenExpiresAt" timestamptz,
        "refreshTokenExpiresAt" timestamptz,
        "scope" text,
        "password" text,
        "createdAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamptz NOT NULL
      );

      -- App-level role column
      ALTER TABLE IF EXISTS "user"
        ADD COLUMN IF NOT EXISTS "role" text NOT NULL DEFAULT 'viewer';
      ALTER TABLE IF EXISTS "user"
        DROP CONSTRAINT IF EXISTS user_role_check;
      ALTER TABLE IF EXISTS "user"
        ADD CONSTRAINT user_role_check CHECK ("role" IN ('supervisor', 'viewer'));
    `);

    for (const user of SUPERVISORS) {
      const userId = randomBytes(16).toString("hex");
      const now = new Date().toISOString();
      const hashed = hashPassword(user.password);

      // ── Upsert user ────────────────────────────────────────────────
      const existing = await client.query(
        `SELECT id FROM "user" WHERE lower(email) = lower($1)`,
        [user.email],
      );

      let finalUserId;
      if (existing.rows.length > 0) {
        finalUserId = existing.rows[0].id;
        await client.query(
          `UPDATE "user"
           SET name = $1, role = 'supervisor', "updatedAt" = $2
           WHERE id = $3`,
          [user.name, now, finalUserId],
        );
        console.log(`✓ Updated existing user → ${user.name} (${user.email})`);
      } else {
        await client.query(
          `INSERT INTO "user" (id, name, email, "emailVerified", "createdAt", "updatedAt", role)
           VALUES ($1, $2, $3, true, $4, $4, 'supervisor')`,
          [userId, user.name, user.email, now],
        );
        finalUserId = userId;
        console.log(`✓ Created user → ${user.name} (${user.email})`);
      }

      // ── Upsert credential account ──────────────────────────────────
      // Critical: accountId MUST equal userId for Better Auth credentials
      const accExisting = await client.query(
        `SELECT id FROM "account"
         WHERE "userId" = $1 AND "providerId" = 'credential'`,
        [finalUserId],
      );

      if (accExisting.rows.length > 0) {
        await client.query(
          `UPDATE "account"
           SET password = $1, "updatedAt" = $2, "accountId" = $3
           WHERE id = $4`,
          [hashed, now, finalUserId, accExisting.rows[0].id],
        );
        console.log(`  └─ password updated`);
      } else {
        const accId = randomBytes(16).toString("hex");
        await client.query(
          `INSERT INTO "account"
             (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
           VALUES ($1, $2, 'credential', $2, $3, $4, $4)`,
          [accId, finalUserId, hashed, now],
        );
        console.log(`  └─ credential account created`);
      }
    }

    console.log("\n✅ Done. Both supervisors are ready.");
    console.log("   Login with username: Alvin  or  Khairul");
    console.log("   Password: Admin");
  } catch (err) {
    console.error("\n❌ Seed failed");
    console.error(`   ${err.message}`);
    if (err.code) console.error(`   code: ${err.code}`);
    if (err.detail) console.error(`   detail: ${err.detail}`);
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end().catch(() => {});
  }
}

main();
