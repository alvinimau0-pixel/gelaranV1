// Site progress photos — persisted server-side: image bytes in Vercel Blob,
// metadata (title/note/date/tower) in Postgres. Replaces the old
// localStorage/base64-in-zustand approach so photos survive a refresh, a
// closed browser, and show up the same on any other phone or computer.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { recordAuditEvent } from "@/lib/audit.server";

export type SitePhoto = {
  id: number;
  title: string;
  note: string;
  photoUrl: string;
  photoDate: string; // YYYY-MM-DD
  tower: "A" | "B" | "Both" | "Other" | null;
  uploadedAt: string; // ISO
};

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");
const towerSchema = z.enum(["A", "B", "Both", "Other"]).nullable().optional();

function toSitePhoto(row: {
  id: number;
  title: string;
  note: string | null;
  photo_url: string;
  photo_date: string;
  tower: string | null;
  created_at: string;
}): SitePhoto {
  return {
    id: row.id,
    title: row.title,
    note: row.note ?? "",
    photoUrl: row.photo_url,
    photoDate: row.photo_date,
    tower: (row.tower as SitePhoto["tower"]) ?? null,
    uploadedAt: row.created_at,
  };
}

export const listSitePhotos = createServerFn({ method: "GET" }).handler(async (): Promise<SitePhoto[]> => {
  const sql = await getSql();
  const rows = await sql<{
    id: number;
    title: string;
    note: string | null;
    photo_url: string;
    photo_date: string;
    tower: string | null;
    created_at: string;
  }>`select id, title, note, photo_url, photo_date, tower, created_at
     from site_photos order by photo_date desc, created_at desc`;
  return rows.map(toSitePhoto);
});

export const createSitePhoto = createServerFn({ method: "POST" })
  .validator(
    z.object({
      title: z.string().min(1).max(200),
      note: z.string().max(500).default(""),
      date: dateSchema,
      tower: towerSchema,
      contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
      base64Data: z.string().min(1),
    }),
  )
  .handler(async ({ data }): Promise<SitePhoto> => {
    const { uploadBase64Image } = await import("@/lib/blob.server");
    const uploaded = await uploadBase64Image("site-photos", data.contentType, data.base64Data);
    const sql = await getSql();
    const [row] = await sql<{
      id: number;
      title: string;
      note: string | null;
      photo_url: string;
      photo_date: string;
      tower: string | null;
      created_at: string;
    }>`insert into site_photos (title, note, photo_url, photo_date, tower)
       values (${data.title}, ${data.note}, ${uploaded.url}, ${data.date}, ${data.tower ?? null})
       returning id, title, note, photo_url, photo_date, tower, created_at`;
    await recordAuditEvent(sql, {
      action: "site_photo.created",
      entityType: "site_photo",
      entityId: row.id,
      summary: `Uploaded site photo ${row.title}`,
      details: { title: data.title, date: data.date, tower: data.tower ?? null },
    });
    return toSitePhoto(row);
  });

export const updateSitePhoto = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.number().int(),
      title: z.string().min(1).max(200).optional(),
      note: z.string().max(500).optional(),
      date: dateSchema.optional(),
      tower: towerSchema,
    }),
  )
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const sql = await getSql();
    await sql`
      update site_photos set
        title = coalesce(${data.title ?? null}, title),
        note = coalesce(${data.note ?? null}, note),
        photo_date = coalesce(${data.date ?? null}, photo_date),
        tower = coalesce(${data.tower ?? null}, tower),
        updated_at = now()
      where id = ${data.id}
    `;
    await recordAuditEvent(sql, {
      action: "site_photo.updated",
      entityType: "site_photo",
      entityId: data.id,
      summary: `Updated site photo ${data.id}`,
      details: data,
    });
    return { ok: true };
  });

export const deleteSitePhoto = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.number().int() }))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const sql = await getSql();
    const [row] = await sql<{ photo_url: string }>`select photo_url from site_photos where id = ${data.id}`;
    await sql`delete from site_photos where id = ${data.id}`;
    if (row) {
      const { deleteImage } = await import("@/lib/blob.server");
      await deleteImage(row.photo_url);
    }
    await recordAuditEvent(sql, {
      action: "site_photo.deleted",
      entityType: "site_photo",
      entityId: data.id,
      summary: `Deleted site photo ${data.id}`,
    });
    return { ok: true };
  });
