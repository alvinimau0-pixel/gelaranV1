import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { report } from "@/lib/report-data";
import { ITEM_META, PACKAGES, cellTone, itemsForPackage, relatedMaterial } from "@/lib/mep";
import { Badge, Card, Meter } from "@/components/ui";
import { cn, pct } from "@/lib/utils";

type Sel = { tower: "A" | "B"; level: string; item: string };

export function MepMatrix({ tower }: { tower?: "A" | "B" }) {
  const [pkg, setPkg] = useState<(typeof PACKAGES)[number]>("All");
  const [sel, setSel] = useState<Sel | null>(null);
  const items = itemsForPackage(pkg);
  const levels = report.progression.A.map((r) => r.level);
  const towers: ("A" | "B")[] = tower ? [tower] : ["A", "B"];

  const detail = sel
    ? {
        meta: ITEM_META[sel.item],
        a: report.progression.A.find((r) => r.level === sel.level)?.items[sel.item] ?? null,
        b: report.progression.B.find((r) => r.level === sel.level)?.items[sel.item] ?? null,
        mats: relatedMaterial(sel.item),
      }
    : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {PACKAGES.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPkg(p)}
            className={cn(
              "min-h-11 rounded-full px-4 text-sm font-medium transition-colors duration-150",
              pkg === p ? "bg-ink text-accent-fg" : "bg-surface-2 text-muted hover:text-fg",
            )}
          >
            {p}
          </button>
        ))}
      </div>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-xs">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-surface-2 px-3 py-2 font-semibold uppercase tracking-wide text-muted">
                  Lv
                </th>
                {tower ? null : (
                  <th className="bg-surface-2 px-2 py-2 font-semibold uppercase tracking-wide text-muted">T</th>
                )}
                {items.map((item) => (
                  <th key={item} className="bg-surface-2 px-1 py-2 text-center font-semibold text-muted">
                    <span className="inline-block max-w-16 leading-tight">{ITEM_META[item]?.short ?? item}</span>
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
                          className="sticky left-0 bg-surface px-3 py-1 font-medium text-fg"
                        >
                          {level}
                        </td>
                      ) : null}
                      {tower ? null : <td className="px-2 py-1 text-muted">{t}</td>}
                      {items.map((item) => {
                        const v = row?.items[item] ?? null;
                        const active = sel?.level === level && sel.item === item && sel.tower === t;
                        return (
                          <td key={item} className="p-0.5">
                            <button
                              type="button"
                              onClick={() => setSel({ tower: t, level, item })}
                              className={cn(
                                "flex h-9 w-full min-w-12 items-center justify-center rounded-xs font-mono tabular-nums transition-transform duration-150 hover:scale-[1.03]",
                                cellTone(v),
                                active && "ring-2 ring-ink",
                              )}
                              aria-label={`Tower ${t} level ${level} ${item}`}
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
          </table>
        </div>
        <p className="px-4 py-3 text-xs text-muted">Tap a cell for scope, material and drawing. Values are %.</p>
      </Card>

      {sel && detail ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-ink/30" onClick={() => setSel(null)}>
          <aside
            className="flex h-full w-full max-w-md flex-col overflow-y-auto bg-surface p-5 shadow-[0_8px_40px_rgba(15,23,36,0.18)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  Tower {sel.tower} · Level {sel.level}
                </p>
                <h2 className="mt-1 font-display text-xl font-semibold">{sel.item}</h2>
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
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="accent">{detail.meta?.package}</Badge>
              <Badge>{detail.meta?.short}</Badge>
            </div>
            <p className="mt-4 text-sm text-muted">{detail.meta?.detail}</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted">Tower A</p>
                <p className="mt-1 font-display text-lg font-semibold tabular-nums">{pct(detail.a)}</p>
                <div className="mt-2">
                  <Meter value={detail.a ?? 0} />
                </div>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted">Tower B</p>
                <p className="mt-1 font-display text-lg font-semibold tabular-nums">{pct(detail.b)}</p>
                <div className="mt-2">
                  <Meter value={detail.b ?? 0} />
                </div>
              </div>
            </div>
            <h3 className="mt-6 text-sm font-semibold">Related material</h3>
            {detail.mats.length ? (
              <ul className="mt-2 space-y-2 text-sm">
                {detail.mats.map((m) => (
                  <li key={m.material} className="flex justify-between gap-3 border-b border-border py-2">
                    <span>{m.material}</span>
                    <span className="tabular-nums text-muted">bal {m.balance}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted">No material line mapped.</p>
            )}
            {detail.meta?.drawing ? (
              <Link
                to="/library"
                search={{ dwg: detail.meta.drawing }}
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-ink px-4 text-sm font-medium text-accent-fg"
              >
                Open drawing {detail.meta.drawing}
              </Link>
            ) : null}
          </aside>
        </div>
      ) : null}
    </div>
  );
}
