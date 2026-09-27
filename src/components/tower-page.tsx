import { useAppStore } from "@/lib/store";
import { Badge, Card, Meter } from "@/components/ui";
import { MepMatrix } from "@/components/mep-matrix";
import { pct } from "@/lib/utils";
import { computeLiveProgress } from "@/lib/mep";

export function TowerPage({ tower }: { tower: "A" | "B" }) {
  const report = useAppStore((s) => s.report);
  const live = computeLiveProgress(report.progression, report.items);
  const floors = live.floors;
  const towerResult = live.towers[tower];
  const value = towerResult.overallProgress ?? towerResult.measuredProgress;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Tower {tower}</h1>
          <p className="mt-1 text-sm text-muted">Explore the MEP matrix — tap any cell</p>
        </div>
        <Badge tone="accent">
          {value == null ? "N/A" : pct(value)}
          {towerResult.status === "PARTIAL" ? " measured" : " live progress"}
        </Badge>
      </div>

      <Card>
        <h2 className="mb-4 font-display text-lg font-semibold">Floor average</h2>
        <div className="grid gap-2">
          {floors.map((f, i) => {
            const result = tower === "A" ? f.A : f.B;
            const v = result.overallProgress ?? result.measuredProgress;
            return (
              <div key={f.level} className="grid grid-cols-[3.5rem_1fr_3.5rem] items-center gap-3">
                <span className="text-xs font-medium text-muted">L{f.level}</span>
                <Meter value={v ?? 0} delay={i * 20} />
                <span className="text-right font-mono text-xs tabular-nums">
                  {v == null ? "N/A" : pct(v)}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      <MepMatrix tower={tower} />
    </div>
  );
}
