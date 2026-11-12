"use client";
import { useState } from "react";
import { saveWhatsapp } from "../app/actions";

export default function WhatsappForm({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(null);
    const r = await saveWhatsapp(value);
    setBusy(false);
    if (r.ok && r.number) { setValue(r.number); setMsg({ ok: true, text: "Saved. The shop uses this number right away." }); }
    else setMsg({ ok: false, text: r.error ?? "Could not save" });
  }

  return (
    <form onSubmit={submit} className="max-w-md space-y-3">
      <label className="block text-sm">WhatsApp number for orders</label>
      <input value={value} onChange={(e) => setValue(e.target.value)} inputMode="tel" placeholder="2547XXXXXXXX"
        className="w-full rounded-lg border border-champagne/60 bg-white/70 p-3" />
      <button disabled={busy} className="rounded-full bg-claret px-6 py-2.5 text-sm text-ivory disabled:opacity-50">{busy ? "Saving…" : "Save"}</button>
      {msg && <p className={`text-sm ${msg.ok ? "" : "font-medium"}`}>{msg.text}</p>}
    </form>
  );
}
