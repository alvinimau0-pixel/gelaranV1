import {
  getAttendanceSummary,
  setAttendanceByName,
  setAttendanceForTeam,
  listWorkers,
  setAttendance,
  todayInKualaLumpur,
  type AttendanceStatus,
} from "@/lib/attendance";
import { useAppStore } from "@/lib/store";
import { pct } from "@/lib/utils";
import { interpretAiCommand, type AiIntent } from "@/lib/ai-command";
import { ITEM_META, computePackageProgress } from "@/lib/mep";
import { setItemRange } from "@/lib/progression";

type ProgressField = "overall" | "coldWater" | "sanitary" | "irrigation";

const progressLabels: Record<ProgressField, string> = {
  overall: "overall",
  coldWater: "cold water",
  sanitary: "sanitary",
  irrigation: "irrigation",
};

const attendanceLabels: Record<AttendanceStatus, string> = {
  Present: "present",
  Absent: "absent",
  Leave: "on leave",
  Off: "off",
};

function sanitizeError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error ?? "");
  const lower = raw.toLowerCase();
  if (
    lower.includes("pglite") ||
    lower.includes("enoent") ||
    lower.includes("no such file") ||
    lower.includes("database is not configured") ||
    lower.includes("database_url")
  ) {
    return "Database is not configured. Add DATABASE_URL in Vercel → Environment Variables, then redeploy.";
  }
  return raw || "Please try again.";
}

const ITEM_ALIASES: Record<string, string> = {
  "transfer pump": "TRANSFER PUMP PIPES",
  "transfer pump pipes": "TRANSFER PUMP PIPES",
  "tp pipes": "TRANSFER PUMP PIPES",
  hosereel: "HOSEREEL FLOORTRAP & STACK",
  "hose reel": "HOSEREEL FLOORTRAP & STACK",
  "pipe sleeve": "PIPE SLEEVE",
  sleeve: "PIPE SLEEVE",
  "cw tenant": "CW TENANT",
  "cold water tenant": "CW TENANT",
  "sanitary toilets": "SANITARY TOILETS",
  toilets: "SANITARY TOILETS",
  "irrigation outlet": "IRRIGATION OUTLET",
  "irrigation inlet": "IRRIGATION INLET",
};

function resolveItemName(raw: string): string | null {
  const cleaned = raw.trim().toLowerCase();
  if (ITEM_ALIASES[cleaned]) return ITEM_ALIASES[cleaned];
  const upper = raw.trim().toUpperCase();
  if (ITEM_META[upper]) return upper;
  for (const key of Object.keys(ITEM_META)) {
    if (key.toLowerCase().includes(cleaned) || cleaned.includes(key.toLowerCase().slice(0, 8))) {
      return key;
    }
  }
  return null;
}

function formatProgress(field: ProgressField, value: number) {
  return `${progressLabels[field]} is now **${pct(value)}**`;
}

function parsePercent(value: string): number | null {
  const numeric = Number(value.replace("%", "").trim());
  if (!Number.isFinite(numeric) || numeric < 0 || numeric > 100) return null;
  return numeric / 100;
}

function resolveDate(value?: string): string {
  const today = todayInKualaLumpur();
  if (!value || /today/i.test(value)) return today.iso;
  const base = new Date(Date.UTC(today.year, today.month - 1, today.day));
  const normalized = value.toLowerCase();
  if (normalized.includes("yesterday")) base.setUTCDate(base.getUTCDate() - 1);
  else if (normalized.includes("tomorrow")) base.setUTCDate(base.getUTCDate() + 1);
  else if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  else return today.iso;
  return base.toISOString().slice(0, 10);
}

