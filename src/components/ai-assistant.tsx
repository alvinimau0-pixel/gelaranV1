import { useEffect, useRef, useState } from "react";
import { Bot, Check, Send, Sparkles, X } from "lucide-react";
import {
  getAttendanceSummary,
  setAttendanceByName,
  setAttendanceForTeam,
  todayInKualaLumpur,
  type AttendanceStatus,
} from "@/lib/attendance";
import { useAppStore } from "@/lib/store";
import { pct, cn } from "@/lib/utils";
import { interpretAiCommand, type AiIntent } from "@/lib/ai-command";

type Msg = { role: "user" | "assistant"; text: string };
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

function formatProgress(field: ProgressField, value: number) {
  return `${progressLabels[field]} progress to **${pct(value)}**.`;
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

function parseAttendance(text: string): { workerName: string; status: AttendanceStatus; date: string } | null {
  const match = text.match(
    /^(?:mark|set|update)\s+(?:worker\s+)?(?:"([^"]+)"|'([^']+)'|(.+?))\s+(?:as\s+)?(present|absent|leave|off)(?:\s+(?:for\s+|on\s+)?(today|yesterday|tomorrow|\d{4}-\d{2}-\d{2}))?$/i,
  );
  if (!match) return null;
  const workerName = (match[1] ?? match[2] ?? match[3] ?? "").trim();
  const rawStatus = match[4].toLowerCase();
  const status = rawStatus[0].toUpperCase() + rawStatus.slice(1) as AttendanceStatus;
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

function refreshAttendanceTable() {
  window.dispatchEvent(new Event("gelaran:attendance-updated"));
}

function intentToCommand(intent: AiIntent): string | null {
  const date = intent.date ?? "today";
  if (intent.action === "help") return "help";
  if (intent.action === "status") return "status";
  if (intent.action === "attendance_summary") return `attendance ${date}`;
  if (intent.action === "update_attendance" && intent.workerName && intent.status) return `mark "${intent.workerName}" ${intent.status.toLowerCase()} ${date}`;
  if (intent.action === "update_team_attendance" && intent.team && intent.status) return `mark everyone in ${intent.team} ${intent.status.toLowerCase()} ${date}`;
  if (intent.action === "update_progress" && intent.field && intent.value !== null) return `set ${intent.field} progress to ${intent.value}%`;
  if (intent.action === "adjust_progress" && intent.field && intent.delta !== null) return `${intent.delta >= 0 ? "increase" : "decrease"} ${intent.field} by ${Math.abs(intent.delta)}%`;
  if (intent.action === "update_manpower" && intent.value !== null) return `set on site to ${intent.value}`;
  if (intent.action === "update_weather" && intent.text) return `set weather to "${intent.text}"`;
  if (intent.action === "update_focus" && intent.text) return `set today focus to "${intent.text}"`;
  return null;
}

export async function applyCommand(text: string, useAi = true): Promise<string> {
  const store = useAppStore.getState();
  const lower = text.toLowerCase().replace(/[“”]/g, '"').trim();

  if (!lower) return "Please enter a request. Type **help** to see examples.";

  if (/^(help|commands|what can you|how do i)/i.test(lower)) {
    return [
      "**I can update the dashboard for you.** Use a direct command and I will confirm exactly what changed.",
      "**Attendance:** `mark SOLIHIN present yesterday`, `set BILAL absent tomorrow`, or `mark everyone in team 4 present today`",
      "**Attendance questions:** `who is absent today`, `how many workers are present`, or `roll call today`",
      "**Manpower:** `set on site to 30`",
      "**Progress:** `set cold water progress to 55%`, `cold water is at 55%`, or `we're 60% complete on sanitary`",
      "**Conditions:** `set weather to Fair` or `set today focus to transfer pump at L13`",
      "**Read-only check:** `status`",
      "Attendance, BOQ, Photos, and other dashboard changes are managed here—not through page editing.",
    ].join("\n");
  }

  if (/^(status|summary|progress|how.*(going|doing)|dashboard)/i.test(lower)) {
    const s = store.report.site;
    return [
      "**Site snapshot**",
      `· Overall ${pct(s.overall)} · Cold water ${pct(s.coldWater)} · Sanitary ${pct(s.sanitary)} · Irrigation ${pct(s.irrigation)}`,
      `· On site: ${s.men} · Weather: ${s.weather} · Shift: ${s.shift}`,
      `· Today: ${s.today}`,
      "· Attendance updates: available by worker name or team",
    ].join("\n");
  }

  if (/^(who is|who's|how many).*(present|absent|leave|off|attendance)/i.test(lower) || /^(attendance|roll call|headcount)\s*(today|yesterday|tomorrow)?$/i.test(lower)) {
    const summary = await getAttendanceSummary({ data: { date: resolveDate(lower.match(/today|yesterday|tomorrow|\d{4}-\d{2}-\d{2}/i)?.[0]) } });
    const requested = /absent/i.test(lower) ? "absent" : /leave/i.test(lower) ? "leave" : /off/i.test(lower) ? "off" : "present";
    const names = summary[requested as "present" | "absent" | "leave" | "off"];
    return `**Attendance for ${summary.date}**\n· ${requested[0].toUpperCase() + requested.slice(1)}: **${names.length}**${names.length ? ` — ${names.join(", ")}` : " — none recorded"}\n· Present ${summary.present.length} · Absent ${summary.absent.length} · Leave ${summary.leave.length} · Off ${summary.off.length} · Blank ${summary.blank.length}`;
  }

  const teamAttendance = parseTeamAttendance(text.trim());
  if (teamAttendance) {
    try {
      const result = await setAttendanceForTeam({ data: teamAttendance });
      refreshAttendanceTable();
      return `Done — marked **${result.count} workers** in **${result.team}** ${attendanceLabels[teamAttendance.status]} on ${teamAttendance.date}. The table has been refreshed.`;
    } catch (error) {
      return `I could not update that team. ${error instanceof Error ? error.message : "Please check the team name."}`;
    }
  }

  const attendance = parseAttendance(text.trim());
  if (attendance) {
    try {
      const result = await setAttendanceByName({ data: attendance });
      refreshAttendanceTable();
      const dateLabel = attendance.date === todayInKualaLumpur().iso ? "today" : `on ${attendance.date}`;
      return `Done — **${result.workerName}** is marked **${attendanceLabels[attendance.status]}** ${dateLabel}. The attendance table has been refreshed.`;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Worker could not be found";
      return `I could not update attendance. ${message} Please check the worker's name and try again.`;
    }
  }

  if (/^(?:mark|set|update)\s+.+\s+(?:present|absent|leave|off)/i.test(lower)) {
    return "I recognized an attendance request, but need a worker name and status. Example: **mark SOLIHIN present today**.";
  }

  const manpowerMatch = lower.match(/(?:set|update|change)?\s*(?:on\s*site|men|manpower|workers|people)\s*(?:to|=|:)?\s*(\d+)\b/i);
  if (manpowerMatch) {
    const men = Number(manpowerMatch[1]);
    if (men < 0 || men > 1000) return "Please provide an on-site manpower value from 0 to 1,000.";
    store.updateSite({ men });
    return `Done — on-site manpower is now **${men}**.`;
  }

  const progressMatch = lower.match(
    /(?:set|update|change)?\s*(overall|cold\s*water|sanitary|irrigation)\s*(?:progress|complete|completion)?\s*(?:to|at|=|:)\s*(\d+(?:\.\d+)?)\s*%?/i,
  );
  if (progressMatch) {
    const rawField = progressMatch[1].replace(/\s+/g, "").toLowerCase() as ProgressField;
    const field = rawField in progressLabels ? rawField : null;
    const value = parsePercent(progressMatch[2]);
    if (!field || value === null) return "Progress must be a percentage from 0% to 100%.";
    store.updateSite({ [field]: value } as Partial<typeof store.report.site>);
    return `Done — updated ${formatProgress(field, value)}`;
  }

  const naturalProgressMatch = lower.match(/(?:we(?:'re| are)|it(?:'s| is)|currently)\s+(\d+(?:\.\d+)?)\s*%\s*(?:complete|completed|done)\s*(?:on|for|with)\s+(overall|cold\s*water|sanitary|irrigation)/i);
  if (naturalProgressMatch) {
    const field = naturalProgressMatch[2].replace(/\s+/g, "").toLowerCase() as ProgressField;
    const value = parsePercent(naturalProgressMatch[1]);
    if (!(field in progressLabels) || value === null) return "Please provide a progress value from 0% to 100%.";
    store.updateSite({ [field]: value } as Partial<typeof store.report.site>);
    return `Got it — ${formatProgress(field, value)}`;
  }

  const adjustmentMatch = lower.match(
    /(?:increase|raise|decrease|reduce)\s+(overall|cold\s*water|sanitary|irrigation)\s+(?:progress\s+)?by\s+(\d+(?:\.\d+)?)\s*%?/i,
  );
  if (adjustmentMatch) {
    const rawField = adjustmentMatch[1].replace(/\s+/g, "").toLowerCase() as ProgressField;
    const field = rawField in progressLabels ? rawField : null;
    const delta = Number(adjustmentMatch[2]) / 100;
    if (!field || !Number.isFinite(delta)) return "Progress adjustments must use a valid percentage.";
    const direction = /^(increase|raise)/i.test(lower) ? 1 : -1;
    const value = Math.max(0, Math.min(1, store.report.site[field] + direction * delta));
    store.updateSite({ [field]: value } as Partial<typeof store.report.site>);
    return `Done — adjusted ${formatProgress(field, value)}`;
  }

  const weatherMatch = lower.match(/(?:set|update|change)?\s*weather\s*(?:to|=|:)\s*["']?(.+?)["']?$/i);
  if (weatherMatch) {
    const weather = weatherMatch[1].trim().replace(/["']$/g, "");
    if (weather.length < 2 || weather.length > 40) return "Please provide a weather description between 2 and 40 characters.";
    store.updateSite({ weather });
    return `Done — weather is now **${weather}**.`;
  }

  const focusMatch = lower.match(/(?:set|update|change)?\s*(?:today|focus|work)\s*(?:focus)?\s*(?:to|=|:)\s*["']?(.+?)["']?$/i);
  if (focusMatch) {
    const focus = focusMatch[1].trim().replace(/["']$/g, "");
    if (focus.length < 3 || focus.length > 100) return "Please provide a work focus between 3 and 100 characters.";
    store.updateSite({ today: focus });
    return `Done — today's work focus is now **${focus}**.`;
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

  return "I did not change anything. Type **help** for examples, or try **mark SOLIHIN present today**.";
}

export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      text: "Hi — I understand natural requests for progress, manpower, conditions, and attendance. Try **who is absent today**, **mark everyone in team 4 present**, or type **help**.",
    },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open, busy]);

  async function send(command = input) {
    const text = command.trim();
    if (!text || busy) return;
    setInput("");
    setMsgs((messages) => [...messages, { role: "user", text }]);
    setBusy(true);
    try {
      const reply = await applyCommand(text);
      window.setTimeout(() => setMsgs((messages) => [...messages, { role: "assistant", text: reply }]), 120);
    } catch (error) {
      console.error("[ai-assistant] command failed", error);
      setMsgs((messages) => [...messages, { role: "assistant", text: "I could not apply that change. Nothing was modified; please try a more specific command." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen((value) => !value)} className="fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full bg-ink text-accent-fg shadow-lg transition hover:scale-105" aria-label={open ? "Close AI assistant" : "Open AI assistant"}>
        {open ? <X className="size-5" /> : <Sparkles className="size-5" />}
      </button>
      {open ? (
        <div className="fixed bottom-24 right-5 z-50 flex h-[min(34rem,76dvh)] w-[min(25rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
          <div className="flex items-center gap-2 border-b border-border bg-ink px-4 py-3 text-accent-fg">
            <Bot className="size-4" />
            <div className="min-w-0 flex-1"><p className="text-sm font-semibold">Site AI assistant</p><p className="text-[11px] text-white/60">Clear commands · attendance enabled</p></div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-3 text-sm">
            {msgs.map((message, index) => (
              <div key={index} className={cn("max-w-[92%] whitespace-pre-wrap rounded-xl px-3 py-2", message.role === "user" ? "ml-auto bg-ink text-accent-fg" : "bg-surface-2 text-fg")}>
                {message.text.split("**").map((part, partIndex) => partIndex % 2 === 1 ? <strong key={partIndex}>{part}</strong> : <span key={partIndex}>{part}</span>)}
              </div>
            ))}
            {busy ? <div className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-muted"><Check className="size-3 animate-pulse" />Checking and applying…</div> : null}
            <div ref={bottomRef} />
          </div>
          <div className="flex flex-wrap gap-1.5 border-t border-border p-2">
            {["help", "status", "who is absent today", "mark SOLIHIN present today"].map((suggestion) => <button key={suggestion} type="button" disabled={busy} onClick={() => void send(suggestion)} className="rounded-full border border-border px-2 py-1 text-[11px] text-muted hover:border-accent hover:text-fg">{suggestion}</button>)}
          </div>
          <div className="flex gap-2 border-t border-border p-2">
            <input value={input} disabled={busy} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && void send()} placeholder="Ask AI what to update…" className="min-w-0 flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent" aria-label="AI assistant command" />
            <button type="button" disabled={busy} onClick={() => void send()} className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-ink text-accent-fg disabled:opacity-50" aria-label="Send command to AI assistant"><Send className="size-4" /></button>
          </div>
        </div>
      ) : null}
    </>
  );
}

export { parseAttendance };
