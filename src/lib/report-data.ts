import meta from "./seed-meta.json";
import prog from "./seed-prog.json";
import approved from "./report-data.json";

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

export type PlannedManpower = {
  total: number;
  direct: number;
  subcontractor: number;
};

export function plannedManpower(
  dailyReport: Pick<DailyReport, "totalWorkers" | "subcontractors">,
): PlannedManpower {
  const subcontractor = dailyReport.subcontractors.reduce(
    (sum, row) => sum + Math.max(0, Number(row.workers) || 0),
    0,
  );
  const total = Math.max(subcontractor, Math.max(0, Number(dailyReport.totalWorkers) || 0));
  return { total, direct: Math.max(0, total - subcontractor), subcontractor };
}

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

const seed = { ...meta, ...prog } as unknown as ReportData;
const approvedData = approved as unknown as Partial<ReportData>;

function fallbackRows<T>(active: T[] | undefined, approvedRows: T[] | undefined): T[] {
  return active?.length ? active : (approvedRows ?? []);
}

function isCoherentDailyReport(value: DailyReport | undefined): value is DailyReport {
  if (!value || !Number.isFinite(value.totalWorkers) || value.totalWorkers < 0) return false;
  const distributionTotal = value.laborDistribution.reduce((sum, row) => sum + row.workers, 0);
  const subcontractorTotal = value.subcontractors.reduce((sum, row) => sum + row.workers, 0);
  return distributionTotal === value.totalWorkers && subcontractorTotal <= value.totalWorkers;
}

function selectDailyReport(
  active: DailyReport | undefined,
  approvedReport: DailyReport | undefined,
): DailyReport {
  if (isCoherentDailyReport(approvedReport)) return approvedReport;
  if (isCoherentDailyReport(active)) return active;
  return (
    active ??
    approvedReport ?? {
      date: "",
      project: "",
      totalWorkers: 0,
      workHours: { start: "", finish: "" },
      subcontractors: [],
      laborDistribution: [],
      activities: [],
    }
  );
}

export const report = {
  ...seed,
  dailyReport: selectDailyReport(seed.dailyReport, approvedData.dailyReport),
  floors: fallbackRows(seed.floors, approvedData.floors),
  orders: fallbackRows(seed.orders, approvedData.orders),
  aipoon: fallbackRows(seed.aipoon, approvedData.aipoon),
  ariyan: fallbackRows(seed.ariyan, approvedData.ariyan),
  aipoonTotal: seed.aipoonTotal || approvedData.aipoonTotal || 0,
  aipoonClaimed: seed.aipoonClaimed || approvedData.aipoonClaimed || 0,
  ariyanTotal: seed.ariyanTotal || approvedData.ariyanTotal || 0,
  ariyanClaimed: seed.ariyanClaimed || approvedData.ariyanClaimed || 0,
} as ReportData;
