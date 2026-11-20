"use client";
import { useState } from "react";
import { saveManualCodes } from "../app/actions-codes";

export default function ManualCodesForm({ initial }: { initial: boolean }) {
  const [on, setOn] = useState(initial);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true); setMsg("");
    const r = await saveManualCodes(on);
    setBusy(false);
    setMsg(r.ok ? "Saved." : r.error ?? "Could not save");
  }

  return (
    <section className="max-w-xl space-y-3 rounded-2xl border border-champagne/40 bg-white/60 p-5">
      <h2 className="font-serif text-2xl">Customer sign-in codes</h2>
      <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={on} onChange={(e) => setOn(e.target.checked)} /> <span>Show sign-in codes to staff so they can send them on WhatsApp</span></label>
      <p className="text-xs text-claret/70">When this is on, each code a customer asks for appears under Sign-in codes. Use it while WhatsApp codes aren&apos;t working yet, or for customers who are not on WhatsApp. Anyone who can see a code can sign in as that customer, so switch it off once WhatsApp codes work. Every time a code is shown, it is recorded in the activity log.</p>
      <div className="flex items-center gap-4">
        <button onClick={save} disabled={busy} className="rounded-full bg-claret px-6 py-2 text-sm text-ivory disabled:opacity-50">{busy ? "Saving…" : "Save"}</button>
        {msg && <span className="text-sm">{msg}</span>}
      </div>
    </section>
  );
}