export function parseAttendance(
  text: string,
): { workerName: string; status: AttendanceStatus; date: string } | null {
  const match = text.match(
    /^(?:mark|set|update)\s+(?:worker\s+)?(?:"([^"]+)"|'([^']+)'|(.+?))\s+(?:as\s+)?(present|absent|leave|off)(?:\s+(?:for\s+|on\s+)?(today|yesterday|tomorrow|\d{4}-\d{2}-\d{2}))?$/i,
  );
  if (!match) return null;
  const workerName = (match[1] ?? match[2] ?? match[3] ?? "").trim();
  const rawStatus = match[4].toLowerCase();
  const status = (rawStatus[0].toUpperCase() + rawStatus.slice(1)) as AttendanceStatus;
  const date = resolveDate(match[5]);
  if (!workerName) return null;
  return { workerName, status, date };
}

function parseTeamAttendance(text: string): { team: string; status: AttendanceStatus; date: string } | null {
  const match = text.match(
    /^(?:mark|set|update)\s+(?:everyone|all workers|the whole team)\s+(?:in\s+)?(team\s*[\w-]+)\s+(?:as\s+)?(present|absent|leave|off)(?:\s+(?:for\s+|on\s+)?(today|yesterday|tomorrow|\d{4}-\d{2}-\d{2}))?$/i,
  );
  if (!match) return null;
  const rawStatus = match[2].toLowerCase();
  return {
    team: match[1].replace(/\s+/g, " ").trim(),
    status: (rawStatus[0].toUpperCase() + rawStatus.slice(1)) as AttendanceStatus,
    date: resolveDate(match[3]),
  };
}

function parseAllAttendance(text: string): { status: AttendanceStatus; date: string } | null {
  const match = text.match(
    /^(?:mark\s+)?(?:everyone|all(?:\s+workers)?|all\s+present)\s+(?:as\s+)?(present|absent|leave|off)?(?:\s+(?:for\s+|on\s+)?(today|yesterday|tomorrow|\d{4}-\d{2}-\d{2}))?$/i,
  );
  if (!match) return null;
  const rawStatus = (match[1] ?? "present").toLowerCase();
  return {
    status: (rawStatus[0].toUpperCase() + rawStatus.slice(1)) as AttendanceStatus,
    date: resolveDate(match[2]),
  };
}

function parseItemProgress(text: string): {
  item: string;
  tower: "A" | "B";
  levelFrom: number;
  levelTo: number;
  value: number;
} | null {
  const match = text.match(
    /(?:update|set|change)?\s*(.+?)\s+(?:on\s+)?(?:tower\s*)?([AB])\s+(?:level\s*|l\s*)?(\d+)\s*(?:to|-|–|—)\s*(?:level\s*|l\s*)?(\d+)\s+(\d+(?:\.\d+)?)\s*%?/i,
  );
  if (!match) return null;
  const item = resolveItemName(match[1]);
  if (!item) return null;
  const tower = match[2].toUpperCase() as "A" | "B";
  const levelFrom = Number(match[3]);
  const levelTo = Number(match[4]);
  const value = parsePercent(match[5]);
  if (value === null || levelFrom > levelTo) return null;
  return { item, tower, levelFrom, levelTo, value };
}

function refreshAttendanceTable() {
  window.dispatchEvent(new Event("gelaran:attendance-updated"));
}

function intentToCommand(intent: AiIntent): string | null {
  const date = intent.date ?? "today";
  if (intent.action === "help") return "help";
  if (intent.action === "status") return "status";
  if (intent.action === "attendance_summary") return `attendance ${date}`;
  if (intent.action === "update_attendance" && intent.workerName && intent.status)
    return `mark "${intent.workerName}" ${intent.status.toLowerCase()} ${date}`;
  if (intent.action === "update_team_attendance" && intent.team && intent.status)
    return `mark everyone in ${intent.team} ${intent.status.toLowerCase()} ${date}`;
  if (intent.action === "update_all_attendance" && intent.status)
    return `everyone ${intent.status.toLowerCase()} ${date}`;
  if (intent.action === "update_progress" && intent.field && intent.value !== null)
    return `set ${intent.field} progress to ${intent.value}%`;
  if (intent.action === "adjust_progress" && intent.field && intent.delta !== null)
    return `${intent.delta >= 0 ? "increase" : "decrease"} ${intent.field} by ${Math.abs(intent.delta)}%`;
  if (
    intent.action === "update_item_progress" &&
    intent.item &&
    intent.tower &&
    intent.levelFrom != null &&
    intent.levelTo != null &&
    intent.value != null
  )
    return `update ${intent.item} tower ${intent.tower} level ${intent.levelFrom} to level ${intent.levelTo} ${intent.value}%`;
  if (intent.action === "update_manpower" && intent.value !== null) return `set on site to ${intent.value}`;
  if (intent.action === "update_weather" && intent.text) return `set weather to "${intent.text}"`;
  if (intent.action === "update_focus" && intent.text) return `set today focus to "${intent.text}"`;
  return null;
}

