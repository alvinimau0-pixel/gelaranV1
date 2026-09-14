import { b as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as leaderTone, o as pct, r as report } from "./router-CTFxBC_9.mjs";
import { a as TableWrap, i as Stat, n as Card, o as Td, r as Meter, s as Th, t as Badge } from "./ui-BFdMxFpS.mjs";
import { a as Bar, i as CartesianGrid, n as YAxis, o as ResponsiveContainer, r as XAxis, s as Tooltip, t as BarChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BJKgdPTU.js
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const s = report.site;
	const chart = report.floors.filter((f) => f.level !== "OVERALL").map((f) => ({
		level: f.level,
		A: Math.round(f.a * 1e3) / 10,
		B: Math.round(f.b * 1e3) / 10
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-semibold tracking-tight",
				children: "Site dashboard"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-sm text-muted",
				children: [
					"Daily snapshot · ",
					s.today,
					" · Weather ",
					s.weather,
					" · ",
					s.shift,
					" shift"
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Overall",
						value: pct(s.overall),
						bar: s.overall,
						hint: "Site-wide complete"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Cold water",
						value: pct(s.coldWater),
						bar: s.coldWater,
						delay: 40,
						hint: "Remaining 52.4%"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Sanitary",
						value: pct(s.sanitary),
						bar: s.sanitary,
						delay: 80,
						hint: "Remaining 53.0%"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Irrigation",
						value: pct(s.irrigation),
						bar: s.irrigation,
						delay: 120,
						hint: "Remaining 93.9%"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "On site",
						value: `${s.men}`,
						hint: "People today",
						delay: 160
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Today",
						value: "TP + hosereel",
						hint: s.weather + " · " + s.shift,
						delay: 200
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Drawings",
						value: "7",
						hint: "MEP shop sheets",
						delay: 240
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "anim-enter",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex flex-wrap items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-lg font-semibold",
						children: "Tower A vs Tower B"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "ok",
						children: "Tower A leads by 3.5%"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableWrap, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Package" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
						className: "text-right",
						children: "Tower A"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
						className: "text-right",
						children: "Tower B"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
						className: "text-right",
						children: "Gap"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Leader" })
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: report.comparePackages.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
						className: "font-medium",
						children: row.package
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
						numeric: true,
						children: pct(row.a)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
						numeric: true,
						children: pct(row.b)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
						numeric: true,
						children: pct(row.gap)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: leaderTone(row.leader),
						children: row.leader
					}) })
				] }, row.package)) })] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-4 font-display text-lg font-semibold",
				children: "Floor complete · A vs B"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-72 w-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: "100%",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
						data: chart,
						margin: {
							top: 8,
							right: 8,
							left: -12,
							bottom: 0
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
								stroke: "#e2e6ed",
								vertical: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
								dataKey: "level",
								tick: {
									fontSize: 11,
									fill: "#5c6775"
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
								tick: {
									fontSize: 11,
									fill: "#5c6775"
								},
								unit: "%"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
								border: "1px solid #e2e6ed",
								borderRadius: 12,
								fontSize: 12
							} }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
								dataKey: "A",
								fill: "#1b2430",
								radius: [
									4,
									4,
									0,
									0
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
								dataKey: "B",
								fill: "#3d8bff",
								radius: [
									4,
									4,
									0,
									0
								]
							})
						]
					})
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-4 font-display text-lg font-semibold",
					children: "Work item gaps"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mb-3 text-sm text-muted",
					children: [
						"Open the ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/matrix",
							className: "font-medium text-accent hover:underline",
							children: "MEP matrix"
						}),
						" to inspect every floor cell, or the",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/library",
							className: "font-medium text-accent hover:underline",
							children: "drawings library"
						}),
						"."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableWrap, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Package" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Item" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
						className: "text-right",
						children: "A"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
						className: "text-right",
						children: "B"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
						className: "text-right",
						children: "Gap"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Leader" })
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: report.itemGaps.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: row.package }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
						className: "font-medium",
						children: row.item
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
						numeric: true,
						children: pct(row.a)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
						numeric: true,
						children: pct(row.b)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
						numeric: true,
						children: pct(row.gap)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: leaderTone(row.leader),
						children: row.leader
					}) })
				] }, `${row.package}-${row.item}`)) })] })
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-2 font-display text-lg font-semibold",
						children: "Material outstanding"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							report.poSummary.toOrder,
							" lines still to order · balance ",
							report.orderTotals.total
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 space-y-3",
						children: [
							["Cold water", report.orderTotals.coldWater],
							["Sanitary", report.orderTotals.sanitary],
							["Irrigation", report.orderTotals.irrigation]
						].map(([label, qty]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-1 flex justify-between text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "tabular-nums text-muted",
								children: qty
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, { value: Number(qty) / report.orderTotals.total })] }, String(label)))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/material",
						className: "mt-4 inline-flex text-sm font-medium text-accent hover:underline",
						children: "Open material board"
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-2 font-display text-lg font-semibold",
						children: "Today on site"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							"Focus: ",
							s.today,
							". Blockers: none recorded."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 space-y-2 text-sm",
						children: report.teams.slice(0, 6).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex justify-between gap-3 border-b border-border py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted",
								children: t.team
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-medium",
								children: [t.leader, t.assistants.length ? ` · ${t.assistants.length} assist` : ""]
							})]
						}, t.team))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/manpower",
						className: "mt-4 inline-flex text-sm font-medium text-accent hover:underline",
						children: "Open attendance"
					})
				] })]
			})
		]
	});
}
//#endregion
export { Home as component };
