import { useEffect, useRef, useState } from "react";
import { Bot, Check, Send, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { applyCommand } from "@/lib/apply-command";

type Msg = { role: "user" | "assistant"; text: string };

function friendlyError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error ?? "");
  const lower = raw.toLowerCase();
  if (
    lower.includes("no such file") ||
    lower.includes("enoent") ||
    lower.includes("cannot find module") ||
    lower.includes("failed to fetch") ||
    lower.includes("network")
  ) {
    return "Server is still updating. Please wait a moment and try again, or hard-refresh the page.";
  }
  if (raw.length > 160) return "Something went wrong. Please try again.";
  return raw || "Please try again.";
}

export function GroqAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", text: "Groq Operator ready. I can add or remove workers, update attendance and progress, or report the current status." },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open]);

  async function send(preset?: string) {
    const text = (preset ?? input).trim();
    if (!text || busy) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text }]);
    setBusy(true);
    try {
      const reply = await applyCommand(text);
      setMsgs((m) => [...m, { role: "assistant", text: reply }]);
    } catch (error) {
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          text: `Couldn’t complete that. ${friendlyError(error)}`,
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 right-4 z-50 inline-flex size-14 items-center justify-center rounded-full bg-ink text-accent-fg shadow-lg transition hover:scale-105 active:scale-95 sm:bottom-6 sm:right-6"
        aria-label={open ? "Close Groq operator" : "Open Groq operator"}
      >
        {open ? <X className="size-5" /> : <Sparkles className="size-5" />}
      </button>
      {open ? (
        <div className="fixed bottom-20 right-4 z-50 flex w-[min(100vw-2rem,24rem)] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl sm:bottom-24 sm:right-6">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
            <Bot className="size-4 text-accent" />
            <p className="flex-1 text-sm font-semibold">Groq Operator</p>
            <button type="button" className="rounded-md p-1 text-muted hover:bg-surface-2" onClick={() => setOpen(false)} aria-label="Close">
              <X className="size-4" />
            </button>
          </div>
          <div className="flex max-h-80 flex-col gap-2 overflow-y-auto p-3 text-sm">
            {msgs.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "max-w-[92%] whitespace-pre-wrap rounded-xl px-3 py-2",
                  message.role === "user" ? "ml-auto bg-ink text-accent-fg" : "bg-surface-2 text-fg",
                )}
              >
                {message.text.split("**").map((part, partIndex) =>
                  partIndex % 2 === 1 ? <strong key={partIndex}>{part}</strong> : <span key={partIndex}>{part}</span>,
                )}
              </div>
            ))}
            {busy ? (
              <div className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-muted">
                <Check className="size-3 animate-pulse" />
                Groq is processing…
              </div>
            ) : null}
            <div ref={bottomRef} />
          </div>
          <div className="flex flex-wrap gap-1.5 border-t border-border p-2">
            {["help", "status", "everyone present today", "who is absent today"].map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                disabled={busy}
                onClick={() => void send(suggestion)}
                className="rounded-full border border-border px-2 py-1 text-[11px] text-muted hover:border-accent hover:text-fg"
              >
                {suggestion}
              </button>
            ))}
          </div>
          <div className="flex gap-2 border-t border-border p-2">
            <input
              value={input}
              disabled={busy}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && void send()}
              placeholder="Type a command…"
              className="min-w-0 flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
              aria-label="Groq operator command"
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => void send()}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-ink text-accent-fg disabled:opacity-50"
              aria-label="Send command to Groq operator"
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

export { parseAttendance } from "@/lib/apply-command";
