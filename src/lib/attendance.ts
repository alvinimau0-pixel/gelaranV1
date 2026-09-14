import { report } from "@/lib/report-data";

export const YEAR = 2026;
export const MONTH = 9;
export const DAYS = 31;
export const REPORT_DAY = 12;

export type Mark = "P" | "A" | "O" | "";

export const CREW = Array.from(new Set(report.people.map((p) => p.name)));

export function isWeekend(day: number) {
  const d = new Date(Date.UTC(YEAR, MONTH - 1, day));
  const wd = d.getUTCDay();
  return wd === 0 || wd === 6;
}

function key(name: string, day: number) {
  return `${name}::${day}`;
}

function seed(): Record<string, Mark> {
  const out: Record<string, Mark> = {};
  for (const name of CREW) {
    for (let d = 1; d <= DAYS; d++) {
      if (isWeekend(d)) out[key(name, d)] = "O";
      else if (d <= REPORT_DAY) out[key(name, d)] = "P";
      else out[key(name, d)] = "";
    }
  }
  return out;
}

const STORAGE = "msk-attendance-2026-09";

export function loadAttendance(): Record<string, Mark> {
  const base = seed();
  if (typeof window === "undefined") return base;
  try {
    const raw = localStorage.getItem(STORAGE);
    if (!raw) return base;
    return { ...base, ...(JSON.parse(raw) as Record<string, Mark>) };
  } catch {
    return base;
  }
}

export function saveAttendance(map: Record<string, Mark>) {
  localStorage.setItem(STORAGE, JSON.stringify(map));
}

export function cycleMark(current: Mark, weekend: boolean): Mark {
  if (weekend) {
    if (current === "O") return "P";
    if (current === "P") return "A";
    return "O";
  }
  if (current === "P") return "A";
  if (current === "A") return "";
  return "P";
}

export function markAt(map: Record<string, Mark>, name: string, day: number): Mark {
  return map[key(name, day)] ?? "";
}

export function setMark(map: Record<string, Mark>, name: string, day: number, mark: Mark) {
  return { ...map, [key(name, day)]: mark };
}

export function countForDay(map: Record<string, Mark>, day: number, mark: Mark) {
  return CREW.filter((n) => markAt(map, n, day) === mark).length;
}

export function countForName(map: Record<string, Mark>, name: string, mark: Mark) {
  let n = 0;
  for (let d = 1; d <= DAYS; d++) if (markAt(map, name, d) === mark) n += 1;
  return n;
}
