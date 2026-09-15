import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Calendar, Trash2, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { Badge, Card } from "@/components/ui";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { listSitePhotos, createSitePhoto, deleteSitePhoto, type SitePhoto } from "@/lib/photos";
import { compressImageToBase64 } from "@/lib/image-compress";

export const Route = createFileRoute("/photos")({ component: PhotosPage });

function PhotosPage() {
  const editMode = useAppStore((s) => s.editMode);
  const fileRef = useRef<HTMLInputElement>(null);

  const [photos, setPhotos] = useState<SitePhoto[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [tower, setTower] = useState<SitePhoto["tower"]>("Both");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [featuredIdx, setFeaturedIdx] = useState(0);

  useEffect(() => {
    let cancelled = false;
    listSitePhotos()
      .then((rows) => {
        if (!cancelled) setPhotos(rows);
      })
      .catch((err) => console.error("[photos] load failed:", err))
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-rotate featured photo every 6s when multiple exist
  useEffect(() => {
    if (photos.length < 2) return;
    const t = setInterval(() => setFeaturedIdx((i) => (i + 1) % photos.length), 6000);
    return () => clearInterval(t);
  }, [photos.length]);

  useEffect(() => {
    setFeaturedIdx(0);
  }, [photos.length]);

  const byDate = useMemo(() => {
    const map = new Map<string, SitePhoto[]>();
    for (const p of photos) {
      const list = map.get(p.photoDate) ?? [];
      list.push(p);
      map.set(p.photoDate, list);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [photos]);

  const featured = photos[featuredIdx] ?? null;

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setUploadError(null);
    if (!f || !f.type.startsWith("image/")) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(f);
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const { base64Data, contentType } = await compressImageToBase64(file);
      const created = await createSitePhoto({
        data: {
          title: title.trim() || `Site photo · ${date}`,
          note: note.trim(),
          date,
          tower,
          contentType,
          base64Data,
        },
      });
      setPhotos((p) =>
        [created, ...p].sort(
          (a, b) => b.photoDate.localeCompare(a.photoDate) || b.uploadedAt.localeCompare(a.uploadedAt),
        ),
      );
      setTitle("");
      setNote("");
      setFile(null);
      setPreview(null);
      setDate(new Date().toISOString().slice(0, 10));
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      console.error("[photos] upload failed:", err);
      setUploadError(err instanceof Error ? err.message : "Upload failed. Check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: number) {
    const prev = photos;
    setPhotos((p) => p.filter((x) => x.id !== id));
    try {
      await deleteSitePhoto({ data: { id } });
    } catch (err) {
      console.error("[photos] delete failed:", err);
      setPhotos(prev); // never pretend a failed delete succeeded
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Photos at home</h1>
          <p className="mt-1 text-sm text-muted">
            Site progress photos · sorted by date · auto-featured on every new upload
          </p>
        </div>
        <Badge tone="accent">
          {photos.length} photo{photos.length === 1 ? "" : "s"}
        </Badge>
      </div>

      {featured ? (
        <Card className="overflow-hidden p-0">
          <div className="relative aspect-[16/9] bg-ink sm:aspect-[21/9]">
            <img src={featured.photoUrl} alt={featured.title} className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 sm:p-6">
              <p className="text-xs font-medium uppercase tracking-wide text-white/70">
                {featured.photoDate}
                {featured.tower ? ` · Tower ${featured.tower}` : ""}
              </p>
              <h2 className="mt-1 font-display text-xl font-semibold text-white sm:text-2xl">{featured.title}</h2>
              {featured.note ? <p className="mt-1 max-w-xl text-sm text-white/80">{featured.note}</p> : null}
            </div>
            {photos.length > 1 ? (
              <div className="absolute bottom-3 right-3 flex gap-1.5">
                {photos.slice(0, 8).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Show photo ${i + 1}`}
                    onClick={() => setFeaturedIdx(i)}
                    className={cn(
                      "size-2 rounded-full transition-colors",
                      i === featuredIdx ? "bg-white" : "bg-white/40 hover:bg-white/70",
                    )}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </Card>
      ) : (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <ImageIcon className="size-10 text-subtle" />
          <p className="font-display text-lg font-semibold">{loaded ? "No photos yet" : "Loading photos…"}</p>
          <p className="max-w-sm text-sm text-muted">
            Upload the first site photo. New uploads automatically appear first and rotate in the featured
            strip by date.
          </p>
        </Card>
      )}

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Upload className="size-4 text-accent" />
          <h2 className="font-display text-lg font-semibold">Upload photo</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3">
            <label className="block text-xs font-medium uppercase tracking-wide text-muted">
              Image
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={onFile}
                className="mt-1.5 block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-ink file:px-3 file:py-2 file:text-sm file:font-medium file:text-accent-fg"
              />
            </label>
            <label className="block text-xs font-medium uppercase tracking-wide text-muted">
              Title
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Transfer pump install L13"
                className="mt-1.5 w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </label>
            <label className="block text-xs font-medium uppercase tracking-wide text-muted">
              Note (optional)
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Short description"
                className="mt-1.5 w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-medium uppercase tracking-wide text-muted">
                Date
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </label>
              <label className="block text-xs font-medium uppercase tracking-wide text-muted">
                Tower
                <select
                  value={tower ?? "Both"}
                  onChange={(e) => setTower(e.target.value as SitePhoto["tower"])}
                  className="mt-1.5 w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
                >
                  <option value="A">Tower A</option>
                  <option value="B">Tower B</option>
                  <option value="Both">Both</option>
                  <option value="Other">Other</option>
                </select>
              </label>
            </div>
            {uploadError ? <p className="text-xs text-bad">{uploadError}</p> : null}
            <button
              type="button"
              disabled={!preview || uploading}
              onClick={handleUpload}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-medium text-accent-fg disabled:opacity-40"
            >
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
              {uploading ? "Uploading…" : "Save photo"}
            </button>
          </div>
          <div className="flex min-h-48 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-surface-2">
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-64 w-full object-contain" />
            ) : (
              <p className="text-sm text-muted">Preview appears here</p>
            )}
          </div>
        </div>
      </Card>

      {byDate.map(([d, list]) => (
        <div key={d} className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-muted" />
            <h3 className="font-display text-base font-semibold">{d}</h3>
            <Badge tone="mute">{list.length}</Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <Card key={p.id} className="overflow-hidden p-0">
                <button
                  type="button"
                  className="block w-full text-left"
                  onClick={() => {
                    const idx = photos.findIndex((x) => x.id === p.id);
                    if (idx >= 0) setFeaturedIdx(idx);
                  }}
                >
                  <div className="aspect-[4/3] bg-surface-2">
                    <img src={p.photoUrl} alt={p.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-3">
                    <p className="font-medium leading-snug">{p.title}</p>
                    <p className="mt-1 text-xs text-muted">
                      {p.tower ? `Tower ${p.tower}` : "Site"}
                      {p.note ? ` · ${p.note}` : ""}
                    </p>
                  </div>
                </button>
                {editMode ? (
                  <div className="flex border-t border-border">
                    <button
                      type="button"
                      className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-bad hover:bg-bad-bg"
                      onClick={() => handleDelete(p.id)}
                    >
                      <Trash2 className="size-3.5" />
                      Remove
                    </button>
                  </div>
                ) : null}
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
