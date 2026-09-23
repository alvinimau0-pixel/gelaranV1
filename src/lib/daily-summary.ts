import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { report as seedReport } from "@/lib/report-data";
import { todayInKualaLumpur } from "@/lib/attendance";
import type { ProgressionData } from "@/lib/progression";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");
const summaryInput = z.object({ date: dateSchema.optional() });

export type DailySummary = {
  id: number | null;
  summaryDate: string;
  generatedAt: string | null;
  attendance: {
    present: number;
    absent: number;
    mc: number;
    off: number;
    blank: number;
    direct: number;
    subcontractor: number;
  };
  towers: { A: number; B: number; overall: number };
  workers: { name: string; workerType: "Direct" | "Subcontractor"; status: string; time: string | null }[];
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
  payload: DailySummary["workers"];
};

function summaryDate(date?: string) {
  return date ?? todayInKualaLumpur().iso;
}

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function progressionFromSeed(): ProgressionData {
  return structuredClone(seedReport.progression) as ProgressionData;
}

function toSummary(row: SummaryRow): DailySummary {
  return {
    id: row.id,
    summaryDate: row.summary_date,
    generatedAt: row.generated_at,
    attendance: {
      present: row.present_count,
      absent: row.absent_count,
      mc: row.mc_count,
      off: row.off_count,
      blank: Math.max(0, row.payload.filter((worker) => worker.status === "Blank").length),
      direct: row.direct_count,
      subcontractor: row.subcontractor_count,
    },
    towers: {
      A: Number(row.tower_a_progress),
      B: Number(row.tower_b_progress),
      overall: Number(row.overall_progress),
    },
    workers: row.payload,
  };
}

export async function buildDailySummary(date?: string): Promise<DailySummary> {
  const summaryDateValue = summaryDate(date);
  const sql = await getSql();
  await sql`
    update attendance
    set check_in = coalesce(check_in, '08:00'), check_out = coalesce(check_out, '19:00'), updated_at = now()
    where attendance_date = ${summaryDateValue} and status = 'Present'
  `;
  await sql`
    insert into attendance (worker_id, attendance_date, status, check_in, check_out)
    select id, ${summaryDateValue}, 'Present', '08:00', '19:00'
    from workers where active = true
    on conflict (worker_id, attendance_date) do nothing
  `;

  const workers = await sql<{
    name: string;
    worker_type: "Direct" | "Subcontractor" | null;
    status: "Present" | "Absent" | "Off" | "Leave" | null;
    check_in: string | null;
    check_out: string | null;
  }>`
    select w.name, w.worker_type, a.status, a.check_in, a.check_out
    from workers w
    left join attendance a on a.worker_id = w.id and a.attendance_date = ${summaryDateValue}
    where w.active = true order by w.name asc
  `;

  const [progressionRow] = await sql<{ data: ProgressionData }>`select data from mep_progression where id = 1`;
  const progression = progressionRow?.data ?? progressionFromSeed();
  const towerProgress = (tower: "A" | "B") => average(
    (progression[tower] ?? []).flatMap((floor) => Object.values(floor.items ?? {})).filter(
      (value): value is number => typeof value === "number" && Number.isFinite(value),
    ),
  );
  const a = towerProgress("A");
  const b = towerProgress("B");
  const payload = workers.map((worker) => ({
    name: worker.name,
    workerType: worker.worker_type === "Subcontractor" ? "Subcontractor" as const : "Direct" as const,
    status: worker.status === "Present" ? "Present" : worker.status === "Absent" ? "Absent" : worker.status === "Leave" ? "MC" : worker.status === "Off" ? "Off" : "Blank",
    time: worker.status === "Present" && worker.check_in && worker.check_out ? `${worker.check_in.slice(0, 5)}-${worker.check_out.slice(0, 5)}` : null,
  }));
  const count = (status: string) => payload.filter((worker) => worker.status === status).length;
  const direct = payload.filter((worker) => worker.workerType === "Direct").length;
  const subcontractor = payload.length - direct;
  const [row] = await sql<SummaryRow>`
    insert into daily_summary (
      summary_date, present_count, absent_count, mc_count, off_count,
      direct_count, subcontractor_count, tower_a_progress, tower_b_progress,
      overall_progress, payload, generated_at
    ) values (
      ${summaryDateValue}, ${count("Present")}, ${count("Absent")}, ${count("MC")}, ${count("Off")},
      ${direct}, ${subcontractor}, ${a}, ${b}, ${(a + b) / 2}, ${JSON.stringify(payload)}::jsonb, now()
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
    returning id, summary_date, generated_at, present_count, absent_count, mc_count, off_count,
      direct_count, subcontractor_count, tower_a_progress, tower_b_progress, overall_progress, payload
  `;
  const { recordAuditEvent } = await import("@/lib/audit.server");
  await recordAuditEvent(sql, {
    action: "daily_summary.generated",
    entityType: "daily_summary",
    entityId: summaryDateValue,
    summary: `Generated daily manpower and Tower A/B summary for ${summaryDateValue}`,
  });
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

export const getLatestDailySummary = createServerFn({ method: "GET" }).handler(async (): Promise<DailySummary | null> => {
  const rows = await listDailySummaries({ data: { limit: 1 } });
  return rows[0] ?? null;
});
