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
} from "lucide-react";
import { Badge, Card } from "@/components/ui";
import { MepMatrix } from "@/components/mep-matrix";
import { pct, cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { ITEM_META, PACKAGES, normalizeProgress } from "@/lib/mep";
import { todayInKualaLumpur } from "@/lib/attendance";
import { listSitePhotos, createSitePhoto, type SitePhoto } from "@/lib/photos";
import { compressImageToBase64 } from "@/lib/image-compress";
import { getLatestDailySummary, type DailySummary } from "@/lib/daily-summary";
import { ProgressDashboard } from "@/components/progress-dashboard";

export const Route = createFileRoute("/home")({ component: Home });

function average(values: Array<number | null | undefined>) {
  const valid = values.map(normalizeProgress).filter((value): value is number => value != null);
  return valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : null;
}

function CombinedProgressDashboard() {
  const progression = useAppStore((state) => state.report.progression);
  const items = useAppStore((state) => state.report.items);
  const [filter, setFilter] = useState<(typeof PACKAGES)[number]>("All");
  const activeItems = items.filter((item) => ITEM_META[item]);
  const visibleItems = filter === "All" ? activeItems : activeItems.filter((item) => ITEM_META[item]?.package === filter);
  const itemProgress = (tower: "A" | "B", item: string) => average(progression[tower].map((row) => row.items[item]));
  const towerOverall = (tower: "A" | "B") => average(activeItems.flatMap((item) => progression[tower].map((row) => row.items[item])));
  const combinedOverall = average([towerOverall("A"), towerOverall("B")]);

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-accent">Management view</p>
          <h2 className="mt-0.5 font-display text-base font-semibold sm:text-lg">Tower A + Tower B Combined Progress</h2>
          <p className="mt-1 text-xs text-muted">Live from the same floor-level MEP progression used by both matrices.</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PACKAGES.map((pkg) => (
            <button
              key={pkg}
              type="button"
              onClick={() => setFilter(pkg)}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-semibold transition",
                filter === pkg ? "bg-accent text-white" : "bg-surface-2 text-muted hover:text-fg",
              )}
            >
              {pkg}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {([["Tower A", towerOverall("A")], ["Tower B", towerOverall("B")], ["Combined", combinedOverall]] as const).map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border bg-surface-2/60 px-3 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">{label}</p>
            <p className="mt-1 font-display text-xl font-semibold tabular-nums text-fg">
              {value == null ? "—" : String(Math.round(value * 100)) + "%"}
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface">
              <div className="h-full rounded-full bg-accent" style={{ width: String(Math.round((value ?? 0) * 100)) + "%" }} />
            </div>
          </div>
        ))}
      </div>
      <div className="responsive-scroll relative mt-4 overflow-x-auto rounded-xl border border-border">
        <table className="responsive-table table-clear w-full min-w-[640px] border-collapse text-left text-xs sm:min-w-[700px]" aria-label="Tower A and Tower B combined MEP progress">
          <thead>
            <tr>
              <th className="sticky-col sticky left-0 z-10 min-w-48 px-2 py-2 sm:px-3">Work Item</th>
              <th className="px-2 py-2 sm:px-3">Package</th>
              <th className="px-2 py-2 text-right sm:px-3">Tower A</th>
              <th className="px-2 py-2 text-right sm:px-3">Tower B</th>
              <th className="px-2 py-2 text-right sm:px-3">Combined</th>
            </tr>
          </thead>
          <tbody>
            {visibleItems.map((item) => {
              const a = itemProgress("A", item);
              const b = itemProgress("B", item);
              const combined = average([a, b]);
              return (
                <tr key={item} className="border-t border-border/70">
                  <th scope="row" className="sticky-col sticky left-0 z-[1] min-w-48 bg-surface px-2 py-2.5 font-medium text-fg sm:px-3">{item}</th>
                  <td className="px-2 py-2.5 text-muted sm:px-3">{ITEM_META[item]?.package}</td>
                  <td className="px-2 py-2.5 text-right font-mono tabular-nums sm:px-3">{a == null ? "—" : String(Math.round(a * 100)) + "%"}</td>
                  <td className="px-2 py-2.5 text-right font-mono tabular-nums sm:px-3">{b == null ? "—" : String(Math.round(b * 100)) + "%"}</td>
                  <td className="px-2 py-2.5 text-right font-mono font-bold tabular-nums text-accent sm:px-3">{combined == null ? "—" : String(Math.round(combined * 100)) + "%"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Home() {
  const report = useAppStore((state) => state.report);
  const s = report.site;
  const today = todayInKualaLumpur();
  const fileRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<SitePhoto[]>([]);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [photoPaused, setPhotoPaused] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    listSitePhotos()
      .then((list) => {
        if (!cancelled) setPhotos(list);
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

  useEffect(() => {
    getLatestDailySummary()
      .then(setDailySummary)
      .catch((err) => console.error("[dashboard] daily summary load failed", err));
  }, []);

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
          <Badge tone="accent">{s.men} workers planned</Badge>
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
                <p className="text-sm font-semibold text-white">{featured.title}</p>
                <p className="text-xs text-white/70">{featured.date}</p>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-white/60">No site photos yet</div>
          )}
          <div className="absolute right-2 top-2 flex gap-1">
            <button
              type="button"
              onClick={() => setPhotoPaused((paused) => !paused)}
              className="rounded-lg bg-black/40 p-2 text-white backdrop-blur"
              aria-label={photoPaused ? "Play slideshow" : "Pause slideshow"}
            >
              {photoPaused ? <Play className="size-4" /> : <Pause className="size-4" />}
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="rounded-lg bg-black/40 p-2 text-white backdrop-blur"
              aria-label="Upload photo"
            >
              <ImagePlus className="size-4" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onUpload(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>
        {uploadError ? <p role="alert" className="border-t border-bad/20 bg-bad-bg px-3 py-2 text-sm text-bad">{uploadError}</p> : null}
      </Card>

      <ProgressDashboard dailySummary={dailySummary} />

      {dailySummary ? (
        <Card>
          <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-accent">Work plan & distribution</p>
              <h2 className="mt-0.5 font-display text-base font-semibold sm:text-lg">Manpower detail · {dailySummary.summaryDate}</h2>
            </div>
            <Link to="/daily-summary" className="text-xs font-medium text-accent hover:underline">View history →</Link>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-lg bg-ok-bg px-3 py-2"><p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Present</p><p className="mt-1 font-mono text-lg font-bold text-ok">{dailySummary.attendance.present}</p></div>
            <div className="rounded-lg bg-bad-bg px-3 py-2"><p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Absent</p><p className="mt-1 font-mono text-lg font-bold text-bad">{dailySummary.attendance.absent}</p></div>
            <div className="rounded-lg bg-accent/10 px-3 py-2"><p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Direct / sub</p><p className="mt-1 font-mono text-lg font-bold text-accent">{dailySummary.attendance.direct} / {dailySummary.attendance.subcontractor}</p></div>
            <div className="rounded-lg bg-surface-2 px-3 py-2"><p className="text-[10px] font-semibold uppercase tracking-wide text-muted">MC / Off</p><p className="mt-1 font-mono text-lg font-bold text-fg">{dailySummary.attendance.mc} / {dailySummary.attendance.off}</p></div>
          </div>
        </Card>
      ) : null}

      <Card className="p-3 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-base font-semibold sm:text-lg">Work plan · {report.dailyReport.date}</h2>
            <p className="text-[11px] text-muted">Planned workers by subcontractor and field team</p>
          </div>
          <span className="font-mono text-sm font-bold tabular-nums text-fg">{report.dailyReport.totalWorkers} total</span>
        </div>
        <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {report.dailyReport.subcontractors.map((sub) => (
            <div key={sub.name} className="rounded-xl border border-border bg-surface-2/70 px-3 py-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold tracking-wide text-fg">{sub.name}</p>
                <span className="font-mono text-sm font-bold tabular-nums text-accent">{sub.workers}</span>
              </div>
              <p className="mt-1 text-[11px] leading-tight text-muted">{sub.scope}</p>
            </div>
          ))}
        </div>
        <div className="mb-4 overflow-hidden rounded-xl border border-border bg-surface-2/50">
          <div className="space-y-2.5 px-3 py-3">
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
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="table-clear w-full min-w-[680px] border-collapse text-left text-xs" aria-label="Work plan activities">
            <thead>
              <tr>
                <th scope="col" className="w-12 px-3 py-2 text-center">No.</th>
                <th scope="col" className="px-3 py-2">Location</th>
                <th scope="col" className="px-3 py-2">Work scope</th>
                <th scope="col" className="px-3 py-2">Assigned crew / contractor</th>
              </tr>
            </thead>
            <tbody>
              {report.dailyReport.activities.map((activity, index) => (
                <tr key={`${activity.scope}-${index}`} className="border-t border-border/70">
                  <td className="px-3 py-2.5 text-center font-mono font-bold text-accent">{index + 1}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-medium text-fg">
                    {activity.level ? `Level ${activity.level}` : "Site"}{activity.tower ? ` · Tower ${activity.tower}` : ""}
                  </td>
                  <td className="px-3 py-2.5 font-medium text-fg">{activity.scope}</td>
                  <td className="px-3 py-2.5 text-muted">{activity.workers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <CombinedProgressDashboard />

      <Card className="p-3 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-display text-base font-semibold sm:text-lg">MEP matrix</h2>
          <Link to="/matrix" className="text-xs font-medium text-accent hover:underline">Full screen →</Link>
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
          <Link to="/material" className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 px-3 py-3 transition hover:border-accent">
            <Package className="size-5 shrink-0 text-accent" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-sm font-medium">Material delivered</p>
              <p className="text-xs text-muted">{report.poSummary.toOrder} lines to order · bal {report.orderTotals.total}</p>
            </div>
          </Link>
          <Link to="/po-log" className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 px-3 py-3 transition hover:border-accent">
            <AlertTriangle className="size-5 shrink-0 text-warn" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-sm font-medium">Issues / PO log</p>
              <p className="text-xs text-muted">Purchase orders & outstanding</p>
            </div>
          </Link>
          <Link to="/manpower" className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 px-3 py-3 transition hover:border-accent">
            <HardHat className="size-5 shrink-0 text-ok" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-sm font-medium">Workers</p>
              <p className="text-xs text-muted">Open the full attendance register</p>
            </div>
          </Link>
          <Link to="/matrix" className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 px-3 py-3 transition hover:border-accent">
            <TrendingUp className="size-5 shrink-0 text-accent" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-sm font-medium">Progress</p>
              <p className="text-xs text-muted">Overall {pct(s.overall)} · CW {pct(s.coldWater)} · San {pct(s.sanitary)}</p>
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
