import { i as __toESM } from "../_runtime.mjs";
import { b as require_jsx_runtime, v as Link, z as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as X } from "../_libs/lucide-react.mjs";
import { i as cn, o as pct, r as report } from "./router-CTFxBC_9.mjs";
import { n as Card, r as Meter, t as Badge } from "./ui-BFdMxFpS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mep-matrix-CxhcDxO3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ITEM_META = {
	"PIPE SLEEVE": {
		package: "Cold Water",
		short: "Sleeve",
		detail: "Slab penetration sleeve for CW riser and floor offtakes. One set per typical floor.",
		drawing: "CW-R-01"
	},
	PUMP: {
		package: "Cold Water",
		short: "Pump",
		detail: "Transfer / booster pump set at L31 plant. N/A on typical floors.",
		drawing: "CW-P-01"
	},
	"PUMP CONTROL PANEL": {
		package: "Cold Water",
		short: "Panel",
		detail: "Pump starter and control panel, L31 plant room.",
		drawing: "CW-P-01"
	},
	"TRANSFER PUMP PIPES": {
		package: "Cold Water",
		short: "TP pipes",
		detail: "Stainless steel transfer pump pipe, riser from L13 to L31 including elbows, check valves and sampling points.",
		drawing: "CW-P-01"
	},
	"L31 & 31M ROOF PIPING": {
		package: "Cold Water",
		short: "Roof",
		detail: "Roof manifold and 31M interconnection piping. Lot work at plant level only.",
		drawing: "RF-31"
	},
	"CW TENANT": {
		package: "Cold Water",
		short: "CW tenant",
		detail: "Tenant cold-water pipework and offtakes on typical floors.",
		drawing: "TYP-FL"
	},
	"BACKSHAFT CW & FW TOILETS": {
		package: "Cold Water",
		short: "Backshaft",
		detail: "Backshaft CW and flushing water to toilet cores.",
		drawing: "SAN-T-01"
	},
	"HOSEREEL FLOORTRAP & STACK": {
		package: "Sanitary",
		short: "Hosereel",
		detail: "Hosereel outlet, floor trap and vertical stack including fittings and supports.",
		drawing: "SAN-R-01"
	},
	"SANITARY TENANT": {
		package: "Sanitary",
		short: "San tenant",
		detail: "Tenant sanitary waste and vent offtakes.",
		drawing: "SAN-R-01"
	},
	"TOILET PIPE DISTRIBUTION & HACKING": {
		package: "Sanitary",
		short: "Toilet dist.",
		detail: "Toilet high-level distribution, droppers and hacking for four toilet sets per floor.",
		drawing: "SAN-T-01"
	},
	"SANITARY TOILETS": {
		package: "Sanitary",
		short: "Toilets",
		detail: "Toilet UPVC waste/vent stacks, traps and floor outlets.",
		drawing: "SAN-T-01"
	},
	"SANITARY WARES INSTALLATION": {
		package: "Sanitary",
		short: "Wares",
		detail: "WC pans, wash basins and sanitary ware fit-off.",
		drawing: "SAN-T-01"
	},
	"IRRIGATION OUTLET": {
		package: "Irrigation",
		short: "Irr. out",
		detail: "Irrigation outlet points on typical floors / landscape zones.",
		drawing: "IRR-01"
	},
	"IRRIGATION INLET": {
		package: "Irrigation",
		short: "Irr. in",
		detail: "Irrigation inlet and isolation to the floor loop.",
		drawing: "IRR-01"
	},
	"IRRIGATION WIRING": {
		package: "Irrigation",
		short: "Wiring",
		detail: "Control cabling from valves to irrigation panel.",
		drawing: "IRR-01"
	},
	"IRRIGATION CONTROL PANEL": {
		package: "Irrigation",
		short: "Irr. panel",
		detail: "Irrigation controller. Plant / roof only.",
		drawing: "IRR-01"
	}
};
var PACKAGES = [
	"All",
	"Cold Water",
	"Sanitary",
	"Irrigation"
];
function itemsForPackage(pkg) {
	if (pkg === "All") return report.items;
	return report.items.filter((i) => ITEM_META[i]?.package === pkg);
}
function cellTone(v) {
	if (v == null) return "bg-surface-2 text-subtle";
	if (v >= .9) return "bg-ok-bg text-ok";
	if (v >= .5) return "bg-accent/15 text-ink";
	if (v > 0) return "bg-warn-bg text-warn";
	return "bg-bad-bg text-bad";
}
function relatedMaterial(item) {
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
function MepMatrix({ tower }) {
	const [pkg, setPkg] = (0, import_react.useState)("All");
	const [sel, setSel] = (0, import_react.useState)(null);
	const items = itemsForPackage(pkg);
	const levels = report.progression.A.map((r) => r.level);
	const towers = tower ? [tower] : ["A", "B"];
	const detail = sel ? {
		meta: ITEM_META[sel.item],
		a: report.progression.A.find((r) => r.level === sel.level)?.items[sel.item] ?? null,
		b: report.progression.B.find((r) => r.level === sel.level)?.items[sel.item] ?? null,
		mats: relatedMaterial(sel.item)
	} : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: PACKAGES.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setPkg(p),
					className: cn("min-h-11 rounded-full px-4 text-sm font-medium transition-colors duration-150", pkg === p ? "bg-ink text-accent-fg" : "bg-surface-2 text-muted hover:text-fg"),
					children: p
				}, p))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full min-w-[720px] border-collapse text-left text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "sticky left-0 z-10 bg-surface-2 px-3 py-2 font-semibold uppercase tracking-wide text-muted",
								children: "Lv"
							}),
							tower ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "bg-surface-2 px-2 py-2 font-semibold uppercase tracking-wide text-muted",
								children: "T"
							}),
							items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "bg-surface-2 px-1 py-2 text-center font-semibold text-muted",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "inline-block max-w-16 leading-tight",
									children: ITEM_META[item]?.short ?? item
								})
							}, item))
						] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: levels.map((level) => towers.map((t) => {
							const row = report.progression[t].find((r) => r.level === level);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								t === towers[0] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									rowSpan: towers.length,
									className: "sticky left-0 bg-surface px-3 py-1 font-medium text-fg",
									children: level
								}) : null,
								tower ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-1 text-muted",
									children: t
								}),
								items.map((item) => {
									const v = row?.items[item] ?? null;
									const active = sel?.level === level && sel.item === item && sel.tower === t;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "p-0.5",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setSel({
												tower: t,
												level,
												item
											}),
											className: cn("flex h-9 w-full min-w-12 items-center justify-center rounded-xs font-mono tabular-nums transition-transform duration-150 hover:scale-[1.03]", cellTone(v), active && "ring-2 ring-ink"),
											"aria-label": `Tower ${t} level ${level} ${item}`,
											children: v == null ? "—" : `${Math.round(v * 100)}`
										})
									}, item);
								})
							] }, `${level}-${t}`);
						})) })]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-4 py-3 text-xs text-muted",
					children: "Tap a cell for scope, material and drawing. Values are %."
				})]
			}),
			sel && detail ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 flex justify-end bg-ink/30",
				onClick: () => setSel(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "flex h-full w-full max-w-md flex-col overflow-y-auto bg-surface p-5 shadow-[0_8px_40px_rgba(15,23,36,0.18)]",
					onClick: (e) => e.stopPropagation(),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs font-medium uppercase tracking-wide text-muted",
								children: [
									"Tower ",
									sel.tower,
									" · Level ",
									sel.level
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-1 font-display text-xl font-semibold",
								children: sel.item
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "inline-flex size-11 items-center justify-center rounded-md border border-border",
								onClick: () => setSel(null),
								"aria-label": "Close",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: "accent",
								children: detail.meta?.package
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: detail.meta?.short })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-sm text-muted",
							children: detail.meta?.detail
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg border border-border p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: "Tower A"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 font-display text-lg font-semibold tabular-nums",
										children: pct(detail.a)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, { value: detail.a ?? 0 })
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg border border-border p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: "Tower B"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 font-display text-lg font-semibold tabular-nums",
										children: pct(detail.b)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, { value: detail.b ?? 0 })
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-6 text-sm font-semibold",
							children: "Related material"
						}),
						detail.mats.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-2 space-y-2 text-sm",
							children: detail.mats.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex justify-between gap-3 border-b border-border py-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: m.material }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "tabular-nums text-muted",
									children: ["bal ", m.balance]
								})]
							}, m.material))
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: "No material line mapped."
						}),
						detail.meta?.drawing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/library",
							search: { dwg: detail.meta.drawing },
							className: "mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-ink px-4 text-sm font-medium text-accent-fg",
							children: ["Open drawing ", detail.meta.drawing]
						}) : null
					]
				})
			}) : null
		]
	});
}
//#endregion
export { MepMatrix as t };
