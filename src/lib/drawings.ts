export type Drawing = {
  id: string;
  title: string;
  package: string;
  scale: string;
  rev: string;
  note: string;
};

export const DRAWINGS: Drawing[] = [
  {
    id: "CW-R-01",
    title: "Cold water riser — Towers A & B",
    package: "Cold Water",
    scale: "NTS",
    rev: "A",
    note: "Pipe sleeve each floor. Transfer SS pipe L13–L31. Roof manifold at L31/31M.",
  },
  {
    id: "CW-P-01",
    title: "Stainless steel transfer pump pipe",
    package: "Cold Water",
    scale: "NTS",
    rev: "A",
    note: "RM 80/m. Elbow / check valve extra. Sampling points L13 and L23.",
  },
  {
    id: "SAN-R-01",
    title: "Sanitary stack, hosereel & tenant droppers",
    package: "Sanitary",
    scale: "NTS",
    rev: "A",
    note: "Hosereel set + floor trap (6 nos/floor). Tenant stack and vent cowls.",
  },
  {
    id: "SAN-T-01",
    title: "Toilet high level & distribution L24–L31",
    package: "Sanitary",
    scale: "NTS",
    rev: "A",
    note: "4 toilet sets L25–L31. L24 additional 2 sets. UPVC waste and vent.",
  },
  {
    id: "IRR-01",
    title: "Irrigation inlet, outlet and control",
    package: "Irrigation",
    scale: "NTS",
    rev: "A",
    note: "Outlet and inlet per floor. Wiring and panel remaining.",
  },
  {
    id: "RF-31",
    title: "L31 / 31M roof plant",
    package: "Cold Water",
    scale: "NTS",
    rev: "A",
    note: "Pumps, control panel, roof piping and irrigation panel location.",
  },
  {
    id: "TYP-FL",
    title: "Typical floor wet services L13–L30",
    package: "Combined",
    scale: "NTS",
    rev: "A",
    note: "CW tenant, backshaft, hosereel, toilet core, irrigation offtakes.",
  },
];
