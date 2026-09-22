import { report } from "@/lib/report-data";

export type MepPackage = "Cold Water" | "Flush Water" | "Sanitary" | "Irrigation" | "VO";

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
  "L31 AND 31M ROOF PIPING": {
    package: "Cold Water",
    detail: "Roof manifold and 31M interconnection piping. Lot work at plant level only.",
    drawing: "RF-31",
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
  "CONCEALED PIPE": {
    package: "Cold Water",
    detail: "Concealed cold-water pipework in walls / screed (e.g. L23).",
    drawing: "CW-C-01",
  },
  "FLUSH WATER TANK PIPE": {
    package: "Flush Water",
    detail: "Pipework from flush-water tank to toilet cores and distribution.",
    drawing: "FW-T-01",
  },
  "BACKSHAFT FLUSH WATER TOILETS": {
    package: "Flush Water",
    detail: "Backshaft flush-water supply to toilet cores.",
    drawing: "FW-B-01",
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
  "TOILET PIPE DISTRIBUTION AND HACKING": {
    package: "Sanitary",
    detail: "Toilet high-level distribution, droppers and hacking for toilet sets per floor.",
    drawing: "SAN-T-01",
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
  "PP PIPE": {
    package: "Sanitary",
    detail: "Polypropylene (PP) sanitary / waste pipe installation.",
    drawing: "SAN-PP-01",
  },
  "FLOOR GRATING": {
    package: "Sanitary",
    detail: "Floor grating at wet areas and drainage points (e.g. L7).",
    drawing: "SAN-G-01",
  },
  "BACKSHAFT SANITARY TOILET": {
    package: "Sanitary",
    detail: "Backshaft sanitary waste/vent to toilet cores.",
    drawing: "SAN-B-01",
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

export const PACKAGES = ["All", "Cold Water", "Flush Water", "Sanitary", "Irrigation", "VO"] as const;

export function itemsForPackage(pkg: (typeof PACKAGES)[number]) {
  if (pkg === "All") return report.items;
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
