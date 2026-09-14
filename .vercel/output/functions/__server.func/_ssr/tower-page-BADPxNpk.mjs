import { b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as pct, r as report } from "./router-CTFxBC_9.mjs";
import { n as Card, r as Meter, t as Badge } from "./ui-BFdMxFpS.mjs";
import { t as MepMatrix } from "./mep-matrix-CxhcDxO3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tower-page-BADPxNpk.js
var import_jsx_runtime = require_jsx_runtime();
function TowerPage({ tower }) {
	const floors = report.floors.filter((f) => f.level !== "OVERALL");
	const overall = report.comparePackages.find((p) => p.package === "OVERALL");
	const value = tower === "A" ? overall?.a : overall?.b;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "font-display text-3xl font-semibold",
					children: ["Tower ", tower]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Explore the MEP matrix — tap any cell"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					tone: "accent",
					children: [pct(value ?? 0), " package complete"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-4 font-display text-lg font-semibold",
				children: "Floor average"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-2",
				children: floors.map((f, i) => {
					const v = tower === "A" ? f.a : f.b;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-[3.5rem_1fr_3.5rem] items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs font-medium text-muted",
								children: ["L", f.level]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
								value: v,
								delay: i * 20
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-right font-mono text-xs tabular-nums",
								children: pct(v)
							})
						]
					}, f.level);
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MepMatrix, { tower })
		]
	});
}
//#endregion
export { TowerPage as t };
