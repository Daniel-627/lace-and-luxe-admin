"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { markMessageSent, retryMessage } from "../app/actions-messaging";
import { localPhone, when } from "../lib/format";
import { CHANNEL_LABEL, type ChannelKey, type MessageRow } from "../lib/messaging";
import Badge from "./Badge";

const tone = (s: string) => (s === "SENT" ? "ok" : s === "FAILED" ? "bad" : s === "MANUAL" ? "warn" : "muted") as "ok" | "bad" | "warn" | "muted";
const text = (s: string) => (s === "MANUAL" ? "Send by hand" : s === "FAILED" ? "Couldn't send" : s === "SENDING" ? "Sending" : s === "PENDING" ? "Trying again soon" : "Sent");

export default function MessagesList({ messages, labels }: { messages: MessageRow[]; labels: Record<string, string> }) {
  const router = useRouter();
  const [busy, setBusy] = useState<number | null>(null);
  const [err, setErr] = useState("");

  async function run(id: number, fn: (id: number) => Promise<{ ok?: true; error?: string }>) {
    setBusy(id); setErr("");
    const r = await fn(id);
    setBusy(null);
    if (r.ok) router.refresh(); else setErr(r.error ?? "Something went wrong");
  }

  if (messages.length === 0) return <p className="text-claret/70">Nothing here.</p>;
  return (
    <div className="space-y-3">
      {err && <p className="text-sm">{err}</p>}
      {messages.map((m) => (
        <div key={m.id} className="space-y-2 rounded-2xl border border-champagne/40 bg-white/60 p-4 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-medium">{labels[m.category] ?? m.category} <span className="text-claret/60">· {m.audience === "STAFF" ? "to staff" : "to customer"}</span></p>
              <p className="text-xs text-claret/60">{m.toPhone ? localPhone(m.toPhone) : m.toEmail} · {when(m.createdAt)}{m.channel ? ` · sent by ${m.channel === "manual" ? "hand" : CHANNEL_LABEL[m.channel as ChannelKey] ?? m.channel}` : ""}{m.attempts ? ` · ${m.attempts} ${m.attempts === 1 ? "try" : "tries"}` : ""}</p>
            </div>
            <Badge tone={tone(m.status)}>{text(m.status)}</Badge>
          </div>
          <p className="rounded-lg bg-ivory/80 p-3">{m.body}</p>
          {m.lastError && m.status !== "SENT" && <p className="text-xs text-claret/70">Last problem: {m.lastError}</p>}
          {m.status !== "SENT" && (
            <div className="flex flex-wrap gap-2">
              {m.toPhone && <a href={`https://wa.me/${m.toPhone}?text=${encodeURIComponent(m.body)}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-claret px-4 py-1.5 text-ivory">Send on WhatsApp</a>}
              <button disabled={busy === m.id} onClick={() => void run(m.id, markMessageSent)} className="rounded-full border border-claret/40 px-4 py-1.5 hover:border-claret">I sent it</button>
              {(m.status === "MANUAL" || m.status === "FAILED") && <button disabled={busy === m.id} onClick={() => void run(m.id, retryMessage)} className="rounded-full border border-claret/40 px-4 py-1.5 hover:border-claret">Try again</button>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
