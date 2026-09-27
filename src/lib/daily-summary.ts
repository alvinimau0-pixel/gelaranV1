import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { report as seedReport } from "@/lib/report-data";
import type { ProgressionData } from "@/lib/progression";
import { normalizeProgressionRows } from "@/lib/mep";
import { computeLiveProgress } from "@/lib/mep";

const summaryInput = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

type WorkerRow = {
  name: string;
  worker_type: string;
  status: string;
  check_in: string | null;
  check_out: string | null;
};

type SummaryRow = {
  id: number;
  summary_date: string;
  generated_at: string;
  present_count: number;
  absent_count: number;
  mc_count: number;
  off_count: number;
  direct_count: number;
  subcontractor_count: number;
  tower_a_progress: number;
  tower_b_progress: number;
  overall_progress: number;
  payload: unknown;
};

export type DailySummary = {
  id: number;
  date: string;
  generatedAt: string;
  attendance: {
    present: number;
    absent: number;
    mc: number;
    off: number;
  };
  manpower: {
    direct: number;
    subcontractor: number;
  };
  towers: {
    A: number;
    B: number;
    overall: number;
  };
  workers: Array<{
    name: string;
    workerType: "Direct" | "Subcontractor";
    status: "Present" | "Absent" | "MC" | "Off" | "Blank";
    time: string | null;
  }>;
};

function toSummary(row: SummaryRow): DailySummary {
  const payload = (row.payload ?? []) as DailySummary["workers"];
  return {
    id: row.id,
    date: row.summary_date,
    generatedAt: row.generated_at,
    attendance: {
      present: row.present_count,
      absent: row.absent_count,
      mc: row.mc_count,
      off: row.off_count,
    },
    manpower: {
      direct: row.direct_count,
      subcontractor: row.subcontractor_count,
    },
    towers: {
      A: row.tower_a_progress,
      B: row.tower_b_progress,
      overall: row.overall_progress,
    },
    workers: payload,
  };
}

function progressionFromSeed(): ProgressionData {
  const A = normalizeProgressionRows(seedReport.progression.A);
  return { A, B: structuredClone(A) } as ProgressionData;
}

export async function buildDailySummary(date?: string) {
  const sql = await getSql();
  const summaryDateValue =
    date ??
    new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kuala_Lumpur" });

  await sql`
    create table if not exists daily_summary (
      id serial primary key,
      summary_date date not null unique,
      present_count integer not null default 0,
      absent_count integer not null default 0,
      mc_count integer not null default 0,
      off_count integer not null default 0,
      direct_count integer not null default 0,
      subcontractor_count integer not null default 0,
      tower_a_progress double precision not null default 0,
      tower_b_progress double precision not null default 0,
      overall_progress double precision not null default 0,
      payload jsonb not null default '[]'::jsonb,
      generated_at timestamptz not null default now()
    )
  `;

  const workers = await sql<WorkerRow>`
    select w.name, w.worker_type, coalesce(a.status, 'Blank') as status,
      a.check_in, a.check_out
    from workers w
    left join attendance a on a.worker_id = w.id and a.date = ${summaryDateValue}::date
    order by w.name
  `;

  let present = 0, absent = 0, mc = 0, off = 0, direct = 0, sub = 0;
  const payload = workers.map((w) => {
    const status = (w.status || "Blank") as DailySummary["workers"][number]["status"];
    if (status === "Present") present += 1;
    else if (status === "Absent") absent += 1;
    else if (status === "MC") mc += 1;
    else if (status === "Off") off += 1;
    if (w.worker_type === "Direct") direct += 1;
    else sub += 1;
    return {
      name: w.name,
      workerType: (w.worker_type === "Direct" ? "Direct" : "Subcontractor") as "Direct" | "Subcontractor",
      status,
      time: w.check_in ?? null,
    };
  });

  let progression: ProgressionData = progressionFromSeed();
  try {
    const [row] = await sql<{ data: ProgressionData }>`select data from mep_progression where id = 1`;
    if (row?.data) progression = row.data;
  } catch {
    /* use seed */
  }

  const live = computeLiveProgress(progression, seedReport.items);
  const towerA = live.towersLegacy.A ?? 0;
  const towerB = live.towersLegacy.B ?? 0;
  const overall = live.packagesLegacy.overall ?? 0;

  await sql`
    insert into daily_summary (
      summary_date, present_count, absent_count, mc_count, off_count,
      direct_count, subcontractor_count, tower_a_progress, tower_b_progress,
      overall_progress, payload, generated_at
    ) values (
      ${summaryDateValue}::date, ${present}, ${absent}, ${mc}, ${off},
      ${direct}, ${sub}, ${towerA}, ${towerB}, ${overall}, ${JSON.stringify(payload)}::jsonb, now()
    )
    on conflict (summary_date) do update set
      present_count = excluded.present_count,
      absent_count = excluded.absent_count,
      mc_count = excluded.mc_count,
      off_count = excluded.off_count,
      direct_count = excluded.direct_count,
      subcontractor_count = excluded.subcontractor_count,
      tower_a_progress = excluded.tower_a_progress,
      tower_b_progress = excluded.tower_b_progress,
      overall_progress = excluded.overall_progress,
      payload = excluded.payload,
      generated_at = now()
  `;

  const [row] = await sql<SummaryRow>`
    select id, summary_date, generated_at, present_count, absent_count, mc_count, off_count,
      direct_count, subcontractor_count, tower_a_progress, tower_b_progress, overall_progress, payload
    from daily_summary where summary_date = ${summaryDateValue}::date
  `;

  return toSummary(row);
}

export const generateDailySummary = createServerFn({ method: "POST" })
  .validator(summaryInput)
  .handler(async ({ data }) => buildDailySummary(data.date));

export const listDailySummaries = createServerFn({ method: "GET" })
  .validator(z.object({ limit: z.number().int().min(1).max(31).optional() }).optional())
  .handler(async ({ data }): Promise<DailySummary[]> => {
    const sql = await getSql();
    const rows = await sql<SummaryRow>`
      select id, summary_date, generated_at, present_count, absent_count, mc_count, off_count,
        direct_count, subcontractor_count, tower_a_progress, tower_b_progress, overall_progress, payload
      from daily_summary order by summary_date desc limit ${data?.limit ?? 7}
    `;
    return rows.map(toSummary);
  });

export const getLatestDailySummary = createServerFn({ method: "GET" }).handler(
  async (): Promise<DailySummary | null> => {
    const rows = await listDailySummaries({ data: { limit: 1 } });
    const latest = rows[0];
    if (!latest) return null;
    try {
      const [progressionRow] = await (await getSql())<{
        data: ProgressionData;
      }>`select data from mep_progression where id = 1`;
      const live = computeLiveProgress(
        progressionRow?.data ?? progressionFromSeed(),
        seedReport.items,
      );
      return {
        ...latest,
        towers: {
          A: live.towersLegacy.A ?? latest.towers.A,
          B: live.towersLegacy.B ?? latest.towers.B,
          overall: live.packagesLegacy.overall ?? latest.towers.overall,
        },
      };
    } catch {
      return latest;
    }
  },
);
