import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { report } from "@/lib/report-data";
import { Card, Stat } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  listWorkers,
  listAttendanceForMonth,
  ensureAttendanceThroughToday,
  setAttendance,
  setWorkerType,
  todayInKualaLumpur,
  daysInMonth,
  weekdayOf,
  type Worker,
  type AttendanceStatus,
} from "@/lib/attendance";
import { getAccessRole, type AccessRole } from "@/lib/auth/roles";

export const Route = createFileRoute("/manpower")({ component: Manpower });

type Mark = "P" | "A" | "O" | "L" | "";
type AttendanceTime = { checkIn: string | null; checkOut: string | null };

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

function shortTime(value: string | null) {
  if (!value) return "";
  const [hours, minutes] = value.slice(0, 5).split(":");
  return `${Number(hours)}${minutes === "00" ? "" : `:${minutes}`}`;
}

function cellLabel(mark: Mark, time: AttendanceTime | undefined) {
  if (mark === "P") return `${shortTime(time?.checkIn ?? "08:00")}-${shortTime(time?.checkOut ?? "19:00")}`;
  if (mark === "L") return "MC";
  if (mark === "A") return "ABSENT";
  if (mark === "O") return "OFF";
  return "·";
}

function Manpower() {
  const today = useMemo(() => todayInKualaLumpur(), []);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [map, setMap] = useState<Record<string, Mark>>({});
  const [timeMap, setTimeMap] = useState<Record<string, AttendanceTime>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [access, setAccess] = useState<AccessRole>({ authenticated: false, role: "viewer" });
  const canEdit = access.role === "supervisor";

  const days = useMemo(
    () => Array.from({ length: daysInMonth(today.year, today.month) }, (_, i) => i + 1),
    [today.year, today.month],
  );

  useEffect(() => {
    void getAccessRole().then(setAccess).catch((error) => console.error("[manpower] role load failed:", error));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadAttendance = async () => {
      try {
        await ensureAttendanceThroughToday({ data: { year: today.year, month: today.month, throughDay: today.day } });
        const [w, a] = await Promise.all([
          listWorkers(),
          listAttendanceForMonth({ data: { year: today.year, month: today.month } }),
        ]);
        if (cancelled) return;
        setWorkers(w);
        const next: Record<string, Mark> = {};
        const nextTimes: Record<string, AttendanceTime> = {};
        for (const row of a) {
          const day = Number(row.attendanceDate.slice(8, 10));
          next[key(row.workerId, day)] = STATUS_TO_MARK[row.status];
          nextTimes[key(row.workerId, day)] = { checkIn: row.checkIn, checkOut: row.checkOut };
        }
        setMap(next);
        setTimeMap(nextTimes);
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
  }, [today.year, today.month, today.day]);

  const directWorkers = workers.filter((worker) => worker.workerType === "Direct");
  const subcontractorWorkers = workers.filter((worker) => worker.workerType === "Subcontractor");

  const presentToday = workers.filter((w) => (map[key(w.id, today.day)] ?? "") === "P").length;
  const absentToday = workers.filter((w) => (map[key(w.id, today.day)] ?? "") === "A").length;
  const leaveToday = workers.filter((w) => (map[key(w.id, today.day)] ?? "") === "L").length;
  const offToday = workers.filter((w) => (map[key(w.id, today.day)] ?? "") === "O").length;

  function countForWorker(workerId: number, mark: Mark) {
    let n = 0;
    for (const d of days) if ((map[key(workerId, d)] ?? "") === mark) n += 1;
    return n;
  }

  function dateForDay(day: number) {
    return `${today.year}-${String(today.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  async function cycleAttendance(workerId: number, day: number) {
    if (!canEdit || day > today.day) return;
    const cellKey = key(workerId, day);
    const current = map[cellKey] ?? "";
    const currentTime = timeMap[cellKey];
    const next: Mark = current === "P" && currentTime?.checkOut === "19:00" ? "P" : current === "P" ? "L" : current === "L" ? "A" : current === "A" ? "O" : current === "O" ? "" : "P";
    const status = next === "P" ? "Present" : next === "A" ? "Absent" : next === "L" ? "Leave" : next === "O" ? "Off" : null;
    const nextTime: AttendanceTime = next === "P" ? { checkIn: "08:00", checkOut: current === "P" ? "22:00" : "19:00" } : { checkIn: null, checkOut: null };
    setSavingKey(cellKey);
    setMap((previous) => ({ ...previous, [cellKey]: next }));
    setTimeMap((previous) => ({ ...previous, [cellKey]: nextTime }));
    try {
      await setAttendance({ data: { workerId, date: dateForDay(day), status, checkIn: nextTime.checkIn, checkOut: nextTime.checkOut } });
      window.dispatchEvent(new Event("gelaran:attendance-updated"));
    } catch (error) {
      console.error("[manpower] attendance save failed:", error);
      setMap((previous) => ({ ...previous, [cellKey]: current }));
      setTimeMap((previous) => ({ ...previous, [cellKey]: timeMap[cellKey] ?? { checkIn: null, checkOut: null } }));
    } finally {
      setSavingKey(null);
    }
  }

  async function changeWorkerType(workerId: number, workerType: "Direct" | "Subcontractor") {
    if (!canEdit) return;
    await setWorkerType({ data: { workerId, workerType } });
    setWorkers((previous) => previous.map((worker) => worker.id === workerId ? { ...worker, workerType } : worker));
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
          {today.iso} (Malaysia time) · {canEdit ? "Supervisor editing enabled." : "Read-only view — supervisor access is required to edit."}
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
        <p className="mb-3 text-xs text-muted">{canEdit ? "Attendance changes and manpower classification are enabled for supervisors." : "Attendance symbols and manpower classification are locked. Sign in with a supervisor account to edit."}</p>
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
                  <p className="truncate text-[11px] text-muted">{w.team ?? "Unassigned"} · {w.workerType}</p>
                </div>
                <span className={cn("flex h-8 min-w-16 shrink-0 items-center justify-center rounded-md px-1 text-[11px] font-semibold sm:h-9 sm:min-w-20 sm:text-xs", TONE[mark])}>
                  {cellLabel(mark, timeMap[key(w.id, today.day)])}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2 sm:mb-4">
          <div>
            <h2 className="font-display text-base font-semibold sm:text-lg">Manpower split</h2>
            <p className="mt-1 text-xs text-muted">Correct the classification below; totals and attendance stay synchronized.</p>
          </div>
          <div className="flex gap-2 text-xs font-semibold"><span className="rounded-full bg-accent/15 px-2.5 py-1 text-accent">Direct {directWorkers.length}</span><span className="rounded-full bg-blue-500/15 px-2.5 py-1 text-blue-700">Subcontractor {subcontractorWorkers.length}</span></div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {workers.map((worker) => (
            <label key={worker.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-2 px-3 py-2.5">
              <span className="min-w-0"><span className="block truncate text-sm font-medium">{worker.name}</span><span className="block truncate text-[11px] text-muted">{worker.subcontractor ?? worker.team ?? "Unassigned"}</span></span>
              <select disabled={!canEdit} value={worker.workerType} onChange={(event) => void changeWorkerType(worker.id, event.target.value as "Direct" | "Subcontractor")} className="min-h-9 rounded-md border border-border bg-surface px-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60">
                <option value="Direct">Direct worker</option>
                <option value="Subcontractor">Subcontractor</option>
              </select>
            </label>
          ))}
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
          <p className="text-[10px] text-muted sm:text-xs">Click a past/today cell: 8–7 → 8–10 → MC → ABSENT → OFF → blank</p>
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
                  <th scope="row" className="sticky left-0 z-[1] bg-surface px-2 py-0.5 text-left text-[11px] font-medium sm:px-3 sm:py-1 sm:text-xs">
                    <span className="block">{w.name}</span><span className="text-[9px] font-normal text-muted">{w.workerType === "Direct" ? "Direct" : "Sub"}</span>
                  </th>
                  {days.map((d) => {
                    const cellKey = key(w.id, d);
                    const m = map[cellKey] ?? "";
                    return (
                      <td key={d} aria-label={`${w.name} day ${d} ${cellLabel(m, timeMap[cellKey])}`} className="p-0.5">
                        <button
                          type="button"
                          onClick={() => void cycleAttendance(w.id, d)}
                          disabled={!canEdit || d > today.day || savingKey === key(w.id, d)}
                          title={!canEdit ? "Supervisor access required" : d > today.day ? "Future date" : "Edit attendance time or status"}
                          className={cn(
                            "flex h-7 min-w-12 w-full items-center justify-center rounded-xs px-0.5 text-[9px] font-medium leading-none transition-colors hover:ring-2 hover:ring-accent/50 disabled:cursor-not-allowed disabled:opacity-50 sm:h-8 sm:min-w-14 sm:text-[10px]",
                            TONE[m],
                            d === today.day && "ring-1 ring-ink/30",
                          )}
                        >
                          {cellLabel(m, timeMap[cellKey])}
                        </button>
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
