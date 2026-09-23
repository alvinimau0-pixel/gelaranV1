import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, Stat } from "@/components/ui";
import { getLatestDailySummary, listDailySummaries, type DailySummary } from "@/lib/daily-summary";
import { pct } from "@/lib/utils";

export const Route = createFileRoute("/daily-summary")({ component: DailySummaryPage });

function DailySummaryPage() {
  const [latest, setLatest] = useState<DailySummary | null>(null);
  const [history, setHistory] = useState<DailySummary[]>([]);

  useEffect(() => {
    void Promise.all([getLatestDailySummary(), listDailySummaries({ data: { limit: 14 } })])
      .then(([current, rows]) => {
        setLatest(current);
        setHistory(rows);
      })
      .catch((error) => console.error("[daily-summary] history load failed", error));
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-accent">Automated report</p>
        <h1 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">Daily manpower & tower progress</h1>
        <p className="mt-1 text-xs text-muted sm:text-sm">Generated automatically every day at 7:00 PM Malaysia time.</p>
      </div>
      {latest ? (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="Present" value={String(latest.attendance.present)} />
            <Stat label="Absent" value={String(latest.attendance.absent)} delay={40} />
            <Stat label="Direct / sub" value={`${latest.attendance.direct} / ${latest.attendance.subcontractor}`} delay={80} />
            <Stat label="Overall progress" value={pct(latest.towers.overall)} delay={120} />
          </div>
          <Card>
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2"><div><h2 className="font-display text-base font-semibold sm:text-lg">Latest · {latest.summaryDate}</h2><p className="text-xs text-muted">Attendance symbols: 8-7, 8-10, MC, ABSENT, OFF</p></div><span className="text-xs text-muted">Tower A {pct(latest.towers.A)} · Tower B {pct(latest.towers.B)}</span></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[620px] border-collapse text-left text-xs"><thead><tr className="bg-surface-2 text-[10px] uppercase tracking-wide text-muted"><th className="px-3 py-2">Worker</th><th className="px-3 py-2">Type</th><th className="px-3 py-2">Attendance</th><th className="px-3 py-2">Time</th></tr></thead><tbody>{latest.workers.map((worker) => <tr key={worker.name} className="border-t border-border/70"><td className="px-3 py-2 font-medium">{worker.name}</td><td className="px-3 py-2 text-muted">{worker.workerType}</td><td className="px-3 py-2">{worker.status}</td><td className="px-3 py-2 font-mono text-muted">{worker.time ?? "—"}</td></tr>)}</tbody></table></div>
          </Card>
        </>
      ) : <Card><p className="text-sm text-muted">No daily summary has been generated yet. The first one will be created at 7:00 PM Malaysia time.</p></Card>}
      <Card>
        <h2 className="mb-3 font-display text-base font-semibold sm:text-lg">Report history</h2>
        <div className="overflow-x-auto"><table className="w-full min-w-[680px] border-collapse text-left text-xs"><thead><tr className="bg-surface-2 text-[10px] uppercase tracking-wide text-muted"><th className="px-3 py-2">Date</th><th className="px-3 py-2">Present</th><th className="px-3 py-2">Absent</th><th className="px-3 py-2">MC / Off</th><th className="px-3 py-2">Direct / sub</th><th className="px-3 py-2">Tower A</th><th className="px-3 py-2">Tower B</th><th className="px-3 py-2">Overall</th></tr></thead><tbody>{history.map((row) => <tr key={row.summaryDate} className="border-t border-border/70"><td className="px-3 py-2 font-medium">{row.summaryDate}</td><td className="px-3 py-2 font-mono">{row.attendance.present}</td><td className="px-3 py-2 font-mono">{row.attendance.absent}</td><td className="px-3 py-2 font-mono">{row.attendance.mc} / {row.attendance.off}</td><td className="px-3 py-2 font-mono">{row.attendance.direct} / {row.attendance.subcontractor}</td><td className="px-3 py-2 font-mono">{pct(row.towers.A)}</td><td className="px-3 py-2 font-mono">{pct(row.towers.B)}</td><td className="px-3 py-2 font-mono font-semibold">{pct(row.towers.overall)}</td></tr>)}</tbody></table></div>
      </Card>
    </div>
  );
}
