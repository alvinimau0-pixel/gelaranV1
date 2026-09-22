import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";

export type AuditRow = {
  id: number;
  action: string;
  entityType: string;
  entityId: string | null;
  summary: string;
  details: string;
  actorLabel: string;
  createdAt: string;
};

export const listAuditEvents = createServerFn({ method: "GET" })
  .validator(z.object({ limit: z.number().int().min(1).max(200).default(50) }).optional())
  .handler(async ({ data }): Promise<AuditRow[]> => {
    const sql = await getSql();
    const limit = data?.limit ?? 50;
    const rows = await sql<{
      id: number;
      action: string;
      entity_type: string;
      entity_id: string | null;
      summary: string;
      details_json: string;
      actor_label: string;
      created_at: string;
    }>`
      select id, action, entity_type, entity_id, summary, details::text as details_json, actor_label, created_at
      from audit_log order by created_at desc limit ${limit}
    `;
    return rows.map((row) => ({
      id: row.id,
      action: row.action,
      entityType: row.entity_type,
      entityId: row.entity_id,
      summary: row.summary,
      details: row.details_json ?? "{}",
      actorLabel: row.actor_label,
      createdAt: row.created_at,
    }));
  });

export const exportOperationalData = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const [workers, attendance, photos, progression, audit] = await Promise.all([
    sql`select id, employee_code, name, trade, team, subcontractor, phone, photo_url, active, created_at, updated_at from workers order by name asc`,
    sql`select worker_id, attendance_date, status, check_in, check_out, remarks, created_at, updated_at from attendance order by attendance_date desc, worker_id asc`,
    sql`select id, title, note, photo_url, photo_date, tower, created_at, updated_at from site_photos order by photo_date desc, created_at desc`,
    sql`select id, data, updated_at from mep_progression order by id`,
    sql`select id, action, entity_type, entity_id, summary, details, actor_label, request_id, user_agent, created_at from audit_log order by created_at desc limit 1000`,
  ]);
  return {
    exportedAt: new Date().toISOString(),
    json: JSON.stringify({ exportedAt: new Date().toISOString(), workers, attendance, photos, progression, audit }),
  };
});
