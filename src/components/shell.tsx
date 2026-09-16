import { Link, useRouterState } from "@tanstack/react-router";
import {
  Building2,
  Camera,
  Droplets,
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
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { AiAssistant } from "@/components/ai-assistant";

const NAV = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/photos", label: "Photos", icon: Camera },
  { to: "/matrix", label: "MEP matrix", icon: Grid3x3 },
  { to: "/tower-a", label: "Tower A", icon: Building2 },
  { to: "/tower-b", label: "Tower B", icon: Building2 },
  { to: "/library", label: "Drawings", icon: Library },
  { to: "/material", label: "Material", icon: Package },
  { to: "/manpower", label: "Attendance", icon: HardHat },
  { to: "/boq", label: "BOQ", icon: FileSpreadsheet },
  { to: "/po-log", label: "PO log", icon: Truck },
] as const;

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const report = useAppStore((s) => s.report);

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-sm bg-ink text-accent-fg">
              <Droplets className="size-4" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-semibold tracking-tight text-ink">
                {report.meta.project}
              </p>
              <p className="truncate text-xs text-muted">{report.meta.company}</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-xs text-muted lg:flex">
            <span className="rounded-full bg-surface-2 px-3 py-1 font-medium text-fg">
              {report.meta.reportDate}
            </span>
            <span className="rounded-full bg-ok-bg px-3 py-1 font-medium text-ok">
              {report.site.weather} · {report.site.shift}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex size-11 items-center justify-center rounded-md border border-border bg-surface md:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        <nav className="mx-auto hidden max-w-7xl gap-1 overflow-x-auto px-4 pb-2 sm:px-6 md:flex">
          {NAV.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150",
                  active
                    ? "bg-ink text-accent-fg"
                    : "text-muted hover:bg-surface-2 hover:text-fg",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        {open ? (
          <nav className="grid gap-1 border-t border-border px-3 py-2 md:hidden">
            {NAV.map((item) => {
              const active = pathname === item.to;
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                    active ? "bg-ink text-accent-fg" : "text-fg hover:bg-surface-2",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        ) : null}
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      <AiAssistant />
    </div>
  );
}
