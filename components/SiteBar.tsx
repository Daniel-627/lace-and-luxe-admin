"use client";
import { useState } from "react";
import { saveSiteSettings } from "../app/actions-content";

export default function SiteBar({ initialEnabled, initialText }: { initialEnabled: boolean; initialText: string }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [text, setText] = useState(initialText);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function save() {
    setBusy(true); setMsg("");
    const r = await saveSiteSettings(enabled, text);
    setBusy(false);
    setMsg(r.ok ? "Saved. The shop shows it within about a minute." : r.error ?? "Could not save");
  }

  return (
    <section className="space-y-3 rounded-2xl border border-champagne/40 bg-white/60 p-5">
      <h2 className="font-serif text-2xl">Top bar</h2>
      <p className="text-sm text-claret/70">The thin bar above the menu, on every page of the shop. Leave the text empty to use the standard one.</p>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} /> Show the top bar</label>
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Order on WhatsApp · Pay with M-Pesa · Discreet packaging" className="w-full rounded-lg border border-champagne/60 bg-white/70 p-2.5 text-sm" />
      <div className="flex items-center gap-4">
        <button onClick={save} disabled={busy} className="rounded-full bg-claret px-6 py-2 text-sm text-ivory disabled:opacity-50">{busy ? "Saving…" : "Save top bar"}</button>
        {msg && <span className="text-sm">{msg}</span>}
      </div>
    </section>
  );
}
