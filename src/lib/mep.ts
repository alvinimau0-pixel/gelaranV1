import { report } from "@/lib/report-data";

export type MepPackage = "Cold Water" | "Flush Water" | "Sanitary" | "Irrigation" | "VO";

export type TaskPackage = "CW" | "FW" | "SAN" | "VO";
export type MepTask = {
  id: string;
  stage: "Coordination" | "Installation" | "Testing" | "Commissioning" | "Commercial";
  short: string;
};

export const TASK_GROUPS: Record<TaskPackage, { label: string; logic: string; tasks: MepTask[] }> = {
  CW: { label: "Cold Water", logic: "Floor progress from the 25 September 2026 work matrix.", tasks: [
    { id: "CW-01", stage: "Installation", short: "Pump" },
    { id: "CW-02", stage: "Installation", short: "Pump control panel" },
    { id: "CW-03", stage: "Installation", short: "Pipeline from pump L6 to rooftop A & B" },
    { id: "CW-04", stage: "Installation", short: "Rooftop pipe" },
    { id: "CW-05", stage: "Installation", short: "Tenant inlet and dropper" },
    { id: "CW-06", stage: "Installation", short: "Backshaft CW & FW dropper (Asgar)" },
    { id: "CW-07", stage: "Installation", short: "Backshaft CW & FW distribution (Bilal)" },
    { id: "CW-08", stage: "Installation", short: "AHU dropper inlet and outlet" },
    { id: "CW-09", stage: "Installation", short: "Terrace dropper inlet and outlet" },
    { id: "CW-10", stage: "Installation", short: "High-level inlet UPVC CW outlet (Apoon)" },
  ] },
  FW: { label: "Flush Water", logic: "No separate flush-water column is present in the supplied matrix.", tasks: [] },
  SAN: { label: "Sanitary", logic: "Floor progress from the supplied tenant, hacking, backshaft, sanitary-ware and hosereel columns.", tasks: [
    { id: "SAN-01", stage: "Installation", short: "Tenant outlet and dropper" },
    { id: "SAN-02", stage: "Installation", short: "Hacking and pipe conceal (UPVC and PPR)" },
    { id: "SAN-03", stage: "Installation", short: "Backshaft CW outlet (Sarif)" },
    { id: "SAN-04", stage: "Installation", short: "Sanitary wares (Apoon)" },
    { id: "SAN-05", stage: "Installation", short: "Hosereel" },
  ] },
  VO: { label: "Irrigation", logic: "Landscape inlet, outlet and wiring progress from the supplied matrix.", tasks: [
    { id: "IRR-01", stage: "Installation", short: "Landscape inlet (Rahmatullah)" },
    { id: "IRR-02", stage: "Installation", short: "Landscape outlet (Rahmatullah)" },
    { id: "IRR-03", stage: "Testing", short: "Landscape wiring (Green Simex)" },
  ] },
};

export const ITEM_META: Record<
  string,
  { package: MepPackage; detail: string; drawing: string }
> = {
  PUMP: {
    package: "Cold Water",
    detail: "Transfer / booster pump set at L31 plant. Not applicable on typical floors.",
    drawing: "CW-P-01",
  },
  "PUMP CONTROL PANEL": {
    package: "Cold Water",
    detail: "Pump starter and control panel, L31 plant room.",
    drawing: "CW-P-01",
  },
  "PIPELINE FROM PUMP LEVEL 6 TO ROOFTOP A & B": {
    package: "Cold Water",
    detail: "Pipeline from pump level 6 to rooftop serving Tower A and Tower B.",
    drawing: "CW-P-01",
  },
  "ROOFTOP PIPE": { package: "Cold Water", detail: "Rooftop pipe installation.", drawing: "CW-P-01" },
  "TENANT INLET AND DROPPER": {
    package: "Cold Water",
    detail: "Tenant inlet and dropper installation.",
    drawing: "TYP-FL",
  },
  "BACKSHAFT CW & FW DROPPER (ASGAR)": { package: "Cold Water", detail: "Backshaft CW & FW dropper installation by Asgar.", drawing: "CW-R-01" },
  "BACKSHAFT CW & FW DISTRIBUTION (BILAL)": { package: "Cold Water", detail: "Backshaft CW & FW distribution by Bilal.", drawing: "CW-R-01" },
  "AHU DROPPER INLET AND OUTLET": { package: "Cold Water", detail: "AHU dropper inlet and outlet.", drawing: "CW-R-01" },
  "TERRACE DROPPER INLET AND OUTLET": { package: "Cold Water", detail: "Terrace dropper inlet and outlet.", drawing: "CW-R-01" },
  "HIGH LEVEL INLET UPVC CW OUTLET (APOON)": { package: "Cold Water", detail: "High-level inlet UPVC CW outlet by Apoon.", drawing: "CW-R-01" },
  "TENANT OUTLET AND DROPPER": { package: "Sanitary", detail: "Tenant outlet and dropper installation.", drawing: "SAN-R-01" },
  "HACKING AND PIPE CONCEAL (UPVC AND PPR)": { package: "Sanitary", detail: "Hacking and concealed UPVC/PPR pipework.", drawing: "SAN-T-01" },
  "BACKSHAFT CW OUTLET (SARIF)": { package: "Sanitary", detail: "Backshaft CW outlet by Sarif.", drawing: "SAN-R-01" },
  "SANITARY WARES (APOON)": { package: "Sanitary", detail: "Sanitary ware installation by Apoon.", drawing: "SAN-T-01" },
  HOSEREEL: { package: "Sanitary", detail: "Hosereel installation.", drawing: "SAN-R-01" },
  "LANDSCAPE INLET (RAHMATULLAH)": { package: "Irrigation", detail: "Landscape inlet by Rahmatullah.", drawing: "IRR-R-01" },
  "LANDSCAPE OUTLET (RAHMATULLAH)": { package: "Irrigation", detail: "Landscape outlet by Rahmatullah.", drawing: "IRR-R-01" },
  "LANDSCAPE WIRING (GREEN SIMEX)": { package: "Irrigation", detail: "Landscape wiring by Green Simex.", drawing: "IRR-W-01" },
};

