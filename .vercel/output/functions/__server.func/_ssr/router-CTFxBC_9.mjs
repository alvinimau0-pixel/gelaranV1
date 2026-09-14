import { i as __toESM } from "../_runtime.mjs";
import { _ as createRootRoute, b as require_jsx_runtime, d as useRouterState, g as createFileRoute, h as lazyRouteComponent, l as Scripts, m as Outlet, p as createRouter, u as HeadContent, v as Link, y as useRouter, z as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Menu, c as HardHat, d as Droplets, f as Building2, i as Package, l as Grid3x3, n as Truck, o as Library, r as TriangleAlert, s as LayoutDashboard, t as X, u as FileSpreadsheet } from "../_libs/lucide-react.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-CTFxBC_9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function pct(n, digits = 1) {
	if (n == null || Number.isNaN(n)) return "—";
	return `${(n * 100).toFixed(digits)}%`;
}
function rm(n) {
	if (n == null || Number.isNaN(Number(n))) return "—";
	return `RM ${Number(n).toLocaleString("en-MY", { maximumFractionDigits: 2 })}`;
}
function leaderTone(leader) {
	if (leader === "Tower A") return "ok";
	if (leader === "Tower B") return "warn";
	return "mute";
}
var report = {
	"meta": {
		"company": "GELARAN MAJU SDN BHD",
		"project": "THE CAPITOL / MSK",
		"reportDate": "12 SEPTEMBER 2026",
		"supaham": "SUPAHAM"
	},
	"packages": {
		"coldWater": .4760714285714284,
		"sanitary": .47025,
		"irrigation": .06125,
		"overall": .335857142857143
	},
	"site": {
		"overall": .3358571428571427,
		"coldWater": .4760714285714284,
		"sanitary": .4702499999999998,
		"irrigation": .06125,
		"men": 27,
		"dayRm": 15900,
		"weather": "Fair",
		"shift": "Day",
		"today": "Transfer pump + hosereel",
		"blockers": null,
		"tomorrow": null
	},
	"items": [
		"PIPE SLEEVE",
		"PUMP",
		"PUMP CONTROL PANEL",
		"TRANSFER PUMP PIPES",
		"L31 & 31M ROOF PIPING",
		"CW TENANT",
		"BACKSHAFT CW & FW TOILETS",
		"HOSEREEL FLOORTRAP & STACK",
		"SANITARY TENANT",
		"TOILET PIPE DISTRIBUTION & HACKING",
		"SANITARY TOILETS",
		"SANITARY WARES INSTALLATION",
		"IRRIGATION OUTLET",
		"IRRIGATION INLET",
		"IRRIGATION WIRING",
		"IRRIGATION CONTROL PANEL"
	],
	"cw": [
		"PIPE SLEEVE",
		"PUMP",
		"PUMP CONTROL PANEL",
		"TRANSFER PUMP PIPES",
		"L31 & 31M ROOF PIPING",
		"CW TENANT",
		"BACKSHAFT CW & FW TOILETS"
	],
	"san": [
		"HOSEREEL FLOORTRAP & STACK",
		"SANITARY TENANT",
		"TOILET PIPE DISTRIBUTION & HACKING",
		"SANITARY TOILETS",
		"SANITARY WARES INSTALLATION"
	],
	"irr": [
		"IRRIGATION OUTLET",
		"IRRIGATION INLET",
		"IRRIGATION WIRING",
		"IRRIGATION CONTROL PANEL"
	],
	"progression": {
		"A": [
			{
				"level": "13",
				"items": {
					"PIPE SLEEVE": 1,
					"PUMP": null,
					"PUMP CONTROL PANEL": null,
					"TRANSFER PUMP PIPES": .95,
					"L31 & 31M ROOF PIPING": null,
					"CW TENANT": .95,
					"BACKSHAFT CW & FW TOILETS": 0,
					"HOSEREEL FLOORTRAP & STACK": .95,
					"SANITARY TENANT": .95,
					"TOILET PIPE DISTRIBUTION & HACKING": 0,
					"SANITARY TOILETS": 0,
					"SANITARY WARES INSTALLATION": 0,
					"IRRIGATION OUTLET": 1,
					"IRRIGATION INLET": .9,
					"IRRIGATION WIRING": 0,
					"IRRIGATION CONTROL PANEL": null
				}
			},
			{
				"level": "14",
				"items": {
					"PIPE SLEEVE": 1,
					"PUMP": null,
					"PUMP CONTROL PANEL": null,
					"TRANSFER PUMP PIPES": .95,
					"L31 & 31M ROOF PIPING": null,
					"CW TENANT": .95,
					"BACKSHAFT CW & FW TOILETS": .95,
					"HOSEREEL FLOORTRAP & STACK": .95,
					"SANITARY TENANT": .95,
					"TOILET PIPE DISTRIBUTION & HACKING": .95,
					"SANITARY TOILETS": .95,
					"SANITARY WARES INSTALLATION": .95,
					"IRRIGATION OUTLET": 1,
					"IRRIGATION INLET": 0,
					"IRRIGATION WIRING": 0,
					"IRRIGATION CONTROL PANEL": null
				}
			},
			{
				"level": "15",
				"items": {
					"PIPE SLEEVE": 1,
					"PUMP": null,
					"PUMP CONTROL PANEL": null,
					"TRANSFER PUMP PIPES": .95,
					"L31 & 31M ROOF PIPING": null,
					"CW TENANT": .95,
					"BACKSHAFT CW & FW TOILETS": .95,
					"HOSEREEL FLOORTRAP & STACK": .95,
					"SANITARY TENANT": .95,
					"TOILET PIPE DISTRIBUTION & HACKING": .95,
					"SANITARY TOILETS": .95,
					"SANITARY WARES INSTALLATION": .95,
					"IRRIGATION OUTLET": .95,
					"IRRIGATION INLET": 0,
					"IRRIGATION WIRING": 0,
					"IRRIGATION CONTROL PANEL": null
				}
			},
			{
				"level": "16",
				"items": {
					"PIPE SLEEVE": 1,
					"PUMP": null,
					"PUMP CONTROL PANEL": null,
					"TRANSFER PUMP PIPES": .95,
					"L31 & 31M ROOF PIPING": null,
					"CW TENANT": .95,
					"BACKSHAFT CW & FW TOILETS": .95,
					"HOSEREEL FLOORTRAP & STACK": .5,
					"SANITARY TENANT": .5,
					"TOILET PIPE DISTRIBUTION & HACKING": 1,
					"SANITARY TOILETS": .95,
					"SANITARY WARES INSTALLATION": .95,
					"IRRIGATION OUTLET": .95,
					"IRRIGATION INLET": 0,
					"IRRIGATION WIRING": 0,
					"IRRIGATION CONTROL PANEL": null
				}
			},
			{
				"level": "17",
				"items": {
					"PIPE SLEEVE": 1,
					"PUMP": null,
					"PUMP CONTROL PANEL": null,
					"TRANSFER PUMP PIPES": .95,
					"L31 & 31M ROOF PIPING": null,
					"CW TENANT": .95,
					"BACKSHAFT CW & FW TOILETS": 0,
					"HOSEREEL FLOORTRAP & STACK": .5,
					"SANITARY TENANT": .5,
					"TOILET PIPE DISTRIBUTION & HACKING": 1,
					"SANITARY TOILETS": .95,
					"SANITARY WARES INSTALLATION": .1,
					"IRRIGATION OUTLET": 0,
					"IRRIGATION INLET": 0,
					"IRRIGATION WIRING": 0,
					"IRRIGATION CONTROL PANEL": null
				}
			},
			{
				"level": "18",
				"items": {
					"PIPE SLEEVE": 1,
					"PUMP": null,
					"PUMP CONTROL PANEL": null,
					"TRANSFER PUMP PIPES": .95,
					"L31 & 31M ROOF PIPING": null,
					"CW TENANT": .95,
					"BACKSHAFT CW & FW TOILETS": 0,
					"HOSEREEL FLOORTRAP & STACK": .5,
					"SANITARY TENANT": .5,
					"TOILET PIPE DISTRIBUTION & HACKING": 1,
					"SANITARY TOILETS": .95,
					"SANITARY WARES INSTALLATION": 0,
					"IRRIGATION OUTLET": .1,
					"IRRIGATION INLET": 0,
					"IRRIGATION WIRING": 0,
					"IRRIGATION CONTROL PANEL": null
				}
			},
			{
				"level": "19",
				"items": {
					"PIPE SLEEVE": 1,
					"PUMP": null,
					"PUMP CONTROL PANEL": null,
					"TRANSFER PUMP PIPES": .95,
					"L31 & 31M ROOF PIPING": null,
					"CW TENANT": .95,
					"BACKSHAFT CW & FW TOILETS": 0,
					"HOSEREEL FLOORTRAP & STACK": .5,
					"SANITARY TENANT": .5,
					"TOILET PIPE DISTRIBUTION & HACKING": 1,
					"SANITARY TOILETS": .95,
					"SANITARY WARES INSTALLATION": 0,
					"IRRIGATION OUTLET": 0,
					"IRRIGATION INLET": 0,
					"IRRIGATION WIRING": 0,
					"IRRIGATION CONTROL PANEL": null
				}
			},
			{
				"level": "20",
				"items": {
					"PIPE SLEEVE": 1,
					"PUMP": null,
					"PUMP CONTROL PANEL": null,
					"TRANSFER PUMP PIPES": .95,
					"L31 & 31M ROOF PIPING": null,
					"CW TENANT": .95,
					"BACKSHAFT CW & FW TOILETS": 0,
					"HOSEREEL FLOORTRAP & STACK": .95,
					"SANITARY TENANT": .95,
					"TOILET PIPE DISTRIBUTION & HACKING": .2,
					"SANITARY TOILETS": .95,
					"SANITARY WARES INSTALLATION": 0,
					"IRRIGATION OUTLET": 0,
					"IRRIGATION INLET": 0,
					"IRRIGATION WIRING": 0,
					"IRRIGATION CONTROL PANEL": null
				}
			},
			{
				"level": "21",
				"items": {
					"PIPE SLEEVE": 1,
					"PUMP": null,
					"PUMP CONTROL PANEL": null,
					"TRANSFER PUMP PIPES": .95,
					"L31 & 31M ROOF PIPING": null,
					"CW TENANT": .95,
					"BACKSHAFT CW & FW TOILETS": 0,
					"HOSEREEL FLOORTRAP & STACK": .95,
					"SANITARY TENANT": .95,
					"TOILET PIPE DISTRIBUTION & HACKING": 0,
					"SANITARY TOILETS": .95,
					"SANITARY WARES INSTALLATION": 0,
					"IRRIGATION OUTLET": 0,
					"IRRIGATION INLET": 0,
					"IRRIGATION WIRING": 0,
					"IRRIGATION CONTROL PANEL": null
				}
			},
			{
				"level": "22",
				"items": {
					"PIPE SLEEVE": 1,
					"PUMP": null,
					"PUMP CONTROL PANEL": null,
					"TRANSFER PUMP PIPES": .95,
					"L31 & 31M ROOF PIPING": null,
					"CW TENANT": .95,
					"BACKSHAFT CW & FW TOILETS": 0,
					"HOSEREEL FLOORTRAP & STACK": .95,
					"SANITARY TENANT": .95,
					"TOILET PIPE DISTRIBUTION & HACKING": .95,
					"SANITARY TOILETS": .95,
					"SANITARY WARES INSTALLATION": 0,
					"IRRIGATION OUTLET": 0,
					"IRRIGATION INLET": 0,
					"IRRIGATION WIRING": 0,
					"IRRIGATION CONTROL PANEL": 0
				}
			},
			{
				"level": "23",
				"items": {
					"PIPE SLEEVE": 1,
					"PUMP": null,
					"PUMP CONTROL PANEL": null,
					"TRANSFER PUMP PIPES": .95,
					"L31 & 31M ROOF PIPING": null,
					"CW TENANT": .95,
					"BACKSHAFT CW & FW TOILETS": 0,
					"HOSEREEL FLOORTRAP & STACK": .5,
					"SANITARY TENANT": .5,
					"TOILET PIPE DISTRIBUTION & HACKING": 0,
					"SANITARY TOILETS": .95,
					"SANITARY WARES INSTALLATION": 0,
					"IRRIGATION OUTLET": 0,
					"IRRIGATION INLET": 0,
					"IRRIGATION WIRING": 0,
					"IRRIGATION CONTROL PANEL": null
				}
			},
			{
				"level": "24",
				"items": {
					"PIPE SLEEVE": 1,
					"PUMP": null,
					"PUMP CONTROL PANEL": null,
					"TRANSFER PUMP PIPES": .95,
					"L31 & 31M ROOF PIPING": null,
					"CW TENANT": .95,
					"BACKSHAFT CW & FW TOILETS": 0,
					"HOSEREEL FLOORTRAP & STACK": .5,
					"SANITARY TENANT": .5,
					"TOILET PIPE DISTRIBUTION & HACKING": 0,
					"SANITARY TOILETS": .95,
					"SANITARY WARES INSTALLATION": 0,
					"IRRIGATION OUTLET": 0,
					"IRRIGATION INLET": 0,
					"IRRIGATION WIRING": 0,
					"IRRIGATION CONTROL PANEL": null
				}
			},
			{
				"level": "25",
				"items": {
					"PIPE SLEEVE": 1,
					"PUMP": null,
					"PUMP CONTROL PANEL": null,
					"TRANSFER PUMP PIPES": .95,
					"L31 & 31M ROOF PIPING": null,
					"CW TENANT": .95,
					"BACKSHAFT CW & FW TOILETS": 0,
					"HOSEREEL FLOORTRAP & STACK": .95,
					"SANITARY TENANT": .95,
					"TOILET PIPE DISTRIBUTION & HACKING": 0,
					"SANITARY TOILETS": .95,
					"SANITARY WARES INSTALLATION": 0,
					"IRRIGATION OUTLET": 0,
					"IRRIGATION INLET": 0,
					"IRRIGATION WIRING": 0,
					"IRRIGATION CONTROL PANEL": null
				}
			},
			{
				"level": "26",
				"items": {
					"PIPE SLEEVE": 1,
					"PUMP": null,
					"PUMP CONTROL PANEL": null,
					"TRANSFER PUMP PIPES": .95,
					"L31 & 31M ROOF PIPING": null,
					"CW TENANT": .95,
					"BACKSHAFT CW & FW TOILETS": 0,
					"HOSEREEL FLOORTRAP & STACK": .95,
					"SANITARY TENANT": .95,
					"TOILET PIPE DISTRIBUTION & HACKING": .95,
					"SANITARY TOILETS": .95,
					"SANITARY WARES INSTALLATION": 0,
					"IRRIGATION OUTLET": 0,
					"IRRIGATION INLET": 0,
					"IRRIGATION WIRING": 0,
					"IRRIGATION CONTROL PANEL": null
				}
			},
			{
				"level": "27",
				"items": {
					"PIPE SLEEVE": 1,
					"PUMP": null,
					"PUMP CONTROL PANEL": null,
					"TRANSFER PUMP PIPES": .95,
					"L31 & 31M ROOF PIPING": null,
					"CW TENANT": .95,
					"BACKSHAFT CW & FW TOILETS": 0,
					"HOSEREEL FLOORTRAP & STACK": .95,
					"SANITARY TENANT": .95,
					"TOILET PIPE DISTRIBUTION & HACKING": 0,
					"SANITARY TOILETS": .95,
					"SANITARY WARES INSTALLATION": 0,
					"IRRIGATION OUTLET": 0,
					"IRRIGATION INLET": 0,
					"IRRIGATION WIRING": 0,
					"IRRIGATION CONTROL PANEL": null
				}
			},
			{
				"level": "28",
				"items": {
					"PIPE SLEEVE": 1,
					"PUMP": null,
					"PUMP CONTROL PANEL": null,
					"TRANSFER PUMP PIPES": .95,
					"L31 & 31M ROOF PIPING": null,
					"CW TENANT": .95,
					"BACKSHAFT CW & FW TOILETS": 0,
					"HOSEREEL FLOORTRAP & STACK": 0,
					"SANITARY TENANT": 0,
					"TOILET PIPE DISTRIBUTION & HACKING": 0,
					"SANITARY TOILETS": 0,
					"SANITARY WARES INSTALLATION": 0,
					"IRRIGATION OUTLET": 0,
					"IRRIGATION INLET": 0,
					"IRRIGATION WIRING": 0,
					"IRRIGATION CONTROL PANEL": null
				}
			},
			{
				"level": "29",
				"items": {
					"PIPE SLEEVE": 1,
					"PUMP": null,
					"PUMP CONTROL PANEL": null,
					"TRANSFER PUMP PIPES": 0,
					"L31 & 31M ROOF PIPING": null,
					"CW TENANT": .95,
					"BACKSHAFT CW & FW TOILETS": 0,
					"HOSEREEL FLOORTRAP & STACK": 0,
					"SANITARY TENANT": 0,
					"TOILET PIPE DISTRIBUTION & HACKING": 0,
					"SANITARY TOILETS": 0,
					"SANITARY WARES INSTALLATION": 0,
					"IRRIGATION OUTLET": 0,
					"IRRIGATION INLET": 0,
					"IRRIGATION WIRING": 0,
					"IRRIGATION CONTROL PANEL": null
				}
			},
			{
				"level": "30",
				"items": {
					"PIPE SLEEVE": 1,
					"PUMP": null,
					"PUMP CONTROL PANEL": null,
					"TRANSFER PUMP PIPES": 0,
					"L31 & 31M ROOF PIPING": null,
					"CW TENANT": 0,
					"BACKSHAFT CW & FW TOILETS": 0,
					"HOSEREEL FLOORTRAP & STACK": 0,
					"SANITARY TENANT": 0,
					"TOILET PIPE DISTRIBUTION & HACKING": 0,
					"SANITARY TOILETS": 0,
					"SANITARY WARES INSTALLATION": 0,
					"IRRIGATION OUTLET": 0,
					"IRRIGATION INLET": 0,
					"IRRIGATION WIRING": 0,
					"IRRIGATION CONTROL PANEL": null
				}
			},
			{
				"level": "31",
				"items": {
					"PIPE SLEEVE": .55,
					"PUMP": .95,
					"PUMP CONTROL PANEL": .95,
					"TRANSFER PUMP PIPES": 0,
					"L31 & 31M ROOF PIPING": 0,
					"CW TENANT": 0,
					"BACKSHAFT CW & FW TOILETS": 0,
					"HOSEREEL FLOORTRAP & STACK": 0,
					"SANITARY TENANT": 0,
					"TOILET PIPE DISTRIBUTION & HACKING": 0,
					"SANITARY TOILETS": 0,
					"SANITARY WARES INSTALLATION": 0,
					"IRRIGATION OUTLET": 0,
					"IRRIGATION INLET": 0,
					"IRRIGATION WIRING": 0,
					"IRRIGATION CONTROL PANEL": null
				}
			},
			{
				"level": "31M",
				"items": {
					"PIPE SLEEVE": .1,
					"PUMP": 0,
					"PUMP CONTROL PANEL": 0,
					"TRANSFER PUMP PIPES": 0,
					"L31 & 31M ROOF PIPING": 0,
					"CW TENANT": 0,
					"BACKSHAFT CW & FW TOILETS": 0,
					"HOSEREEL FLOORTRAP & STACK": 0,
					"SANITARY TENANT": 0,
					"TOILET PIPE DISTRIBUTION & HACKING": 0,
					"SANITARY TOILETS": 0,
					"SANITARY WARES INSTALLATION": 0,
					"IRRIGATION OUTLET": 0,
					"IRRIGATION INLET": 0,
					"IRRIGATION WIRING": 0,
					"IRRIGATION CONTROL PANEL": 0
				}
			}
		],
		"B": [
			{
				"level": "13",
				"items": {
					"PIPE SLEEVE": 1,
					"PUMP": null,
					"PUMP CONTROL PANEL": null,
					"TRANSFER PUMP PIPES": .95,
					"L31 & 31M ROOF PIPING": null,
					"CW TENANT": .95,
					"BACKSHAFT CW & FW TOILETS": 0,
					"HOSEREEL FLOORTRAP & STACK": .95,
					"SANITARY TENANT": .95,
					"TOILET PIPE DISTRIBUTION & HACKING": 0,
					"SANITARY TOILETS": 0,
					"SANITARY WARES INSTALLATION": 0,
					"IRRIGATION OUTLET": 1,
					"IRRIGATION INLET": .9,
					"IRRIGATION WIRING": 0,
					"IRRIGATION CONTROL PANEL": null
				}
			},
			{
				"level": "14",
				"items": {
					"PIPE SLEEVE": 1,
					"PUMP": null,
					"PUMP CONTROL PANEL": null,
					"TRANSFER PUMP PIPES": .95,
					"L31 & 31M ROOF PIPING": null,
					"CW TENANT": .95,
					"BACKSHAFT CW & FW TOILETS": .95,
					"HOSEREEL FLOORTRAP & STACK": .95,
					"SANITARY TENANT": .95,
					"TOILET PIPE DISTRIBUTION & HACKING": .95,
					"SANITARY TOILETS": .95,
					"SANITARY WARES INSTALLATION": .95,
					"IRRIGATION OUTLET": 1,
					"IRRIGATION INLET": 0,
					"IRRIGATION WIRING": 0,
					"IRRIGATION CONTROL PANEL": null
				}
			},
			{
				"level": "15",
				"items": {
					"PIPE SLEEVE": 1,
					"PUMP": null,
					"PUMP CONTROL PANEL": null,
					"TRANSFER PUMP PIPES": .95,
					"L31 & 31M ROOF PIPING": null,
					"CW TENANT": .95,
					"BACKSHAFT CW & FW TOILETS": .95,
					"HOSEREEL FLOORTRAP & STACK": .95,
					"SANITARY TENANT": .95,
					"TOILET PIPE DISTRIBUTION & HACKING": .95,
					"SANITARY TOILETS": .95,
					"SANITARY WARES INSTALLATION": .95,
					"IRRIGATION OUTLET": .95,
					"IRRIGATION INLET": 0,
					"IRRIGATION WIRING": 0,
					"IRRIGATION CONTROL PANEL": null
				}
			},
			{
				"level": "16",
				"items": {
					"PIPE SLEEVE": 1,
					"PUMP": null,
					"PUMP CONTROL PANEL": null,
					"TRANSFER PUMP PIPES": .95,
					"L31 & 31M ROOF PIPING": null,
					"CW TENANT": .95,
					"BACKSHAFT CW & FW TOILETS": .1,
					"HOSEREEL FLOORTRAP & STACK": .5,
					"SANITARY TENANT": .5,
					"TOILET PIPE DISTRIBUTION & HACKING": .95,
					"SANITARY TOILETS": .95,
					"SANITARY WARES INSTALLATION": .95,
					"IRRIGATION OUTLET": .95,
					"IRRIGATION INLET": 0,
					"IRRIGATION WIRING": 0,
					"IRRIGATION CONTROL PANEL": null
				}
			},
			{
				"level": "17",
				"items": {
					"PIPE SLEEVE": 1,
					"PUMP": null,
					"PUMP CONTROL PANEL": null,
					"TRANSFER PUMP PIPES": .95,
					"L31 & 31M ROOF PIPING": null,
					"CW TENANT": .95,
					"BACKSHAFT CW & FW TOILETS": 0,
					"HOSEREEL FLOORTRAP & STACK": .5,
					"SANITARY TENANT": .5,
					"TOILET PIPE DISTRIBUTION & HACKING": .95,
					"SANITARY TOILETS": .95,
					"SANITARY WARES INSTALLATION": .1,
					"IRRIGATION OUTLET": 0,
					"IRRIGATION INLET": 0,
					"IRRIGATION WIRING": 0,
					"IRRIGATION CONTROL PANEL": null
				}
			},
			{
				"level": "18",
				"items": {
					"PIPE SLEEVE": 1,
					"PUMP": null,
					"PUMP CONTROL PANEL": null,
					"TRANSFER PUMP PIPES": .95,
					"L31 & 31M ROOF PIPING": null,
					"CW TENANT": .95,
					"BACKSHAFT CW & FW TOILETS": 0,
					"HOSEREEL FLOORTRAP & STACK": .5,
					"SANITARY TENANT": .5,
					"TOILET PIPE DISTRIBUTION & HACKING": .95,
					"SANITARY TOILETS": .95,
					"SANITARY WARES INSTALLATION": 0,
					"IRRIGATION OUTLET": .1,
					"IRRIGATION INLET": 0,
					"IRRIGATION WIRING": 0,
					"IRRIGATION CONTROL PANEL": null
				}
			},
			{
				"level": "19",
				"items": {
					"PIPE SLEEVE": 1,
					"PUMP": null,
					"PUMP CONTROL PANEL": null,
					"TRANSFER PUMP PIPES": .95,
					"L31 & 31M ROOF PIPING": null,
					"CW TENANT": .95,
					"BACKSHAFT CW & FW TOILETS": 0,
					"HOSEREEL FLOORTRAP & STACK": .5,
					"SANITARY TENANT": .5,
					"TOILET PIPE DISTRIBUTION & HACKING": .95,
					"SANITARY TOILETS": .95,
					"SANITARY WARES INSTALLATION": 0,
					"IRRIGATION OUTLET": 0,
					"IRRIGATION INLET": 0,
					"IRRIGATION WIRING": 0,
					"IRRIGATION CONTROL PANEL": null
				}
			},
			{
				"level": "20",
				"items": {
					"PIPE SLEEVE": 1,
					"PUMP": null,
					"PUMP CONTROL PANEL": null,
					"TRANSFER PUMP PIPES": 0,
					"L31 & 31M ROOF PIPING": null,
					"CW TENANT": .95,
					"BACKSHAFT CW & FW TOILETS": 0,
					"HOSEREEL FLOORTRAP & STACK": .95,
					"SANITARY TENANT": .95,
					"TOILET PIPE DISTRIBUTION & HACKING": .2,
					"SANITARY TOILETS": .95,
					"SANITARY WARES INSTALLATION": 0,
					"IRRIGATION OUTLET": 0,
					"IRRIGATION INLET": 0,
					"IRRIGATION WIRING": 0,
					"IRRIGATION CONTROL PANEL": null
				}
			},
			{
				"level": "21",
				"items": {
					"PIPE SLEEVE": 1,
					"PUMP": null,
					"PUMP CONTROL PANEL": null,
					"TRANSFER PUMP PIPES": 0,
					"L31 & 31M ROOF PIPING": null,
					"CW TENANT": .95,
					"BACKSHAFT CW & FW TOILETS": 0,
					"HOSEREEL FLOORTRAP & STACK": .95,
					"SANITARY TENANT": .95,
					"TOILET PIPE DISTRIBUTION & HACKING": 0,
					"SANITARY TOILETS": .95,
					"SANITARY WARES INSTALLATION": 0,
					"IRRIGATION OUTLET": 0,
					"IRRIGATION INLET": 0,
					"IRRIGATION WIRING": 0,
					"IRRIGATION CONTROL PANEL": null
				}
			},
			{
				"level": "22",
				"items": {
					"PIPE SLEEVE": 1,
					"PUMP": null,
					"PUMP CONTROL PANEL": null,
					"TRANSFER PUMP PIPES": 0,
					"L31 & 31M ROOF PIPING": null,
					"CW TENANT": .95,
					"BACKSHAFT CW & FW TOILETS": 0,
					"HOSEREEL FLOORTRAP & STACK": .95,
					"SANITARY TENANT": .95,
					"TOILET PIPE DISTRIBUTION & HACKING": .95,
					"SANITARY TOILETS": .95,
					"SANITARY WARES INSTALLATION": 0,
					"IRRIGATION OUTLET": 0,
					"IRRIGATION INLET": 0,
					"IRRIGATION WIRING": 0,
					"IRRIGATION CONTROL PANEL": 0
				}
			},
			{
				"level": "23",
				"items": {
					"PIPE SLEEVE": 1,
					"PUMP": null,
					"PUMP CONTROL PANEL": null,
					"TRANSFER PUMP PIPES": 0,
					"L31 & 31M ROOF PIPING": null,
					"CW TENANT": .95,
					"BACKSHAFT CW & FW TOILETS": 0,
					"HOSEREEL FLOORTRAP & STACK": .5,
					"SANITARY TENANT": .5,
					"TOILET PIPE DISTRIBUTION & HACKING": 0,
					"SANITARY TOILETS": .95,
					"SANITARY WARES INSTALLATION": 0,
					"IRRIGATION OUTLET": 0,
					"IRRIGATION INLET": 0,
					"IRRIGATION WIRING": 0,
					"IRRIGATION CONTROL PANEL": null
				}
			},
			{
				"level": "24",
				"items": {
					"PIPE SLEEVE": 1,
					"PUMP": null,
					"PUMP CONTROL PANEL": null,
					"TRANSFER PUMP PIPES": 0,
					"L31 & 31M ROOF PIPING": null,
					"CW TENANT": .95,
					"BACKSHAFT CW & FW TOILETS": 0,
					"HOSEREEL FLOORTRAP & STACK": .5,
					"SANITARY TENANT": .5,
					"TOILET PIPE DISTRIBUTION & HACKING": 0,
					"SANITARY TOILETS": .5,
					"SANITARY WARES INSTALLATION": 0,
					"IRRIGATION OUTLET": 0,
					"IRRIGATION INLET": 0,
					"IRRIGATION WIRING": 0,
					"IRRIGATION CONTROL PANEL": null
				}
			},
			{
				"level": "25",
				"items": {
					"PIPE SLEEVE": 1,
					"PUMP": null,
					"PUMP CONTROL PANEL": null,
					"TRANSFER PUMP PIPES": 0,
					"L31 & 31M ROOF PIPING": null,
					"CW TENANT": .95,
					"BACKSHAFT CW & FW TOILETS": 0,
					"HOSEREEL FLOORTRAP & STACK": .95,
					"SANITARY TENANT": .95,
					"TOILET PIPE DISTRIBUTION & HACKING": 0,
					"SANITARY TOILETS": .95,
					"SANITARY WARES INSTALLATION": 0,
					"IRRIGATION OUTLET": 0,
					"IRRIGATION INLET": 0,
					"IRRIGATION WIRING": 0,
					"IRRIGATION CONTROL PANEL": null
				}
			},
			{
				"level": "26",
				"items": {
					"PIPE SLEEVE": 1,
					"PUMP": null,
					"PUMP CONTROL PANEL": null,
					"TRANSFER PUMP PIPES": 0,
					"L31 & 31M ROOF PIPING": null,
					"CW TENANT": .95,
					"BACKSHAFT CW & FW TOILETS": 0,
					"HOSEREEL FLOORTRAP & STACK": .95,
					"SANITARY TENANT": .95,
					"TOILET PIPE DISTRIBUTION & HACKING": .95,
					"SANITARY TOILETS": .95,
					"SANITARY WARES INSTALLATION": 0,
					"IRRIGATION OUTLET": 0,
					"IRRIGATION INLET": 0,
					"IRRIGATION WIRING": 0,
					"IRRIGATION CONTROL PANEL": null
				}
			},
			{
				"level": "27",
				"items": {
					"PIPE SLEEVE": 1,
					"PUMP": null,
					"PUMP CONTROL PANEL": null,
					"TRANSFER PUMP PIPES": 0,
					"L31 & 31M ROOF PIPING": null,
					"CW TENANT": .95,
					"BACKSHAFT CW & FW TOILETS": 0,
					"HOSEREEL FLOORTRAP & STACK": .95,
					"SANITARY TENANT": .95,
					"TOILET PIPE DISTRIBUTION & HACKING": 0,
					"SANITARY TOILETS": .95,
					"SANITARY WARES INSTALLATION": 0,
					"IRRIGATION OUTLET": 0,
					"IRRIGATION INLET": 0,
					"IRRIGATION WIRING": 0,
					"IRRIGATION CONTROL PANEL": null
				}
			},
			{
				"level": "28",
				"items": {
					"PIPE SLEEVE": 1,
					"PUMP": null,
					"PUMP CONTROL PANEL": null,
					"TRANSFER PUMP PIPES": 0,
					"L31 & 31M ROOF PIPING": null,
					"CW TENANT": .95,
					"BACKSHAFT CW & FW TOILETS": 0,
					"HOSEREEL FLOORTRAP & STACK": 0,
					"SANITARY TENANT": 0,
					"TOILET PIPE DISTRIBUTION & HACKING": 0,
					"SANITARY TOILETS": 0,
					"SANITARY WARES INSTALLATION": 0,
					"IRRIGATION OUTLET": 0,
					"IRRIGATION INLET": 0,
					"IRRIGATION WIRING": 0,
					"IRRIGATION CONTROL PANEL": null
				}
			},
			{
				"level": "29",
				"items": {
					"PIPE SLEEVE": 1,
					"PUMP": null,
					"PUMP CONTROL PANEL": null,
					"TRANSFER PUMP PIPES": 0,
					"L31 & 31M ROOF PIPING": null,
					"CW TENANT": 0,
					"BACKSHAFT CW & FW TOILETS": 0,
					"HOSEREEL FLOORTRAP & STACK": 0,
					"SANITARY TENANT": 0,
					"TOILET PIPE DISTRIBUTION & HACKING": 0,
					"SANITARY TOILETS": 0,
					"SANITARY WARES INSTALLATION": 0,
					"IRRIGATION OUTLET": 0,
					"IRRIGATION INLET": 0,
					"IRRIGATION WIRING": 0,
					"IRRIGATION CONTROL PANEL": null
				}
			},
			{
				"level": "30",
				"items": {
					"PIPE SLEEVE": 1,
					"PUMP": null,
					"PUMP CONTROL PANEL": null,
					"TRANSFER PUMP PIPES": 0,
					"L31 & 31M ROOF PIPING": null,
					"CW TENANT": 0,
					"BACKSHAFT CW & FW TOILETS": 0,
					"HOSEREEL FLOORTRAP & STACK": 0,
					"SANITARY TENANT": 0,
					"TOILET PIPE DISTRIBUTION & HACKING": 0,
					"SANITARY TOILETS": 0,
					"SANITARY WARES INSTALLATION": 0,
					"IRRIGATION OUTLET": 0,
					"IRRIGATION INLET": 0,
					"IRRIGATION WIRING": 0,
					"IRRIGATION CONTROL PANEL": null
				}
			},
			{
				"level": "31",
				"items": {
					"PIPE SLEEVE": .5,
					"PUMP": .95,
					"PUMP CONTROL PANEL": .95,
					"TRANSFER PUMP PIPES": 0,
					"L31 & 31M ROOF PIPING": 0,
					"CW TENANT": 0,
					"BACKSHAFT CW & FW TOILETS": 0,
					"HOSEREEL FLOORTRAP & STACK": 0,
					"SANITARY TENANT": 0,
					"TOILET PIPE DISTRIBUTION & HACKING": 0,
					"SANITARY TOILETS": 0,
					"SANITARY WARES INSTALLATION": 0,
					"IRRIGATION OUTLET": 0,
					"IRRIGATION INLET": 0,
					"IRRIGATION WIRING": 0,
					"IRRIGATION CONTROL PANEL": null
				}
			},
			{
				"level": "31M",
				"items": {
					"PIPE SLEEVE": .1,
					"PUMP": 0,
					"PUMP CONTROL PANEL": 0,
					"TRANSFER PUMP PIPES": 0,
					"L31 & 31M ROOF PIPING": 0,
					"CW TENANT": 0,
					"BACKSHAFT CW & FW TOILETS": 0,
					"HOSEREEL FLOORTRAP & STACK": 0,
					"SANITARY TENANT": 0,
					"TOILET PIPE DISTRIBUTION & HACKING": 0,
					"SANITARY TOILETS": 0,
					"SANITARY WARES INSTALLATION": 0,
					"IRRIGATION OUTLET": 0,
					"IRRIGATION INLET": 0,
					"IRRIGATION WIRING": 0,
					"IRRIGATION CONTROL PANEL": 0
				}
			}
		]
	},
	"comparePackages": [
		{
			"package": "COLD WATER",
			"a": .5132142857142857,
			"b": .4389285714285714,
			"gap": .07428571428571434,
			"leader": "Tower A"
		},
		{
			"package": "SANITARY",
			"a": .4734999999999999,
			"b": .46699999999999997,
			"gap": .00649999999999995,
			"leader": "Tower A"
		},
		{
			"package": "IRRIGATION",
			"a": .06125,
			"b": .06125,
			"gap": 0,
			"leader": "Tie"
		},
		{
			"package": "OVERALL",
			"a": .3878125,
			"b": .35328124999999994,
			"gap": .03453125000000007,
			"leader": "Tower A"
		}
	],
	"itemGaps": [
		{
			"package": "Cold Water",
			"item": "Pipe Sleeve",
			"a": .9325000000000001,
			"b": .93,
			"gap": .0025000000000000577,
			"leader": "Tower A"
		},
		{
			"package": "Cold Water",
			"item": "Pump",
			"a": .475,
			"b": .475,
			"gap": 0,
			"leader": "Tie"
		},
		{
			"package": "Cold Water",
			"item": "Pump Control Panel",
			"a": .475,
			"b": .475,
			"gap": 0,
			"leader": "Tie"
		},
		{
			"package": "Cold Water",
			"item": "Transfer Pump Pipes",
			"a": .7599999999999998,
			"b": .3325,
			"gap": .42749999999999977,
			"leader": "Tower A"
		},
		{
			"package": "Cold Water",
			"item": "L31 & 31M Roof Piping",
			"a": 0,
			"b": 0,
			"gap": 0,
			"leader": "Tie"
		},
		{
			"package": "Cold Water",
			"item": "CW Tenant",
			"a": .8074999999999998,
			"b": .7599999999999998,
			"gap": .04749999999999999,
			"leader": "Tower A"
		},
		{
			"package": "Cold Water",
			"item": "Backshaft CW & FW Toilets",
			"a": .1425,
			"b": .1,
			"gap": .04249999999999998,
			"leader": "Tower A"
		},
		{
			"package": "Sanitary",
			"item": "Hosereel Floortrap & Stack",
			"a": .5774999999999999,
			"b": .5774999999999999,
			"gap": 0,
			"leader": "Tie"
		},
		{
			"package": "Sanitary",
			"item": "Sanitary Tenant",
			"a": .5774999999999999,
			"b": .5774999999999999,
			"gap": 0,
			"leader": "Tie"
		},
		{
			"package": "Sanitary",
			"item": "Toilet Pipe Distribution & Hacking",
			"a": .4,
			"b": .39,
			"gap": .010000000000000009,
			"leader": "Tower A"
		},
		{
			"package": "Sanitary",
			"item": "Sanitary Toilets",
			"a": .6649999999999998,
			"b": .6424999999999998,
			"gap": .022499999999999964,
			"leader": "Tower A"
		},
		{
			"package": "Sanitary",
			"item": "Sanitary Wares Installation",
			"a": .1475,
			"b": .1475,
			"gap": 0,
			"leader": "Tie"
		},
		{
			"package": "Irrigation",
			"item": "Irrigation Outlet",
			"a": .2,
			"b": .2,
			"gap": 0,
			"leader": "Tie"
		},
		{
			"package": "Irrigation",
			"item": "Irrigation Inlet",
			"a": .045,
			"b": .045,
			"gap": 0,
			"leader": "Tie"
		},
		{
			"package": "Irrigation",
			"item": "Irrigation Wiring",
			"a": 0,
			"b": 0,
			"gap": 0,
			"leader": "Tie"
		},
		{
			"package": "Irrigation",
			"item": "Irrigation Control Panel",
			"a": 0,
			"b": 0,
			"gap": 0,
			"leader": "Tie"
		}
	],
	"floors": [
		{
			"level": "13",
			"a": .5583333333333333,
			"b": .5583333333333333,
			"gap": 0,
			"leader": "Tie"
		},
		{
			"level": "14",
			"a": .7999999999999999,
			"b": .7999999999999999,
			"gap": 0,
			"leader": "Tie"
		},
		{
			"level": "15",
			"a": .7958333333333333,
			"b": .7958333333333333,
			"gap": 0,
			"leader": "Tie"
		},
		{
			"level": "16",
			"a": .725,
			"b": .65,
			"gap": .07499999999999996,
			"leader": "Tower A"
		},
		{
			"level": "17",
			"a": .49583333333333335,
			"b": .49166666666666664,
			"gap": .004166666666666707,
			"leader": "Tower A"
		},
		{
			"level": "18",
			"a": .49583333333333335,
			"b": .49166666666666664,
			"gap": .004166666666666707,
			"leader": "Tower A"
		},
		{
			"level": "19",
			"a": .48750000000000004,
			"b": .48333333333333334,
			"gap": .004166666666666707,
			"leader": "Tower A"
		},
		{
			"level": "20",
			"a": .49583333333333335,
			"b": .4166666666666667,
			"gap": .07916666666666666,
			"leader": "Tower A"
		},
		{
			"level": "21",
			"a": .4791666666666667,
			"b": .39999999999999997,
			"gap": .07916666666666672,
			"leader": "Tower A"
		},
		{
			"level": "22",
			"a": .5153846153846154,
			"b": .4423076923076923,
			"gap": .07307692307692315,
			"leader": "Tower A"
		},
		{
			"level": "23",
			"a": .4041666666666666,
			"b": .325,
			"gap": .07916666666666661,
			"leader": "Tower A"
		},
		{
			"level": "24",
			"a": .4041666666666666,
			"b": .28750000000000003,
			"gap": .11666666666666659,
			"leader": "Tower A"
		},
		{
			"level": "25",
			"a": .4791666666666667,
			"b": .39999999999999997,
			"gap": .07916666666666672,
			"leader": "Tower A"
		},
		{
			"level": "26",
			"a": .5583333333333333,
			"b": .4791666666666667,
			"gap": .07916666666666666,
			"leader": "Tower A"
		},
		{
			"level": "27",
			"a": .4791666666666667,
			"b": .39999999999999997,
			"gap": .07916666666666672,
			"leader": "Tower A"
		},
		{
			"level": "28",
			"a": .24166666666666667,
			"b": .1625,
			"gap": .07916666666666666,
			"leader": "Tower A"
		},
		{
			"level": "29",
			"a": .1625,
			"b": .08333333333333333,
			"gap": .07916666666666668,
			"leader": "Tower A"
		},
		{
			"level": "30",
			"a": .08333333333333333,
			"b": .08333333333333333,
			"gap": 0,
			"leader": "Tie"
		},
		{
			"level": "31",
			"a": .16333333333333336,
			"b": .16,
			"gap": .003333333333333355,
			"leader": "Tower A"
		},
		{
			"level": "31M",
			"a": .00625,
			"b": .00625,
			"gap": 0,
			"leader": "Tie"
		}
	],
	"orders": [
		{
			"package": "Cold Water",
			"material": "Pipe sleeve",
			"unit": "nos",
			"qtyFloor": 1,
			"remainingA": 1.35,
			"remainingB": 1.4,
			"required": 2.75,
			"ordered": 0,
			"balance": 2.75,
			"status": "To Order",
			"remarks": null
		},
		{
			"package": "Cold Water",
			"material": "Transfer pump pipes",
			"unit": "floor",
			"qtyFloor": 1,
			"remainingA": 4.800000000000001,
			"remainingB": 13.350000000000001,
			"required": 18.150000000000002,
			"ordered": 0,
			"balance": 18.150000000000002,
			"status": "To Order",
			"remarks": null
		},
		{
			"package": "Cold Water",
			"material": "CW tenant pipework",
			"unit": "floor",
			"qtyFloor": 1,
			"remainingA": 3.8500000000000005,
			"remainingB": 4.800000000000001,
			"required": 8.650000000000002,
			"ordered": 0,
			"balance": 8.650000000000002,
			"status": "To Order",
			"remarks": null
		},
		{
			"package": "Cold Water",
			"material": "Backshaft CW & FW pipe",
			"unit": "floor",
			"qtyFloor": 1,
			"remainingA": 17.15,
			"remainingB": 18,
			"required": 35.15,
			"ordered": 0,
			"balance": 35.15,
			"status": "To Order",
			"remarks": null
		},
		{
			"package": "Cold Water",
			"material": "L31 & 31M roof piping",
			"unit": "lot",
			"qtyFloor": 1,
			"remainingA": 2,
			"remainingB": 2,
			"required": 4,
			"ordered": 0,
			"balance": 4,
			"status": "To Order",
			"remarks": null
		},
		{
			"package": "Cold Water",
			"material": "Pump",
			"unit": "set",
			"qtyFloor": 1,
			"remainingA": 1.05,
			"remainingB": 1.05,
			"required": 2.1,
			"ordered": 0,
			"balance": 2.1,
			"status": "To Order",
			"remarks": null
		},
		{
			"package": "Cold Water",
			"material": "Pump control panel",
			"unit": "set",
			"qtyFloor": 1,
			"remainingA": 1.05,
			"remainingB": 1.05,
			"required": 2.1,
			"ordered": 0,
			"balance": 2.1,
			"status": "To Order",
			"remarks": null
		},
		{
			"package": "Sanitary",
			"material": "Hosereel set",
			"unit": "nos",
			"qtyFloor": 6,
			"remainingA": 8.45,
			"remainingB": 8.45,
			"required": 101.39999999999999,
			"ordered": 0,
			"balance": 101.39999999999999,
			"status": "To Order",
			"remarks": null
		},
		{
			"package": "Sanitary",
			"material": "Floor trap",
			"unit": "nos",
			"qtyFloor": 6,
			"remainingA": 8.45,
			"remainingB": 8.45,
			"required": 101.39999999999999,
			"ordered": 0,
			"balance": 101.39999999999999,
			"status": "To Order",
			"remarks": null
		},
		{
			"package": "Sanitary",
			"material": "Sanitary stack pipe",
			"unit": "floor",
			"qtyFloor": 1,
			"remainingA": 8.45,
			"remainingB": 8.45,
			"required": 16.9,
			"ordered": 0,
			"balance": 16.9,
			"status": "To Order",
			"remarks": null
		},
		{
			"package": "Sanitary",
			"material": "Toilet distribution pipe",
			"unit": "floor",
			"qtyFloor": 1,
			"remainingA": 12,
			"remainingB": 12.2,
			"required": 24.2,
			"ordered": 0,
			"balance": 24.2,
			"status": "To Order",
			"remarks": null
		},
		{
			"package": "Sanitary",
			"material": "Sanitary tenant",
			"unit": "floor",
			"qtyFloor": 1,
			"remainingA": 8.45,
			"remainingB": 8.45,
			"required": 16.9,
			"ordered": 0,
			"balance": 16.9,
			"status": "To Order",
			"remarks": null
		},
		{
			"package": "Sanitary",
			"material": "WC pan",
			"unit": "nos",
			"qtyFloor": 4,
			"remainingA": 6.700000000000001,
			"remainingB": 7.15,
			"required": 55.400000000000006,
			"ordered": 0,
			"balance": 55.400000000000006,
			"status": "To Order",
			"remarks": null
		},
		{
			"package": "Sanitary",
			"material": "Wash basin",
			"unit": "nos",
			"qtyFloor": 4,
			"remainingA": 6.700000000000001,
			"remainingB": 7.15,
			"required": 55.400000000000006,
			"ordered": 0,
			"balance": 55.400000000000006,
			"status": "To Order",
			"remarks": null
		},
		{
			"package": "Sanitary",
			"material": "Sanitary wares",
			"unit": "floor",
			"qtyFloor": 1,
			"remainingA": 17.05,
			"remainingB": 17.05,
			"required": 34.1,
			"ordered": 0,
			"balance": 34.1,
			"status": "To Order",
			"remarks": null
		},
		{
			"package": "Irrigation",
			"material": "Irrigation outlet",
			"unit": "nos",
			"qtyFloor": 1,
			"remainingA": 16,
			"remainingB": 16,
			"required": 32,
			"ordered": 0,
			"balance": 32,
			"status": "To Order",
			"remarks": null
		},
		{
			"package": "Irrigation",
			"material": "Irrigation inlet",
			"unit": "nos",
			"qtyFloor": 1,
			"remainingA": 19.1,
			"remainingB": 19.1,
			"required": 38.2,
			"ordered": 0,
			"balance": 38.2,
			"status": "To Order",
			"remarks": null
		},
		{
			"package": "Irrigation",
			"material": "Irrigation cable",
			"unit": "floor",
			"qtyFloor": 1,
			"remainingA": 20,
			"remainingB": 20,
			"required": 40,
			"ordered": 0,
			"balance": 40,
			"status": "To Order",
			"remarks": null
		},
		{
			"package": "Irrigation",
			"material": "Irrigation control panel",
			"unit": "set",
			"qtyFloor": 1,
			"remainingA": 2,
			"remainingB": 2,
			"required": 4,
			"ordered": 0,
			"balance": 4,
			"status": "To Order",
			"remarks": null
		}
	],
	"people": [
		{
			"name": "SUPAHAM",
			"rate": 2e3,
			"onSite": 1,
			"costToday": 2e3
		},
		{
			"name": "SOLIHIN",
			"rate": 1e3,
			"onSite": 1,
			"costToday": 1e3
		},
		{
			"name": "ASGAR",
			"rate": 500,
			"onSite": 1,
			"costToday": 500
		},
		{
			"name": "SUHAIRI",
			"rate": 700,
			"onSite": 1,
			"costToday": 700
		},
		{
			"name": "BILAL",
			"rate": 500,
			"onSite": 1,
			"costToday": 500
		},
		{
			"name": "JUWEL",
			"rate": 500,
			"onSite": 1,
			"costToday": 500
		},
		{
			"name": "JILLUR",
			"rate": 500,
			"onSite": 1,
			"costToday": 500
		},
		{
			"name": "SARIP",
			"rate": 700,
			"onSite": 1,
			"costToday": 700
		},
		{
			"name": "EMON",
			"rate": 500,
			"onSite": 1,
			"costToday": 500
		},
		{
			"name": "IBNU",
			"rate": 500,
			"onSite": 1,
			"costToday": 500
		},
		{
			"name": "KAMAL",
			"rate": 500,
			"onSite": 1,
			"costToday": 500
		},
		{
			"name": "YASIN",
			"rate": 500,
			"onSite": 1,
			"costToday": 500
		},
		{
			"name": "SOFIKUL",
			"rate": 1e3,
			"onSite": 1,
			"costToday": 1e3
		},
		{
			"name": "NAZMUL",
			"rate": 500,
			"onSite": 1,
			"costToday": 500
		},
		{
			"name": "MAHMUD",
			"rate": 500,
			"onSite": 1,
			"costToday": 500
		},
		{
			"name": "NURUL",
			"rate": 500,
			"onSite": 1,
			"costToday": 500
		},
		{
			"name": "JIARUL",
			"rate": "n/a",
			"onSite": 1,
			"costToday": 0
		},
		{
			"name": "SUPENDI",
			"rate": 500,
			"onSite": 1,
			"costToday": 500
		},
		{
			"name": "RANA",
			"rate": 500,
			"onSite": 1,
			"costToday": 500
		},
		{
			"name": "ASHRAFUL",
			"rate": 500,
			"onSite": 1,
			"costToday": 500
		},
		{
			"name": "FARHAD",
			"rate": 500,
			"onSite": 1,
			"costToday": 500
		},
		{
			"name": "BADOL",
			"rate": 500,
			"onSite": 1,
			"costToday": 500
		},
		{
			"name": "ISLAM",
			"rate": 500,
			"onSite": 1,
			"costToday": 500
		},
		{
			"name": "SYAHIB",
			"rate": 500,
			"onSite": 1,
			"costToday": 500
		},
		{
			"name": "AMIRUL",
			"rate": 500,
			"onSite": 1,
			"costToday": 500
		},
		{
			"name": "DAMIL",
			"rate": 500,
			"onSite": 1,
			"costToday": 500
		},
		{
			"name": "KAMAL",
			"rate": 500,
			"onSite": 1,
			"costToday": 500
		}
	],
	"teams": [
		{
			"team": "team 1",
			"leader": "SOLIHIN",
			"assistants": [
				"ASHRAFUL",
				"JIARUL",
				"YASIN"
			]
		},
		{
			"team": "team 2",
			"leader": "ASGAR",
			"assistants": ["RANA"]
		},
		{
			"team": "team 3",
			"leader": "SUHAIRI",
			"assistants": ["SUPENDI"]
		},
		{
			"team": "team 4",
			"leader": "BILAL",
			"assistants": [
				"FARHAD",
				"SOFIKUL",
				"SYAHIB",
				"AMIRUL",
				"NURUL",
				"NAZMUL"
			]
		},
		{
			"team": "team 5",
			"leader": "JUWEL",
			"assistants": ["BADOL"]
		},
		{
			"team": "team 6",
			"leader": "JILLUR",
			"assistants": ["ISLAM"]
		},
		{
			"team": "team 7",
			"leader": "SARIP",
			"assistants": ["SYAHIB"]
		},
		{
			"team": "team 8",
			"leader": "EMON",
			"assistants": ["MAHMUD"]
		},
		{
			"team": "team 9",
			"leader": "IBNU",
			"assistants": ["DAMIL"]
		},
		{
			"team": "team 10",
			"leader": "KAMAL",
			"assistants": []
		}
	],
	"aipoon": [
		{
			"desc": "LEVEL 25",
			"unit": "Lot",
			"qty": 1,
			"rate": 5800,
			"prev": 0,
			"done": .95,
			"amount": 5510
		},
		{
			"desc": "LEVEL 26",
			"unit": "Lot",
			"qty": 1,
			"rate": 5800,
			"prev": 0,
			"done": 0,
			"amount": 0
		},
		{
			"desc": "LEVEL 27",
			"unit": "Lot",
			"qty": 1,
			"rate": 5800,
			"prev": 0,
			"done": .95,
			"amount": 5510
		},
		{
			"desc": "LEVEL 28",
			"unit": "Lot",
			"qty": 1,
			"rate": 5800,
			"prev": 0,
			"done": 0,
			"amount": 0
		},
		{
			"desc": "LEVEL 29",
			"unit": "Lot",
			"qty": 1,
			"rate": 5800,
			"prev": 0,
			"done": 0,
			"amount": 0
		},
		{
			"desc": "LEVEL 30",
			"unit": "Lot",
			"qty": 1,
			"rate": 5800,
			"prev": 0,
			"done": 0,
			"amount": 0
		},
		{
			"desc": "LEVEL 31",
			"unit": "Lot",
			"qty": 1,
			"rate": 2900,
			"prev": 0,
			"done": 0,
			"amount": 0
		},
		{
			"desc": "LEVEL 25",
			"unit": "Lot",
			"qty": 1,
			"rate": 1600,
			"prev": 0,
			"done": .95,
			"amount": 1520
		},
		{
			"desc": "LEVEL 26",
			"unit": "Lot",
			"qty": 1,
			"rate": 1600,
			"prev": 0,
			"done": 0,
			"amount": 0
		},
		{
			"desc": "LEVEL 27",
			"unit": "Lot",
			"qty": 1,
			"rate": 1600,
			"prev": 0,
			"done": .95,
			"amount": 1520
		},
		{
			"desc": "LEVEL 28",
			"unit": "Lot",
			"qty": 1,
			"rate": 1600,
			"prev": 0,
			"done": 0,
			"amount": 0
		},
		{
			"desc": "LEVEL 29",
			"unit": "Lot",
			"qty": 1,
			"rate": 1600,
			"prev": 0,
			"done": 0,
			"amount": 0
		},
		{
			"desc": "LEVEL 30",
			"unit": "Lot",
			"qty": 1,
			"rate": 1600,
			"prev": 0,
			"done": 0,
			"amount": 0
		},
		{
			"desc": "LEVEL 31",
			"unit": "Lot",
			"qty": 1,
			"rate": 1600,
			"prev": 0,
			"done": 0,
			"amount": 0
		},
		{
			"desc": "LEVEL 25",
			"unit": "Lot",
			"qty": 1,
			"rate": 510,
			"prev": 0,
			"done": .95,
			"amount": 484.5
		},
		{
			"desc": "LEVEL 26",
			"unit": "Lot",
			"qty": 1,
			"rate": 510,
			"prev": 0,
			"done": 0,
			"amount": 0
		},
		{
			"desc": "LEVEL 27",
			"unit": "Lot",
			"qty": 1,
			"rate": 510,
			"prev": 0,
			"done": .95,
			"amount": 484.5
		},
		{
			"desc": "LEVEL 28",
			"unit": "Lot",
			"qty": 1,
			"rate": 510,
			"prev": 0,
			"done": 0,
			"amount": 0
		},
		{
			"desc": "LEVEL 29",
			"unit": "Lot",
			"qty": 1,
			"rate": 510,
			"prev": 0,
			"done": 0,
			"amount": 0
		},
		{
			"desc": "LEVEL 30",
			"unit": "Lot",
			"qty": 1,
			"rate": 510,
			"prev": 0,
			"done": 0,
			"amount": 0
		},
		{
			"desc": "LEVEL 31",
			"unit": "Lot",
			"qty": 1,
			"rate": 510,
			"prev": 0,
			"done": 0,
			"amount": 0
		},
		{
			"desc": "LEVEL 24 TOWER B",
			"unit": "Lot",
			"qty": 1,
			"rate": 2900,
			"prev": 0,
			"done": 0,
			"amount": 0
		},
		{
			"desc": "LEVEL 24 TOWER A (BRICKWALL)",
			"unit": "Lot",
			"qty": 1,
			"rate": 2900,
			"prev": 0,
			"done": 0,
			"amount": 0
		}
	],
	"ariyan": [
		{
			"section": "1.1 To install stainless steel transfer pump pipe",
			"desc": "LEVEL 13",
			"unit": "m",
			"qty": 10.75,
			"rate": 80,
			"prev": 0,
			"done": .95,
			"amount": 817
		},
		{
			"section": "1.1 To install stainless steel transfer pump pipe",
			"desc": "LEVEL 14",
			"unit": "m",
			"qty": 4.5,
			"rate": 80,
			"prev": 0,
			"done": .95,
			"amount": 342
		},
		{
			"section": "1.1 To install stainless steel transfer pump pipe",
			"desc": "LEVEL 15",
			"unit": "m",
			"qty": 4.5,
			"rate": 80,
			"prev": 0,
			"done": .95,
			"amount": 342
		},
		{
			"section": "1.1 To install stainless steel transfer pump pipe",
			"desc": "LEVEL 16",
			"unit": "m",
			"qty": 4.5,
			"rate": 80,
			"prev": 0,
			"done": .95,
			"amount": 342
		},
		{
			"section": "1.1 To install stainless steel transfer pump pipe",
			"desc": "LEVEL 17",
			"unit": "m",
			"qty": 4.5,
			"rate": 80,
			"prev": 0,
			"done": .95,
			"amount": 342
		},
		{
			"section": "1.1 To install stainless steel transfer pump pipe",
			"desc": "LEVEL 18",
			"unit": "m",
			"qty": 4.5,
			"rate": 80,
			"prev": 0,
			"done": .95,
			"amount": 342
		},
		{
			"section": "1.1 To install stainless steel transfer pump pipe",
			"desc": "LEVEL 19",
			"unit": "m",
			"qty": 4.5,
			"rate": 80,
			"prev": 0,
			"done": .95,
			"amount": 342
		},
		{
			"section": "1.1 To install stainless steel transfer pump pipe",
			"desc": "LEVEL 20",
			"unit": "m",
			"qty": 4.5,
			"rate": 80,
			"prev": 0,
			"done": .95,
			"amount": 342
		},
		{
			"section": "1.1 To install stainless steel transfer pump pipe",
			"desc": "LEVEL 21",
			"unit": "m",
			"qty": 4.5,
			"rate": 80,
			"prev": 0,
			"done": .95,
			"amount": 342
		},
		{
			"section": "1.1 To install stainless steel transfer pump pipe",
			"desc": "LEVEL 22",
			"unit": "m",
			"qty": 4.5,
			"rate": 80,
			"prev": 0,
			"done": 0,
			"amount": 0
		},
		{
			"section": "1.1 To install stainless steel transfer pump pipe",
			"desc": "LEVEL 23",
			"unit": "m",
			"qty": 4.5,
			"rate": 80,
			"prev": 0,
			"done": 0,
			"amount": 0
		},
		{
			"section": "1.1 To install stainless steel transfer pump pipe",
			"desc": "LEVEL 24",
			"unit": "m",
			"qty": 4.5,
			"rate": 80,
			"prev": 0,
			"done": 0,
			"amount": 0
		},
		{
			"section": "1.1 To install stainless steel transfer pump pipe",
			"desc": "LEVEL 25",
			"unit": "m",
			"qty": 4.5,
			"rate": 80,
			"prev": 0,
			"done": 0,
			"amount": 0
		},
		{
			"section": "1.1 To install stainless steel transfer pump pipe",
			"desc": "LEVEL 26",
			"unit": "m",
			"qty": 4.5,
			"rate": 80,
			"prev": 0,
			"done": 0,
			"amount": 0
		},
		{
			"section": "1.1 To install stainless steel transfer pump pipe",
			"desc": "LEVEL 27",
			"unit": "m",
			"qty": 5.1,
			"rate": 80,
			"prev": 0,
			"done": 0,
			"amount": 0
		},
		{
			"section": "1.1 To install stainless steel transfer pump pipe",
			"desc": "LEVEL 28",
			"unit": "m",
			"qty": 5.1,
			"rate": 80,
			"prev": 0,
			"done": 0,
			"amount": 0
		},
		{
			"section": "1.1 To install stainless steel transfer pump pipe",
			"desc": "LEVEL 29",
			"unit": "m",
			"qty": 5.1,
			"rate": 80,
			"prev": 0,
			"done": 0,
			"amount": 0
		},
		{
			"section": "1.1 To install stainless steel transfer pump pipe",
			"desc": "LEVEL 30",
			"unit": "m",
			"qty": 6,
			"rate": 80,
			"prev": 0,
			"done": 0,
			"amount": 0
		},
		{
			"section": "1.1 To install stainless steel transfer pump pipe",
			"desc": "LEVEL 31",
			"unit": "m",
			"qty": 12.7,
			"rate": 80,
			"prev": 0,
			"done": 0,
			"amount": 0
		},
		{
			"section": "1.2 Additional fittings. Rate RM150 per no. (elbow / check valve).",
			"desc": "LEVEL 13  |  ELBOW",
			"unit": "NOS",
			"qty": 3,
			"rate": 150,
			"prev": 0,
			"done": .95,
			"amount": 427.5
		},
		{
			"section": "1.2 Additional fittings. Rate RM150 per no. (elbow / check valve).",
			"desc": "LEVEL 14  |  ELBOW / CHECK VALVE",
			"unit": "NOS",
			"qty": 2,
			"rate": 150,
			"prev": 0,
			"done": .95,
			"amount": 285
		},
		{
			"section": "1.2 Additional fittings. Rate RM150 per no. (elbow / check valve).",
			"desc": "LEVEL 21  |  ELBOW",
			"unit": "NOS",
			"qty": 2,
			"rate": 150,
			"prev": 0,
			"done": 0,
			"amount": 0
		},
		{
			"section": "1.2 Additional fittings. Rate RM150 per no. (elbow / check valve).",
			"desc": "LEVEL 23  |  CHECK VALVE",
			"unit": "NOS",
			"qty": 1,
			"rate": 150,
			"prev": 0,
			"done": 0,
			"amount": 0
		},
		{
			"section": "1.2 Additional fittings. Rate RM150 per no. (elbow / check valve).",
			"desc": "LEVEL 13  |  SAMPLING POINT",
			"unit": "NOS",
			"qty": 1,
			"rate": 80,
			"prev": 0,
			"done": 1,
			"amount": 80
		},
		{
			"section": "1.2 Additional fittings. Rate RM150 per no. (elbow / check valve).",
			"desc": "LEVEL 23  |  SAMPLING POINT",
			"unit": "NOS",
			"qty": 1,
			"rate": 80,
			"prev": 0,
			"done": 0,
			"amount": 0
		},
		{
			"section": "2.1 To install stainless steel transfer pump pipe",
			"desc": "LEVEL 21",
			"unit": "m",
			"qty": 4.5,
			"rate": 80,
			"prev": 0,
			"done": .95,
			"amount": 342
		},
		{
			"section": "2.1 To install stainless steel transfer pump pipe",
			"desc": "LEVEL 22",
			"unit": "m",
			"qty": 4.5,
			"rate": 80,
			"prev": 0,
			"done": .95,
			"amount": 342
		},
		{
			"section": "2.1 To install stainless steel transfer pump pipe",
			"desc": "LEVEL 23",
			"unit": "m",
			"qty": 4.5,
			"rate": 80,
			"prev": 0,
			"done": .95,
			"amount": 342
		},
		{
			"section": "2.1 To install stainless steel transfer pump pipe",
			"desc": "LEVEL 24",
			"unit": "m",
			"qty": 4.5,
			"rate": 80,
			"prev": 0,
			"done": .95,
			"amount": 342
		},
		{
			"section": "2.1 To install stainless steel transfer pump pipe",
			"desc": "LEVEL 25",
			"unit": "m",
			"qty": 4.5,
			"rate": 80,
			"prev": 0,
			"done": .95,
			"amount": 342
		},
		{
			"section": "2.1 To install stainless steel transfer pump pipe",
			"desc": "LEVEL 26",
			"unit": "m",
			"qty": 4.5,
			"rate": 80,
			"prev": 0,
			"done": .95,
			"amount": 342
		},
		{
			"section": "2.1 To install stainless steel transfer pump pipe",
			"desc": "LEVEL 27",
			"unit": "m",
			"qty": 5.1,
			"rate": 80,
			"prev": 0,
			"done": .95,
			"amount": 387.59999999999997
		},
		{
			"section": "2.1 To install stainless steel transfer pump pipe",
			"desc": "LEVEL 28",
			"unit": "m",
			"qty": 5.1,
			"rate": 80,
			"prev": 0,
			"done": .95,
			"amount": 387.59999999999997
		},
		{
			"section": "2.1 To install stainless steel transfer pump pipe",
			"desc": "LEVEL 29",
			"unit": "m",
			"qty": 5.1,
			"rate": 80,
			"prev": 0,
			"done": .95,
			"amount": 387.59999999999997
		},
		{
			"section": "2.1 To install stainless steel transfer pump pipe",
			"desc": "LEVEL 30",
			"unit": "m",
			"qty": 6,
			"rate": 80,
			"prev": 0,
			"done": 0,
			"amount": 0
		},
		{
			"section": "2.1 To install stainless steel transfer pump pipe",
			"desc": "LEVEL 31",
			"unit": "m",
			"qty": 12.7,
			"rate": 80,
			"prev": 0,
			"done": 0,
			"amount": 0
		},
		{
			"section": "2.2 Additional fittings. Rate RM150 per no. (elbow / check valve).",
			"desc": "LEVEL 23  |  CHECK VALVE",
			"unit": "NOS",
			"qty": 1,
			"rate": 150,
			"prev": 0,
			"done": 0,
			"amount": 0
		},
		{
			"section": "2.2 Additional fittings. Rate RM150 per no. (elbow / check valve).",
			"desc": "LEVEL 13  |  SAMPLING POINT",
			"unit": "NOS",
			"qty": 1,
			"rate": 80,
			"prev": 0,
			"done": 0,
			"amount": 0
		},
		{
			"section": "2.2 Additional fittings. Rate RM150 per no. (elbow / check valve).",
			"desc": "LEVEL 23  |  SAMPLING POINT",
			"unit": "NOS",
			"qty": 1,
			"rate": 80,
			"prev": 0,
			"done": 0,
			"amount": 0
		}
	],
	"aipoonTotal": 58270,
	"aipoonClaimed": 15029,
	"ariyanTotal": 14810,
	"ariyanClaimed": 7560.3,
	"orderTotals": {
		"coldWater": 72.9,
		"sanitary": 405.7,
		"irrigation": 114.2,
		"total": 592.8,
		"ordered": 0
	},
	"poSummary": {
		"toOrder": 19,
		"partial": 0,
		"complete": 0,
		"pos": 0,
		"amount": 0
	},
	"rmPerPct": 473.415567843471
};
var NAV = [
	{
		to: "/",
		label: "Overview",
		icon: LayoutDashboard
	},
	{
		to: "/matrix",
		label: "MEP matrix",
		icon: Grid3x3
	},
	{
		to: "/tower-a",
		label: "Tower A",
		icon: Building2
	},
	{
		to: "/tower-b",
		label: "Tower B",
		icon: Building2
	},
	{
		to: "/library",
		label: "Drawings",
		icon: Library
	},
	{
		to: "/material",
		label: "Material",
		icon: Package
	},
	{
		to: "/manpower",
		label: "Attendance",
		icon: HardHat
	},
	{
		to: "/boq",
		label: "BOQ",
		icon: FileSpreadsheet
	},
	{
		to: "/po-log",
		label: "PO log",
		icon: Truck
	}
];
function Shell({ children }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex min-w-0 items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex size-9 items-center justify-center rounded-sm bg-ink text-accent-fg",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Droplets, {
									className: "size-4",
									strokeWidth: 2
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate font-display text-sm font-semibold tracking-tight text-ink",
									children: report.meta.project
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-xs text-muted",
									children: report.meta.company
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "hidden items-center gap-2 text-xs text-muted lg:flex",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full bg-surface-2 px-3 py-1 font-medium text-fg",
								children: report.meta.reportDate
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full bg-ok-bg px-3 py-1 font-medium text-ok",
								children: "Fair · Day"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "inline-flex size-11 items-center justify-center rounded-md border border-border bg-surface md:hidden",
							"aria-label": open ? "Close menu" : "Open menu",
							onClick: () => setOpen((v) => !v),
							children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "mx-auto hidden max-w-7xl gap-1 overflow-x-auto px-4 pb-2 sm:px-6 md:flex",
					children: NAV.map((item) => {
						const active = pathname === item.to;
						const Icon = item.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.to,
							className: cn("inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150", active ? "bg-ink text-accent-fg" : "text-muted hover:bg-surface-2 hover:text-fg"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), item.label]
						}, item.to);
					})
				}),
				open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "grid gap-1 border-t border-border px-3 py-2 md:hidden",
					children: NAV.map((item) => {
						const active = pathname === item.to;
						const Icon = item.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.to,
							onClick: () => setOpen(false),
							className: cn("flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium", active ? "bg-ink text-accent-fg" : "text-fg hover:bg-surface-2"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), item.label]
						}, item.to);
					})
				}) : null
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8",
			children
		})]
	});
}
var styles_default = "/assets/styles-D8i6sbdq.css";
var APP_NAME = "The Capitol / MSK";
var Route$9 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "theme-color",
				content: "#3d8bff"
			},
			{
				name: "description",
				content: "Gelaran Maju site dashboard for The Capitol / MSK — progress, materials, manpower and BOQ."
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Barlow:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		className: "antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", {
			className: "min-h-dvh bg-bg text-fg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
			]
		})]
	})
});
var $$splitComponentImporter$8 = () => import("./routes-BJKgdPTU.mjs");
var Route$8 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$8, "component") });
var $$splitComponentImporter$7 = () => import("./boq-BXRHMBMQ.mjs");
var Route$7 = createFileRoute("/boq")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
var $$splitComponentImporter$6 = () => import("./library-CqTT3oJp.mjs");
var Route$6 = createFileRoute("/library")({
	validateSearch: (raw) => ({ dwg: typeof raw.dwg === "string" ? raw.dwg : void 0 }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./manpower-BRZUd_s2.mjs");
var Route$5 = createFileRoute("/manpower")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("./material-BzPmXZSw.mjs");
var Route$4 = createFileRoute("/material")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./matrix-BW_JbCBO.mjs");
var Route$3 = createFileRoute("/matrix")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./po-log-D_wVkbqD.mjs");
var Route$2 = createFileRoute("/po-log")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./tower-a-BErq9LjZ.mjs");
var Route$1 = createFileRoute("/tower-a")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./tower-b-DidfR1gc.mjs");
var Route = createFileRoute("/tower-b")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var rootRouteChildren = {
	IndexRoute: Route$8.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$9
	}),
	BoqRoute: Route$7.update({
		id: "/boq",
		path: "/boq",
		getParentRoute: () => Route$9
	}),
	LibraryRoute: Route$6.update({
		id: "/library",
		path: "/library",
		getParentRoute: () => Route$9
	}),
	ManpowerRoute: Route$5.update({
		id: "/manpower",
		path: "/manpower",
		getParentRoute: () => Route$9
	}),
	MaterialRoute: Route$4.update({
		id: "/material",
		path: "/material",
		getParentRoute: () => Route$9
	}),
	MatrixRoute: Route$3.update({
		id: "/matrix",
		path: "/matrix",
		getParentRoute: () => Route$9
	}),
	PoLogRoute: Route$2.update({
		id: "/po-log",
		path: "/po-log",
		getParentRoute: () => Route$9
	}),
	TowerARoute: Route$1.update({
		id: "/tower-a",
		path: "/tower-a",
		getParentRoute: () => Route$9
	}),
	TowerBRoute: Route.update({
		id: "/tower-b",
		path: "/tower-b",
		getParentRoute: () => Route$9
	})
};
var routeTree = Route$9._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { leaderTone as a, cn as i, Route$6 as n, pct as o, report as r, rm as s, router_exports as t };
