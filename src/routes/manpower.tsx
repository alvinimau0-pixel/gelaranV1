import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { report } from "@/lib/report-data";
import { Card, Stat } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  CREW,
  DAYS,
  REPORT_DAY,
  countForDay,
  countForName,
  cycleMark,
  isWeekend,
  loadAttendance,
  markAt,
  saveAttendance,
  setMark,
  type Mark,
} from "@/lib/attendance";

export const Route = createFileRoute("/manpower")({ component: Manpower });

const TONE: Record<Mark, string> = {
  P: "bg-ok-bg text-ok",
  A: "bg-bad-bg text-bad",
  O: "bg-surface-2 text-subtle",
  "": "bg-surface text-subtle",
};

function Manpower() {
  const [map, setMap] = useState<Record<string, Mark>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setMap(loadAttendance());
    setReady(true);
  }, []);
  const presentToday = countForDay(map, REPORT_DAY, "P");
  const absentToday = countForDay(map, REPORT_DAY, "A");

  const days = useMemo(() => Array.from({ length: DAYS }, (_, i) => i + 1), []);

  function toggle(name: string, day: number) {
    if (!ready) return;
    const next = setMark(map, name, day, cycleMark(markAt(map, name, day), isWeekend(day)));
    setMap(next);
    saveAttendance(next);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Attendance</h1>
        <p className="mt-1 text-sm text-muted">
          September 2026 · tap a cell to cycle Present / Absent / blank. Weekends start as Off.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Crew list" value={String(CREW.length)} hint="Unique names" />
        <Stat label={`Present ${REPORT_DAY} Sep`} value={String(presentToday)} delay={40} />
        <Stat label="Absent that day" value={String(absentToday)} delay={80} />
      </div>

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
          <h2 className="font-display text-lg font-semibold">September register</h2>
          <p className="text-xs text-muted">P present · A absent · O off</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-center text-xs">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-surface-2 px-3 py-2 text-left font-semibold uppercase tracking-wide text-muted">
                  Name
                </th>
                {days.map((d) => (
                  <th
                    key={d}
                    className={cn(
                      "min-w-8 bg-surface-2 px-1 py-2 font-semibold tabular-nums text-muted",
                      isWeekend(d) && "text-subtle",
                      d === REPORT_DAY && "text-ink",
                    )}
                  >
                    {d}
                  </th>
                ))}
                <th className="bg-surface-2 px-2 py-2 font-semibold text-muted">P</th>
                <th className="bg-surface-2 px-2 py-2 font-semibold text-muted">A</th>
              </tr>
            </thead>
            <tbody>
              {CREW.map((name) => (
                <tr key={name}>
                  <td className="sticky left-0 bg-surface px-3 py-1 text-left font-medium">{name}</td>
                  {days.map((d) => {
                    const m = markAt(map, name, d);
                    return (
                      <td key={d} className="p-0.5">
                        <button
                          type="button"
                          onClick={() => toggle(name, d)}
                          className={cn(
                            "flex h-8 w-full items-center justify-center rounded-xs font-medium",
                            TONE[m],
                            d === REPORT_DAY && "ring-1 ring-ink/30",
                          )}
                          aria-label={`${name} day ${d} ${m || "blank"}`}
                        >
                          {m || "·"}
                        </button>
                      </td>
                    );
                  })}
                  <td className="px-2 font-mono tabular-nums text-ok">{countForName(map, name, "P")}</td>
                  <td className="px-2 font-mono tabular-nums text-bad">{countForName(map, name, "A")}</td>
                </tr>
              ))}
              <tr>
                <td className="sticky left-0 bg-surface-2 px-3 py-2 text-left font-semibold">Headcount P</td>
                {days.map((d) => (
                  <td key={d} className="bg-surface-2 px-1 py-2 font-mono tabular-nums text-muted">
                    {countForDay(map, d, "P")}
                  </td>
                ))}
                <td className="bg-surface-2" />
                <td className="bg-surface-2" />
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
