import type { ReactNode } from "react";

const TONES = {
  ok: "bg-claret text-ivory",
  warn: "bg-champagne text-claret",
  bad: "border border-claret text-claret",
  muted: "bg-rose/25 text-claret",
} as const;

export default function Badge({ tone, children }: { tone: keyof typeof TONES; children: ReactNode }) {
  return <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] uppercase tracking-[0.1em] ${TONES[tone]}`}>{children}</span>;
}

export const payTone = (s: string) => (s === "PAID" ? "ok" : s === "FAILED" || s === "EXPIRED" ? "bad" : "warn") as keyof typeof TONES;
export const fulfilTone = (s: string) => (s === "DELIVERED" ? "ok" : s === "CANCELLED" ? "bad" : s === "NEW" ? "muted" : "warn") as keyof typeof TONES;
