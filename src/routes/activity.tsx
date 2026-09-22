import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui";
import { listAuditEvents, type AuditRow } from "@/lib/audit";

export const Route = createFileRoute("/activity")({ component: ActivityPage });

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-MY", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kuala_Lumpur",
  }).format(new Date(value));
}

function ActivityPage() {
  const [events, setEvents] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listAuditEvents({ data: { limit: 100 } })
      .then((rows) => {
        if (!cancelled) setEvents(rows);
      })
      .catch(() => {
        if (!cancelled) setError("Activity history is unavailable. Check the database connection.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-accent">Operations</p>
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight sm:text-3xl">Activity history</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Recent changes to attendance, workers, site photos, and MEP progress.
        </p>
      </div>
      <Card className="overflow-hidden p-0">
        {loading ? <p className="p-4 text-sm text-muted">Loading activity…</p> : null}
        {error ? <p className="border-b border-bad/20 bg-bad-bg p-4 text-sm text-bad" role="alert">{error}</p> : null}
        {!loading && !error && events.length === 0 ? (
          <p className="p-4 text-sm text-muted">No operational changes have been recorded yet.</p>
        ) : null}
        {events.length > 0 ? (
          <div className="divide-y divide-border">
            {events.map((event) => (
              <article key={event.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-accent">{event.action}</span>
                    <span className="text-xs text-muted">{event.actorLabel}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-fg">{event.summary}</p>
                  {event.entityId ? <p className="mt-0.5 text-xs text-muted">{event.entityType} · {event.entityId}</p> : null}
                </div>
                <time className="shrink-0 text-xs text-muted" dateTime={event.createdAt}>{formatDate(event.createdAt)}</time>
              </article>
            ))}
          </div>
        ) : null}
      </Card>
    </div>
  );
}
