import { b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as cn } from "./router-CTFxBC_9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ui-BFdMxFpS.js
var import_jsx_runtime = require_jsx_runtime();
function Card({ className, children, style }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		style,
		className: cn("rounded-xl border border-border bg-surface p-5 shadow-[0_8px_24px_rgba(15,23,36,0.04)]", className),
		children
	});
}
function Badge({ tone = "mute", children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", {
			ok: "bg-ok-bg text-ok",
			warn: "bg-warn-bg text-warn",
			bad: "bg-bad-bg text-bad",
			mute: "bg-surface-2 text-muted",
			accent: "bg-accent/15 text-accent"
		}[tone]),
		children
	});
}
function Meter({ value, delay = 0 }) {
	const pct = Math.max(0, Math.min(1, value)) * 100;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-2 w-full overflow-hidden rounded-full bg-surface-2",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("bar-fill h-full rounded-full", value >= .7 ? "bg-ok" : value >= .35 ? "bg-accent" : value > .08 ? "bg-warn" : "bg-bad"),
			style: {
				width: `${pct}%`,
				animationDelay: `${delay}ms`
			}
		})
	});
}
function Stat({ label, value, hint, bar, delay = 0 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "anim-enter p-4",
		style: { animationDelay: `${delay}ms` },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium uppercase tracking-wide text-muted",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 font-display text-2xl font-semibold tabular-nums tracking-tight text-ink",
				children: value
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-subtle",
				children: hint
			}) : null,
			bar != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
					value: bar,
					delay
				})
			}) : null
		]
	});
}
function TableWrap({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto rounded-lg border border-border",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("table", {
			className: "w-full min-w-[640px] border-collapse text-left text-sm",
			children
		})
	});
}
function Th({ children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
		className: cn("sticky top-0 bg-surface-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted", className),
		children
	});
}
function Td({ children, className, numeric }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
		className: cn("border-t border-border px-3 py-2.5 text-fg", numeric && "text-right font-mono tabular-nums text-[13px]", className),
		children
	});
}
//#endregion
export { TableWrap as a, Stat as i, Card as n, Td as o, Meter as r, Th as s, Badge as t };
