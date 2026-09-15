// Cloud object storage for uploaded images (worker profile photos + site
// progress photos). SERVER-ONLY — never import this from client code or a
// route component. Uses Vercel Blob so images live outside Postgres; only the
// resulting URL is ever stored in the database.
//
// Requires a Blob store linked to the Vercel project (Storage tab -> Create
// Database -> Blob -> Connect to Project). Vercel then injects
// BLOB_READ_WRITE_TOKEN automatically; nothing to hardcode.

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // raw input cap, pre-compression
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export type UploadedImage = { url: string; pathname: string };

function assertServer() {
  if (typeof window !== "undefined") {
    throw new Error("@/lib/blob.server is server-only");
  }
}

/**
 * Decode a client-sent base64 image payload and upload it to Vercel Blob.
 * `folder` namespaces the storage key ("workers" | "site-photos") — the
 * caller never controls the key directly, so there is no path/key injection
 * surface from user input.
 */
export async function uploadBase64Image(
  folder: "workers" | "site-photos",
  contentType: string,
  base64Data: string,
): Promise<UploadedImage> {
  assertServer();
  if (!ALLOWED_TYPES.has(contentType)) {
    throw new Error("Unsupported image type. Use JPEG, PNG, or WebP.");
  }
  const buffer = Buffer.from(base64Data, "base64");
  if (buffer.byteLength === 0) throw new Error("Empty image upload.");
  if (buffer.byteLength > MAX_UPLOAD_BYTES) {
    throw new Error("Image too large (max 8MB).");
  }
  // Keep uploads functional when a personal Vercel project has not yet had a
  // Blob store connected. The client already sends a resized JPEG, so this
  // fallback is bounded by the same 8MB cap and is stored in the existing
  // text URL column. Once BLOB_READ_WRITE_TOKEN is available, new uploads use
  // Blob automatically without any code or data migration.
  if (!process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
    return {
      url: `data:${contentType};base64,${base64Data}`,
      pathname: `${folder}/inline-${Date.now()}`,
    };
  }
  const { put } = await import("@vercel/blob");
  const ext = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const result = await put(key, buffer, {
    access: "public",
    contentType,
    addRandomSuffix: false,
  });
  return { url: result.url, pathname: result.pathname };
}

/** Best-effort delete — never throws (missing token, already-gone key, etc). */
export async function deleteImage(url: string | null | undefined): Promise<void> {
  assertServer();
  if (!url || url.startsWith("data:")) return;
  try {
    const { del } = await import("@vercel/blob");
    await del(url);
  } catch (err) {
    console.error("[blob] delete failed:", err);
  }
}
