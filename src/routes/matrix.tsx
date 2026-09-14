import { createFileRoute } from "@tanstack/react-router";
import { MepMatrix } from "@/components/mep-matrix";

export const Route = createFileRoute("/matrix")({ component: Page });

function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">MEP matrix</h1>
        <p className="mt-1 text-sm text-muted">
          Both towers, every floor and work item. Filter by package, then open a cell for scope and drawings.
        </p>
      </div>
      <MepMatrix />
    </div>
  );
}
