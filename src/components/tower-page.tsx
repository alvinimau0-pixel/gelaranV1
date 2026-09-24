import { useAppStore } from "@/lib/store";
import { Badge, Card, Meter } from "@/components/ui";
import { MepMatrix } from "@/components/mep-matrix";
import { pct } from "@/lib/utils";
import { ITEM_META, normalizeProgress } from "@/lib/mep";

export function TowerPage({ tower }: { tower: "A" | "B" }) {
  const report = useAppStore((s) => s.report);
  const floors = report.floors.filter((f) => f.level !== "OVERALL");
  const activeItems = report.items.filter((item) => ITEM_META[item]);
  const values = activeItems.flatMap((item) => report.progression[tower].map((row) => normalizeProgress(row.items[item]))).filter((value): value is number => value != null);
  const value = values.length ? values.reduce((sum, current) => sum + current, 0) / values.length : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Tower {tower}</h1>
          <p className="mt-1 text-sm text-muted">Explore the MEP matrix — tap any cell</p>
        </div>
        <Badge tone="accent">{pct(value ?? 0)} package complete</Badge>
      </div>

      <Card>
        <h2 className="mb-4 font-display text-lg font-semibold">Floor average</h2>
        <div className="grid gap-2">
          {floors.map((f, i) => {
            const v = tower === "A" ? f.a : f.b;
            return (
              <div key={f.level} className="grid grid-cols-[3.5rem_1fr_3.5rem] items-center gap-3">
                <span className="text-xs font-medium text-muted">L{f.level}</span>
                <Meter value={v} delay={i * 20} />
                <span className="text-right font-mono text-xs tabular-nums">{pct(v)}</span>
              </div>
            );
          })}
        </div>
      </Card>

      <MepMatrix tower={tower} />
    </div>
  );
}
