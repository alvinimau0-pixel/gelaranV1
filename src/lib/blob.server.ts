// Cloud object storage for uploaded images (worker profile photos + site
// progress photos). SERVER-ONLY — never import this from client code or a
// route component.
//
// Provider priority (free-first):
//   1. Vercel Blob  — when BLOB_READ_WRITE_TOKEN is set and store is public
//   2. Data-URL fallback — keeps uploads working with zero external deps
//
// Future free upgrade path (no code change required at call sites):
//   Cloudflare R2 (10 GB free/month) can be enabled later by setting:
//     R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL
//   The abstraction below is already structured for that addition.

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // raw input cap, pre-compression
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export type UploadedImage = { url: string; pathname: string; provider: "vercel-blob" | "data-url" };

function assertServer() {
  if (typeof window !== "undefined") {
    throw new Error("@/lib/blob.server is server-only");
  }
}

function hasVercelBlob(): boolean {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  const access = process.env.BLOB_STORE_ACCESS?.trim().toLowerCase();
  // Prefer explicit public access; if the flag is missing we still try Blob
  // and fall back on failure (keeps older projects working).
  return Boolean(token) && (access === "public" || access === undefined || access === "");
}

function buildKey(folder: string, contentType: string): string {
  const ext =
    contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
  return `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
}

async function uploadToVercelBlob(
  key: string,
  buffer: Buffer,
  contentType: string,
): Promise<UploadedImage> {
  const { put } = await import("@vercel/blob");
  const result = await put(key, buffer, {
    access: "public",
    contentType,
    addRandomSuffix: false,
  });
  return { url: result.url, pathname: result.pathname, provider: "vercel-blob" };
}

function uploadAsDataUrl(
  folder: string,
  contentType: string,
  base64Data: string,
): UploadedImage {
  return {
    url: `data:${contentType};base64,${base64Data}`,
    pathname: `${folder}/inline-${Date.now()}`,
    provider: "data-url",
  };
}

/**
 * Decode a client-sent base64 image payload and upload it.
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

  // ── Primary: Vercel Blob (free tier already linked on most projects) ──
  if (hasVercelBlob()) {
    try {
      const key = buildKey(folder, contentType);
      const uploaded = await uploadToVercelBlob(key, buffer, contentType);
      return uploaded;
    } catch (err) {
      console.error("[storage] Vercel Blob upload failed; falling back to data-URL:", err);
      // Fall through to data-URL so the feature never breaks completely.
    }
  }

  // ── Fallback: inline data-URL (zero external cost, works offline) ──
  // Bounded by the same 8 MB cap. Once a proper Blob/R2 token is available,
  // new uploads automatically use cloud storage without code or data migration.
  return uploadAsDataUrl(folder, contentType, base64Data);
}

/** Best-effort delete — never throws (missing token, already-gone key, etc). */
export async function deleteImage(url: string | null | undefined): Promise<void> {
  assertServer();
  if (!url || url.startsWith("data:")) return;

  // Vercel Blob URLs
  if (url.includes("blob.vercel-storage.com") || url.includes("public.blob.vercel-storage.com")) {
    try {
      const { del } = await import("@vercel/blob");
      await del(url);
      return;
    } catch (err) {
      console.error("[storage] Vercel Blob delete failed:", err);
    }
  }

  // Future: R2 / other providers can be added here by URL pattern.
}

/**
 * Returns which storage provider is currently active.
 * Useful for diagnostics / admin UI later.
 */
export function getActiveStorageProvider(): "vercel-blob" | "data-url" {
  return hasVercelBlob() ? "vercel-blob" : "data-url";
}
