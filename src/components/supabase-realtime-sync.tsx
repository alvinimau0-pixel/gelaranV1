import { useEffect, useState } from "react";
import {
  subscribeToDashboardRealtime,
  type RealtimeSyncStatus,
} from "@/lib/supabase-realtime";

const statusCopy: Record<RealtimeSyncStatus, string> = {
  disabled: "Realtime not configured",
  connecting: "Connecting to live data…",
  subscribed: "Live sync connected",
  error: "Live sync unavailable",
};

export function SupabaseRealtimeSync() {
  const [status, setStatus] = useState<RealtimeSyncStatus>("disabled");

  useEffect(() => {
    return subscribeToDashboardRealtime(setStatus, (change) => {
      window.dispatchEvent(
        new CustomEvent("gelaran:supabase-change", { detail: change }),
      );
    });
  }, []);

  return (
    <span
      aria-live="polite"
      data-realtime-status={status}
      className={`fixed bottom-3 left-3 z-40 rounded-full border px-2.5 py-1 text-[11px] font-medium shadow-sm ${
        status === "subscribed"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : status === "error"
            ? "border-rose-200 bg-rose-50 text-rose-700"
            : "border-border bg-surface text-muted"
      }`}
    >
      {statusCopy[status]}
    </span>
  );
}
