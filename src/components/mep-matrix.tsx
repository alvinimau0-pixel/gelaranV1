import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { ITEM_META, PACKAGES, cellTone, itemsForPackage, normalizeProgress, relatedMaterial, validateProgression } from "@/lib/mep";
import { Badge, Card, Meter } from "@/components/ui";
import { cn, pct } from "@/lib/utils";

type Sel = { tower: "A" | "B"; level: string; item: string };

const LEGEND = [
  { label: "Complete", range: "90–100%", className: "bg-emerald-500" },
  { label: "In progress", range: "50–89%", className: "bg-blue-600" },
  { label: "Started", range: "1–49%", className: "bg-amber-400" },
  { label: "Not started", range: "0%", className: "bg-red-500" },
  { label: "N/A", range: "—", className: "bg-slate-200 ring-1 ring-inset ring-slate-300" },
];

export function MepMatrix({ tower }: { tower?: "A" | "B" }) {
  const report = useAppStore((s) => s.report);
  const [pkg, setPkg] = useState<(typeof PACKAGES)[number]>("All");
  const [sel, setSel] = useState<Sel | null>(null);
  const items = itemsForPackage(pkg);
  const levels = report.progression.A.map((r) => r.level);
  const towers: ("A" | "B")[] = tower ? [tower] : ["A", "B"];
  const validationIssues = validateProgression(report.progression, items);
  const overallFor = (item: string) => {
    const values = towers.flatMap((t) => levels.map((level) => report.progression[t].find((r) => r.level === level)?.items[item] ?? null)).filter(
      (value): value is number => value != null,
    );
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
  };

  const detail = sel
    ? {
        meta: ITEM_META[sel.item],
        a: report.progression.A.find((r) => r.level === sel.level)?.items[sel.item] ?? null,
        b: report.progression.B.find((r) => r.level === sel.level)?.items[sel.item] ?? null,
        mats: relatedMaterial(sel.item),
      }
    : null;

  const selectCell = (t: "A" | "B", level: string, item: string) =>
    setSel({ tower: t, level, item });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {PACKAGES.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPkg(p)}
            className={cn(
              "min-h-9 rounded-full px-3 text-xs font-medium transition-colors duration-150 sm:min-h-11 sm:px-4 sm:text-sm",
              pkg === p ? "bg-ink text-accent-fg" : "bg-surface-2 text-muted hover:text-fg",
            )}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-[11px] text-muted sm:text-xs">
        <span className="font-semibold text-fg">Color validation</span>
        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-semibold", validationIssues.length ? "bg-bad-bg text-bad" : "bg-ok-bg text-ok")}>
          <span className={cn("size-2 rounded-full", validationIssues.length ? "bg-bad" : "bg-ok")} aria-hidden="true" />
          {validationIssues.length ? `${validationIssues.length} invalid cells` : "All cells valid"}
        </span>
        <span className="h-4 w-px bg-border" aria-hidden="true" />
        <span className="font-semibold text-fg">Progress key</span>
        {LEGEND.map((entry) => (
          <span key={entry.label} className="inline-flex items-center gap-1.5 whitespace-nowrap" title={`${entry.label}: ${entry.range}`}>
            <span className={cn("size-2.5 rounded-full shadow-sm", entry.className)} aria-hidden="true" />
            <span>{entry.label} <span className="text-subtle">({entry.range})</span></span>
          </span>
        ))}
      </div>

      <Card className="p-0">
        <div className="hidden overflow-hidden md:block">
          <table className="table-clear w-full table-fixed border-collapse text-left text-[10px] lg:text-[11px]" aria-label="MEP progress matrix">
            <colgroup>
              <col className="w-10" />
              {!tower ? <col className="w-8" /> : null}
              {items.map((item) => <col key={item} />)}
            </colgroup>
            <thead>
              <tr>
                <th className="sticky left-0 z-20 border-b border-border bg-surface-2 px-1.5 py-2 text-center font-semibold uppercase tracking-wide text-fg">
                  Lvl
                </th>
                {tower ? null : (
                  <th className="border-b border-border bg-surface-2 px-1 py-2 text-center font-semibold uppercase tracking-wide text-fg">
                    T
                  </th>
                )}
                {items.map((item) => (
                  <th
                    key={item}
                    title={item}
                    className="border-b border-l border-border bg-surface-2 px-0.5 py-2 text-center font-semibold leading-tight text-fg"
                  >
                    <span className="block truncate px-0.5">{ITEM_META[item]?.short ?? item}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {levels.map((level) =>
                towers.map((t) => {
                  const row = report.progression[t].find((r) => r.level === level);
                  return (
                    <tr key={`${level}-${t}`}>
                      {t === towers[0] ? (
                        <td
                          rowSpan={towers.length}
                          className="sticky left-0 z-10 border-b border-border bg-surface px-1.5 py-1 text-center font-semibold text-fg"
                        >
                          {level}
                        </td>
                      ) : null}
                      {tower ? null : (
                        <td className="border-b border-border px-1 py-1 text-center font-semibold text-muted">{t}</td>
                      )}
                      {items.map((item) => {
                        const raw = row?.items[item] ?? null;
                        const v = normalizeProgress(raw);
                        const active = sel?.level === level && sel.item === item && sel.tower === t;
                        return (
                          <td key={item} className="border-b border-border p-0.5">
                            <button
                              type="button"
                              onClick={() => selectCell(t, level, item)}
                              className={cn(
                                "flex h-8 w-full items-center justify-center rounded-md font-mono text-[11px] font-bold tabular-nums transition-transform hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink lg:h-9",
                                cellTone(v),
                                active && "ring-2 ring-ink ring-offset-1",
                              )}
                              aria-label={`Tower ${t} level ${level} ${item}: ${v == null ? "not applicable" : `${Math.round(v * 100)} percent`}`}
                              title={`${ITEM_META[item]?.short ?? item}: ${v == null ? "N/A" : `${Math.round(v * 100)}%`}`}
                            >
                              {v == null ? "—" : `${Math.round(v * 100)}`}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                }),
              )}
            </tbody>
            <tfoot>
              <tr>
                <th className="sticky left-0 z-10 bg-ink px-1.5 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-white">Overall</th>
                {tower ? null : <th className="bg-ink px-1 py-2 text-center text-[10px] font-bold text-white">—</th>}
                {items.map((item) => {
                  const value = overallFor(item);
                  return <td key={item} className="bg-ink px-0.5 py-2 text-center font-mono text-[10px] font-bold tabular-nums text-white">{value == null ? "—" : `${Math.round(value * 100)}%`}</td>;
                })}
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="space-y-2 p-2 md:hidden">
          {levels.map((level) =>
            towers.map((t) => {
              const row = report.progression[t].find((r) => r.level === level);
              return (
                <section key={`${level}-${t}`} className="rounded-xl border border-border bg-surface-2/60 p-2">
                  <div className="mb-2 flex items-center justify-between px-1">
                    <span className="font-display text-sm font-semibold text-fg">Level {level}</span>
                    {!tower ? <span className="rounded-full bg-ink px-2 py-0.5 text-[10px] font-semibold text-accent-fg">Tower {t}</span> : null}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {items.map((item) => {
                      const v = normalizeProgress(row?.items[item] ?? null);
                      const active = sel?.level === level && sel.item === item && sel.tower === t;
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => selectCell(t, level, item)}
                          className={cn(
                            "flex min-h-12 items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink",
                            cellTone(v),
                            active && "ring-2 ring-ink ring-offset-1",
                          )}
                          aria-label={`Tower ${t} level ${level} ${item}: ${v == null ? "not applicable" : `${Math.round(v * 100)} percent`}`}
                        >
                          <span className="min-w-0 truncate text-[11px] font-semibold leading-tight">{ITEM_META[item]?.short ?? item}</span>
                          <span className="shrink-0 font-mono text-sm font-bold tabular-nums">{v == null ? "—" : `${Math.round(v * 100)}%`}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            }),
          )}
          <div className="rounded-xl bg-ink px-3 py-2.5 text-white">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide">Overall matrix average</span>
              <span className="font-mono text-sm font-bold tabular-nums">{Math.round((items.map(overallFor).filter((value): value is number => value != null).reduce((sum, value) => sum + value, 0) / Math.max(1, items.map(overallFor).filter((value): value is number => value != null).length)) * 100)}%</span>
            </div>
            <div className="flex gap-1 overflow-hidden rounded-full bg-white/15">
              {items.map((item) => {
                const value = overallFor(item);
                return value == null ? null : <span key={item} className={cn("h-2 flex-1", cellTone(value).split(" ")[0])} title={`${ITEM_META[item]?.short ?? item}: ${Math.round(value * 100)}%`} />;
              })}
            </div>
          </div>
        </div>
      </Card>

      {sel && detail ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-ink/30" onClick={() => setSel(null)}>
          <aside
            className="flex h-full w-full max-w-md flex-col overflow-y-auto bg-surface p-4 shadow-[0_8px_40px_rgba(15,23,36,0.18)] sm:p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Tower {sel.tower} · Level {sel.level}</p>
                <h2 className="mt-1 font-display text-lg font-semibold sm:text-xl">{sel.item}</h2>
              </div>
              <button
                type="button"
                className="inline-flex size-11 items-center justify-center rounded-md border border-border"
                onClick={() => setSel(null)}
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2"><Badge tone="accent">{detail.meta?.package}</Badge></div>
            <p className="mt-4 text-sm text-muted">{detail.meta?.detail}</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border p-3"><p className="text-xs text-muted">Tower A</p><p className="mt-1 font-display text-lg font-semibold tabular-nums">{pct(detail.a)}</p><div className="mt-2"><Meter value={detail.a ?? 0} /></div></div>
              <div className="rounded-lg border border-border p-3"><p className="text-xs text-muted">Tower B</p><p className="mt-1 font-display text-lg font-semibold tabular-nums">{pct(detail.b)}</p><div className="mt-2"><Meter value={detail.b ?? 0} /></div></div>
            </div>
            <h3 className="mt-6 text-sm font-semibold">Related material</h3>
            {detail.mats.length ? (
              <ul className="mt-2 space-y-2 text-sm">{detail.mats.map((m) => <li key={m.material} className="flex justify-between gap-3 border-b border-border py-2"><span>{m.material}</span><span className="tabular-nums text-muted">bal {m.balance}</span></li>)}</ul>
            ) : <p className="mt-2 text-sm text-muted">No material line mapped.</p>}
            {detail.meta?.drawing ? <Link to="/library" search={{ dwg: detail.meta.drawing }} className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-ink px-4 text-sm font-medium text-accent-fg">Open drawing {detail.meta.drawing}</Link> : null}
          </aside>
        </div>
      ) : null}
    </div>
  );
}
