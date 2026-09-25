import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/matrix")({ component: Page });

function Page() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-3xl font-semibold">MEP matrix</h1>
          <span className="rounded-full bg-accent/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent">
            25 September 2026
          </span>
        </div>
        <p className="mt-1 text-sm text-muted">
          Gelaran Maju Sdn Bhd · The Capitol Project · latest floor-by-floor work matrix.
        </p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm" aria-labelledby="matrix-title">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-2 px-4 py-3">
          <div>
            <h2 id="matrix-title" className="font-semibold text-fg">Latest progress matrix</h2>
            <p className="mt-0.5 text-xs text-muted">Scroll horizontally to inspect the complete work-item schema.</p>
          </div>
          <a
            href="/matrix/gelaran-maju-2026-09-25.jpg"
            download="gelaran-maju-2026-09-25.jpg"
            className="rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-fg transition-colors hover:bg-surface-2"
          >
            Download matrix
          </a>
        </div>
        <div className="overflow-x-auto p-3 sm:p-4">
          <img
            src="/matrix/gelaran-maju-2026-09-25.jpg"
            alt="Gelaran Maju Sdn Bhd The Capitol Project progress matrix showing floors 13 through 31 and overall progress percentages"
            className="block h-auto min-w-[1200px] max-w-none rounded-lg border border-border bg-white"
          />
        </div>
      </section>
    </div>
  );
}
