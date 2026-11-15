"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { revealCode } from "../app/actions-codes";
import { localPhone } from "../lib/format";
import type { LoginCodeRow } from "../lib/codes";
import Badge from "./Badge";

const mmss = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, "0")}`;

export default function CodesList({ codes }: { codes: LoginCodeRow[] }) {
  const router = useRouter();
  const [now, setNow] = useState(0);
  const [shown, setShown] = useState<Record<number, string>>({});
  const [copied, setCopied] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setNow(Date.now());
    const tick = setInterval(() => setNow(Date.now()), 1000);
    const refresh = setInterval(() => router.refresh(), 8000); // new requests show up by themselves
    return () => { clearInterval(tick); clearInterval(refresh); };
  }, [router]);

  async function show(id: number) {
    setError("");
    const r = await revealCode(id);
    if (r.code) setShown((s) => ({ ...s, [id]: r.code! })); else setError(r.error ?? "Could not show the code");
  }

  if (codes.length === 0) return <p className="text-claret/70">No one has asked for a code in the last hour.</p>;

  return (
    <div className="space-y-3">
      {error && <p className="text-sm">{error}</p>}
      {codes.map((c) => {
        const left = now ? Date.parse(c.expiresAt) - now : 0;
        const status = c.status === "WAITING" && now && left <= 0 ? "EXPIRED" : c.status;
        const code = shown[c.id];
        const text = code ? `Your Lace & Luxe sign-in code is ${code}. It is valid for a few minutes. If you did not ask for it, please ignore this message.` : "";
        return (
          <div key={c.id} className="space-y-3 rounded-2xl border border-champagne/40 bg-white/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-serif text-2xl">{localPhone(c.phone)}</p>
                <p className="text-xs text-claret/60">{c.name ?? "New customer"}{now ? ` · asked ${Math.max(0, Math.round((now - Date.parse(c.createdAt)) / 60000))} min ago` : ""}</p>
              </div>
              <div className="flex items-center gap-3">
                {status === "WAITING" && now > 0 && <span className="text-sm tabular-nums text-claret/70">{mmss(left)} left</span>}
                <Badge tone={status === "WAITING" ? "warn" : status === "USED" ? "ok" : "muted"}>{status === "WAITING" ? "Waiting" : status === "USED" ? "Signed in" : status === "EXPIRED" ? "Expired" : "Not available"}</Badge>
              </div>
            </div>
            {status === "WAITING" && !code && <button onClick={() => void show(c.id)} className="rounded-full bg-claret px-5 py-2 text-sm text-ivory">Show code and send on WhatsApp</button>}
            {status === "WAITING" && code && (
              <div className="space-y-3 rounded-xl bg-claret p-4 text-ivory">
                <p className="text-center font-serif text-5xl tracking-[0.3em]">{code}</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <a href={`https://wa.me/${c.phone}?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-champagne px-5 py-2 text-sm text-claret">Open WhatsApp with the message</a>
                  <button onClick={async () => { await navigator.clipboard.writeText(code); setCopied(c.id); }} className="rounded-full border border-ivory/60 px-5 py-2 text-sm">{copied === c.id ? "Copied" : "Copy code"}</button>
                </div>
              </div>
            )}
            {status === "UNAVAILABLE" && <p className="text-xs text-claret/60">This one was asked for while manual codes were off.</p>}
          </div>
        );
      })}
    </div>
  );
}
