import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  style,
}: {
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <section
      style={style}
      className={cn(
        "rounded-xl border border-border bg-surface p-5 shadow-[0_8px_24px_rgba(15,23,36,0.04)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function Badge({
  tone = "mute",
  children,
}: {
  tone?: "ok" | "warn" | "bad" | "mute" | "accent";
  children: React.ReactNode;
}) {
  const map = {
    ok: "bg-ok-bg text-ok",
    warn: "bg-warn-bg text-warn",
    bad: "bg-bad-bg text-bad",
    mute: "bg-surface-2 text-muted",
    accent: "bg-accent/15 text-accent",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        map[tone],
      )}
    >
      {children}
    </span>
  );
}

export function Meter({
  value,
  delay = 0,
}: {
  value: number;
  delay?: number;
}) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  const tone =
    value >= 0.7 ? "bg-ok" : value >= 0.35 ? "bg-accent" : value > 0.08 ? "bg-warn" : "bg-bad";
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
      <div
        className={cn("bar-fill h-full rounded-full", tone)}
        style={{ width: `${pct}%`, animationDelay: `${delay}ms` }}
      />
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  bar,
  delay = 0,
}: {
  label: string;
  value: string;
  hint?: string;
  bar?: number;
  delay?: number;
}) {
  return (
    <Card className="anim-enter p-4" style={{ animationDelay: `${delay}ms` }}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold tabular-nums tracking-tight text-ink">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-subtle">{hint}</p> : null}
      {bar != null ? (
        <div className="mt-3">
          <Meter value={bar} delay={delay} />
        </div>
      ) : null}
    </Card>
  );
}

export function TableWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        "sticky top-0 bg-surface-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className,
  numeric,
}: {
  children?: React.ReactNode;
  className?: string;
  numeric?: boolean;
}) {
  return (
    <td
      className={cn(
        "border-t border-border px-3 py-2.5 text-fg",
        numeric && "text-right font-mono tabular-nums text-[13px]",
        className,
      )}
    >
      {children}
    </td>
  );
}
