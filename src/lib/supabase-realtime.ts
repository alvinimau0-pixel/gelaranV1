import { createClient, type RealtimeChannel } from "@supabase/supabase-js";

export const REALTIME_TABLES = [
  "gm_progress_matrix",
  "gm_attendance",
  "gm_worker_placements",
  "gm_material_orders",
  "gm_daily_site_reports",
] as const;

export type RealtimeSyncStatus = "disabled" | "connecting" | "subscribed" | "error";

export type RealtimeChange = {
  table: (typeof REALTIME_TABLES)[number];
  event: "INSERT" | "UPDATE" | "DELETE";
  record: Record<string, unknown>;
  oldRecord: Record<string, unknown>;
};

export function supabaseRealtimeConfig(): { url: string; anonKey: string } | null {
  const url = String(import.meta.env.VITE_SUPABASE_URL ?? "").trim();
  const anonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY ?? "").trim();
  if (!url || !anonKey || !/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url)) return null;
  return { url, anonKey };
}

export function subscribeToDashboardRealtime(
  onStatus: (status: RealtimeSyncStatus) => void,
  onChange: (change: RealtimeChange) => void,
): () => void {
  const config = supabaseRealtimeConfig();
  if (!config) {
    onStatus("disabled");
    return () => undefined;
  }

  const client = createClient(config.url, config.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  let channel: RealtimeChannel | null = client.channel("gelaran-dashboard-realtime");
  onStatus("connecting");

  for (const table of REALTIME_TABLES) {
    channel = channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table },
      (payload) => {
        const event = payload.eventType as RealtimeChange["event"];
        onChange({
          table,
          event,
          record: (payload.new ?? {}) as Record<string, unknown>,
          oldRecord: (payload.old ?? {}) as Record<string, unknown>,
        });
      },
    );
  }

  channel.subscribe((status) => {
    if (status === "SUBSCRIBED") onStatus("subscribed");
    else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") onStatus("error");
    else if (status === "CLOSED") onStatus("disabled");
  });

  return () => {
    if (channel) void client.removeChannel(channel);
    channel = null;
  };
}
