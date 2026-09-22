import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  ClipboardList,
  HardHat,
  ImagePlus,
  Pause,
  Package,
  Play,
  TrendingUp,
  Users,
} from "lucide-react";
import { Badge, Card } from "@/components/ui";
import { MepMatrix } from "@/components/mep-matrix";
import { pct, cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import {
  listWorkers,
  listAttendanceForMonth,
  todayInKualaLumpur,
  type Worker,
  type AttendanceStatus,
} from "@/lib/attendance";
import { listSitePhotos, createSitePhoto, type SitePhoto } from "@/lib/photos";
import { compressImageToBase64 } from "@/lib/image-compress";

export const Route = createFileRoute("/")({ component: Home });

type Mark = "P" | "A" | "O" | "L" | "";
const STATUS_TO_MARK: Record<AttendanceStatus, Mark> = {
  Present: "P",
  Absent: "A",
  Off: "O",
  Leave: "L",
};

function Home() {
  const report = useAppStore((s) => s.report);
  const s = report.site;
  const today = useMemo(() => todayInKualaLumpur(), []);

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [marks, setMarks] = useState<Record<number, Mark>>({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [w, a] = await Promise.all([
          listWorkers(),
          listAttendanceForMonth({ data: { year: today.year, month: today.month } }),
        ]);
        if (cancelled) return;
        setWorkers(w);
        const next: Record<number, Mark> = {};
        for (const row of a) {
          const day = Number(row.attendanceDate.slice(8, 10));
          if (day === today.day) next[row.workerId] = STATUS_TO_MARK[row.status];
        }
        setMarks(next);
      } catch (err) {
        console.error("[dashboard] workers load failed", err);
      }
    };
    void load();
    const onUpd = () => void load();
    window.addEventListener("gelaran:attendance-updated", onUpd);
    return () => {
      cancelled = true;
      window.removeEventListener("gelaran:attendance-updated", onUpd);
    };
  }, [today.year, today.month, today.day]);

  const present = workers.filter((w) => marks[w.id] === "P").length;
  const absent = workers.filter((w) => marks[w.id] === "A").length;
  const leave = workers.filter((w) => marks[w.id] === "L").length;
  const off = workers.filter((w) => marks[w.id] === "O").length;
  const blank = workers.length - present - absent - leave - off;

  const [photos, setPhotos] = useState<SitePhoto[]>([]);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [photoPaused, setPhotoPaused] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    listSitePhotos()
      .then((rows) => {
        if (!cancelled) setPhotos(rows);
      })
      .catch((err) => console.error("[dashboard] photos load failed", err));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (photos.length < 2 || photoPaused) return;
    const t = setInterval(() => setPhotoIdx((i) => (i + 1) % photos.length), 3000);
    return () => clearInterval(t);
  }, [photoPaused, photos.length]);

  async function onUpload(file: File | null) {
    if (!file || !file.type.startsWith("image/")) return;
    setUploadError(null);
    setUploading(true);
    try {
      const { base64Data, contentType } = await compressImageToBase64(file);
      const created = await createSitePhoto({
        data: {
          title: file.name.replace(/\.[^.]+$/, "") || "Site photo",
          note: "",
          date: today.iso,
          tower: null,
          contentType,
          base64Data,
        },
      });
      setPhotos((prev) => [created, ...prev]);
      setPhotoIdx(0);
    } catch (err) {
      console.error("[dashboard] upload failed", err);
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const featured = photos[photoIdx] ?? null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Site dashboard</h1>
          <p className="mt-0.5 text-xs text-muted sm:text-sm">
            {s.today} · {s.weather} · {s.shift} · {pct(s.overall)} overall
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge tone="accent">{s.men} on site</Badge>
          <Badge tone="ok">{present} present</Badge>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="relative aspect-[16/10] bg-ink sm:aspect-[21/9]">
          {featured ? (
            <>
              <img
                key={featured.id}
                src={featured.photoUrl}
                alt={featured.title}
                width={1600}
                height={1000}
                fetchPriority="high"
                className="h-full w-full object-cover transition-opacity duration-500"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 sm:p-4">
                <p className="text-[10px] font-medium uppercase tracking-wide text-white/70 sm:text-xs">
                  {featured.photoDate}
                  {featured.tower ? ` · Tower ${featured.tower}` : ""}
                </p>
                <p className="mt-0.5 truncate font-display text-sm font-semibold text-white sm:text-base">
                  {featured.title}
                </p>
              </div>
              {photos.length > 1 ? (
                  <div className="absolute bottom-3 right-3 flex items-center gap-1">
                    {photos.slice(0, 8).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Photo ${i + 1}`}
                      onClick={() => setPhotoIdx(i)}
                      className={cn(
                        "size-1.5 rounded-full transition-colors sm:size-2",
                        i === photoIdx ? "bg-white" : "bg-white/40",
                      )}
                      />
                    ))}
                    <button
                      type="button"
                      aria-label={photoPaused ? "Resume photo rotation" : "Pause photo rotation"}
                      aria-pressed={photoPaused}
                      onClick={() => setPhotoPaused((paused) => !paused)}
                      className="ml-1 inline-flex size-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      {photoPaused ? <Play className="size-3.5" aria-hidden="true" /> : <Pause className="size-3.5" aria-hidden="true" />}
                    </button>
                  </div>
              ) : null}
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-white/60">
              <Camera className="size-8" aria-hidden="true" />
              <p className="text-sm">No photos yet</p>
            </div>
          )}
          <div className="absolute right-2 top-2 flex gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur hover:bg-black/70 disabled:opacity-50"
            >
              <ImagePlus className="size-3.5" aria-hidden="true" />
              {uploading ? "Uploading…" : "Upload"}
            </button>
            <Link
              to="/photos"
              className="inline-flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur hover:bg-black/70"
            >
              All
            </Link>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            aria-label="Upload site photo"
            className="hidden"
            onChange={(e) => void onUpload(e.target.files?.[0] ?? null)}
          />
        </div>
        {uploadError ? <p role="alert" className="border-t border-bad/20 bg-bad-bg px-3 py-2 text-sm text-bad">{uploadError}</p> : null}
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold sm:text-lg">
            <Users className="size-4 text-muted" aria-hidden="true" />
            Workers today
          </h2>
          <Link to="/manpower" className="text-xs font-medium text-accent hover:underline">
            Full attendance →
          </Link>
        </div>
        <div className="mb-3 grid grid-cols-4 gap-2">
          <div className="rounded-lg bg-ok-bg px-2 py-2 text-center">
            <p className="font-display text-lg font-semibold text-ok tabular-nums">{present}</p>
            <p className="text-[10px] font-medium uppercase text-ok/80">Present</p>
          </div>
          <div className="rounded-lg bg-bad-bg px-2 py-2 text-center">
            <p className="font-display text-lg font-semibold text-bad tabular-nums">{absent}</p>
            <p className="text-[10px] font-medium uppercase text-bad/80">Absent</p>
          </div>
          <div className="rounded-lg bg-accent/15 px-2 py-2 text-center">
            <p className="font-display text-lg font-semibold text-accent tabular-nums">{leave}</p>
            <p className="text-[10px] font-medium uppercase text-accent/80">Leave</p>
          </div>
          <div className="rounded-lg bg-surface-2 px-2 py-2 text-center">
            <p className="font-display text-lg font-semibold text-muted tabular-nums">{off + blank}</p>
            <p className="text-[10px] font-medium uppercase text-muted">Off / —</p>
          </div>
        </div>
        <div className="max-h-48 space-y-1.5 overflow-y-auto">
          {workers.slice(0, 12).map((w) => {
            const m = marks[w.id] ?? "";
            const tone =
              m === "P"
                ? "bg-ok-bg text-ok"
                : m === "A"
                  ? "bg-bad-bg text-bad"
                  : m === "L"
                    ? "bg-accent/15 text-accent"
                    : "bg-surface-2 text-subtle";
            return (
              <div
                key={w.id}
                className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5"
              >
                <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-2 text-[10px] font-semibold text-muted">
                  {w.photoUrl ? (
                    <img src={w.photoUrl} alt="" width={64} height={64} loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    w.name.slice(0, 2)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium leading-tight">{w.name}</p>
                  <p className="truncate text-[11px] text-muted">{w.team ?? "—"}</p>
                </div>
                <span className={cn("rounded px-1.5 py-0.5 text-xs font-semibold", tone)}>
                  {m || "·"}
                </span>
              </div>
            );
          })}
          {workers.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted">Loading workers…</p>
          ) : null}
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-accent">Daily report · {report.dailyReport.project}</p>
            <h2 className="mt-0.5 font-display text-base font-semibold sm:text-lg">Work plan · {report.dailyReport.date}</h2>
          </div>
          <div className="rounded-lg bg-ink px-3 py-2 text-right text-white">
            <p className="font-display text-lg font-semibold leading-none tabular-nums">{report.dailyReport.totalWorkers}</p>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-white/70">workers</p>
          </div>
        </div>
        <div className="mb-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-surface-2 px-3 py-1.5 font-medium text-fg">Start {report.dailyReport.workHours.start}</span>
          <span className="rounded-full bg-surface-2 px-3 py-1.5 font-medium text-fg">Finish {report.dailyReport.workHours.finish}</span>
        </div>
        <div className="mb-4 grid gap-2 sm:grid-cols-3">
          {report.dailyReport.subcontractors.map((sub) => (
            <div key={sub.name} className="rounded-xl border border-border bg-surface-2/70 px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold tracking-wide text-fg">{sub.name}</p>
                <span className="font-mono text-sm font-bold tabular-nums text-accent">{sub.workers}</span>
              </div>
              <p className="mt-1 text-[11px] leading-tight text-muted">{sub.scope}</p>
            </div>
          ))}
        </div>
        <div className="mb-4 rounded-xl border border-border bg-surface-2/50 p-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-fg">Labor distribution</h3>
              <p className="text-[11px] text-muted">Today’s 27 workers by crew</p>
            </div>
            <span className="font-mono text-sm font-bold tabular-nums text-fg">27 total</span>
          </div>
          <div className="space-y-2.5">
            {report.dailyReport.laborDistribution.map((group) => (
              <div key={group.label}>
                <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                  <span className="min-w-0 truncate font-medium text-fg">{group.label}</span>
                  <span className="shrink-0 font-mono font-bold tabular-nums text-muted">{group.workers} · {Math.round((group.workers / report.dailyReport.totalWorkers) * 100)}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-surface">
                  <div className={cn("h-full rounded-full", group.color)} style={{ width: `${(group.workers / report.dailyReport.totalWorkers) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {report.dailyReport.activities.map((activity, index) => (
            <div key={`${activity.scope}-${index}`} className="flex gap-2.5 rounded-xl border border-border px-3 py-2.5">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-[10px] font-bold text-accent">{index + 1}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium leading-snug text-fg">
                  {activity.level ? `L${activity.level}` : "Site"}{activity.tower ? ` · Tower ${activity.tower}` : ""} · {activity.scope}
                </p>
                <p className="mt-0.5 text-[11px] leading-snug text-muted">{activity.workers}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-3 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-display text-base font-semibold sm:text-lg">MEP matrix</h2>
          <Link to="/matrix" className="text-xs font-medium text-accent hover:underline">
            Full screen →
          </Link>
        </div>
        <div className="-mx-1 overflow-x-auto">
          <MepMatrix />
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 flex items-center gap-2 font-display text-base font-semibold sm:text-lg">
          <ClipboardList className="size-4 text-muted" aria-hidden="true" />
          Notes & quick links
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <Link
            to="/material"
            className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 px-3 py-3 transition hover:border-accent"
          >
            <Package className="size-5 shrink-0 text-accent" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-sm font-medium">Material delivered</p>
              <p className="text-xs text-muted">
                {report.poSummary.toOrder} lines to order · bal {report.orderTotals.total}
              </p>
            </div>
          </Link>
          <Link
            to="/po-log"
            className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 px-3 py-3 transition hover:border-accent"
          >
            <AlertTriangle className="size-5 shrink-0 text-warn" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-sm font-medium">Issues / PO log</p>
              <p className="text-xs text-muted">Purchase orders & outstanding</p>
            </div>
          </Link>
          <Link
            to="/manpower"
            className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 px-3 py-3 transition hover:border-accent"
          >
            <HardHat className="size-5 shrink-0 text-ok" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-sm font-medium">Workers</p>
              <p className="text-xs text-muted">
                {present} present · {absent} absent today
              </p>
            </div>
          </Link>
          <Link
            to="/matrix"
            className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 px-3 py-3 transition hover:border-accent"
          >
            <TrendingUp className="size-5 shrink-0 text-accent" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-sm font-medium">Progress</p>
              <p className="text-xs text-muted">
                Overall {pct(s.overall)} · CW {pct(s.coldWater)} · San {pct(s.sanitary)}
              </p>
            </div>
          </Link>
        </div>
        {s.blockers ? (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-warn-bg px-3 py-2 text-sm text-warn">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>Blocker: {s.blockers}</span>
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-2 text-xs text-muted">
            <CheckCircle2 className="size-3.5 text-ok" aria-hidden="true" />
            No blockers recorded · Focus: {s.today}
          </div>
        )}
      </Card>
    </div>
  );
}
