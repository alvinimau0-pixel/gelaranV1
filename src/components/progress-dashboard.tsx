import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Card, Badge } from "@/components/ui";
import { pct, cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { ITEM_META, normalizeProgress } from "@/lib/mep";
import type { DailySummary } from "@/lib/daily-summary";

function average(values: Array<number | null | undefined>) {
  const valid = values.map(normalizeProgress).filter((v): v is number => v != null);
  return valid.length ? valid.reduce((s, v) => s + v, 0) / valid.length : null;
}

function barColor(v: number | null) {
  if (v == null) return "bg-slate-300";
  if (v >= 0.7) return "bg-emerald-500";
  if (v >= 0.4) return "bg-blue-600";
  if (v >= 0.2) return "bg-amber-400";
  return "bg-red-500";
}

type Team = { team: string; leader: string; assistants: string[] };

export function ProgressDashboard({ dailySummary }: { dailySummary: DailySummary | null }) {
  const progression = useAppStore((s) => s.report.progression);
  const items = useAppStore((s) => s.report.items);
  const packages = useAppStore((s) => s.report.packages);
  const teams = (useAppStore((s) => (s.report as { teams?: Team[] }).teams) ?? []) as Team[];
  const activities = useAppStore((s) => s.report.dailyReport?.activities ?? []);

  const presentSet = useMemo(() => {
    const set = new Set<string>();
    for (const w of dailySummary?.workers ?? []) {
      if (w.status === "Present") set.add(w.name.toUpperCase());
    }
    return set;
  }, [dailySummary]);

  const isPresent = (name: string) => {
    const n = name.toUpperCase();
    if (presentSet.has(n)) return true;
    for (const p of presentSet) {
      if (n.split(" ")[0] === p.split(" ")[0] || n.includes(p) || p.includes(n)) return true;
    }
    return presentSet.size === 0;
  };

  const activeItems = items.filter((item) => ITEM_META[item]);
  const towerOverall = (tower: "A" | "B") =>
    average(activeItems.flatMap((item) => progression[tower].map((row) => row.items[item])));
  const combined = average([towerOverall("A"), towerOverall("B")]);

  const pkgAvg = (pkg: string) => {
    const pkgItems = activeItems.filter((i) => ITEM_META[i]?.package === pkg);
    return average(
      (["A", "B"] as const).flatMap((t) =>
        progression[t].flatMap((row) => pkgItems.map((item) => row.items[item])),
      ),
    );
  };

  const cw = pkgAvg("Cold Water") ?? packages?.coldWater ?? null;
  const san = pkgAvg("Sanitary") ?? packages?.sanitary ?? null;
  const irr = pkgAvg("Irrigation") ?? packages?.irrigation ?? null;
  const ovr = combined ?? packages?.overall ?? null;

  const att = dailySummary?.attendance;
  const towers = dailySummary?.towers;
  const focusActivities = activities.filter((a) => a.scope && a.scope !== "—").slice(0, 6);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        <div className="rounded-xl border border-border bg-ok-bg/80 px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Present</p>
          <p className="mt-1 font-display text-2xl font-bold tabular-nums text-ok">{att?.present ?? "—"}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface-2 px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Tower A</p>
          <p className="mt-1 font-display text-2xl font-bold tabular-nums text-fg">{towers ? pct(towers.A) : ovr != null ? pct(towerOverall("A")) : "—"}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface-2 px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Tower B</p>
          <p className="mt-1 font-display text-2xl font-bold tabular-nums text-fg">{towers ? pct(towers.B) : ovr != null ? pct(towerOverall("B")) : "—"}</p>
        </div>
        <div className="col-span-2 rounded-xl border border-accent/30 bg-accent/10 px-3 py-3 sm:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Overall</p>
              <p className="mt-1 font-display text-2xl font-bold tabular-nums text-accent">{towers ? pct(towers.overall) : ovr != null ? pct(ovr) : "—"}</p>
            </div>
            <div className="relative size-14 shrink-0 rounded-full" style={{ background: `conic-gradient(var(--color-accent, #2563eb) ${Math.round((towers?.overall ?? ovr ?? 0) * 100)}%, #e2e8f0 0)` }} aria-hidden>
              <div className="absolute inset-1.5 flex items-center justify-center rounded-full bg-surface text-[11px] font-bold tabular-nums text-fg">{Math.round((towers?.overall ?? ovr ?? 0) * 100)}%</div>
            </div>
          </div>
        </div>
      </div>

      <Card className="p-3 sm:p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-accent">Package progress</p>
          <span className="text-[10px] text-muted">Weights: CW 55% · SAN 30% · IRR 15%</span>
        </div>
        <div className="space-y-2.5">
          {([["CW · Cold Water", cw], ["SAN · Sanitary", san], ["IRR · Irrigation", irr]] as const).map(([label, value]) => (
            <div key={label}>
              <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                <span className="font-medium text-fg">{label}</span>
                <span className="font-mono font-bold tabular-nums text-fg">{value == null ? "—" : pct(value)}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-surface-2">
                <div className={cn("h-full rounded-full transition-all", barColor(value))} style={{ width: `${Math.round((value ?? 0) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="p-3 sm:p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-accent">Manpower · Leader → Assist</p>
            <Link to="/manpower" className="text-[11px] font-medium text-accent hover:underline">Register →</Link>
          </div>
          {teams.length === 0 ? (
            <p className="text-xs text-muted">No team seed loaded.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[320px] border-collapse text-left text-[11px]">
                <thead>
                  <tr className="border-b border-border bg-surface-2/80">
                    <th className="px-2 py-1.5 font-semibold">Team</th>
                    <th className="px-2 py-1.5 font-semibold">Leader</th>
                    <th className="px-2 py-1.5 font-semibold">Assist</th>
                    <th className="px-2 py-1.5 text-right font-semibold">On site</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.filter((t) => t.team !== "housekeeping" || t.leader).slice(0, 9).map((t) => {
                    const members = [t.leader, ...t.assistants];
                    const on = members.filter(isPresent).length;
                    const total = members.length;
                    const full = on === total && total > 0;
                    return (
                      <tr key={t.team} className="border-t border-border/60">
                        <td className="px-2 py-1.5 font-medium capitalize text-fg">{t.team}</td>
                        <td className="px-2 py-1.5 font-semibold text-fg">{t.leader}</td>
                        <td className="max-w-[140px] truncate px-2 py-1.5 text-muted">{t.assistants.length ? t.assistants.join(", ") : "—"}</td>
                        <td className={cn("px-2 py-1.5 text-right font-mono font-bold tabular-nums", full ? "text-ok" : on === 0 ? "text-bad" : "text-warn")}>
                          {dailySummary ? `${on}/${total}` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-accent">Focus today</p>
            <Link to="/matrix" className="text-[11px] font-medium text-accent hover:underline">Matrix →</Link>
          </div>
          {focusActivities.length === 0 ? (
            <p className="text-xs text-muted">No activities listed for today.</p>
          ) : (
            <ul className="space-y-2">
              {focusActivities.map((a, i) => (
                <li key={`${a.scope}-${i}`} className="flex items-start gap-2 rounded-lg border border-border bg-surface-2/50 px-2.5 py-2">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-[10px] font-bold text-accent">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-fg">{a.level ? `L${a.level} · ` : ""}{a.scope}</p>
                    <p className="mt-0.5 truncate text-[11px] text-muted">{a.workers}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {att ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Badge tone="ok">Present {att.present}</Badge>
              <Badge tone={att.absent ? "bad" : "mute"}>Absent {att.absent}</Badge>
              <Badge tone="mute">Direct {att.direct} · Sub {att.subcontractor}</Badge>
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
