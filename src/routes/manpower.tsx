import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { report } from "@/lib/report-data";
import { Card, Stat } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  listWorkers,
  listAttendanceForMonth,
  setAttendance,
  saveWorkerPhoto,
  todayInKualaLumpur,
  daysInMonth,
  weekdayOf,
  type Worker,
  type AttendanceStatus,
} from "@/lib/attendance";
import { compressImageToBase64 } from "@/lib/image-compress";

export const Route = createFileRoute("/manpower")({ component: Manpower });

type Mark = "P" | "A" | "O" | "L" | "";

const STATUS_TO_MARK: Record<AttendanceStatus, Mark> = { Present: "P", Absent: "A", Off: "O", Leave: "L" };
const MARK_TO_STATUS: Record<Exclude<Mark, "">, AttendanceStatus> = {
  P: "Present",
  A: "Absent",
  O: "Off",
  L: "Leave",
};
const TONE: Record<Mark, string> = {
  P: "bg-ok-bg text-ok",
  A: "bg-bad-bg text-bad",
  O: "bg-surface-2 text-subtle",
  L: "bg-accent/15 text-accent",
  "": "bg-surface text-subtle",
};
const CYCLE: Mark[] = ["", "P", "A", "L", "O"];

function key(workerId: number, day: number) {
  return `${workerId}::${day}`;
}

function Manpower() {
  const today = useMemo(() => todayInKualaLumpur(), []);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [map, setMap] = useState<Record<string, Mark>>({});
  const [ready, setReady] = useState(false);
  const [busyPhotoId, setBusyPhotoId] = useState<number | null>(null);
  const fileRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const days = useMemo(
    () => Array.from({ length: daysInMonth(today.year, today.month) }, (_, i) => i + 1),
    [today.year, today.month],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
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
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [today.year, today.month]);

  const presentToday = workers.filter((w) => (map[key(w.id, today.day)] ?? "") === "P").length;
  const absentToday = workers.filter((w) => (map[key(w.id, today.day)] ?? "") === "A").length;
  const leaveToday = workers.filter((w) => (map[key(w.id, today.day)] ?? "") === "L").length;
  const offToday = workers.filter((w) => (map[key(w.id, today.day)] ?? "") === "O").length;

  async function toggle(workerId: number, day: number) {
    if (!ready) return;
    const current = map[key(workerId, day)] ?? "";
    const nextMark = CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length];
    setMap((m) => ({ ...m, [key(workerId, day)]: nextMark }));
    const iso = `${today.year}-${String(today.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    try {
      await setAttendance({
        data: { workerId, date: iso, status: nextMark === "" ? null : MARK_TO_STATUS[nextMark] },
      });
    } catch (err) {
      console.error("[manpower] save failed:", err);
      setMap((m) => ({ ...m, [key(workerId, day)]: current })); // never let the grid lie about what saved
    }
  }

  async function onPhotoPick(workerId: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setBusyPhotoId(workerId);
    try {
      const { base64Data, contentType } = await compressImageToBase64(file, 800, 0.8);
      const { photoUrl } = await saveWorkerPhoto({ data: { workerId, contentType, base64Data } });
      setWorkers((ws) => ws.map((w) => (w.id === workerId ? { ...w, photoUrl } : w)));
    } catch (err) {
      console.error("[manpower] photo upload failed:", err);
    } finally {
      setBusyPhotoId(null);
      const input = fileRefs.current[workerId];
      if (input) input.value = "";
    }
  }

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
        <p className="mb-3 text-xs text-muted">Tap a photo to upload or change it.</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {workers.map((w) => {
            const mark = map[key(w.id, today.day)] ?? "";
            return (
              <div key={w.id} className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 p-3">
                <button
                  type="button"
                  onClick={() => fileRefs.current[w.id]?.click()}
                  className="relative size-12 shrink-0 overflow-hidden rounded-full border border-border bg-surface"
                  aria-label={`Change photo for ${w.name}`}
                >
                  {w.photoUrl ? (
                    <img src={w.photoUrl} alt={w.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-subtle">
                      {w.name.slice(0, 2)}
                    </span>
                  )}
                  {busyPhotoId === w.id ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
                      <Camera className="size-4 animate-pulse" />
                    </span>
                  ) : null}
                </button>
                <input
                  ref={(el) => {
                    fileRefs.current[w.id] = el;
                  }}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => onPhotoPick(w.id, e)}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium leading-snug">{w.name}</p>
                  <p className="truncate text-xs text-muted">{w.team ?? "Unassigned team"}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggle(w.id, today.day)}
                  className={cn(
                    "flex h-9 w-12 shrink-0 items-center justify-center rounded-md text-sm font-semibold",
                    TONE[mark],
                  )}
                >
                  {mark || "·"}
                </button>
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
                        <button
                          type="button"
                          onClick={() => toggle(w.id, d)}
                          className={cn(
                            "flex h-8 w-full items-center justify-center rounded-xs font-medium",
                            TONE[m],
                            d === today.day && "ring-1 ring-ink/30",
                          )}
                          aria-label={`${w.name} day ${d} ${m || "blank"}`}
                        >
                          {m || "·"}
                        </button>
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
