import { report } from "@/lib/report-data";

export type MepPackage = "Cold Water" | "Flush Water" | "Sanitary" | "Irrigation" | "VO";

export type TaskPackage = "CW" | "FW" | "SAN" | "VO";
export type MepTask = {
  id: string;
  stage: "Coordination" | "Installation" | "Testing" | "Commissioning" | "Commercial";
  short: string;
};

export const TASK_GROUPS: Record<TaskPackage, { label: string; logic: string; tasks: MepTask[] }> = {
  CW: { label: "Cold Water", logic: "Update by measured installation quantity, then confirm inspection and testing evidence.", tasks: [
    { id: "CW-01", stage: "Coordination", short: "Incoming connection and meter" },
    { id: "CW-02", stage: "Installation", short: "Storage tanks and break tank" },
    { id: "CW-03", stage: "Installation", short: "Pumping main and distribution" },
    { id: "CW-04", stage: "Installation", short: "Booster pump, VSD and controls" },
    { id: "CW-05", stage: "Installation", short: "Valves, PRVs, gauges and backflow" },
    { id: "CW-06", stage: "Testing", short: "Sleeves, supports and fire stopping" },
    { id: "CW-07", stage: "Commissioning", short: "Flush, disinfect and sample" },
  ] },
  FW: { label: "Flush Water", logic: "Track independently from CW; do not treat an unrecorded FW value as zero.", tasks: [
    { id: "FW-01", stage: "Coordination", short: "Non-potable separation and labels" },
    { id: "FW-02", stage: "Installation", short: "FW tanks and break-tank link" },
    { id: "FW-03", stage: "Installation", short: "Booster pump and pressure tank" },
    { id: "FW-04", stage: "Installation", short: "Pumping main and floor distribution" },
    { id: "FW-05", stage: "Installation", short: "Toilet flushing connections" },
    { id: "FW-06", stage: "Commissioning", short: "Backflow, flow and commissioning" },
  ] },
  SAN: { label: "Sanitary", logic: "Separate installation status from drainage test and technical acceptance.", tasks: [
    { id: "SAN-01", stage: "Coordination", short: "Soil, waste and vent risers" },
    { id: "SAN-02", stage: "Installation", short: "Stacks and tenant branches" },
    { id: "SAN-03", stage: "Installation", short: "Toilet distribution and hacking" },
    { id: "SAN-04", stage: "Installation", short: "Floor traps, wastes and access" },
    { id: "SAN-05", stage: "Installation", short: "Fixtures and sanitary wares" },
    { id: "SAN-06", stage: "Testing", short: "Water, air and flow tests" },
  ] },
  VO: { label: "Variation Orders + Irrigation", logic: "Track variation orders and irrigation scope by instruction, design, approval, installation, acceptance and valuation.", tasks: [
    { id: "VO-01", stage: "Commercial", short: "Register instruction and affected scope" },
    { id: "VO-02", stage: "Coordination", short: "Revise tank and pipework drawings" },
    { id: "VO-03", stage: "Installation", short: "FRP tank changes and rerouting" },
    { id: "VO-04", stage: "Installation", short: "Ladders, drains, overflows and sampling" },
    { id: "VO-05", stage: "Testing", short: "VO testing and technical acceptance" },
    { id: "VO-06", stage: "Commercial", short: "Measure, claim and close valuation" },
    { id: "IRR-01", stage: "Installation", short: "Irrigation pipework and outlets — NKVE zone" },
    { id: "IRR-02", stage: "Installation", short: "Irrigation pipework and outlets — LBU zone" },
    { id: "IRR-03", stage: "Installation", short: "Irrigation pipework and outlets — Residential zone" },
    { id: "IRR-04", stage: "Installation", short: "Irrigation pipework and outlets — Tamil School zone" },
    { id: "IRR-05", stage: "Testing", short: "Irrigation control cabling and panel" },
  ] },
};

