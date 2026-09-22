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
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">Attendance</h1>
        <p className="mt-1 text-xs text-muted sm:text-sm">
          {today.iso} (Malaysia time) · Use Groq Operator to mark attendance.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        <Stat label="Total workers" value={String(workers.length)} />
        <Stat label="Present today" value={String(presentToday)} delay={40} />
        <Stat label="Absent today" value={String(absentToday)} delay={80} />
        <Stat label="Leave / Off today" value={String(leaveToday + offToday)} delay={120} />
      </div>

      <Card>
        <h2 className="mb-3 font-display text-base font-semibold sm:mb-4 sm:text-lg">Worker directory</h2>
        <p className="mb-3 text-xs text-muted">Attendance changes are authorized through Groq Operator.</p>
        <div className="grid gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
          {workers.map((w) => {
            const mark = map[key(w.id, today.day)] ?? "";
            return (
              <div key={w.id} className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 p-2.5 sm:p-3">
                <div className="relative size-10 shrink-0 overflow-hidden rounded-full border border-border bg-surface sm:size-12">
                  {w.photoUrl ? (
                    <img src={w.photoUrl} alt={w.name} width={96} height={96} loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-subtle">
                      {w.name.slice(0, 2)}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium leading-snug">{w.name}</p>
                  <p className="truncate text-[11px] text-muted">{w.team ?? "Unassigned"}</p>
                </div>
                <span className={cn("flex h-8 w-10 shrink-0 items-center justify-center rounded-md text-sm font-semibold sm:h-9 sm:w-12", TONE[mark])}>
                  {mark || "·"}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 font-display text-base font-semibold sm:mb-4 sm:text-lg">Teams</h2>
        <div className="grid gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
          {report.teams.map((t) => (
            <div key={t.team} className="rounded-lg border border-border bg-surface-2 p-3 sm:p-4">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted sm:text-xs">{t.team}</p>
              <p className="mt-1 font-display text-base font-semibold sm:text-lg">{t.leader}</p>
              <p className="mt-1 text-xs text-muted sm:text-sm">
                {t.assistants.length ? t.assistants.join(", ") : "No assistants"}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 sm:px-4 sm:py-3">
          <h2 className="font-display text-base font-semibold sm:text-lg">{monthLabel} register</h2>
          <p className="text-[10px] text-muted sm:text-xs">P present · A absent · L leave · O off</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-center text-[10px] sm:min-w-[900px] sm:text-xs">
            <caption className="sr-only">{monthLabel} attendance register for all workers</caption>
            <thead>
              <tr>
                <th scope="col" className="sticky left-0 z-10 bg-surface-2 px-2 py-1.5 text-left font-semibold uppercase tracking-wide text-muted sm:px-3 sm:py-2">
                  Name
                </th>
                {days.map((d) => {
                  const wd = weekdayOf(today.year, today.month, d);
                  return (
                    <th
                      key={d}
                      scope="col"
                      className={cn(
                        "min-w-6 bg-surface-2 px-0.5 py-1.5 font-semibold tabular-nums text-muted sm:min-w-8 sm:px-1 sm:py-2",
                        wd === 6 && "text-subtle",
                        wd === 0 && "text-accent",
                        d === today.day && "text-ink",
                      )}
                      title={wd === 0 ? "Sunday — working day" : undefined}
                    >
                      {d}
                    </th>
                  );
                })}
                <th scope="col" className="bg-surface-2 px-1.5 py-1.5 font-semibold text-muted sm:px-2 sm:py-2">P</th>
                <th scope="col" className="bg-surface-2 px-1.5 py-1.5 font-semibold text-muted sm:px-2 sm:py-2">A</th>
              </tr>
            </thead>
            <tbody>
              {workers.map((w) => (
                <tr key={w.id}>
                  <th scope="row" className="sticky left-0 bg-surface px-2 py-0.5 text-left text-[11px] font-medium sm:px-3 sm:py-1 sm:text-xs">
                    {w.name}
                  </th>
                  {days.map((d) => {
                    const m = map[key(w.id, d)] ?? "";
                    return (
                      <td key={d} aria-label={`${w.name} day ${d} ${m || "blank"}`} className="p-0.5">
                        <span
                          className={cn(
                            "flex h-6 w-full items-center justify-center rounded-xs font-medium sm:h-8",
                            TONE[m],
                            d === today.day && "ring-1 ring-ink/30",
                          )}
                        >
                          {m || "·"}
                        </span>
                      </td>
                    );
                  })}
                  <td className="px-1.5 font-mono tabular-nums text-ok sm:px-2">{countForWorker(w.id, "P")}</td>
                  <td className="px-1.5 font-mono tabular-nums text-bad sm:px-2">{countForWorker(w.id, "A")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="px-3 py-2 text-[10px] text-muted sm:px-4 sm:text-xs">Swipe sideways to see all days.</p>
      </Card>
    </div>
  );
}
