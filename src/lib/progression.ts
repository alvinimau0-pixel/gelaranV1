// MEP matrix progression — shared Postgres JSON snapshot so every device sees
// the same floor x item %. Seeded from report-data on first read.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql, type Sql } from "@/lib/db";
import { report as seedReport } from "@/lib/report-data";
import { recordAuditEvent } from "@/lib/audit.server";
import { normalizeProgressionRows } from "@/lib/mep";

export type ProgressionRow = {
  level: string;
  items: Record<string, number | null>;
};

export type ProgressionData = {
  A: ProgressionRow[];
  B: ProgressionRow[];
};

const progressionSchema = z.object({
  A: z.array(
    z.object({
      level: z.string(),
      items: z.record(z.string(), z.union([z.number(), z.null()])),
    }),
  ),
  B: z.array(
    z.object({
      level: z.string(),
      items: z.record(z.string(), z.union([z.number(), z.null()])),
    }),
  ),
});

const LEGACY_PROGRESSION_KEYS = new Set([
  "L31 AND 31M ROOF PIPING",
  "L31 & 31M ROOF PIPING",
  "PP PIPE",
  "FLOOR GRATING",
  "BACKSHAFT FLUSH WATER TOILETS",
  "BACKSHAFT SANITARY TOILET",
  "BACKSHAFT CW & FW TOILETS",
  "CONCEALED PIPE",
  "TOILET PIPE DISTRIBUTION AND HACKING",
  "TOILET PIPE DISTRIBUTION & HACKING",
]);

function seedProgression(): ProgressionData {
  const A = normalizeProgressionRows(seedReport.progression.A);
  return { A, B: structuredClone(A) } as ProgressionData;
}

function normalizeSnapshot(input: ProgressionData): ProgressionData {
  const A = normalizeProgressionRows(input.A ?? []);
  const hadLegacy = [ ...(input.A ?? []), ...(input.B ?? []) ].some((row) =>
    Object.keys(row.items ?? {}).some((item) => LEGACY_PROGRESSION_KEYS.has(item)),
  );
  return { A, B: hadLegacy ? structuredClone(A) : normalizeProgressionRows(input.B ?? []) };
}

function progressionChanged(before: ProgressionData, after: ProgressionData) {
  return JSON.stringify(before) !== JSON.stringify(after);
}

/** Create table if migration has not run yet (safe on every call). */
async function ensureTable(sql: Sql): Promise<void> {
  await sql`
    create table if not exists mep_progression (
      id integer primary key default 1 check (id = 1),
      data jsonb not null,
      updated_at timestamptz not null default now()
    )
  `;
}

/** Load shared progression; seed DB from report-data if empty. */
export const getProgression = createServerFn({ method: "GET" }).handler(
  async (): Promise<ProgressionData> => {
    try {
      const sql = await getSql();
      await ensureTable(sql);
      const [row] = await sql<{ data: ProgressionData }>`
        select data from mep_progression where id = 1
      `;
      if (row?.data) {
        const parsed = progressionSchema.safeParse(row.data);
        if (parsed.success) {
          const normalized = normalizeSnapshot(parsed.data);
          if (progressionChanged(parsed.data, normalized)) {
            await sql`
              update mep_progression
              set data = ${JSON.stringify(normalized)}::jsonb, updated_at = now()
              where id = 1 and data = ${JSON.stringify(parsed.data)}::jsonb
            `;
          }
          return normalized;
        }
      }
      const seed = seedProgression();
      await sql`
        insert into mep_progression (id, data)
        values (1, ${JSON.stringify(seed)}::jsonb)
        on conflict (id) do nothing
      `;
      return seed;
    } catch (error) {
      console.error("[progression] load failed; using seed", error);
      return seedProgression();
    }
  },
);

/** Replace the full progression snapshot (used after AI bulk updates). */
export const saveProgression = createServerFn({ method: "POST" })
  .validator(z.object({ data: progressionSchema }))
  .handler(async ({ data }): Promise<{ ok: true; updatedAt: string }> => {
    const { requireSupervisor } = await import("@/lib/auth/roles.server");
    await requireSupervisor();
    const sql = await getSql();
    await ensureTable(sql);
    const normalized = normalizeSnapshot(data.data);
    const [row] = await sql<{ updated_at: string }>`
      insert into mep_progression (id, data, updated_at)
      values (1, ${JSON.stringify(normalized)}::jsonb, now())
      on conflict (id) do update
        set data = excluded.data, updated_at = now()
      returning updated_at
    `;
    await recordAuditEvent(sql, {
      action: "progression.replaced",
      entityType: "mep_progression",
      entityId: "1",
      summary: "Replaced the MEP progression snapshot",
    });
    return { ok: true, updatedAt: row.updated_at };
  });

/** Patch a level range for one item on one tower. */
export const setItemRange = createServerFn({ method: "POST" })
  .validator(
    z.object({
      tower: z.enum(["A", "B"]),
      item: z.string().min(1),
      levelFrom: z.number().int().min(1).max(50),
      levelTo: z.number().int().min(1).max(50),
      value: z.number().min(0).max(1),
    }),
  )
  .handler(
    async ({
      data,
    }): Promise<{ ok: true; updated: number; progression: ProgressionData }> => {
      const { requireSupervisor } = await import("@/lib/auth/roles.server");
      await requireSupervisor();
      const sql = await getSql();
      await ensureTable(sql);

      let current: ProgressionData;
      const [existing] = await sql<{ data: ProgressionData }>`
        select data from mep_progression where id = 1
      `;
      if (existing?.data) {
        const parsed = progressionSchema.safeParse(existing.data);
        current = parsed.success ? normalizeSnapshot(parsed.data) : seedProgression();
      } else {
        current = seedProgression();
      }

      const rows = current[data.tower];
      let updated = 0;
      for (const row of rows) {
        const lvl = Number(row.level);
        if (!Number.isFinite(lvl)) continue;
        if (lvl >= data.levelFrom && lvl <= data.levelTo) {
          row.items[data.item] = data.value;
          updated++;
        }
      }

      await sql`
        insert into mep_progression (id, data, updated_at)
        values (1, ${JSON.stringify(current)}::jsonb, now())
        on conflict (id) do update
          set data = excluded.data, updated_at = now()
      `;

      await recordAuditEvent(sql, {
        action: "progression.range_updated",
        entityType: "mep_progression",
        entityId: `${data.tower}:${data.item}`,
        summary: `Updated ${data.item} on Tower ${data.tower}, levels ${data.levelFrom}-${data.levelTo}`,
        details: { ...data, updated },
      });

      return { ok: true, updated, progression: current };
    },
  );
