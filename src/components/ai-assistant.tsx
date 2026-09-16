import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles, X } from "lucide-react";
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

function formatProgress(field: ProgressField, value: number) {
  return `${progressLabels[field]} progress to **${pct(value)}**.`;
}

function parsePercent(value: string): number | null {
  const numeric = Number(value.replace("%", "").trim());
  if (!Number.isFinite(numeric) || numeric < 0 || numeric > 100) return null;
  return numeric / 100;
}

function applyCommand(text: string): string {
  const store = useAppStore.getState();
  const lower = text.toLowerCase().replace(/[“”]/g, '"').trim();

  if (!lower) return "Please enter a request. Type **help** to see the available commands.";

  if (/^(help|commands|what can you|how do i)/i.test(lower)) {
    return [
      "**AI-only editing is active.** I am the only way to change dashboard values.",
      "Ask me to:",
      "· Set manpower: **set on site to 30**",
      "· Set progress: **set cold water progress to 55%**",
      "· Adjust progress: **increase sanitary by 3%**",
      "· Update conditions: **set weather to Fair**",
      "· Update work focus: **set today focus to transfer pump at L13**",
      "· Review the dashboard: **status**",
      "The Overview, BOQ, Attendance, and Photos pages are read-only.",
    ].join("\n");
  }

  if (/^(status|summary|progress|how.*(going|doing)|dashboard)/i.test(lower)) {
    const s = store.report.site;
    return [
      "**Site snapshot**",
      `· Overall ${pct(s.overall)} · Cold water ${pct(s.coldWater)} · Sanitary ${pct(s.sanitary)} · Irrigation ${pct(s.irrigation)}`,
      `· On site: ${s.men} · Weather: ${s.weather} · Shift: ${s.shift}`,
      `· Today: ${s.today}`,
      "· Dashboard editing: AI assistant only",
    ].join("\n");
  }

  const manpowerMatch = lower.match(/(?:set|update|change)?\s*(?:on\s*site|men|manpower|workers|people)\s*(?:to|=|:)?\s*(\d+)\b/i);
  if (manpowerMatch) {
    const men = Number(manpowerMatch[1]);
    if (men < 0 || men > 1000) return "Please provide an on-site manpower value from 0 to 1,000.";
    store.updateSite({ men });
    return `On-site manpower updated to **${men}**.`;
  }

  const progressMatch = lower.match(
    /(?:set|update|change)?\s*(overall|cold\s*water|sanitary|irrigation)\s*(?:progress)?\s*(?:to|=|:)?\s*(\d+(?:\.\d+)?)\s*%?/i,
  );
  if (progressMatch) {
    const rawField = progressMatch[1].replace(/\s+/g, "").toLowerCase() as keyof typeof progressLabels;
    const field = rawField in progressLabels ? rawField : null;
    const value = parsePercent(progressMatch[2]);
    if (!field || value === null) return "Progress must be a percentage from 0% to 100%.";
    store.updateSite({ [field]: value } as Partial<typeof store.report.site>);
    return `Updated ${formatProgress(field, value)}`;
  }

  const adjustmentMatch = lower.match(
    /(?:increase|raise|decrease|reduce)\s+(overall|cold\s*water|sanitary|irrigation)\s+(?:progress\s+)?by\s+(\d+(?:\.\d+)?)\s*%?/i,
  );
  if (adjustmentMatch) {
    const rawField = adjustmentMatch[1].replace(/\s+/g, "").toLowerCase() as ProgressField;
    const field = rawField in progressLabels ? rawField : null;
    const delta = Number(adjustmentMatch[2]) / 100;
    if (!field || !Number.isFinite(delta)) return "Progress adjustments must use a valid percentage.";
    const direction = lower.startsWith("increase") || lower.startsWith("raise") ? 1 : -1;
    const value = Math.max(0, Math.min(1, store.report.site[field] + direction * delta));
    store.updateSite({ [field]: value } as Partial<typeof store.report.site>);
    return `Adjusted ${formatProgress(field, value)}`;
  }

  const weatherMatch = lower.match(/(?:set|update|change)?\s*weather\s*(?:to|=|:)\s*["']?(.+?)["']?$/i);
  if (weatherMatch) {
    const weather = weatherMatch[1].trim().replace(/["']$/g, "");
    if (weather.length < 2 || weather.length > 40) return "Please provide a weather description between 2 and 40 characters.";
    store.updateSite({ weather });
    return `Weather updated to **${weather}**.`;
  }

  const focusMatch = lower.match(/(?:set|update|change)?\s*(?:today|focus|work)\s*(?:focus)?\s*(?:to|=|:)\s*["']?(.+?)["']?$/i);
  if (focusMatch) {
    const focus = focusMatch[1].trim().replace(/["']$/g, "");
    if (focus.length < 3 || focus.length > 100) return "Please provide a work focus between 3 and 100 characters.";
    store.updateSite({ today: focus });
    return `Today's work focus updated to **${focus}**.`;
  }

  return 'I did not change anything. Try **help**, **status**, **set on site to 28**, or **set cold water progress to 48%**.';
}

export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      text: "Hi — I am the only dashboard editor. Ask for a status update or tell me what to change, such as **set on site to 30** or **set cold water progress to 52%**.",
    },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open]);

  function send() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMsgs((messages) => [...messages, { role: "user", text }]);
    let reply: string;
    try {
      reply = applyCommand(text);
    } catch (error) {
      console.error("[ai-assistant] command failed", error);
      reply = "I could not apply that change. Nothing was modified; please try a more specific command.";
    }
    window.setTimeout(() => setMsgs((messages) => [...messages, { role: "assistant", text: reply }]), 180);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full bg-ink text-accent-fg shadow-lg transition hover:scale-105"
        aria-label={open ? "Close AI assistant" : "Open AI assistant"}
      >
        {open ? <X className="size-5" /> : <Sparkles className="size-5" />}
      </button>

      {open ? (
        <div className="fixed bottom-24 right-5 z-50 flex h-[min(30rem,72dvh)] w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
          <div className="flex items-center gap-2 border-b border-border bg-ink px-4 py-3 text-accent-fg">
            <Bot className="size-4" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Site AI assistant</p>
              <p className="text-[11px] text-white/60">Only editor · validated dashboard commands</p>
            </div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-3 text-sm">
            {msgs.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "max-w-[90%] whitespace-pre-wrap rounded-xl px-3 py-2",
                  message.role === "user" ? "ml-auto bg-ink text-accent-fg" : "bg-surface-2 text-fg",
                )}
              >
                {message.text.split("**").map((part, partIndex) =>
                  partIndex % 2 === 1 ? <strong key={partIndex}>{part}</strong> : <span key={partIndex}>{part}</span>,
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="flex gap-2 border-t border-border p-2">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && send()}
              placeholder="Ask AI to update the dashboard…"
              className="min-w-0 flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
              aria-label="AI assistant command"
            />
            <button
              type="button"
              onClick={send}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-ink text-accent-fg"
              aria-label="Send command to AI assistant"
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

export { applyCommand };
