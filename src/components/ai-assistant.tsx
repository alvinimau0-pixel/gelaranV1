import { useEffect, useRef, useState } from "react";
import { Bot, Check, Send, Sparkles, X } from "lucide-react";
import { setAttendanceByName, todayInKualaLumpur, type AttendanceStatus } from "@/lib/attendance";
import { useAppStore } from "@/lib/store";
import { pct, cn } from "@/lib/utils";

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

function parseAttendance(text: string): { workerName: string; status: AttendanceStatus; date: string } | null {
  const match = text.match(
    /^(?:mark|set|update)\s+(?:worker\s+)?(?:"([^"]+)"|'([^']+)'|(.+?))\s+(?:as\s+)?(present|absent|leave|off)(?:\s+(?:for\s+)?(?:today|on\s+(\d{4}-\d{2}-\d{2})))?$/i,
  );
  if (!match) return null;
  const workerName = (match[1] ?? match[2] ?? match[3] ?? "").trim();
  const rawStatus = match[4].toLowerCase();
  const status = rawStatus[0].toUpperCase() + rawStatus.slice(1) as AttendanceStatus;
  const date = match[5] ?? todayInKualaLumpur().iso;
  if (!workerName || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  return { workerName, status, date };
}

function refreshAttendanceTable() {
  window.dispatchEvent(new Event("gelaran:attendance-updated"));
}

export async function applyCommand(text: string): Promise<string> {
  const store = useAppStore.getState();
  const lower = text.toLowerCase().replace(/[“”]/g, '"').trim();

  if (!lower) return "Please enter a request. Type **help** to see examples.";

  if (/^(help|commands|what can you|how do i)/i.test(lower)) {
    return [
      "**I can update the dashboard for you.** Use a direct command and I will confirm exactly what changed.",
      "**Attendance:** `mark SOLIHIN present today`, `set BILAL absent on 2026-09-17`, or `mark ASGAR leave`",
      "**Manpower:** `set on site to 30`",
      "**Progress:** `set cold water progress to 55%` or `increase sanitary by 3%`",
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
      "· Attendance updates: available by worker name",
    ].join("\n");
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
    /(?:set|update|change)?\s*(overall|cold\s*water|sanitary|irrigation)\s*(?:progress)?\s*(?:to|=|:)\s*(\d+(?:\.\d+)?)\s*%?/i,
  );
  if (progressMatch) {
    const rawField = progressMatch[1].replace(/\s+/g, "").toLowerCase() as ProgressField;
    const field = rawField in progressLabels ? rawField : null;
    const value = parsePercent(progressMatch[2]);
    if (!field || value === null) return "Progress must be a percentage from 0% to 100%.";
    store.updateSite({ [field]: value } as Partial<typeof store.report.site>);
    return `Done — updated ${formatProgress(field, value)}`;
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

  return "I did not change anything. Type **help** for examples, or try **mark SOLIHIN present today**.";
}

export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      text: "Hi — I can update progress, manpower, conditions, and attendance. Try **mark SOLIHIN present today** or type **help**.",
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
            {["help", "status", "mark SOLIHIN present today"].map((suggestion) => <button key={suggestion} type="button" disabled={busy} onClick={() => void send(suggestion)} className="rounded-full border border-border px-2 py-1 text-[11px] text-muted hover:border-accent hover:text-fg">{suggestion}</button>)}
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
