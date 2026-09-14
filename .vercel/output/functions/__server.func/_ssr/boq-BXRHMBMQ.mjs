import { b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as pct, r as report, s as rm } from "./router-CTFxBC_9.mjs";
import { a as TableWrap, i as Stat, n as Card, o as Td, r as Meter, s as Th, t as Badge } from "./ui-BFdMxFpS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/boq-BXRHMBMQ.js
var import_jsx_runtime = require_jsx_runtime();
function Boq() {
	const aShare = report.aipoonClaimed / report.aipoonTotal;
	const rShare = report.ariyanClaimed / report.ariyanTotal;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-semibold",
				children: "Bill of quantities"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Aipoon UPVC · Ariyan stainless transfer pipes"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Aipoon contract",
						value: rm(report.aipoonTotal)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Aipoon claimed",
						value: rm(report.aipoonClaimed),
						bar: aShare,
						delay: 40
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Ariyan contract",
						value: rm(report.ariyanTotal),
						delay: 80
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Ariyan claimed",
						value: rm(report.ariyanClaimed),
						bar: rShare,
						delay: 120
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex flex-wrap items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-lg font-semibold",
						children: "Aipoon · UPVC L24–L31"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						tone: "accent",
						children: [pct(aShare), " claimed"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, { value: aShare }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableWrap, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Description" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Unit" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
							className: "text-right",
							children: "Qty"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
							className: "text-right",
							children: "Rate"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
							className: "text-right",
							children: "Done"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
							className: "text-right",
							children: "Amount"
						})
					] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: report.aipoon.map((row, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
							className: "font-medium",
							children: row.desc
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: row.unit }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
							numeric: true,
							children: row.qty
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
							numeric: true,
							children: rm(row.rate)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
							numeric: true,
							children: pct(row.done)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
							numeric: true,
							children: rm(row.amount)
						})
					] }, i)) })] })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs text-muted",
					children: "Prepared ALVIN · Checked KHAIRUL · Verified AH FATT"
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex flex-wrap items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-lg font-semibold",
						children: "Ariyan · SS transfer pump pipe"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						tone: "ok",
						children: [pct(rShare), " claimed"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, { value: rShare }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-muted",
					children: "RM 80/m · fittings RM 150 · sampling RM 80"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableWrap, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Section" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Description" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Unit" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
							className: "text-right",
							children: "Qty"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
							className: "text-right",
							children: "Rate"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
							className: "text-right",
							children: "Done"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
							className: "text-right",
							children: "Amount"
						})
					] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: report.ariyan.map((row, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
							className: "max-w-40 truncate text-muted",
							children: row.section
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
							className: "font-medium",
							children: row.desc
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: row.unit }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
							numeric: true,
							children: row.qty
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
							numeric: true,
							children: rm(row.rate)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
							numeric: true,
							children: pct(row.done)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
							numeric: true,
							children: rm(row.amount)
						})
					] }, i)) })] })
				})
			] })
		]
	});
}
//#endregion
export { Boq as component };
