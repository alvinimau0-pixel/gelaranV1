import meta from "./seed-meta.json";
import prog from "./seed-prog.json";

export type ProgressRow = {
  level: string;
  items: Record<string, number | null>;
};

export type ProgressionData = {
  A: ProgressRow[];
  B: ProgressRow[];
};

export type MaterialOrder = {
  package: string;
  material: string;
  unit: string;
  qtyFloor: number;
  remainingA: number;
  remainingB: number;
  required: number;
  ordered: number;
  balance: number;
  status: string;
};

export type AipoonLine = {
  desc: string;
  unit: string;
  qty: number;
  rate: number;
  done: number;
  amount: number;
};

export type AriyanLine = AipoonLine & { section: string };

export type DailyActivity = {
  scope: string;
  workers: string;
  level?: string;
  tower?: string;
};

export type DailyReport = {
  date: string;
  project: string;
  totalWorkers: number;
  workHours: { start: string; finish: string };
  subcontractors: { name: string; scope: string; workers: number }[];
  laborDistribution: { label: string; workers: number; color: string }[];
  activities: DailyActivity[];
};

export type ReportData = Omit<
  typeof meta,
  "floors" | "orders" | "aipoon" | "ariyan" | "itemGaps" | "dailyReport"
> & {
  floors: { level: string; a: number; b: number }[];
  orders: MaterialOrder[];
  aipoon: AipoonLine[];
  ariyan: AriyanLine[];
  itemGaps: unknown[];
  dailyReport: DailyReport;
  progression: ProgressionData;
};

export const report = { ...meta, ...prog } as unknown as ReportData;
