// Manpower + attendance: workers and their daily attendance now live in
// Postgres (@/lib/db), shared across every device — not localStorage.
//
// Dates are always computed in Malaysia time (Asia/Kuala_Lumpur), never UTC,
// so an attendance mark can't land under the wrong calendar day. Sunday is a
// normal working day on this site (8:00 AM-5:00 PM) and is never auto-marked
// Off — unlike the old localStorage version, nothing here pre-fills a status;
// a blank cell just means no record has been saved yet.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { report as seedReport } from "@/lib/report-data";

export const KL_TZ = "Asia/Kuala_Lumpur";

export type AttendanceStatus = "Present" | "Absent" | "Off" | "Leave";

export type Worker = {
  id: number;
  employeeCode: string | null;
  name: string;
  trade: string | null;
  team: string | null;
  subcontractor: string | null;
  phone: string | null;
  photoUrl: string | null;
  active: boolean;
};

export type AttendanceRow = {
  workerId: number;
  attendanceDate: string; // YYYY-MM-DD
  status: AttendanceStatus;
};

/** Today's date parts in Malaysia time — the single source of truth for "today". */
export function todayInKualaLumpur(): { year: number; month: number; day: number; iso: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: KL_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  const iso = `${get("year")}-${get("month")}-${get("day")}`;
  return { year: Number(get("year")), month: Number(get("month")), day: Number(get("day")), iso };
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Sunday = 0 ... Saturday = 6 for a plain (year, month, day) — no TZ drift. */
export function weekdayOf(year: number, month: number, day: number): number {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

function fallbackWorkers(): Worker[] {
  const teamByName = new Map<string, string>();
  for (const t of seedReport.teams) {
    teamByName.set(t.leader, t.team);
    for (const assistant of t.assistants) teamByName.set(assistant, t.team);
  }
  return seedReport.people.map((person, index) => ({
    id: -(index + 1),
    employeeCode: null,
    name: person.name,
    trade: "GENERAL WORKER",
    team: teamByName.get(person.name) ?? null,
    subcontractor: null,
    phone: null,
    photoUrl: null,
    active: true,
  }));
}

/** One-time bootstrap: seed `workers` from the existing report data the first
 *  time the table is empty, so the crew already in report-data.ts shows up
 *  immediately instead of starting from a blank directory. */
async function seedWorkersIfEmpty(): Promise<void> {
  const sql = await getSql();
  const [{ count }] = await sql<{ count: number }>`select count(*)::int as count from workers`;
  if (count > 0) return;
  const teamByName = new Map<string, string>();
  for (const t of seedReport.teams) {
    teamByName.set(t.leader, t.team);
    for (const a of t.assistants) if (!teamByName.has(a)) teamByName.set(a, t.team);
  }
  const seen = new Set<string>();
  for (const p of seedReport.people) {
    const name = p.name.trim();
    if (!name || seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    await sql`insert into workers (name, team) values (${name}, ${teamByName.get(name) ?? null})
      on conflict (lower(name)) do nothing`;
  }
}

export const listWorkers = createServerFn({ method: "GET" }).handler(async (): Promise<Worker[]> => {
  try {
    await seedWorkersIfEmpty();
    const sql = await getSql();
    const rows = await sql<{
      id: number;
      employee_code: string | null;
      name: string;
      trade: string | null;
      team: string | null;
      subcontractor: string | null;
      phone: string | null;
      photo_url: string | null;
      active: boolean;
    }>`select id, employee_code, name, trade, team, subcontractor, phone, photo_url, active
       from workers where active = true order by name asc`;
    return rows.map((r) => ({
      id: r.id,
      employeeCode: r.employee_code,
      name: r.name,
      trade: r.trade,
      team: r.team,
      subcontractor: r.subcontractor,
      phone: r.phone,
      photoUrl: r.photo_url,
      active: r.active,
    }));
  } catch (error) {
    console.error("[attendance] worker store unavailable; using report crew fallback", error);
    return fallbackWorkers();
  }
});

export const listAttendanceForMonth = createServerFn({ method: "GET" })
  .validator(z.object({ year: z.number().int(), month: z.number().int().min(1).max(12) }))
  .handler(async ({ data }): Promise<AttendanceRow[]> => {
    try {
      const sql = await getSql();
      const rows = await sql<{ worker_id: number; attendance_date: string; status: AttendanceStatus }>`
        select worker_id, attendance_date, status from attendance
        where date_trunc('month', attendance_date) = date_trunc('month', make_date(${data.year}, ${data.month}, 1))
      `;
      return rows.map((r) => ({ workerId: r.worker_id, attendanceDate: r.attendance_date, status: r.status }));
    } catch (error) {
      console.error("[attendance] attendance store unavailable; showing blank register", error);
      return [];
    }
  });

export const setAttendance = createServerFn({ method: "POST" })
  .validator(
    z.object({
      workerId: z.number().int(),
      date: dateSchema,
      status: z.enum(["Present", "Absent", "Off", "Leave"]).nullable(),
    }),
  )
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const sql = await getSql();
    if (data.status === null) {
      await sql`delete from attendance where worker_id = ${data.workerId} and attendance_date = ${data.date}`;
      return { ok: true };
    }
    await sql`
      insert into attendance (worker_id, attendance_date, status)
      values (${data.workerId}, ${data.date}, ${data.status})
      on conflict (worker_id, attendance_date)
      do update set status = excluded.status, updated_at = now()
    `;
    return { ok: true };
  });

export const setAttendanceByName = createServerFn({ method: "POST" })
  .validator(
    z.object({
      workerName: z.string().trim().min(2).max(100),
      date: dateSchema,
      status: z.enum(["Present", "Absent", "Off", "Leave"]),
    }),
  )
  .handler(async ({ data }): Promise<{ ok: true; workerId: number; workerName: string }> => {
    await seedWorkersIfEmpty();
    const sql = await getSql();
    const [worker] = await sql<{ id: number; name: string }>`
      select id, name from workers
      where active = true and lower(name) = lower(${data.workerName})
      limit 1
    `;
    if (!worker) throw new Error(`Worker not found: ${data.workerName}`);
    await sql`
      insert into attendance (worker_id, attendance_date, status)
      values (${worker.id}, ${data.date}, ${data.status})
      on conflict (worker_id, attendance_date)
      do update set status = excluded.status, updated_at = now()
    `;
    return { ok: true, workerId: worker.id, workerName: worker.name };
  });

export const setAttendanceForTeam = createServerFn({ method: "POST" })
  .validator(
    z.object({
      team: z.string().trim().min(2).max(40),
      date: dateSchema,
      status: z.enum(["Present", "Absent", "Off", "Leave"]),
    }),
  )
  .handler(async ({ data }): Promise<{ ok: true; count: number; team: string }> => {
    await seedWorkersIfEmpty();
    const sql = await getSql();
    const workers = await sql<{ id: number }>`
      select id from workers where active = true and lower(team) = lower(${data.team})
    `;
    if (!workers.length) throw new Error(`No active workers found in ${data.team}`);
    for (const worker of workers) {
      await sql`
        insert into attendance (worker_id, attendance_date, status)
        values (${worker.id}, ${data.date}, ${data.status})
        on conflict (worker_id, attendance_date)
        do update set status = excluded.status, updated_at = now()
      `;
    }
    return { ok: true, count: workers.length, team: data.team };
  });

export const getAttendanceSummary = createServerFn({ method: "GET" })
  .validator(z.object({ date: dateSchema }))
  .handler(async ({ data }): Promise<{ date: string; present: string[]; absent: string[]; leave: string[]; off: string[]; blank: string[] }> => {
    await seedWorkersIfEmpty();
    const sql = await getSql();
    const rows = await sql<{ name: string; status: AttendanceStatus | null }>`
      select w.name, a.status
      from workers w
      left join attendance a on a.worker_id = w.id and a.attendance_date = ${data.date}
      where w.active = true order by w.name asc
    `;
    const summary = { date: data.date, present: [], absent: [], leave: [], off: [], blank: [] } as {
      date: string; present: string[]; absent: string[]; leave: string[]; off: string[]; blank: string[];
    };
    for (const row of rows) {
      const bucket = row.status === "Present" ? "present" : row.status === "Absent" ? "absent" : row.status === "Leave" ? "leave" : row.status === "Off" ? "off" : "blank";
      summary[bucket].push(row.name);
    }
    return summary;
  });

export const saveWorkerPhoto = createServerFn({ method: "POST" })
  .validator(
    z.object({
      workerId: z.number().int(),
      contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
      base64Data: z.string().min(1),
    }),
  )
  .handler(async ({ data }): Promise<{ photoUrl: string }> => {
    const sql = await getSql();
    const [existing] = await sql<{ photo_url: string | null }>`select photo_url from workers where id = ${data.workerId}`;
    if (!existing) throw new Error("Worker not found.");
    const { uploadBase64Image, deleteImage } = await import("@/lib/blob.server");
    const uploaded = await uploadBase64Image("workers", data.contentType, data.base64Data);
    await sql`update workers set photo_url = ${uploaded.url}, updated_at = now() where id = ${data.workerId}`;
    if (existing.photo_url) await deleteImage(existing.photo_url);
    return { photoUrl: uploaded.url };
  });
