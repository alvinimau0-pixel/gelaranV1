import { report } from "@/lib/report-data";

export const ITEM_META: Record<
  string,
  { package: "Cold Water" | "Sanitary" | "Irrigation"; short: string; detail: string; drawing: string }
> = {
  "PIPE SLEEVE": {
    package: "Cold Water",
    short: "Sleeve",
    detail: "Slab penetration sleeve for CW riser and floor offtakes. One set per typical floor.",
    drawing: "CW-R-01",
  },
  PUMP: {
    package: "Cold Water",
    short: "Pump",
    detail: "Transfer / booster pump set at L31 plant. N/A on typical floors.",
    drawing: "CW-P-01",
  },
  "PUMP CONTROL PANEL": {
    package: "Cold Water",
    short: "Panel",
    detail: "Pump starter and control panel, L31 plant room.",
    drawing: "CW-P-01",
  },
  "TRANSFER PUMP PIPES": {
    package: "Cold Water",
    short: "TP pipes",
    detail: "Stainless steel transfer pump pipe, riser from L13 to L31 including elbows, check valves and sampling points.",
    drawing: "CW-P-01",
  },
  "L31 & 31M ROOF PIPING": {
    package: "Cold Water",
    short: "Roof",
    detail: "Roof manifold and 31M interconnection piping. Lot work at plant level only.",
    drawing: "RF-31",
  },
  "CW TENANT": {
    package: "Cold Water",
    short: "CW tenant",
    detail: "Tenant cold-water pipework and offtakes on typical floors.",
    drawing: "TYP-FL",
  },
  "BACKSHAFT CW & FW TOILETS": {
    package: "Cold Water",
    short: "Backshaft",
    detail: "Backshaft CW and flushing water to toilet cores.",
    drawing: "SAN-T-01",
  },
  "HOSEREEL FLOORTRAP & STACK": {
    package: "Sanitary",
    short: "Hosereel",
    detail: "Hosereel outlet, floor trap and vertical stack including fittings and supports.",
    drawing: "SAN-R-01",
  },
  "SANITARY TENANT": {
    package: "Sanitary",
    short: "San tenant",
    detail: "Tenant sanitary waste and vent offtakes.",
    drawing: "SAN-R-01",
  },
  "TOILET PIPE DISTRIBUTION & HACKING": {
    package: "Sanitary",
    short: "Toilet dist.",
    detail: "Toilet high-level distribution, droppers and hacking for four toilet sets per floor.",
    drawing: "SAN-T-01",
  },
  "SANITARY TOILETS": {
    package: "Sanitary",
    short: "Toilets",
    detail: "Toilet UPVC waste/vent stacks, traps and floor outlets.",
    drawing: "SAN-T-01",
  },
  "SANITARY WARES INSTALLATION": {
    package: "Sanitary",
    short: "Wares",
    detail: "WC pans, wash basins and sanitary ware fit-off.",
    drawing: "SAN-T-01",
  },
  "IRRIGATION OUTLET": {
    package: "Irrigation",
    short: "Irr. out",
    detail: "Irrigation outlet points on typical floors / landscape zones.",
    drawing: "IRR-01",
  },
  "IRRIGATION INLET": {
    package: "Irrigation",
    short: "Irr. in",
    detail: "Irrigation inlet and isolation to the floor loop.",
    drawing: "IRR-01",
  },
  "IRRIGATION WIRING": {
    package: "Irrigation",
    short: "Wiring",
    detail: "Control cabling from valves to irrigation panel.",
    drawing: "IRR-01",
  },
  "IRRIGATION CONTROL PANEL": {
    package: "Irrigation",
    short: "Irr. panel",
    detail: "Irrigation controller. Plant / roof only.",
    drawing: "IRR-01",
  },
};

export const PACKAGES = ["All", "Cold Water", "Sanitary", "Irrigation"] as const;

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
    if (key.includes("cw tenant")) return m.includes("cw tenant");
    if (key.includes("backshaft")) return m.includes("backshaft");
    if (key.includes("hosereel")) return m.includes("hosereel") || m.includes("floor trap") || m.includes("stack");
    if (key.includes("sanitary tenant")) return m.includes("sanitary tenant");
    if (key.includes("distribution")) return m.includes("toilet distribution");
    if (key.includes("sanitary toilets")) return m.includes("wc") || m.includes("basin");
    if (key.includes("wares")) return m.includes("wares");
    if (key.includes("outlet")) return m.includes("irrigation outlet");
    if (key.includes("inlet")) return m.includes("irrigation inlet");
    if (key.includes("wiring")) return m.includes("cable");
    if (key.includes("irrigation control")) return m.includes("irrigation control");
    return false;
  });
}

type ProgressionLike = {
  A: { level: string; items: Record<string, number | null> }[];
  B: { level: string; items: Record<string, number | null> }[];
};

/**
 * True package % from the matrix: average of all non-null cells for that
 * package across Tower A + Tower B. Null (N/A) cells are skipped so plant-only
 * items don't drag typical floors down.
 */
export function computePackageProgress(progression: ProgressionLike): {
  coldWater: number;
  sanitary: number;
  irrigation: number;
  overall: number;
} {
  const buckets: Record<"Cold Water" | "Sanitary" | "Irrigation", number[]> = {
    "Cold Water": [],
    Sanitary: [],
    Irrigation: [],
  };

  for (const tower of ["A", "B"] as const) {
    for (const row of progression[tower]) {
      for (const [item, value] of Object.entries(row.items)) {
        if (value == null || !Number.isFinite(value)) continue;
        const pkg = ITEM_META[item]?.package;
        if (!pkg) continue;
        buckets[pkg].push(Math.max(0, Math.min(1, value)));
      }
    }
  }

  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

  const coldWater = avg(buckets["Cold Water"]);
  const sanitary = avg(buckets.Sanitary);
  const irrigation = avg(buckets.Irrigation);
  const all = [...buckets["Cold Water"], ...buckets.Sanitary, ...buckets.Irrigation];
  const overall = avg(all);

  return { coldWater, sanitary, irrigation, overall };
}