export const PACKAGES = ["All", "Cold Water", "Flush Water", "Sanitary", "Irrigation"] as const;

export function itemsForPackage(pkg: (typeof PACKAGES)[number]) {
  if (pkg === "All") return report.items;
  if (pkg === "Irrigation") return report.items.filter((i) => ITEM_META[i]?.package === "Irrigation");
  return report.items.filter((i) => ITEM_META[i]?.package === pkg);
}

export type ProgressState = "complete" | "inProgress" | "started" | "notStarted" | "na";

export function normalizeProgress(v: number | null | undefined) {
  if (v == null || !Number.isFinite(v)) return null;
  return Math.max(0, Math.min(1, v));
}

export function progressState(v: number | null | undefined): ProgressState {
  const value = normalizeProgress(v);
  if (value == null) return "na";
  if (value >= 0.9) return "complete";
  if (value >= 0.5) return "inProgress";
  if (value > 0) return "started";
  return "notStarted";
}

export function cellTone(v: number | null | undefined) {
  switch (progressState(v)) {
    case "complete":
      return "bg-emerald-500 text-white shadow-sm";
    case "inProgress":
      return "bg-blue-600 text-white shadow-sm";
    case "started":
      return "bg-amber-400 text-amber-950 shadow-sm";
    case "notStarted":
      return "bg-red-500 text-white shadow-sm";
    default:
      return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-300";
  }
}

type ProgressionLike = {
  A: { level: string; items: Record<string, number | null> }[];
  B: { level: string; items: Record<string, number | null> }[];
};

const LEGACY_ITEM_ALIASES: Record<string, string[]> = {
  "BACKSHAFT TOILETS": ["BACKSHAFT TOILETS", "BACKSHAFT FLUSH WATER TOILETS", "BACKSHAFT SANITARY TOILET", "BACKSHAFT CW & FW TOILETS"],
  "CONCEALED PIPE + TOILET PIPE DISTRIBUTION": ["CONCEALED PIPE + TOILET PIPE DISTRIBUTION", "CONCEALED PIPE", "TOILET PIPE DISTRIBUTION AND HACKING", "TOILET PIPE DISTRIBUTION & HACKING"],
};
const REMOVED_ITEMS = new Set(["L31 AND 31M ROOF PIPING", "L31 & 31M ROOF PIPING", "PP PIPE", "FLOOR GRATING"]);

export function normalizeProgressionRows(rows: ProgressionLike["A"]): ProgressionLike["A"] {
  return rows.map((row) => {
    const items: Record<string, number | null> = {};
    for (const [item, value] of Object.entries(row.items ?? {})) {
      if (!REMOVED_ITEMS.has(item) && !Object.values(LEGACY_ITEM_ALIASES).some((aliases) => aliases.includes(item))) items[item] = value;
    }
    for (const [canonical, aliases] of Object.entries(LEGACY_ITEM_ALIASES)) {
      const canonicalValue = row.items?.[canonical];
      const legacyValues = aliases
        .filter((alias) => alias !== canonical)
        .map((alias) => row.items?.[alias])
        .filter((value): value is number => value != null && Number.isFinite(value));
      const values = canonicalValue != null && Number.isFinite(canonicalValue) ? [canonicalValue] : legacyValues;
      items[canonical] = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
    }
    return { ...row, items };
  });
}


