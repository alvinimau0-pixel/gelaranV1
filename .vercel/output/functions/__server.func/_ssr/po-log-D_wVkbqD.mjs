import { b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as report, s as rm } from "./router-CTFxBC_9.mjs";
import { a as TableWrap, i as Stat, n as Card, o as Td, s as Th, t as Badge } from "./ui-BFdMxFpS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/po-log-D_wVkbqD.js
var import_jsx_runtime = require_jsx_runtime();
function PoLog() {
	const p = report.poSummary;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-semibold",
				children: "PO log"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "No purchase orders recorded in this report."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "POs",
						value: String(p.pos)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "To order",
						value: String(p.toOrder),
						delay: 40
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Partial",
						value: String(p.partial),
						delay: 80
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Complete",
						value: String(p.complete),
						delay: 120
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-lg font-semibold",
					children: "Outstanding materials"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					tone: "bad",
					children: ["0 POs · ", rm(p.amount)]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableWrap, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Material" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Package" }),
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
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
					className: "font-medium",
					children: row.material
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: row.package }),
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
			] }, row.material)) })] })] })
		]
	});
}
//#endregion
export { PoLog as component };
