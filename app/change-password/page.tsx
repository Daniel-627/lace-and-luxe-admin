"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { changePassword, logout } from "../actions";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [f, setF] = useState({ current: "", next: "", again: "" });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const box = "w-full rounded-lg border border-champagne/60 bg-white/70 p-3";

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setMsg("");
    if (f.next.length < 10) return setMsg("Use at least 10 characters.");
    if (f.next !== f.again) return setMsg("The new passwords don't match.");
    setBusy(true);
    const r = await changePassword(f.current, f.next);
    setBusy(false);
    if (r.ok) { router.push("/"); router.refresh(); } else setMsg(r.error ?? "Could not change the password");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-claret p-6">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-3xl bg-ivory p-8">
        <img src="/brand/monogram-claret.svg" alt="" className="mx-auto h-14 w-auto" />
        <h1 className="text-center font-serif text-3xl">Choose your password</h1>
        <p className="text-center text-sm text-claret/70">You signed in with a temporary password. Choose your own to continue.</p>
        <input type="password" autoComplete="current-password" placeholder="Temporary password" className={box} value={f.current} onChange={(e) => setF({ ...f, current: e.target.value })} />
        <input type="password" autoComplete="new-password" placeholder="New password (10+ characters)" className={box} value={f.next} onChange={(e) => setF({ ...f, next: e.target.value })} />
        <input type="password" autoComplete="new-password" placeholder="Repeat new password" className={box} value={f.again} onChange={(e) => setF({ ...f, again: e.target.value })} />
        <button disabled={busy} className="w-full rounded-full bg-claret py-3 text-sm tracking-wide text-ivory disabled:opacity-50">{busy ? "Saving…" : "Save and continue"}</button>
        {msg && <p className="text-center text-sm">{msg}</p>}
        <p className="text-center"><button type="button" onClick={() => void logout()} className="text-sm underline">Sign out</button></p>
      </form>
    </div>
  );
}