export function validateProgression(progression: ProgressionLike, items: string[]) {
  const issues: string[] = [];
  for (const tower of ["A", "B"] as const) {
    for (const row of progression[tower]) {
      for (const item of items) {
        const value = row.items[item];
        if (value != null && !Number.isFinite(value)) issues.push(`${tower}-${row.level}-${item}: invalid number`);
        else if (value != null && (value < 0 || value > 1)) issues.push(`${tower}-${row.level}-${item}: outside 0–100%`);
      }
    }
  }
  return issues;
}

export function relatedMaterial(item: string) {
  const key = item.toLowerCase();
  return report.orders.filter((o) => {
    const m = o.material.toLowerCase();
    if (key.includes("sleeve")) return m.includes("sleeve");
    if (key.includes("transfer")) return m.includes("transfer");
    if (key.includes("pump control")) return m.includes("control panel") && o.package === "Cold Water";
    if (key === "pump") return m === "pump";
    if (key.includes("roof")) return m.includes("roof");
    if (key.includes("cold water tenant") || key.includes("cw tenant")) return m.includes("cw tenant") || m.includes("tenant");
    if (key.includes("backshaft")) return m.includes("backshaft");
    if (key.includes("hosereel")) return m.includes("hosereel") || m.includes("floor trap") || m.includes("stack");
    if (key.includes("sanitary tenant") || key.includes("tenant outlet")) return m.includes("sanitary tenant");
    if (key.includes("distribution")) return m.includes("toilet distribution");
    if (key.includes("sanitary toilets")) return m.includes("wc") || m.includes("basin");
    if (key.includes("wares")) return m.includes("wares");
    if (key.includes("irrigation") && key.includes("wiring")) return m.includes("cable") || m.includes("wiring");
    if (key.includes("irrigation")) return m.includes("irrigation");
    if (key.includes("meter")) return m.includes("meter");
    if (key.includes("pp pipe")) return m.includes("pp") || m.includes("poly");
    if (key.includes("grating")) return m.includes("grating");
    if (key.includes("concealed")) return m.includes("concealed") || m.includes("cw");
    if (key.includes("flush")) return m.includes("flush");
    return false;
  });
}

export function computePackageProgress(progression: ProgressionLike): {
  coldWater: number;
  sanitary: number;
  irrigation: number;
  overall: number;
} {
  const buckets: Record<MepPackage, number[]> = {
    "Cold Water": [],
    "Flush Water": [],
    Sanitary: [],
    Irrigation: [],
    VO: [],
  };
  for (const tower of ["A", "B"] as const) {
    for (const row of progression[tower] ?? []) {
      for (const [item, value] of Object.entries(row.items ?? {})) {
        if (value == null || !Number.isFinite(value)) continue;
        const pkg = ITEM_META[item]?.package;
        if (pkg) buckets[pkg].push(Math.max(0, Math.min(1, value)));
      }
    }
  }
  const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
  const current = {
    coldWater: avg([...buckets["Cold Water"], ...buckets["Flush Water"]]),
    sanitary: avg(buckets.Sanitary),
    irrigation: avg(buckets.Irrigation),
  };
  const baseBuckets: Record<MepPackage, number[]> = {
    "Cold Water": [],
    "Flush Water": [],
    Sanitary: [],
    Irrigation: [],
    VO: [],
  };
  for (const tower of ["A", "B"] as const) {
    for (const row of report.progression[tower] ?? []) {
      for (const [item, value] of Object.entries(row.items ?? {})) {
        if (value == null || !Number.isFinite(value)) continue;
        const pkg = ITEM_META[item]?.package;
        if (pkg) baseBuckets[pkg].push(Math.max(0, Math.min(1, value)));
      }
    }
  }
  const base = {
    coldWater: avg([...baseBuckets["Cold Water"], ...baseBuckets["Flush Water"]]),
    sanitary: avg(baseBuckets.Sanitary),
    irrigation: avg(baseBuckets.Irrigation),
  };
  const baseline = {
    coldWater: report.packages.coldWater,
    sanitary: report.packages.sanitary,
    irrigation: report.packages.irrigation,
  };
  const coldWater = Math.max(0, Math.min(1, baseline.coldWater + current.coldWater - base.coldWater));
  const sanitary = Math.max(0, Math.min(1, baseline.sanitary + current.sanitary - base.sanitary));
  const irrigation = Math.max(0, Math.min(1, baseline.irrigation + current.irrigation - base.irrigation));
  const overall = Math.max(0, Math.min(1, report.packages.overall + (coldWater - baseline.coldWater) * 0.55 + (sanitary - baseline.sanitary) * 0.3 + (irrigation - baseline.irrigation) * 0.15));
  return { coldWater, sanitary, irrigation, overall };
}
