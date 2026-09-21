import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const intentSchema = z.object({
  action: z.enum([
    "help",
    "status",
    "attendance_summary",
    "update_attendance",
    "update_team_attendance",
    "update_all_attendance",
    "update_progress",
    "adjust_progress",
    "update_item_progress",
    "update_manpower",
    "update_weather",
    "update_focus",
    "unknown",
  ]),
  workerName: z.string().nullable(),
  team: z.string().nullable(),
  date: z.string().nullable(),
  status: z.enum(["Present", "Absent", "Leave", "Off"]).nullable(),
  field: z.enum(["overall", "coldWater", "sanitary", "irrigation"]).nullable(),
  value: z.number().nullable(),
  delta: z.number().nullable(),
  text: z.string().nullable(),
  item: z.string().nullable(),
  tower: z.enum(["A", "B"]).nullable(),
  levelFrom: z.number().nullable(),
  levelTo: z.number().nullable(),
});

export type AiIntent = z.infer<typeof intentSchema>;

const SYSTEM_PROMPT = [
  "You interpret natural language commands for Gelaran Maju construction site dashboard (The Capitol / MSK).",
  "Return ONLY a single JSON object. No markdown, no explanation.",
  "Never invent workers, teams, percentages or floors.",
  "Use action \"unknown\" when the request is ambiguous or unrelated.",
  "",
  "JSON fields (all required):",
  'action, workerName, team, date, status, field, value, delta, text, item, tower, levelFrom, levelTo',
  "Use null for unused fields.",
  "",
  "Actions:",
  "- help | status | attendance_summary",
  "- update_attendance | update_team_attendance | update_all_attendance",
  "- update_progress | adjust_progress | update_item_progress",
  "- update_manpower | update_weather | update_focus | unknown",
  "",
  "Attendance:",
  "- 'everyone present today' → action=update_all_attendance, status=Present, date=today",
  "- 'mark SOLIHIN present today' → update_attendance, workerName=SOLIHIN",
  "- 'mark everyone in team 4 present' → update_team_attendance",
  "",
  "Floor / item progress:",
  "- 'update transfer pump tower A level 20 to level 29 95%' →",
  "  action=update_item_progress, item='TRANSFER PUMP PIPES', tower='A', levelFrom=20, levelTo=29, value=95",
  "Aliases: transfer pump→TRANSFER PUMP PIPES, hosereel→HOSEREEL FLOORTRAP & STACK,",
  "pipe sleeve→PIPE SLEEVE, cw tenant→CW TENANT, sanitary toilets→SANITARY TOILETS,",
  "irrigation outlet→IRRIGATION OUTLET",
  "",
  "High-level: 'set cold water to 55%' → update_progress, field=coldWater, value=55",
  "Percentages are whole numbers (95 not 0.95). Dates: today/yesterday/YYYY-MM-DD.",
].join(" ");

function resolveLlmConfig(): { apiKey: string; base: string; model: string } | null {
  const groq = process.env.GROQ_API_KEY?.trim();
  if (groq) {
    return {
      apiKey: groq,
      base: "https://api.groq.com/openai/v1",
      model: process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile",
    };
  }
  const openai = process.env.OPENAI_API_KEY?.trim();
  if (openai) {
    return {
      apiKey: openai,
      base: (process.env.OPENAI_API_BASE ?? "https://api.openai.com/v1").replace(/\/$/, ""),
      model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
    };
  }
  return null;
}

export const interpretAiCommand = createServerFn({ method: "POST" })
  .validator(z.object({ text: z.string().trim().min(1).max(500) }))
  .handler(async ({ data }): Promise<AiIntent | null> => {
    const cfg = resolveLlmConfig();
    if (!cfg) return null;

    try {
      const response = await fetch(`${cfg.base}/chat/completions`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${cfg.apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: cfg.model,
          temperature: 0,
          max_tokens: 600,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: data.text },
          ],
        }),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        console.warn("[ai-command] LLM error", response.status, errText.slice(0, 200));
        return null;
      }

      const payload = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = payload.choices?.[0]?.message?.content;
      if (!content) return null;

      const cleaned = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      const parsed = JSON.parse(cleaned);
      const result = intentSchema.safeParse(parsed);
      return result.success ? result.data : null;
    } catch (error) {
      console.warn("[ai-command] interpret failed", error);
      return null;
    }
  });