export const ITEM_META: Record<
  string,
  { package: MepPackage; detail: string; drawing: string }
> = {
  "PIPE SLEEVE": {
    package: "Cold Water",
    detail: "Slab penetration sleeve for cold-water riser and floor offtakes. One set per typical floor.",
    drawing: "CW-R-01",
  },
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
  "TRANSFER PUMP PIPES": {
    package: "Cold Water",
    detail: "Stainless steel transfer pump pipe, riser including elbows, check valves and sampling points.",
    drawing: "CW-P-01",
  },
  "COLD WATER TENANT": {
    package: "Cold Water",
    detail: "Tenant cold-water pipework and offtakes on typical floors.",
    drawing: "TYP-FL",
  },
  "DIGITAL WATER METER": {
    package: "Cold Water",
    detail: "Digital water meter installation for cold-water monitoring (sub: Kolik).",
    drawing: "CW-M-01",
  },
  "FLUSH WATER TANK PIPE": {
    package: "Flush Water",
    detail: "Pipework from flush-water tank to toilet cores and distribution.",
    drawing: "FW-T-01",
  },
  "HOSEREEL FLOORTRAP AND STACK": {
    package: "Sanitary",
    detail: "Hosereel outlet, floor trap and vertical stack including fittings and supports.",
    drawing: "SAN-R-01",
  },
  "SANITARY TENANT OUTLET": {
    package: "Sanitary",
    detail: "Tenant sanitary waste and vent offtakes / outlets.",
    drawing: "SAN-R-01",
  },
  "SANITARY TOILETS": {
    package: "Sanitary",
    detail: "Toilet UPVC waste/vent stacks, traps and floor outlets.",
    drawing: "SAN-T-01",
  },
  "SANITARY WARES INSTALLATION": {
    package: "Sanitary",
    detail: "WC pans, wash basins and sanitary ware fit-off.",
    drawing: "SAN-T-01",
  },
  "BACKSHAFT TOILETS": {
    package: "Flush Water",
    detail: "Combined backshaft flush-water and sanitary waste/vent services to toilet cores.",
    drawing: "FW-B-01",
  },
  "CONCEALED PIPE + TOILET PIPE DISTRIBUTION": {
    package: "Sanitary",
    detail: "Combined concealed pipework and toilet distribution / hacking scope per floor.",
    drawing: "SAN-T-01",
  },
  "IRRIGATION NKVE": {
    package: "Irrigation",
    detail: "Irrigation pipework and outlets — NKVE zone.",
    drawing: "IRR-NKVE",
  },
  "IRRIGATION LBU": {
    package: "Irrigation",
    detail: "Irrigation pipework and outlets — LBU zone.",
    drawing: "IRR-LBU",
  },
  "IRRIGATION RESIDENTIAL": {
    package: "Irrigation",
    detail: "Irrigation pipework and outlets — Residential zone.",
    drawing: "IRR-RES",
  },
  "IRRIGATION TAMIL SCHOOL": {
    package: "Irrigation",
    detail: "Irrigation pipework and outlets — Tamil School zone.",
    drawing: "IRR-TS",
  },
  "IRRIGATION WIRING": {
    package: "Irrigation",
    detail: "Control cabling from solenoid valves to irrigation panel (sub: Green Simex).",
    drawing: "IRR-W-01",
  },
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
      const values = aliases.map((alias) => row.items?.[alias]).filter((value): value is number => value != null && Number.isFinite(value));
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
  const coldWater = avg([...buckets["Cold Water"], ...buckets["Flush Water"]]);
  const sanitary = avg(buckets.Sanitary);
  const irrigation = avg(buckets.Irrigation);
  const all = [...buckets["Cold Water"], ...buckets["Flush Water"], ...buckets.Sanitary, ...buckets.Irrigation, ...buckets.VO];
  return { coldWater, sanitary, irrigation, overall: avg(all) };
}
