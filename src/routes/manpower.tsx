import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { report } from "@/lib/report-data";
import { Card, Stat } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  listWorkers,
  listAttendanceForMonth,
  todayInKualaLumpur,
  daysInMonth,
  weekdayOf,
  type Worker,
  type AttendanceStatus,
} from "@/lib/attendance";

export const Route = createFileRoute("/manpower")({ component: Manpower });

type Mark = "P" | "A" | "O" | "L" | "";

const STATUS_TO_MARK: Record<AttendanceStatus, Mark> = { Present: "P", Absent: "A", Off: "O", Leave: "L" };
const TONE: Record<Mark, string> = {
  P: "bg-ok-bg text-ok",
  A: "bg-bad-bg text-bad",
  O: "bg-surface-2 text-subtle",
  L: "bg-accent/15 text-accent",
  "": "bg-surface text-subtle",
};

function key(workerId: number, day: number) {
  return `${workerId}::${day}`;
}

function Manpower() {
  const today = useMemo(() => todayInKualaLumpur(), []);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [map, setMap] = useState<Record<string, Mark>>({});

  const days = useMemo(
    () => Array.from({ length: daysInMonth(today.year, today.month) }, (_, i) => i + 1),
    [today.year, today.month],
  );

  useEffect(() => {
    let cancelled = false;
    const loadAttendance = async () => {
      try {
        const [w, a] = await Promise.all([
          listWorkers(),
          listAttendanceForMonth({ data: { year: today.year, month: today.month } }),
        ]);
        if (cancelled) return;
        setWorkers(w);
        const next: Record<string, Mark> = {};
        for (const row of a) {
          const day = Number(row.attendanceDate.slice(8, 10));
          next[key(row.workerId, day)] = STATUS_TO_MARK[row.status];
        }
        setMap(next);
      } catch (err) {
        console.error("[manpower] load failed:", err);
      }
    };
    void loadAttendance();
    const onAttendanceUpdated = () => void loadAttendance();
    window.addEventListener("gelaran:attendance-updated", onAttendanceUpdated);
    return () => {
      cancelled = true;
      window.removeEventListener("gelaran:attendance-updated", onAttendanceUpdated);
    };
  }, [today.year, today.month]);

  const presentToday = workers.filter((w) => (map[key(w.id, today.day)] ?? "") === "P").length;
  const absentToday = workers.filter((w) => (map[key(w.id, today.day)] ?? "") === "A").length;
  const leaveToday = workers.filter((w) => (map[key(w.id, today.day)] ?? "") === "L").length;
  const offToday = workers.filter((w) => (map[key(w.id, today.day)] ?? "") === "O").length;


  function countForWorker(workerId: number, mark: Mark) {
    let n = 0;
    for (const d of days) if ((map[key(workerId, d)] ?? "") === mark) n += 1;
    return n;
  }

  const monthLabel = new Date(Date.UTC(today.year, today.month - 1, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Attendance</h1>
        <p className="mt-1 text-sm text-muted">
          {today.iso} (Malaysia time) · tap a cell to cycle Present / Absent / Leave / Off. Sundays are a
          normal working day (8:00 AM-5:00 PM) and are never auto-marked Off.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Total workers" value={String(workers.length)} />
        <Stat label="Present today" value={String(presentToday)} delay={40} />
        <Stat label="Absent today" value={String(absentToday)} delay={80} />
        <Stat label="Leave / Off today" value={String(leaveToday + offToday)} delay={120} />
      </div>

      <Card>
        <h2 className="mb-4 font-display text-lg font-semibold">Worker directory</h2>
          <p className="mb-3 text-xs text-muted">Attendance changes are managed by the AI assistant.</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {workers.map((w) => {
            const mark = map[key(w.id, today.day)] ?? "";
            return (
              <div key={w.id} className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 p-3">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-full border border-border bg-surface">
                  {w.photoUrl ? (
                    <img src={w.photoUrl} alt={w.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-subtle">
                      {w.name.slice(0, 2)}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium leading-snug">{w.name}</p>
                  <p className="truncate text-xs text-muted">{w.team ?? "Unassigned team"}</p>
                </div>
                <span className={cn("flex h-9 w-12 shrink-0 items-center justify-center rounded-md text-sm font-semibold", TONE[mark])}>
                  {mark || "·"}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 font-display text-lg font-semibold">Teams</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {report.teams.map((t) => (
            <div key={t.team} className="rounded-lg border border-border bg-surface-2 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">{t.team}</p>
              <p className="mt-1 font-display text-lg font-semibold">{t.leader}</p>
              <p className="mt-1 text-sm text-muted">
                {t.assistants.length ? t.assistants.join(", ") : "No assistants listed"}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="font-display text-lg font-semibold">{monthLabel} register</h2>
          <p className="text-xs text-muted">P present · A absent · L leave · O off</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-center text-xs">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-surface-2 px-3 py-2 text-left font-semibold uppercase tracking-wide text-muted">
                  Name
                </th>
                {days.map((d) => {
                  const wd = weekdayOf(today.year, today.month, d);
                  return (
                    <th
                      key={d}
                      className={cn(
                        "min-w-8 bg-surface-2 px-1 py-2 font-semibold tabular-nums text-muted",
                        wd === 6 && "text-subtle",
                        wd === 0 && "text-accent",
                        d === today.day && "text-ink",
                      )}
                      title={wd === 0 ? "Sunday — working 8:00 AM-5:00 PM" : undefined}
                    >
                      {d}
                    </th>
                  );
                })}
                <th className="bg-surface-2 px-2 py-2 font-semibold text-muted">P</th>
                <th className="bg-surface-2 px-2 py-2 font-semibold text-muted">A</th>
              </tr>
            </thead>
            <tbody>
              {workers.map((w) => (
                <tr key={w.id}>
                  <td className="sticky left-0 bg-surface px-3 py-1 text-left font-medium">{w.name}</td>
                  {days.map((d) => {
                    const m = map[key(w.id, d)] ?? "";
                    return (
                      <td key={d} className="p-0.5">
                        <span
                          className={cn(
                            "flex h-8 w-full items-center justify-center rounded-xs font-medium",
                            TONE[m],
                            d === today.day && "ring-1 ring-ink/30",
                          )}
                          aria-label={`${w.name} day ${d} ${m || "blank"}`}
                        >
                          {m || "·"}
                        </span>
                      </td>
                    );
                  })}
                  <td className="px-2 font-mono tabular-nums text-ok">{countForWorker(w.id, "P")}</td>
                  <td className="px-2 font-mono tabular-nums text-bad">{countForWorker(w.id, "A")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
