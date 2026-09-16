import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Calendar, Image as ImageIcon } from "lucide-react";
import { Badge, Card } from "@/components/ui";
import { cn } from "@/lib/utils";
import { listSitePhotos, type SitePhoto } from "@/lib/photos";

export const Route = createFileRoute("/photos")({ component: PhotosPage });

function PhotosPage() {
  const [photos, setPhotos] = useState<SitePhoto[]>([]);
  const [loaded, setLoaded] = useState(false);
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
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
