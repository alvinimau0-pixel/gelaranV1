import { Link, useRouterState } from "@tanstack/react-router";
import {
  Building2,
  Camera,
  ClipboardList,
  FileSpreadsheet,
  Grid3x3,
  HardHat,
  LayoutDashboard,
  Library,
  Menu,
  Package,
  Truck,
  X,
} from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { ExportDataButton } from "@/components/operations-tools";

const GroqAssistant = lazy(() => import("@/components/groq-assistant").then((module) => ({ default: module.GroqAssistant })));

const NAV = [
  { to: "/home", label: "Home", icon: LayoutDashboard },
  { to: "/photos", label: "Photos", icon: Camera },
  { to: "/matrix", label: "MEP matrix", icon: Grid3x3 },
  { to: "/tower-a", label: "Tower A", icon: Building2 },
  { to: "/tower-b", label: "Tower B", icon: Building2 },
  { to: "/library", label: "Drawings", icon: Library },
  { to: "/material", label: "Material", icon: Package },
  { to: "/manpower", label: "Attendance", icon: HardHat },
  { to: "/boq", label: "BOQ", icon: FileSpreadsheet },
  { to: "/po-log", label: "PO log", icon: Truck },
  { to: "/activity", label: "Activity", icon: ClipboardList },
] as const;

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const report = useAppStore((s) => s.report);
  const isEntry = pathname === "/";

  return (
    <div className="min-h-dvh">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-accent-fg focus:outline-none focus:ring-2 focus:ring-accent"
      >
        Skip to main content
      </a>
      <header className={cn("sticky top-0 z-40 border-b border-border/80 bg-surface/85 backdrop-blur-xl supports-[backdrop-filter]:bg-surface/75", isEntry && "hidden")}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 sm:py-3">
          <Link to="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <img
              src="/logo.svg"
              alt="Gelaran"
              width={40}
              height={40}
              className="logo-mark size-9 shrink-0 rounded-full sm:size-10"
            />
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-semibold tracking-tight text-ink">
                {report.meta.project}
              </p>
              <p className="truncate text-[11px] text-muted sm:text-xs">{report.meta.company}</p>
            </div>
          </Link>
          <div className="hidden items-center gap-2 text-xs text-muted lg:flex">
            <span className="rounded-full bg-surface-2 px-3 py-1 font-medium text-fg transition-colors">
              {report.meta.reportDate}
            </span>
            <span className="rounded-full bg-ok-bg px-3 py-1 font-medium text-ok">
              {report.site.weather} · {report.site.shift}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <ExportDataButton />
            </div>
            <button
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-xl border border-border bg-surface transition-[transform,background-color] hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-95 md:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-navigation"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
        <nav className="mx-auto hidden max-w-7xl gap-1 overflow-x-auto px-4 pb-2.5 sm:px-6 md:flex">
          {NAV.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-[background-color,color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  active
                    ? "bg-ink text-accent-fg shadow-sm"
                    : "text-muted hover:bg-surface-2 hover:text-fg",
                )}
              >
                <Icon className="size-4 opacity-90" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        {open ? (
          <nav id="mobile-navigation" className="anim-fade grid gap-1 border-t border-border px-3 py-2 md:hidden" aria-label="Mobile navigation">
            {NAV.map((item) => {
              const active = pathname === item.to;
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    active ? "bg-ink text-accent-fg" : "text-fg hover:bg-surface-2",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
            <div className="mt-1 border-t border-border pt-2">
              <ExportDataButton />
            </div>
          </nav>
        ) : null}
      </header>
      <main id="main-content" tabIndex={-1} className={cn("mx-auto max-w-7xl scroll-mt-24", isEntry ? "p-2 sm:p-4" : "px-4 py-5 sm:px-6 sm:py-8")}>
        {children}
      </main>
      <Suspense fallback={null}><GroqAssistant /></Suspense>
    </div>
  );
}
