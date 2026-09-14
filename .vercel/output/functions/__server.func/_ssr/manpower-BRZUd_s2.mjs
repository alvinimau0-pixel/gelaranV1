import { i as __toESM } from "../_runtime.mjs";
import { b as require_jsx_runtime, z as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as cn, r as report } from "./router-CTFxBC_9.mjs";
import { i as Stat, n as Card } from "./ui-BFdMxFpS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/manpower-BRZUd_s2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var YEAR = 2026;
var CREW = Array.from(new Set(report.people.map((p) => p.name)));
function isWeekend(day) {
	const wd = new Date(Date.UTC(YEAR, 8, day)).getUTCDay();
	return wd === 0 || wd === 6;
}
function key(name, day) {
	return `${name}::${day}`;
}
function seed() {
	const out = {};
	for (const name of CREW) for (let d = 1; d <= 31; d++) if (isWeekend(d)) out[key(name, d)] = "O";
	else if (d <= 12) out[key(name, d)] = "P";
	else out[key(name, d)] = "";
	return out;
}
var STORAGE = "msk-attendance-2026-09";
function loadAttendance() {
	const base = seed();
	if (typeof window === "undefined") return base;
	try {
		const raw = localStorage.getItem(STORAGE);
		if (!raw) return base;
		return {
			...base,
			...JSON.parse(raw)
		};
	} catch {
		return base;
	}
}
function saveAttendance(map) {
	localStorage.setItem(STORAGE, JSON.stringify(map));
}
function cycleMark(current, weekend) {
	if (weekend) {
		if (current === "O") return "P";
		if (current === "P") return "A";
		return "O";
	}
	if (current === "P") return "A";
	if (current === "A") return "";
	return "P";
}
function markAt(map, name, day) {
	return map[key(name, day)] ?? "";
}
function setMark(map, name, day, mark) {
	return {
		...map,
		[key(name, day)]: mark
	};
}
function countForDay(map, day, mark) {
	return CREW.filter((n) => markAt(map, n, day) === mark).length;
}
function countForName(map, name, mark) {
	let n = 0;
	for (let d = 1; d <= 31; d++) if (markAt(map, name, d) === mark) n += 1;
	return n;
}
var TONE = {
	P: "bg-ok-bg text-ok",
	A: "bg-bad-bg text-bad",
	O: "bg-surface-2 text-subtle",
	"": "bg-surface text-subtle"
};
function Manpower() {
	const [map, setMap] = (0, import_react.useState)({});
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setMap(loadAttendance());
		setReady(true);
	}, []);
	const presentToday = countForDay(map, 12, "P");
	const absentToday = countForDay(map, 12, "A");
	const days = (0, import_react.useMemo)(() => Array.from({ length: 31 }, (_, i) => i + 1), []);
	function toggle(name, day) {
		if (!ready) return;
		const next = setMark(map, name, day, cycleMark(markAt(map, name, day), isWeekend(day)));
		setMap(next);
		saveAttendance(next);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-semibold",
				children: "Attendance"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "September 2026 · tap a cell to cycle Present / Absent / blank. Weekends start as Off."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Crew list",
						value: String(CREW.length),
						hint: "Unique names"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: `Present 12 Sep`,
						value: String(presentToday),
						delay: 40
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Absent that day",
						value: String(absentToday),
						delay: 80
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-4 font-display text-lg font-semibold",
				children: "Teams"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
				children: report.teams.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border border-border bg-surface-2 p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium uppercase tracking-wide text-muted",
							children: t.team
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 font-display text-lg font-semibold",
							children: t.leader
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: t.assistants.length ? t.assistants.join(", ") : "No assistants listed"
						})
					]
				}, t.team))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-lg font-semibold",
						children: "September register"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "P present · A absent · O off"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full min-w-[980px] border-collapse text-center text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "sticky left-0 z-10 bg-surface-2 px-3 py-2 text-left font-semibold uppercase tracking-wide text-muted",
								children: "Name"
							}),
							days.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: cn("min-w-8 bg-surface-2 px-1 py-2 font-semibold tabular-nums text-muted", isWeekend(d) && "text-subtle", d === 12 && "text-ink"),
								children: d
							}, d)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "bg-surface-2 px-2 py-2 font-semibold text-muted",
								children: "P"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "bg-surface-2 px-2 py-2 font-semibold text-muted",
								children: "A"
							})
						] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [CREW.map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "sticky left-0 bg-surface px-3 py-1 text-left font-medium",
								children: name
							}),
							days.map((d) => {
								const m = markAt(map, name, d);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "p-0.5",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => toggle(name, d),
										className: cn("flex h-8 w-full items-center justify-center rounded-xs font-medium", TONE[m], d === 12 && "ring-1 ring-ink/30"),
										"aria-label": `${name} day ${d} ${m || "blank"}`,
										children: m || "·"
									})
								}, d);
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-2 font-mono tabular-nums text-ok",
								children: countForName(map, name, "P")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-2 font-mono tabular-nums text-bad",
								children: countForName(map, name, "A")
							})
						] }, name)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "sticky left-0 bg-surface-2 px-3 py-2 text-left font-semibold",
								children: "Headcount P"
							}),
							days.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "bg-surface-2 px-1 py-2 font-mono tabular-nums text-muted",
								children: countForDay(map, d, "P")
							}, d)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { className: "bg-surface-2" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { className: "bg-surface-2" })
						] })] })]
					})
				})]
			})
		]
	});
}
//#endregion
export { Manpower as component };
