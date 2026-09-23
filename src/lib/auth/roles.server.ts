import { getSql } from "@/lib/db";
import { authConfigured, getSessionUser, UnauthorizedError } from "./verify.server";

export type AppRole = "supervisor" | "viewer";

export class ForbiddenRoleError extends Error {
  readonly status = 403;
  constructor() {
    super("Supervisor access required");
    this.name = "ForbiddenRoleError";
  }
}

function configuredSupervisorEmails() {
  return new Set(
    (process.env.SUPERVISOR_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

async function ensureRoleColumn() {
  const sql = await getSql();
  try {
    await sql`alter table "user" add column if not exists "role" text not null default 'viewer'`;
  } catch (error) {
    // Auth may be disabled locally and the Better Auth table may not exist yet.
    if (authConfigured) throw error;
  }
  return sql;
}

export async function getCurrentRole(): Promise<{ authenticated: boolean; role: AppRole }> {
  if (!authConfigured && !process.env.DATABASE_URL) return { authenticated: true, role: "supervisor" };
  const user = await getSessionUser();
  if (!user) return { authenticated: false, role: "viewer" };
  const sql = await ensureRoleColumn();
  const [row] = await sql<{ role: string | null }>`select "role" from "user" where "id" = ${user.id}`;
  const emailSupervisor = user.email ? configuredSupervisorEmails().has(user.email.toLowerCase()) : false;
  return { authenticated: true, role: row?.role === "supervisor" || emailSupervisor ? "supervisor" : "viewer" };
}

export const getAccessRole = async () => getCurrentRole();

export async function requireSupervisor(): Promise<{ id: string; email: string | null }> {
  if (!authConfigured && !process.env.DATABASE_URL) return { id: "dev-user", email: null };
  const user = await getSessionUser();
  if (!user) throw new UnauthorizedError();
  const sql = await ensureRoleColumn();
  const [row] = await sql<{ role: string | null }>`select "role" from "user" where "id" = ${user.id}`;
  const emailSupervisor = user.email ? configuredSupervisorEmails().has(user.email.toLowerCase()) : false;
  if (row?.role !== "supervisor" && !emailSupervisor) throw new ForbiddenRoleError();
  return user;
}
