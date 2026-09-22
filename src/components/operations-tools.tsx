import { useState } from "react";
import { Download, History } from "lucide-react";
import { exportOperationalData } from "@/lib/audit";

export function ExportDataButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function exportData() {
    setBusy(true);
    setError(null);
    try {
      const data = await exportOperationalData();
      const blob = new Blob([data.json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `gelaran-operational-export-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Export unavailable. Check the database connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => void exportData()}
        disabled={busy}
        className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-medium text-fg transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-wait disabled:opacity-60"
      >
        <Download className="size-4" aria-hidden="true" />
        {busy ? "Preparing export…" : "Export data"}
      </button>
      {error ? <span className="text-right text-[11px] text-bad" role="alert">{error}</span> : null}
    </div>
  );
}

export function ActivityLinkIcon() {
  return <History className="size-4 opacity-90" aria-hidden="true" />;
}
