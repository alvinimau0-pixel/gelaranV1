import { getRequest } from "@tanstack/react-start/server";
import { type Sql } from "@/lib/db";

export type AuditEvent = {
  action: string;
  entityType: string;
  entityId?: string | number | null;
  summary: string;
  details?: Record<string, unknown>;
};

function requestMetadata(): { requestId: string | null; userAgent: string | null } {
  try {
    const request = getRequest();
    return {
      requestId: request?.headers.get("x-request-id") ?? request?.headers.get("x-vercel-id") ?? null,
      userAgent: request?.headers.get("user-agent") ?? null,
    };
  } catch {
    return { requestId: null, userAgent: null };
  }
}

/** Record a mutation without making the mutation fail when audit storage is unavailable. */
export async function recordAuditEvent(sql: Sql, event: AuditEvent): Promise<void> {
  const metadata = requestMetadata();
  try {
    await sql`
      insert into audit_log (action, entity_type, entity_id, summary, details, actor_label, request_id, user_agent)
      values (
        ${event.action},
        ${event.entityType},
        ${event.entityId == null ? null : String(event.entityId)},
        ${event.summary},
        ${JSON.stringify(event.details ?? {})}::jsonb,
        'shared workspace',
        ${metadata.requestId},
        ${metadata.userAgent}
      )
    `;
  } catch (error) {
    console.warn("[audit] unable to record event", error);
  }
}
