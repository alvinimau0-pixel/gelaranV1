import { createFileRoute } from "@tanstack/react-router";
import { buildDailySummary } from "@/lib/daily-summary";

export const Route = createFileRoute("/api/daily-summary")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const cronSecret = process.env.CRON_SECRET;
        if (cronSecret && request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
          return new Response("Unauthorized", { status: 401 });
        }
        try {
          const summary = await buildDailySummary();
          return Response.json({ ok: true, summary });
        } catch (error) {
          console.error("[daily-summary] generation failed", error);
          return Response.json({ ok: false, error: "Daily summary generation failed" }, { status: 500 });
        }
      },
    },
  },
});
