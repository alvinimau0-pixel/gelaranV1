import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { computePackageProgress, ITEM_META, PACKAGES, TASK_GROUPS, cellTone, itemsForPackage, normalizeProgress, relatedMaterial, validateProgression } from "@/lib/mep";
import { setItemRange } from "@/lib/progression";
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

const REGISTER_LEVELS = ["13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "31M"] as const;
const WORK_ITEM_REGISTER = [
  ["Cold Water", "Water connection and meter", ""],
  ["Cold Water", "Water tanks and break tank", ""],
  ["Cold Water", "Main water pipework and distribution", ""],
  ["Cold Water", "Booster pump and controls", "77%"],
  ["Cold Water", "Valves, gauges and backflow protection", ""],
  ["Cold Water", "Pipe sleeves, supports and fire stopping", ""],
  ["Cold Water", "Flushing, disinfection and water sampling", ""],
  ["Flush Water", "Flush-water separation and labels", ""],
  ["Flush Water", "Flush-water tanks and tank connection", ""],
  ["Flush Water", "Flush-water booster pump and pressure tank", ""],
  ["Flush Water", "Flush-water main pipes and floor distribution", "-"],
  ["Flush Water", "Toilet flushing pipe connections", ""],
  ["Flush Water", "Flush-water testing and commissioning", ""],
  ["Sanitary", "Toilet soil, waste and vent pipe risers", ""],
  ["Sanitary", "Toilet stack pipes and branch outlets", ""],
  ["Sanitary", "Toilet pipe outlets and wall hacking", "37%"],
  ["Sanitary", "Floor traps, waste pipes and access points", ""],
  ["Sanitary", "Toilet fixtures, sanitary ware and accessories", ""],
  ["Sanitary", "Toilet drainage, water and air testing", ""],
  ["Variation Orders", "Variation instruction and affected scope", ""],
  ["Variation Orders", "Tank and pipework drawing revisions", ""],
  ["Variation Orders", "Tank changes and pipe rerouting", "-"],
  ["Variation Orders", "Tank accessories: ladders, drains and overflows", ""],
  ["Variation Orders", "Variation testing and technical acceptance", ""],
  ["Variation Orders", "Variation measurement, claim and close-out", ""],
  ["Variation Orders", "Planter box irrigation pipework", ""],
] as const;

function WorkItemRegister() {
  const [filter, setFilter] = useState("All");
  const packages = ["All", "Cold Water", "Flush Water", "Sanitary", "Variation Orders"];
  const rows = filter === "All" ? WORK_ITEM_REGISTER : WORK_ITEM_REGISTER.filter(([pkg]) => pkg === filter);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {packages.map((pkg) => (
          <button key={pkg} type="button" onClick={() => setFilter(pkg)} className={cn("min-h-9 rounded-full px-3 text-xs font-medium sm:min-h-11 sm:px-4 sm:text-sm", filter === pkg ? "bg-ink text-accent-fg" : "bg-surface-2 text-muted hover:text-fg")}>
            {pkg}
          </button>
        ))}
      </div>
      <Card className="p-0">
        <div className="flex flex-wrap items-start justify-between gap-3 px-3 pb-3 pt-3 sm:px-4 sm:pt-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Work item register</p>
            <h2 className="pt-1 font-display text-base font-semibold text-fg sm:text-lg">MEP work plan by level</h2>
            <p className="mt-1 text-xs text-muted">Track each work item across the building levels and monitor overall completion.</p>
          </div>
          <span className="rounded-full bg-accent/10 px-2.5 py-1 text-[10px] font-semibold text-accent">{rows.length} items</span>
        </div>
        <div className="overflow-x-auto border-t border-border">
          <table className="w-full min-w-[1370px] border-collapse text-left text-[10px] lg:text-[11px]" aria-label="Work item register">
            <thead>
              <tr className="bg-surface-2 text-[9px] font-semibold uppercase tracking-wide text-muted">
                <th scope="col" className="sticky left-0 z-10 min-w-36 border-r border-border bg-surface-2 px-3 py-3">Package</th>
                <th scope="col" className="min-w-72 px-3 py-3">Scope / Work Item</th>
                {REGISTER_LEVELS.map((level) => <th key={level} scope="col" className="min-w-12 border-l border-border px-2 py-2 text-center">{level}</th>)}
                <th scope="col" className="min-w-24 border-l border-border px-3 py-3 text-right">Progress</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([pkg, workItem, progress], index) => (
                <tr key={`${pkg}-${workItem}`} className={cn("border-t border-border/70 transition-colors hover:bg-surface-2/60", index > 0 && rows[index - 1]?.[0] !== pkg && "border-t-2 border-t-border")}>
                  <th scope="row" className="sticky left-0 z-[1] border-r border-border bg-surface px-3 py-2.5 font-semibold text-fg"><span className="inline-flex rounded-md bg-accent/10 px-2 py-1 text-[10px] text-accent">{pkg}</span></th>
                  <td className="px-3 py-2.5 font-medium text-fg">{workItem}</td>
                  {REGISTER_LEVELS.map((level) => <td key={`${index}-${level}`} className="border-l border-border/70 px-2 py-2 text-center text-subtle">—</td>)}
                  <td className="border-l border-border px-3 py-2.5 text-right font-mono font-bold text-fg">{progress ? <span className={cn("inline-flex min-w-12 justify-center rounded-md px-2 py-1", progress === "-" ? "bg-surface-2 text-subtle" : "bg-accent/10 text-accent")}>{progress}</span> : <span className="text-subtle">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export function MepMatrix({ tower }: { tower?: "A" | "B" }) {
  if (!tower) return <WorkItemRegister />;
  const report = useAppStore((s) => s.report);
  const [pkg, setPkg] = useState<(typeof PACKAGES)[number]>("All");
  const [sel, setSel] = useState<Sel | null>(null);
  const [draftPercent, setDraftPercent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [view, setView] = useState<"both" | "A" | "B">(tower ?? "both");
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLElement | null>(null);
  const items = itemsForPackage(pkg);
  const levels = report.progression.A.map((r) => r.level);
  const towers: ("A" | "B")[] = view === "both" ? ["A", "B"] : [view];
  const validationIssues = validateProgression(report.progression, items);
  const packageProgress = (code: keyof typeof TASK_GROUPS) => {
    const packageName = code === "CW" ? "Cold Water" : code === "FW" ? "Flush Water" : code === "SAN" ? "Sanitary" : code === "VO" ? "VO" : null;
    if (!packageName) return null;
    const packageItems = report.items.filter((item) => ITEM_META[item]?.package === packageName || (packageName === "VO" && ITEM_META[item]?.package === "Irrigation"));
    const values = (["A", "B"] as const).flatMap((t) => report.progression[t].flatMap((row) => packageItems.map((item) => row.items[item] ?? null))).filter((value): value is number => value != null);
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
  };
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

  useEffect(() => {
    if (!sel || !detail) {
      setDraftPercent("");
      return;
    }
    const current = sel.tower === "A" ? detail.a : detail.b;
    setDraftPercent(current == null ? "0" : String(Math.round(current * 100)));
    setSaveError(null);
  }, [sel, detail?.a, detail?.b]);

  const selectCell = (t: "A" | "B", level: string, item: string) =>
    setSel({ tower: t, level, item });

  async function saveCell() {
    if (!sel) return;
    const percent = Number(draftPercent);
    if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
      setSaveError("Enter a percentage from 0 to 100.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const result = await setItemRange({
        data: {
          tower: sel.tower,
          item: sel.item,
          levelFrom: Number(sel.level),
          levelTo: Number(sel.level),
          value: percent / 100,
        },
      });
      const pkgs = computePackageProgress(result.progression);
      const store = useAppStore.getState();
      store.updateReport({ progression: result.progression });
      store.updateSite({
        coldWater: pkgs.coldWater,
        sanitary: pkgs.sanitary,
        irrigation: pkgs.irrigation,
        overall: pkgs.overall,
      });
      window.dispatchEvent(new Event("gelaran:progression-updated"));
      setSel(null);
    } catch (error) {
      console.error("[mep-matrix] save failed", error);
      setSaveError("Could not save this percentage. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (!sel) return;

    const previousTrigger = triggerRef.current;
    const drawer = drawerRef.current;
    const focusable = drawer
      ? Array.from(drawer.querySelectorAll<HTMLElement>('button, a[href], [tabindex]:not([tabindex="-1"])')).filter(
          (element) => !element.hasAttribute("disabled"),
        )
      : [];
    focusable[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setSel(null);
        return;
      }
      if (event.key !== "Tab" || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previousTrigger?.focus();
    };
  }, [sel]);

  return (
    <div className="space-y-3">
      {!tower ? (
        <div className="rounded-xl border border-border bg-surface p-1 shadow-sm">
          <div className="grid grid-cols-3 gap-1" role="tablist" aria-label="Matrix tower view">
            {([
              ["both", "Both towers", "A + B"],
              ["A", "Tower A", "A only"],
              ["B", "Tower B", "B only"],
            ] as const).map(([value, label, hint]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={view === value}
                onClick={() => { setView(value); setSel(null); }}
                className={cn(
                  "min-h-12 rounded-lg px-2 py-2 text-left transition-[background-color,color,box-shadow]",
                  view === value ? "bg-ink text-accent-fg shadow-sm" : "text-muted hover:bg-surface-2 hover:text-fg",
                )}
              >
                <span className="block text-xs font-semibold sm:text-sm">{label}</span>
                <span className={cn("mt-0.5 block text-[10px]", view === value ? "text-accent-fg/70" : "text-subtle")}>{hint}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Showing {view === "both" ? "both towers" : `Tower ${view}`} · {levels.length} levels
        </p>
      </div>

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
              title={p}
            >
            {p}
            </button>
        ))}
      </div>

      <Card className="p-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="px-3 pt-3 text-xs font-semibold uppercase tracking-wide text-muted sm:px-4 sm:pt-4">Work item register</p>
            <h2 className="px-3 pb-3 pt-1 font-display text-base font-semibold text-fg sm:px-4 sm:pb-4">Full scope and package progress</h2>
          </div>
              <span className="mr-3 mt-3 rounded-full bg-accent/10 px-2.5 py-1 text-[10px] font-semibold text-accent sm:mr-4 sm:mt-4">{pkg}</span>
        </div>
        <div className="overflow-x-auto border-t border-border">
          <table className="w-full min-w-[620px] border-collapse text-left text-[10px]" aria-label="MEP package task key">
            <caption className="sr-only">Full-name task breakdown synchronized with the shared MEP progression</caption>
            <thead>
              <tr className="bg-surface-2 text-[9px] font-semibold uppercase tracking-wide text-muted">
                <th scope="col" className="px-3 py-2 sm:px-4">Package</th>
                <th scope="col" className="px-2 py-2">Stage</th>
                <th scope="col" className="px-2 py-2">Work item</th>
                <th scope="col" className="px-2 py-2 text-right sm:px-4">Progress</th>
              </tr>
            </thead>
            <tbody>
              {(Object.entries(TASK_GROUPS) as [keyof typeof TASK_GROUPS, (typeof TASK_GROUPS)[keyof typeof TASK_GROUPS]][])
                .filter(([code]) => pkg === "All" || (pkg === "Cold Water" && code === "CW") || (pkg === "Flush Water" && code === "FW") || (pkg === "Sanitary" && code === "SAN") || (pkg === "VO" && code === "VO"))
                .flatMap(([code, group]) => group.tasks.map((task, index) => (
                  <tr key={task.id} className="border-t border-border/70">
                    <th scope="row" className="px-3 py-2 font-semibold text-fg sm:px-4">{group.label}</th>
                    <td className="px-2 py-2 text-muted">{task.stage}</td>
                    <td className="max-w-[23rem] px-2 py-2 text-fg" title={group.logic}>{task.short}</td>
                    {index === 0 ? <td rowSpan={group.tasks.length} className="px-2 py-2 text-right font-mono font-bold text-fg sm:px-4">{packageProgress(code) == null ? "—" : `${Math.round((packageProgress(code) ?? 0) * 100)}%`}</td> : null}
                  </tr>
                )))
              }
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-[11px] text-muted sm:text-xs">
        <span className="font-semibold text-fg">Color validation</span>
        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-semibold", validationIssues.length ? "bg-bad-bg text-bad" : "bg-ok-bg text-ok")}>
          <span className={cn("size-2 rounded-full", validationIssues.length ? "bg-bad" : "bg-ok")} aria-hidden="true" />
          {validationIssues.length ? `${validationIssues.length} invalid cells` : "All cells valid"}
        </span>
        <span className="h-4 w-px bg-border" aria-hidden="true" />
        <span className="font-semibold text-fg">Progress key · select any cell to edit</span>
        {LEGEND.map((entry) => (
          <span key={entry.label} className="inline-flex items-center gap-1.5 whitespace-nowrap" title={`${entry.label}: ${entry.range}`}>
            <span className={cn("size-2.5 rounded-full shadow-sm", entry.className)} aria-hidden="true" />
            <span>{entry.label} <span className="text-subtle">({entry.range})</span></span>
          </span>
        ))}
      </div>

      <Card className="p-0">
        <div className="hidden overflow-x-auto md:block">
          <table className="table-clear w-full min-w-[1100px] border-collapse text-left text-[10px] lg:text-[11px]" aria-label="MEP progress matrix">
            <thead>
              <tr>
                <th scope="col" className="sticky left-0 z-20 border-b border-border bg-surface-2 px-1.5 py-2 text-center font-semibold uppercase tracking-wide text-fg">
                  Level
                </th>
                {view !== "both" ? null : (
                  <th scope="col" className="border-b border-border bg-surface-2 px-1 py-2 text-center font-semibold uppercase tracking-wide text-fg">
                    Tower
                  </th>
                )}
                {items.map((item) => (
                  <th
                    key={item}
                    scope="col"
                    title={item}
                    className="border-b border-l border-border bg-surface-2 px-1 py-2 text-center font-semibold leading-tight text-fg"
                  >
                    <span className="block max-w-[8rem] whitespace-normal px-0.5 text-[9px] leading-tight lg:max-w-[10rem] lg:text-[10px]">{item}</span>
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
                        <th
                          rowSpan={towers.length}
                          scope="row"
                          className="sticky left-0 z-10 border-b border-border bg-surface px-1.5 py-1 text-center font-semibold text-fg"
                        >
                          {level}
                        </th>
                      ) : null}
                      {view !== "both" ? null : (
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
                              onClick={(event) => {
                                triggerRef.current = event.currentTarget;
                                selectCell(t, level, item);
                              }}
                              className={cn(
                                "flex h-8 w-full items-center justify-center rounded-md font-mono text-[11px] font-bold tabular-nums transition-transform hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink lg:h-9",
                                cellTone(v),
                                active && "ring-2 ring-ink ring-offset-1",
                              )}
                              aria-label={`Tower ${t} level ${level} ${item}: ${v == null ? "not applicable" : `${Math.round(v * 100)} percent`}`}
                              title={`${item}: ${v == null ? "N/A" : `${Math.round(v * 100)}%`}`}
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
                <th scope="row" className="sticky left-0 z-10 bg-ink px-1.5 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-white">Overall</th>
                {view === "both" ? <th scope="col" className="bg-ink px-1 py-2 text-center text-[10px] font-bold text-white">—</th> : null}
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
                    {view === "both" ? <span className="rounded-full bg-ink px-2 py-0.5 text-[10px] font-semibold text-accent-fg">Tower {t}</span> : <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">Tower {t}</span>}
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {items.map((item) => {
                      const v = normalizeProgress(row?.items[item] ?? null);
                      const active = sel?.level === level && sel.item === item && sel.tower === t;
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={(event) => {
                            triggerRef.current = event.currentTarget;
                            selectCell(t, level, item);
                          }}
                          className={cn(
                            "flex min-h-12 items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink",
                            cellTone(v),
                            active && "ring-2 ring-ink ring-offset-1",
                          )}
                          aria-label={`Tower ${t} level ${level} ${item}: ${v == null ? "not applicable" : `${Math.round(v * 100)} percent`}`}
                        >
                          <span className="min-w-0 text-[11px] font-semibold leading-tight" title={item}>{item}</span>
                          <span className="shrink-0 font-mono text-sm font-bold tabular-nums">{v == null ? "—" : `${Math.round(v * 100)}%`}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            }),
          )}
        </div>
      </Card>

      {sel && detail ? (
        <div className="fixed inset-0 z-50 flex justify-end overscroll-contain bg-ink/30" onClick={() => setSel(null)}>
          <aside
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mep-detail-title"
            tabIndex={-1}
            className="flex h-full w-full max-w-md flex-col overflow-y-auto bg-surface p-4 shadow-[0_8px_40px_rgba(15,23,36,0.18)] sm:p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Tower {sel.tower} · Level {sel.level}</p>
                <h2 id="mep-detail-title" className="mt-1 font-display text-lg font-semibold sm:text-xl">{sel.item}</h2>
              </div>
              <button
                type="button"
                className="inline-flex size-11 items-center justify-center rounded-md border border-border"
                onClick={() => setSel(null)}
                aria-label="Close"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2"><Badge tone="accent">{detail.meta?.package === "Irrigation" ? "Variation Orders · Irrigation" : detail.meta?.package}</Badge></div>
            <p className="mt-4 text-sm text-muted">{detail.meta?.detail}</p>
            <div className="mt-5 rounded-xl border border-accent/30 bg-accent/5 p-3">
              <div className="flex items-end gap-3">
                <label className="min-w-0 flex-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted">Edit {sel.tower} · Level {sel.level}</span>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      inputMode="numeric"
                      value={draftPercent}
                      onChange={(event) => setDraftPercent(event.target.value)}
                      className="min-h-11 w-full rounded-lg border border-border bg-surface px-3 font-mono text-lg font-semibold tabular-nums outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                      aria-label={`Edit Tower ${sel.tower} level ${sel.level} ${sel.item} percentage`}
                    />
                    <span className="font-mono text-lg font-semibold text-muted">%</span>
                  </div>
                </label>
                <button
                  type="button"
                  onClick={() => void saveCell()}
                  disabled={saving}
                  className="min-h-11 rounded-lg bg-ink px-4 text-sm font-semibold text-accent-fg disabled:cursor-wait disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
              <p className="mt-2 text-[11px] text-muted">Save updates this tower and level in the shared matrix for every device.</p>
              {saveError ? <p role="alert" className="mt-2 text-xs font-medium text-bad">{saveError}</p> : null}
            </div>
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
