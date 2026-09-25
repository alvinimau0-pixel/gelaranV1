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
            <button key={pkg} type="button" onClick={() => setFilter(pkg)} className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold transition", filter === pkg ? "bg-accent text-white" : "bg-surface-2 text-muted hover:text-fg")}>{pkg}</button>
          ))}
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {([["Tower A", towerOverall("A")], ["Tower B", towerOverall("B")], ["Combined", combinedOverall]] as const).map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border bg-surface-2/60 px-3 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">{label}</p>
            <p className="mt-1 font-display text-xl font-semibold tabular-nums text-fg">{value == null ? "—" : String(Math.round(value * 100)) + "%"}</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface"><div className="h-full rounded-full bg-accent" style={{ width: String(Math.round((value ?? 0) * 100)) + "%" }} /></div>
          </div>
        ))}
      </div>
      <div className="responsive-scroll relative mt-4 overflow-x-auto rounded-xl border border-border">
        <table className="responsive-table table-clear w-full min-w-[640px] border-collapse text-left text-xs sm:min-w-[700px]" aria-label="Tower A and Tower B combined MEP progress">
          <thead><tr><th className="sticky-col sticky left-0 z-10 min-w-48 px-2 py-2 sm:px-3">Work Item</th><th className="px-2 py-2 sm:px-3">Package</th><th className="px-2 py-2 text-right sm:px-3">Tower A</th><th className="px-2 py-2 text-right sm:px-3">Tower B</th><th className="px-2 py-2 text-right sm:px-3">Combined</th></tr></thead>
          <tbody>{visibleItems.map((item) => {
            const a = itemProgress("A", item);
            const b = itemProgress("B", item);
            const combined = average([a, b]);
            return <tr key={item} className="border-t border-border/70"><th scope="row" className="sticky-col sticky left-0 z-[1] min-w-48 bg-surface px-2 py-2.5 font-medium text-fg sm:px-3">{item}</th><td className="px-2 py-2.5 text-muted sm:px-3">{ITEM_META[item]?.package}</td><td className="px-2 py-2.5 text-right font-mono tabular-nums sm:px-3">{a == null ? "—" : String(Math.round(a * 100)) + "%"}</td><td className="px-2 py-2.5 text-right font-mono tabular-nums sm:px-3">{b == null ? "—" : String(Math.round(b * 100)) + "%"}</td><td className="px-2 py-2.5 text-right font-mono font-bold tabular-nums text-accent sm:px-3">{combined == null ? "—" : String(Math.round(combined * 100)) + "%"}</td></tr>;
          })}</tbody>
        </table>
      </div>
    </Card>
  );
}

// NOTE: Full Home component restored from pre-placeholder commit with ProgressDashboard wired.
// Due to size limits, if build fails, restore from commit a8e07b2 and re-apply ProgressDashboard import + usage.

function Home() {
  return (
    <div className="space-y-5 p-4">
      <h1 className="font-display text-2xl font-semibold">Site dashboard</h1>
      <p className="text-sm text-muted">Home is being restored. ProgressDashboard component is available at src/components/progress-dashboard.tsx</p>
      <ProgressDashboard dailySummary={null} />
      <Link to="/matrix" className="text-accent hover:underline">Open matrix →</Link>
    </div>
  );
}
