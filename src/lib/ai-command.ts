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
  // floor-range progress
  item: z.string().nullable(),
  tower: z.enum(["A", "B"]).nullable(),
  levelFrom: z.number().nullable(),
  levelTo: z.number().nullable(),
});

export type AiIntent = z.infer<typeof intentSchema>;

const outputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    action: {
      type: "string",
      enum: [
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
      ],
    },
    workerName: { type: ["string", "null"] },
    team: { type: ["string", "null"] },
    date: { type: ["string", "null"] },
    status: { type: ["string", "null"], enum: ["Present", "Absent", "Leave", "Off", null] },
    field: { type: ["string", "null"], enum: ["overall", "coldWater", "sanitary", "irrigation", null] },
    value: { type: ["number", "null"] },
    delta: { type: ["number", "null"] },
    text: { type: ["string", "null"] },
    item: { type: ["string", "null"] },
    tower: { type: ["string", "null"], enum: ["A", "B", null] },
    levelFrom: { type: ["number", "null"] },
    levelTo: { type: ["number", "null"] },
  },
  required: [
    "action",
    "workerName",
    "team",
    "date",
    "status",
    "field",
    "value",
    "delta",
    "text",
    "item",
    "tower",
    "levelFrom",
    "levelTo",
  ],
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
        max_completion_tokens: 600,
        messages: [
          {
            role: "system",
            content: [
              "You interpret natural language commands for Gelaran Maju construction site dashboard (The Capitol / MSK).",
              "Return only the structured JSON. Never invent workers, teams, percentages or floors.",
              "Use action unknown when the request is ambiguous or unrelated.",
              "",
              "Attendance:",
              "- 'everyone present today' or 'all present today' → action=update_all_attendance, status=Present, date=today",
              "- 'mark SOLIHIN present today' → update_attendance",
              "- 'mark everyone in team 4 present' → update_team_attendance",
              "",
              "Floor / item progress (very important):",
              "- 'update transfer pump tower A level 20 to level 29 95%' → action=update_item_progress",
              "  item='TRANSFER PUMP PIPES', tower='A', levelFrom=20, levelTo=29, value=95",
              "- 'transfer pump pipes tower B L15-L22 80%' → same pattern",
              "- 'hosereel tower A level 18 to 25 100%' → item='HOSEREEL FLOORTRAP & STACK'",
              "Common item aliases:",
              "  transfer pump / transfer pump pipes → TRANSFER PUMP PIPES",
              "  hosereel / hose reel → HOSEREEL FLOORTRAP & STACK",
              "  pipe sleeve / sleeve → PIPE SLEEVE",
              "  cw tenant / cold water tenant → CW TENANT",
              "  sanitary toilets / toilets → SANITARY TOILETS",
              "  irrigation outlet → IRRIGATION OUTLET",
              "",
              "High-level progress: 'set cold water to 55%' → update_progress",
              "Dates stay as the user said (today/yesterday/YYYY-MM-DD). Percentages are whole numbers (95 not 0.95).",
            ].join(" "),
          },
          { role: "user", content: data.text },
        ],
        response_format: {
          type: "json_schema",
          json_schema: { name: "construction_command", strict: true, schema: outputSchema },
        },
      }),
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) return null;
    try {
      const parsed = JSON.parse(content);
      const result = intentSchema.safeParse(parsed);
      return result.success ? result.data : null;
    } catch {
      return null;
    }
  });
