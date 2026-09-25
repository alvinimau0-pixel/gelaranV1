import { createFileRoute } from "@tanstack/react-router";
import { MepMatrix } from "@/components/mep-matrix";

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
          Both towers, every floor and the 18 work items from the latest Gelaran Maju progress sheet.
        </p>
      </div>
      <MepMatrix />
    </div>
  );
}
