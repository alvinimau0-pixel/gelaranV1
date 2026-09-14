import { b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as report } from "./router-CTFxBC_9.mjs";
import { a as TableWrap, i as Stat, n as Card, o as Td, s as Th, t as Badge } from "./ui-BFdMxFpS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/material-BzPmXZSw.js
var import_jsx_runtime = require_jsx_runtime();
function Material() {
	const t = report.orderTotals;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-semibold",
				children: "Material"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-sm text-muted",
				children: ["Qty remaining vs ordered · report ", report.meta.reportDate]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Required",
						value: String(t.total),
						hint: "All packages"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Ordered",
						value: String(t.ordered),
						hint: "POs placed",
						delay: 40
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Balance",
						value: String(t.total),
						hint: "Still to order",
						delay: 80
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Lines",
						value: String(report.poSummary.toOrder),
						hint: "To Order",
						delay: 120
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Cold water qty",
						value: String(t.coldWater)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Sanitary qty",
						value: String(t.sanitary),
						delay: 40
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Irrigation qty",
						value: String(t.irrigation),
						delay: 80
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-4 font-display text-lg font-semibold",
				children: "Order book"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableWrap, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Package" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Material" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Unit" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
					className: "text-right",
					children: "Qty/fl"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
					className: "text-right",
					children: "Rem A"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
					className: "text-right",
					children: "Rem B"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
					className: "text-right",
					children: "Required"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
					className: "text-right",
					children: "Ordered"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
					className: "text-right",
					children: "Balance"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Status" })
			] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: report.orders.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: row.package }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
					className: "font-medium",
					children: row.material
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: row.unit }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
					numeric: true,
					children: row.qtyFloor
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
					numeric: true,
					children: row.remainingA
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
					numeric: true,
					children: row.remainingB
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
					numeric: true,
					children: row.required
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
					numeric: true,
					children: row.ordered
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
					numeric: true,
					children: row.balance
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "bad",
					children: row.status
				}) })
			] }, `${row.package}-${row.material}`)) })] })] })
		]
	});
}
//#endregion
export { Material as component };
