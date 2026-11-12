"use client";
import { useState } from "react";
import { changePassword } from "../app/actions";

export default function PasswordForm() {
  const [f, setF] = useState({ current: "", next: "", again: "" });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const input = "w-full rounded-lg border border-champagne/60 bg-white/70 p-3";

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setMsg("");
    if (f.next !== f.again) return setMsg("The new passwords don't match.");
    setBusy(true);
    const r = await changePassword(f.current, f.next);
    setBusy(false);
    if (r.ok) { setF({ current: "", next: "", again: "" }); setMsg("Password changed. Other devices were signed out."); }
    else setMsg(r.error ?? "Could not change password");
  }

  return (
    <form onSubmit={submit} className="max-w-md space-y-3">
      <input type="password" autoComplete="current-password" placeholder="Current password" className={input} value={f.current} onChange={(e) => setF({ ...f, current: e.target.value })} />
      <input type="password" autoComplete="new-password" placeholder="New password (10+ characters)" className={input} value={f.next} onChange={(e) => setF({ ...f, next: e.target.value })} />
      <input type="password" autoComplete="new-password" placeholder="Repeat new password" className={input} value={f.again} onChange={(e) => setF({ ...f, again: e.target.value })} />
      <button disabled={busy} className="rounded-full bg-claret px-6 py-2.5 text-sm text-ivory disabled:opacity-50">{busy ? "Saving…" : "Change password"}</button>
      {msg && <p className="text-sm">{msg}</p>}
    </form>
  );
}
