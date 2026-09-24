// Client-only: resize + compress a photo before it goes over the wire. Keeps
// uploads fast on site Wi-Fi/data and keeps the base64-over-JSON payload to a
// server function well under any request-size limit.
//
// Defaults tuned for free-tier storage (Vercel Blob):
//   maxDimension 1280  — still sharp on phone screens
//   quality 0.72       — good visual quality, smaller files

export async function compressImageToBase64(
  file: File,
  maxDimension = 1280,
  quality = 0.72,
): Promise<{ base64Data: string; contentType: "image/jpeg" }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(bitmap, 0, 0, width, height);
  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Compression failed"))),
      "image/jpeg",
      quality,
    ),
  );
  const buffer = await blob.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return { base64Data: btoa(binary), contentType: "image/jpeg" };
}
