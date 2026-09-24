#!/usr/bin/env node
/**
 * Apply GM-only sanitary progress from Tower Work Program (11 SEP 26)
 * into mep_progression. Requires DATABASE_URL.
 *
 *   DATABASE_URL=postgres://... node scripts/apply-gm-matrix.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const seed = JSON.parse(readFileSync(join(root, "src/lib/seed-prog.json"), "utf8"));
const url = process.env.DATABASE_URL?.trim();
if (!url) {
  console.error("Set DATABASE_URL to the Neon pooled connection string.");
  process.exit(1);
}

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();
try {
  await client.query(`
    create table if not exists mep_progression (
      id integer primary key default 1 check (id = 1),
      data jsonb not null,
      updated_at timestamptz not null default now()
    )
  `);
  await client.query(
    `insert into mep_progression (id, data, updated_at)
     values (1, $1::jsonb, now())
     on conflict (id) do update
       set data = excluded.data, updated_at = now()`,
    [JSON.stringify(seed.progression)],
  );
  console.log("Applied GM matrix progression to mep_progression (id=1).");
} finally {
  await client.end();
}
