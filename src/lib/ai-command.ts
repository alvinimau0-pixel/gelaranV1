import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const intentSchema = z.object({
  action: z.enum([
    "help",
    "status",
    "attendance_summary",
    "update_attendance",
    "update_team_attendance",
    "update_progress",
    "adjust_progress",
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
});

export type AiIntent = z.infer<typeof intentSchema>;

const outputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    action: { type: "string", enum: ["help", "status", "attendance_summary", "update_attendance", "update_team_attendance", "update_progress", "adjust_progress", "update_manpower", "update_weather", "update_focus", "unknown"] },
    workerName: { type: ["string", "null"] },
    team: { type: ["string", "null"] },
    date: { type: ["string", "null"] },
    status: { type: ["string", "null"], enum: ["Present", "Absent", "Leave", "Off", null] },
    field: { type: ["string", "null"], enum: ["overall", "coldWater", "sanitary", "irrigation", null] },
    value: { type: ["number", "null"] },
    delta: { type: ["number", "null"] },
    text: { type: ["string", "null"] },
  },
  required: ["action", "workerName", "team", "date", "status", "field", "value", "delta", "text"],
} as const;

export const interpretAiCommand = createServerFn({ method: "POST" })
  .validator(z.object({ text: z.string().trim().min(1).max(500) }))
  .handler(async ({ data }): Promise<AiIntent | null> => {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    const base = (process.env.OPENAI_API_BASE ?? "https://api.openai.com/v1").replace(/\/$/, "");
    if (!apiKey) return null;

    const response = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        model: "gpt-5-mini",
        max_completion_tokens: 500,
        messages: [
          {
            role: "system",
            content: [
              "You interpret construction dashboard requests for Gelaran Maju's The Capital plumbing project.",
              "Return only the structured JSON schema. Never invent a worker, team, date, percentage, or status.",
              "Use action unknown when the request is ambiguous or unrelated.",
              "Dates must remain as the user's explicit YYYY-MM-DD or relative phrase; the application resolves relative dates.",
              "For percentages, value and delta are numeric percentages such as 55 or 3, not fractions.",
              "For weather or work focus, put the requested text in text.",
            ].join(" "),
          },
          { role: "user", content: data.text },
        ],
        response_format: { type: "json_schema", json_schema: { name: "construction_command", strict: true, schema: outputSchema } },
      }),
    });
    if (!response.ok) return null;
    const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) return null;
    const parsed = JSON.parse(content);
    const result = intentSchema.safeParse(parsed);
    return result.success ? result.data : null;
  });
