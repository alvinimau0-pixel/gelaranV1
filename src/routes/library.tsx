import { createFileRoute } from "@tanstack/react-router";
import { DrawingSheet } from "@/components/drawing-sheet";
import { DRAWINGS } from "@/lib/drawings";
import { Badge, Card } from "@/components/ui";
import { cn } from "@/lib/utils";

type Search = { dwg?: string };

export const Route = createFileRoute("/library")({
  validateSearch: (raw: Record<string, unknown>): Search => ({
    dwg: typeof raw.dwg === "string" ? raw.dwg : undefined,
  }),
  component: Library,
});

function Library() {
  const { dwg } = Route.useSearch();
  const active = DRAWINGS.find((d) => d.id === dwg) ?? DRAWINGS[0];
  const navigate = Route.useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Drawings library</h1>
        <p className="mt-1 text-sm text-muted">
          MEP shop drawings for The Capitol / MSK. Select a sheet, then print or share from the browser.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {DRAWINGS.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => navigate({ search: { dwg: d.id } })}
            className={cn(
              "rounded-lg border p-4 text-left transition-colors duration-150",
              active.id === d.id ? "border-ink bg-surface" : "border-border bg-surface-2 hover:border-ink/40",
            )}
          >
            <p className="font-mono text-xs text-muted">{d.id}</p>
            <p className="mt-1 font-display text-base font-semibold">{d.title}</p>
            <div className="mt-2">
              <Badge tone="mute">{d.package}</Badge>
            </div>
          </button>
        ))}
      </div>
      <Card className="p-3 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-mono text-xs text-muted">{active.id}</p>
            <h2 className="font-display text-lg font-semibold">{active.title}</h2>
          </div>
          <Badge tone="accent">{active.package}</Badge>
        </div>
        <p className="mb-4 text-sm text-muted">{active.note}</p>
        <div className="overflow-hidden rounded-lg border border-border">
          <DrawingSheet drawing={active} />
        </div>
      </Card>
    </div>
  );
}
