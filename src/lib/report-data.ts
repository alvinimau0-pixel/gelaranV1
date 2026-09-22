import seed from "./report-seed.json";

/** Site report seed (MEP matrix, teams, daily report). */
export const report = seed as typeof seed & {
  items: string[];
  cw: string[];
  fw: string[];
  san: string[];
  irr: string[];
  vo: string[];
  progression: {
    A: { level: string; items: Record<string, number | null> }[];
    B: { level: string; items: Record<string, number | null> }[];
  };
  teams: { team: string; leader: string; assistants: string[] }[];
  people: { name: string; rate: number | string; onSite: number; costToday: number }[];
  site: {
    overall: number;
    coldWater: number;
    sanitary: number;
    irrigation: number;
    men: number;
    dayRm: number;
    weather: string;
    shift: string;
    today: string;
    blockers: string | null;
    tomorrow: string | null;
  };
  dailyReport: {
    date: string;
    project: string;
    totalWorkers: number;
    workHours: { start: string; finish: string };
    subcontractors: { name: string; scope: string; workers: number }[];
    laborDistribution: { label: string; workers: number; color: string }[];
    activities: { level?: string; tower?: "A" | "B"; scope: string; workers: string }[];
  };
};
