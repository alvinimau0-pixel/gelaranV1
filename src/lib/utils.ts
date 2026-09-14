import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function pct(n: number | null | undefined, digits = 1) {
  if (n == null || Number.isNaN(n)) return "—";
  return `${(n * 100).toFixed(digits)}%`;
}

export function rm(n: number | null | undefined) {
  if (n == null || Number.isNaN(Number(n))) return "—";
  return `RM ${Number(n).toLocaleString("en-MY", { maximumFractionDigits: 2 })}`;
}

export function leaderTone(leader: string) {
  if (leader === "Tower A") return "ok" as const;
  if (leader === "Tower B") return "warn" as const;
  return "mute" as const;
}
