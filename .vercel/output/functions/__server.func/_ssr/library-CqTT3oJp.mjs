import { b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as cn, n as Route$6 } from "./router-CTFxBC_9.mjs";
import { n as Card, t as Badge } from "./ui-BFdMxFpS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/library-CqTT3oJp.js
var import_jsx_runtime = require_jsx_runtime();
function TitleBlock({ d }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			x: "20",
			y: "620",
			width: "760",
			height: "60",
			fill: "#fff",
			stroke: "#1b2430",
			strokeWidth: "1.2"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: "200",
			y1: "620",
			x2: "200",
			y2: "680",
			stroke: "#1b2430"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: "520",
			y1: "620",
			x2: "520",
			y2: "680",
			stroke: "#1b2430"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: "640",
			y1: "620",
			x2: "640",
			y2: "680",
			stroke: "#1b2430"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "30",
			y: "640",
			fill: "#5c6775",
			fontSize: "8",
			children: "GELARAN MAJU SDN BHD"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "30",
			y: "656",
			fill: "#1b2430",
			fontSize: "10",
			fontWeight: "600",
			children: "THE CAPITOL / MSK"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "30",
			y: "672",
			fill: "#5c6775",
			fontSize: "8",
			children: "MEP shop drawing"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "212",
			y: "640",
			fill: "#5c6775",
			fontSize: "8",
			children: "TITLE"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "212",
			y: "662",
			fill: "#1b2430",
			fontSize: "12",
			fontWeight: "600",
			children: d.title
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "532",
			y: "640",
			fill: "#5c6775",
			fontSize: "8",
			children: "DWG"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "532",
			y: "662",
			fill: "#1b2430",
			fontSize: "12",
			fontWeight: "600",
			children: d.id
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "652",
			y: "640",
			fill: "#5c6775",
			fontSize: "8",
			children: "SCALE / REV"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
			x: "652",
			y: "662",
			fill: "#1b2430",
			fontSize: "12",
			fontWeight: "600",
			children: [
				d.scale,
				" · ",
				d.rev
			]
		})
	] });
}
function Frame() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
		x: "12",
		y: "12",
		width: "776",
		height: "676",
		fill: "#fbfcfe",
		stroke: "#1b2430",
		strokeWidth: "2"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
		x: "20",
		y: "20",
		width: "760",
		height: "592",
		fill: "#fff",
		stroke: "#c9d0da"
	})] });
}
function Riser({ x, label, top, bot }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
		x1: x,
		y1: top,
		x2: x,
		y2: bot,
		stroke: "#3d8bff",
		strokeWidth: "4"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
		x,
		y: top - 8,
		textAnchor: "middle",
		fontSize: "10",
		fill: "#1b2430",
		fontWeight: "600",
		children: label
	})] });
}
function Floors({ x, levels }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", { children: levels.map((lv, i) => {
		const y = 80 + i * 22;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: x - 18,
			y1: y,
			x2: x + 18,
			y2: y,
			stroke: "#1b2430",
			strokeWidth: "1.4"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: x + 26,
			y: y + 3,
			fontSize: "8",
			fill: "#5c6775",
			children: lv
		})] }, lv);
	}) });
}
var LVS = [
	"31M",
	"31",
	"30",
	"28",
	"26",
	"24",
	"22",
	"20",
	"18",
	"16",
	"14",
	"13"
];
function DrawingArt({ id }) {
	if (id === "CW-P-01") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "40",
			y: "48",
			fontSize: "11",
			fill: "#5c6775",
			children: "SS TRANSFER MAIN · Ø PER SCHEDULE · FLOW ↑"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M60 560 L60 140 L180 140 L180 90",
			fill: "none",
			stroke: "#3d8bff",
			strokeWidth: "5"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "60",
			cy: "560",
			r: "10",
			fill: "#1b2430"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "78",
			y: "564",
			fontSize: "10",
			children: "PUMP L31"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			x: "168",
			y: "78",
			width: "36",
			height: "22",
			fill: "none",
			stroke: "#1b2430"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "170",
			y: "93",
			fontSize: "8",
			children: "PANEL"
		}),
		[
			[
				60,
				500,
				"L13 10.75m"
			],
			[
				60,
				430,
				"L14–21 4.5m"
			],
			[
				60,
				320,
				"ELBOW"
			],
			[
				60,
				240,
				"CHECK VALVE"
			],
			[
				180,
				140,
				"L31 12.7m"
			]
		].map(([x, y, t]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: Number(x),
			cy: Number(y),
			r: "4",
			fill: "#1b2430"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: Number(x) + 12,
			y: Number(y) + 4,
			fontSize: "9",
			children: t
		})] }, String(t))),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "420",
			y: "200",
			fontSize: "10",
			fill: "#5c6775",
			children: "Tower A advanced to L21"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "420",
			y: "220",
			fontSize: "10",
			fill: "#5c6775",
			children: "Tower B SS pipe from L21–L29"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "420",
			y: "260",
			fontSize: "10",
			children: "Sampling point @ L13 (done) and L23 (open)"
		})
	] });
	if (id === "SAN-R-01" || id === "SAN-T-01") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Riser, {
			x: 160,
			label: "STACK A",
			top: 70,
			bot: 560
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Riser, {
			x: 280,
			label: "STACK B",
			top: 70,
			bot: 560
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Floors, {
			x: 160,
			levels: LVS
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Floors, {
			x: 280,
			levels: LVS
		}),
		[
			80,
			124,
			168,
			212,
			256,
			300
		].map((y) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "400",
				y,
				width: "70",
				height: "28",
				fill: "none",
				stroke: "#1b2430"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: "410",
				y: y + 18,
				fontSize: "9",
				children: "WC · WB"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: "400",
				y1: y + 14,
				x2: "280",
				y2: y + 14,
				stroke: "#1b2430",
				strokeWidth: "1.5"
			})
		] }, y)),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "500",
			y: "96",
			fontSize: "10",
			fill: "#5c6775",
			children: "4 toilet sets L25–L31"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "500",
			y: "116",
			fontSize: "10",
			fill: "#5c6775",
			children: "Hosereel + floor trap 6 nos / floor"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "160",
			cy: "560",
			r: "14",
			fill: "none",
			stroke: "#3d8bff",
			strokeWidth: "2"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "140",
			y: "590",
			fontSize: "9",
			children: "Gully / FT"
		})
	] });
	if (id === "IRR-01") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			x: "80",
			y: "80",
			width: "120",
			height: "50",
			fill: "none",
			stroke: "#1b2430"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "92",
			y: "110",
			fontSize: "11",
			fontWeight: "600",
			children: "IRR PANEL"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: "200",
			y1: "105",
			x2: "320",
			y2: "105",
			stroke: "#3d8bff",
			strokeWidth: "3"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "220",
			y: "96",
			fontSize: "9",
			children: "24V CONTROL"
		}),
		[
			0,
			1,
			2,
			3,
			4
		].map((i) => {
			const y = 180 + i * 70;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "320",
					cy: y,
					r: "8",
					fill: "none",
					stroke: "#1b2430",
					strokeWidth: "2"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: "320",
					y1: y,
					x2: "480",
					y2: y,
					stroke: "#3d8bff",
					strokeWidth: "2"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "480",
					y: y - 14,
					width: "80",
					height: "28",
					fill: "none",
					stroke: "#1b2430"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					x: "492",
					y: y + 4,
					fontSize: "9",
					children: "OUTLET"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
					x: "340",
					y: y - 10,
					fontSize: "8",
					fill: "#5c6775",
					children: ["INLET L", 13 + i * 4]
				})
			] }, i);
		})
	] });
	if (id === "RF-31") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			x: "80",
			y: "80",
			width: "640",
			height: "220",
			fill: "none",
			stroke: "#1b2430"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "96",
			y: "104",
			fontSize: "12",
			fontWeight: "600",
			children: "L31 PLANT"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			x: "120",
			y: "140",
			width: "90",
			height: "70",
			fill: "#eef1f5",
			stroke: "#1b2430"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "138",
			y: "180",
			fontSize: "10",
			children: "PUMP A"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			x: "230",
			y: "140",
			width: "90",
			height: "70",
			fill: "#eef1f5",
			stroke: "#1b2430"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "248",
			y: "180",
			fontSize: "10",
			children: "PUMP B"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			x: "360",
			y: "150",
			width: "110",
			height: "50",
			fill: "none",
			stroke: "#3d8bff",
			strokeWidth: "2"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "372",
			y: "180",
			fontSize: "10",
			children: "CONTROL PANEL"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			x: "80",
			y: "340",
			width: "640",
			height: "140",
			fill: "none",
			stroke: "#1b2430",
			strokeDasharray: "4 3"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "96",
			y: "364",
			fontSize: "12",
			fontWeight: "600",
			children: "31M ROOF"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M160 400 H640",
			stroke: "#3d8bff",
			strokeWidth: "4"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "160",
			y: "430",
			fontSize: "10",
			children: "Roof piping — not started"
		})
	] });
	if (id === "TYP-FL") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			x: "80",
			y: "80",
			width: "300",
			height: "420",
			fill: "none",
			stroke: "#1b2430"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "96",
			y: "104",
			fontSize: "11",
			fontWeight: "600",
			children: "TOWER FLOOR PLATE (TYP.)"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			x: "110",
			y: "140",
			width: "100",
			height: "140",
			fill: "#eef1f5",
			stroke: "#1b2430"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "128",
			y: "210",
			fontSize: "10",
			children: "TOILET CORE"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			x: "240",
			y: "160",
			width: "70",
			height: "50",
			fill: "none",
			stroke: "#3d8bff"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "248",
			y: "190",
			fontSize: "9",
			children: "HOSEREEL"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			x: "110",
			y: "320",
			width: "220",
			height: "80",
			fill: "none",
			stroke: "#1b2430",
			strokeDasharray: "3 2"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "128",
			y: "365",
			fontSize: "10",
			children: "TENANT CW / SAN"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			x: "430",
			y: "80",
			width: "280",
			height: "420",
			fill: "none",
			stroke: "#1b2430"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "446",
			y: "104",
			fontSize: "11",
			fontWeight: "600",
			children: "SERVICES KEY"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "446",
			y: "140",
			fontSize: "10",
			children: "1. Pipe sleeve at slab"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "446",
			y: "164",
			fontSize: "10",
			children: "2. Backshaft CW & FW"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "446",
			y: "188",
			fontSize: "10",
			children: "3. Toilet distribution"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "446",
			y: "212",
			fontSize: "10",
			children: "4. Irrigation offtakes"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "446",
			y: "260",
			fontSize: "10",
			fill: "#5c6775",
			children: "Transfer SS in shaft"
		})
	] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Riser, {
			x: 220,
			label: "CW A",
			top: 70,
			bot: 560
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Riser, {
			x: 360,
			label: "CW B",
			top: 70,
			bot: 560
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Floors, {
			x: 220,
			levels: LVS
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Floors, {
			x: 360,
			levels: LVS
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			x: "500",
			y: "80",
			width: "240",
			height: "160",
			fill: "none",
			stroke: "#1b2430"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "516",
			y: "104",
			fontSize: "11",
			fontWeight: "600",
			children: "NOTES"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "516",
			y: "128",
			fontSize: "10",
			children: "Sleeve complete most floors"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "516",
			y: "148",
			fontSize: "10",
			children: "A transfer pipe leads B"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "516",
			y: "168",
			fontSize: "10",
			children: "Roof piping 0%"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "516",
			y: "188",
			fontSize: "10",
			children: "Pumps at L31 ~95%"
		})
	] });
}
function DrawingSheet({ drawing }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 800 700",
		className: "h-auto w-full bg-surface",
		role: "img",
		"aria-label": drawing.title,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Frame, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawingArt, { id: drawing.id }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleBlock, { d: drawing })
		]
	});
}
var DRAWINGS = [
	{
		id: "CW-R-01",
		title: "Cold water riser — Towers A & B",
		package: "Cold Water",
		scale: "NTS",
		rev: "A",
		note: "Pipe sleeve each floor. Transfer SS pipe L13–L31. Roof manifold at L31/31M."
	},
	{
		id: "CW-P-01",
		title: "Stainless steel transfer pump pipe",
		package: "Cold Water",
		scale: "NTS",
		rev: "A",
		note: "RM 80/m. Elbow / check valve extra. Sampling points L13 and L23."
	},
	{
		id: "SAN-R-01",
		title: "Sanitary stack, hosereel & tenant droppers",
		package: "Sanitary",
		scale: "NTS",
		rev: "A",
		note: "Hosereel set + floor trap (6 nos/floor). Tenant stack and vent cowls."
	},
	{
		id: "SAN-T-01",
		title: "Toilet high level & distribution L24–L31",
		package: "Sanitary",
		scale: "NTS",
		rev: "A",
		note: "4 toilet sets L25–L31. L24 additional 2 sets. UPVC waste and vent."
	},
	{
		id: "IRR-01",
		title: "Irrigation inlet, outlet and control",
		package: "Irrigation",
		scale: "NTS",
		rev: "A",
		note: "Outlet and inlet per floor. Wiring and panel remaining."
	},
	{
		id: "RF-31",
		title: "L31 / 31M roof plant",
		package: "Cold Water",
		scale: "NTS",
		rev: "A",
		note: "Pumps, control panel, roof piping and irrigation panel location."
	},
	{
		id: "TYP-FL",
		title: "Typical floor wet services L13–L30",
		package: "Combined",
		scale: "NTS",
		rev: "A",
		note: "CW tenant, backshaft, hosereel, toilet core, irrigation offtakes."
	}
];
function Library() {
	const { dwg } = Route$6.useSearch();
	const active = DRAWINGS.find((d) => d.id === dwg) ?? DRAWINGS[0];
	const navigate = Route$6.useNavigate();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-semibold",
				children: "Drawings library"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "MEP shop drawings for The Capitol / MSK. Select a sheet, then print or share from the browser."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
				children: DRAWINGS.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => navigate({ search: { dwg: d.id } }),
					className: cn("rounded-lg border p-4 text-left transition-colors duration-150", active.id === d.id ? "border-ink bg-surface" : "border-border bg-surface-2 hover:border-ink/40"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs text-muted",
							children: d.id
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 font-display text-base font-semibold",
							children: d.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: "mute",
								children: d.package
							})
						})
					]
				}, d.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-3 sm:p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex flex-wrap items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs text-muted",
							children: active.id
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-lg font-semibold",
							children: active.title
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "accent",
							children: active.package
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-4 text-sm text-muted",
						children: active.note
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-hidden rounded-lg border border-border",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawingSheet, { drawing: active })
					})
				]
			})
		]
	});
}
//#endregion
export { Library as component };
