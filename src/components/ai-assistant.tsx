import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles, X } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { pct, cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; text: string };

function applyCommand(text: string): string {
  const store = useAppStore.getState();
  const lower = text.toLowerCase().trim();

  const menMatch =
    lower.match(/(?:set|update)?\s*(?:on\s*site|men|manpower)\s*(?:to|=)?\s*(\d+)/i) ||
    lower.match(/(\d+)\s*(?:men|people|workers)\s*(?:on\s*site)?/i);
  if (menMatch) {
    const n = Number(menMatch[1]);
    store.updateSite({ men: n });
    return `Updated on-site manpower to **${n}**.`;
  }

  const weatherMatch = lower.match(
    /(?:set|update)?\s*weather\s*(?:to|=)?\s*["']?([a-zA-Z\s]+)["']?/i,
  );
  if (weatherMatch) {
    const w = weatherMatch[1].trim();
    store.updateSite({ weather: w });
    return `Weather set to **${w}**.`;
  }

  const todayMatch = lower.match(
    /(?:set|update)?\s*(?:today|focus|work)\s*(?:to|=|:)?\s*["']?(.+?)["']?$/i,
  );
  if (todayMatch && !lower.includes("photo")) {
    const t = todayMatch[1].trim();
    if (t.length > 2 && t.length < 80) {
      store.updateSite({ today: t });
      return `Today's focus updated to **${t}**.`;
    }
  }

  const pctMatch = lower.match(
    /(cold\s*water|sanitary|irrigation|overall)\s*(?:to|=)?\s*(\d+(?:\.\d+)?)\s*%?/i,
  );
  if (pctMatch) {
    const key = pctMatch[1].replace(/\s+/g, "").toLowerCase();
    const val = Number(pctMatch[2]) / 100;
    const map: Record<string, "coldWater" | "sanitary" | "irrigation" | "overall"> = {
      coldwater: "coldWater",
      sanitary: "sanitary",
      irrigation: "irrigation",
      overall: "overall",
    };
    const field = map[key];
    if (field) {
      store.updateSite({ [field]: val });
      return `Updated **${field}** to **${pct(val)}**.`;
    }
  }

  if (/status|summary|progress|how.*(going|doing)|dashboard/i.test(lower)) {
    const s = store.report.site;
    return [
      `**Site snapshot**`,
      `· Overall ${pct(s.overall)} · Cold water ${pct(s.coldWater)} · Sanitary ${pct(s.sanitary)} · Irrigation ${pct(s.irrigation)}`,
      `· On site: ${s.men} · Weather: ${s.weather} · Shift: ${s.shift}`,
      `· Today: ${s.today}`,
      `· Photos: shared in Photos at home`,
    ].join("\n");
  }

  if (/help|what can you|commands/i.test(lower)) {
    return [
      `I can help you update the live dashboard. Try:`,
      `· "set on site to 30"`,
      `· "cold water 55%"`,
      `· "weather Fair"`,
      `· "today Transfer pump L13"`,
      `· "status" for a quick summary`,
      `Turn on **Edit mode** in the header for full table edits. Upload site photos under **Photos at home**.`,
    ].join("\n");
  }

  return `Got it. Try commands like "set on site to 28", "cold water 48%", or "status". For full control, enable Edit mode and edit tables directly.`;
}

export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      text: 'Hi — I\'m your site assistant. Ask for status or tell me updates (e.g. "set on site to 30", "cold water 52%").',
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
    setMsgs((m) => [...m, { role: "user", text }]);
    const reply = applyCommand(text);
    setTimeout(() => {
      setMsgs((m) => [...m, { role: "assistant", text: reply }]);
    }, 180);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full bg-ink text-accent-fg shadow-lg transition hover:scale-105"
        aria-label="Open AI assistant"
      >
        {open ? <X className="size-5" /> : <Sparkles className="size-5" />}
      </button>

      {open ? (
        <div className="fixed bottom-24 right-5 z-50 flex h-[min(28rem,70dvh)] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
          <div className="flex items-center gap-2 border-b border-border bg-ink px-4 py-3 text-accent-fg">
            <Bot className="size-4" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Site AI assistant</p>
              <p className="text-[11px] text-white/60">Manual updates · live data</p>
            </div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-3 text-sm">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[90%] rounded-xl px-3 py-2 whitespace-pre-wrap",
                  m.role === "user"
                    ? "ml-auto bg-ink text-accent-fg"
                    : "bg-surface-2 text-fg",
                )}
              >
                {m.text.split("**").map((part, j) =>
                  j % 2 === 1 ? <strong key={j}>{part}</strong> : <span key={j}>{part}</span>,
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="flex gap-2 border-t border-border p-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Update or ask status…"
              className="min-w-0 flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <button
              type="button"
              onClick={send}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-ink text-accent-fg"
              aria-label="Send"
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
