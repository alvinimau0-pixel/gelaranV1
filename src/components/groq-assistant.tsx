import { useEffect, useRef, useState } from "react";
import { Bot, Check, Send, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { applyCommand } from "@/lib/apply-command";
import { isMutatingCommand } from "@/lib/command-safety";

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
  const [pendingCommand, setPendingCommand] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", text: "Groq Operator ready. I can add or remove workers, update attendance and progress, or report the current status." },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open]);

  useEffect(() => {
    if (!open) return;

    inputRef.current?.focus();
    const panel = panelRef.current;
    const toggle = toggleRef.current;
    const focusable = panel
      ? Array.from(panel.querySelectorAll<HTMLElement>('button, input, [tabindex]:not([tabindex="-1"])')).filter(
          (element) => !element.hasAttribute("disabled"),
        )
      : [];

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      toggle?.focus();
    };
  }, [open]);

  async function send(preset?: string, confirmed = false) {
    const text = (preset ?? input).trim();
    if (!text || busy) return;
    if (!confirmed && isMutatingCommand(text)) {
      setInput("");
      setPendingCommand(text);
      setMsgs((m) => [
        ...m,
        { role: "user", text },
        { role: "assistant", text: "This command will change shared project data. Review it below and confirm before I apply it." },
      ]);
      return;
    }
    setInput("");
    setPendingCommand(null);
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
        ref={toggleRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 right-4 z-50 inline-flex size-14 items-center justify-center rounded-full bg-ink text-accent-fg shadow-lg transition-[transform,box-shadow] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-95 sm:bottom-6 sm:right-6"
        aria-label={open ? "Close Groq operator" : "Open Groq operator"}
        aria-expanded={open}
        aria-controls="groq-operator-panel"
      >
        {open ? <X className="size-5" aria-hidden="true" /> : <Sparkles className="size-5" aria-hidden="true" />}
      </button>
      {open ? (
        <div
          ref={panelRef}
          id="groq-operator-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="groq-operator-title"
          className="fixed bottom-20 right-4 z-50 flex w-[min(100vw-2rem,24rem)] flex-col overflow-hidden overscroll-contain rounded-2xl border border-border bg-surface shadow-2xl sm:bottom-24 sm:right-6"
        >
          <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
            <Bot className="size-4 text-accent" aria-hidden="true" />
            <p id="groq-operator-title" className="flex-1 text-sm font-semibold">Groq Operator</p>
            <button type="button" className="rounded-md p-1 text-muted hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" onClick={() => setOpen(false)} aria-label="Close">
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
          <div className="flex max-h-80 flex-col gap-2 overflow-y-auto p-3 text-sm" role="log" aria-live="polite" aria-relevant="additions text" aria-atomic="false">
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
                <Check className="size-3 animate-pulse" aria-hidden="true" />
                Groq is processing…
              </div>
            ) : null}
            {pendingCommand ? (
              <div className="rounded-xl border border-accent/30 bg-accent/10 p-3 text-sm" role="alert">
                <p className="font-semibold text-fg">Confirm shared-data change</p>
                <p className="mt-1 break-words text-xs text-muted">{pendingCommand}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => void send(pendingCommand, true)}
                    className="min-h-9 rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-accent-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    Confirm and apply
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingCommand(null)}
                    className="min-h-9 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-fg hover:bg-surface"
                  >
                    Cancel
                  </button>
                </div>
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
                className="rounded-full border border-border px-2 py-1 text-[11px] text-muted hover:border-accent hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {suggestion}
              </button>
            ))}
          </div>
          <div className="flex gap-2 border-t border-border p-2">
            <input
              ref={inputRef}
              value={input}
              disabled={busy}
              name="groq-command"
              autoComplete="off"
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && void send()}
              placeholder="Type a command…"
              className="min-w-0 flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Groq operator command"
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => void send()}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-ink text-accent-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
              aria-label="Send command to Groq operator"
            >
              <Send className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