export async function applyCommand(text: string, useAi = true): Promise<string> {
  const store = useAppStore.getState();
  const lower = text.toLowerCase().replace(/[“”']/g, '"').trim();

  if (!lower) return "Just type what you need — try **help** if you want examples.";

  if (/^(help|commands|what can you|how do i)/i.test(lower)) {
    return [
      "Sure, here’s what I can do for you:",
      "",
      "**Attendance**",
      "· everyone present today",
      "· mark SOLIHIN present today",
      "· mark everyone in team 4 present",
      "· who is absent today",
      "",
      "**Progress (easy way)**",
      "· update transfer pump tower A level 20 to level 29 95%",
      "· hosereel tower B L15-L22 80%",
      "· set cold water to 55%",
      "",
      "**Other**",
      "· set on site to 30",
      "· set weather to Fair",
      "· set today focus to transfer pump + hosereel",
      "· status",
    ].join("\n");
  }

  if (/^(status|summary|progress|how.*(going|doing)|dashboard)/i.test(lower)) {
    const s = store.report.site;
    return [
      `Here’s the snapshot right now:`,
      `Overall **${pct(s.overall)}** · Cold water **${pct(s.coldWater)}** · Sanitary **${pct(s.sanitary)}** · Irrigation **${pct(s.irrigation)}**`,
      `On site: **${s.men}** people · Weather: ${s.weather} · ${s.shift} shift`,
      `Today’s focus: ${s.today}`,
    ].join("\n");
  }

  if (
    /^(who is|who's|how many).*(present|absent|leave|off|attendance)/i.test(lower) ||
    /^(attendance|roll call|headcount)\s*(today|yesterday|tomorrow)?$/i.test(lower)
  ) {
    try {
      const summary = await getAttendanceSummary({
        data: { date: resolveDate(lower.match(/today|yesterday|tomorrow|\d{4}-\d{2}-\d{2}/i)?.[0]) },
      });
      const requested = /absent/i.test(lower)
        ? "absent"
        : /leave/i.test(lower)
          ? "leave"
          : /off/i.test(lower)
            ? "off"
            : "present";
      const names = summary[requested as "present" | "absent" | "leave" | "off"];
      return [
        `Attendance for **${summary.date}**:`,
        `· ${requested[0].toUpperCase() + requested.slice(1)}: **${names.length}**${names.length ? ` — ${names.join(", ")}` : " — none"}`,
        `· Present ${summary.present.length} · Absent ${summary.absent.length} · Leave ${summary.leave.length} · Off ${summary.off.length}`,
      ].join("\n");
    } catch (error) {
      return sanitizeError(error);
    }
  }

  const allAtt = parseAllAttendance(text.trim());
  if (allAtt) {
    try {
      const workers = await listWorkers();
      let count = 0;
      for (const w of workers) {
        await setAttendance({ data: { workerId: w.id, date: allAtt.date, status: allAtt.status } });
        count++;
      }
      refreshAttendanceTable();
      const label = attendanceLabels[allAtt.status];
      return `All good — marked **${count} workers** ${label} for ${allAtt.date === todayInKualaLumpur().iso ? "today" : allAtt.date}.`;
    } catch (error) {
      return `Couldn’t update everyone just now. ${sanitizeError(error)}`;
    }
  }

  const teamAttendance = parseTeamAttendance(text.trim());
  if (teamAttendance) {
    try {
      const result = await setAttendanceForTeam({ data: teamAttendance });
      refreshAttendanceTable();
      return `Done — marked **${result.count} workers** in **${result.team}** ${attendanceLabels[teamAttendance.status]} ${teamAttendance.date === todayInKualaLumpur().iso ? "today" : `on ${teamAttendance.date}`}.`;
    } catch (error) {
      return `Couldn’t update that team. ${sanitizeError(error)}`;
    }
  }

  const attendance = parseAttendance(text.trim());
  if (attendance) {
    try {
      const result = await setAttendanceByName({ data: attendance });
      refreshAttendanceTable();
      const dateLabel = attendance.date === todayInKualaLumpur().iso ? "today" : `on ${attendance.date}`;
      return `Got it — **${result.workerName}** is now **${attendanceLabels[attendance.status]}** ${dateLabel}.`;
    } catch (error) {
      return `Couldn’t update attendance. ${sanitizeError(error)}`;
    }
  }

  if (/^(?:mark|set|update)\s+.+\s+(?:present|absent|leave|off)/i.test(lower)) {
    return "Almost — I need the worker’s name and status. Example: **mark SOLIHIN present today**.";
  }

  const itemProg = parseItemProgress(text.trim());
  if (itemProg) {
    const { item, tower, levelFrom, levelTo, value } = itemProg;
    try {
      const result = await setItemRange({
        data: { tower, item, levelFrom, levelTo, value },
      });
      if (result.updated === 0) {
        return `I couldn’t find levels ${levelFrom}–${levelTo} for **${item}** on Tower ${tower}. Check the level numbers.`;
      }
      const pkgs = computePackageProgress(result.progression);
      store.updateReport({ progression: result.progression });
      store.updateSite({
        coldWater: pkgs.coldWater,
        sanitary: pkgs.sanitary,
        irrigation: pkgs.irrigation,
        overall: pkgs.overall,
      });
      window.dispatchEvent(new Event("gelaran:progression-updated"));
      return `Updated **${item}** on Tower ${tower} from L${levelFrom} to L${levelTo} → **${Math.round(value * 100)}%** (${result.updated} floors). Package % recalculated from matrix.`;
    } catch {
      const report = structuredClone(store.report);
      const rows = report.progression[tower];
      let updated = 0;
      for (const row of rows) {
        const lvl = Number(row.level);
        if (lvl >= levelFrom && lvl <= levelTo) {
          if (row.items[item] !== undefined || ITEM_META[item]) {
            row.items[item] = value;
            updated++;
          }
        }
      }
      if (updated === 0) {
        return `I couldn’t find levels ${levelFrom}–${levelTo} for **${item}** on Tower ${tower}. Check the level numbers.`;
      }
      const pkgs = computePackageProgress(report.progression);
      store.updateReport({ progression: report.progression });
      store.updateSite({
        coldWater: pkgs.coldWater,
        sanitary: pkgs.sanitary,
        irrigation: pkgs.irrigation,
        overall: pkgs.overall,
      });
      return `Updated **${item}** on Tower ${tower} L${levelFrom}–L${levelTo} → **${Math.round(value * 100)}%** locally (${updated} floors). Cloud sync failed — will retry next update.`;
    }
  }

  const manpowerMatch = lower.match(
    /(?:set|update|change)?\s*(?:on\s*site|men|manpower|workers|people)\s*(?:to|=|:)?\s*(\d+)\b/i,
  );
  if (manpowerMatch) {
    const men = Number(manpowerMatch[1]);
    if (men < 0 || men > 1000) return "Please give a number between 0 and 1,000.";
    store.updateSite({ men });
    return `On-site manpower is now **${men}**.`;
  }

  const progressMatch = lower.match(
    /(?:set|update|change)?\s*(overall|cold\s*water|sanitary|irrigation)\s*(?:progress|complete|completion)?\s*(?:to|at|=|:)\s*(\d+(?:\.\d+)?)\s*%?/i,
  );
  if (progressMatch) {
    const rawField = progressMatch[1].replace(/\s+/g, "").toLowerCase() as ProgressField;
    const field = rawField in progressLabels ? rawField : null;
    const value = parsePercent(progressMatch[2]);
    if (!field || value === null) return "Progress needs to be a percentage from 0% to 100%.";
    store.updateSite({ [field]: value } as Partial<typeof store.report.site>);
    return `Updated — ${formatProgress(field, value)}.`;
  }

  const naturalProgressMatch = lower.match(
    /(?:we(?:'re| are)|it(?:'s| is)|currently)\s+(\d+(?:\.\d+)?)\s*%\s*(?:complete|completed|done)\s*(?:on|for|with)\s+(overall|cold\s*water|sanitary|irrigation)/i,
  );
  if (naturalProgressMatch) {
    const field = naturalProgressMatch[2].replace(/\s+/g, "").toLowerCase() as ProgressField;
    const value = parsePercent(naturalProgressMatch[1]);
    if (!(field in progressLabels) || value === null) return "Please give a progress value from 0% to 100%.";
    store.updateSite({ [field]: value } as Partial<typeof store.report.site>);
    return `Got it — ${formatProgress(field, value)}.`;
  }

  const adjustmentMatch = lower.match(
    /(?:increase|raise|decrease|reduce)\s+(overall|cold\s*water|sanitary|irrigation)\s+(?:progress\s+)?by\s+(\d+(?:\.\d+)?)\s*%?/i,
  );
  if (adjustmentMatch) {
    const rawField = adjustmentMatch[1].replace(/\s+/g, "").toLowerCase() as ProgressField;
    const field = rawField in progressLabels ? rawField : null;
    const delta = Number(adjustmentMatch[2]) / 100;
    if (!field || !Number.isFinite(delta)) return "Need a valid percentage for the adjustment.";
    const direction = /^(increase|raise)/i.test(lower) ? 1 : -1;
    const value = Math.max(0, Math.min(1, store.report.site[field] + direction * delta));
    store.updateSite({ [field]: value } as Partial<typeof store.report.site>);
    return `Adjusted — ${formatProgress(field, value)}.`;
  }

  const weatherMatch = lower.match(/(?:set|update|change)?\s*weather\s*(?:to|=|:)\s*["']?(.+?)["']?$/i);
  if (weatherMatch) {
    const weather = weatherMatch[1].trim().replace(/["']$/g, "");
    if (weather.length < 2 || weather.length > 40) return "Weather description should be 2–40 characters.";
    store.updateSite({ weather });
    return `Weather set to **${weather}**.`;
  }

  const focusMatch = lower.match(
    /(?:set|update|change)?\s*(?:today|focus|work)\s*(?:focus)?\s*(?:to|=|:)\s*["']?(.+?)["']?$/i,
  );
  if (focusMatch) {
    const focus = focusMatch[1].trim().replace(/["']$/g, "");
    if (focus.length < 3 || focus.length > 100) return "Focus should be between 3 and 100 characters.";
    store.updateSite({ today: focus });
    return `Today’s focus is now **${focus}**.`;
  }

  if (useAi) {
    try {
      const intent = await interpretAiCommand({ data: { text: text.trim() } });
      const command = intent ? intentToCommand(intent) : null;
      if (command) return applyCommand(command, false);
    } catch (error) {
      console.warn("[ai-assistant] structured interpreter unavailable; using rule fallback", error);
    }
  }

  return "I didn’t catch that one. Type **help** for examples, or try: **update transfer pump tower A level 20 to level 29 95%**.";
}
