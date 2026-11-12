"use client";
import { useState } from "react";
import { login } from "../actions";

export default function Login() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError("");
    const r = await login(new FormData(e.currentTarget));
    if (r?.error) { setError(r.error); setBusy(false); }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-claret p-6">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-3xl bg-ivory p-8">
        <img src="/brand/monogram-claret.svg" alt="" className="mx-auto h-14 w-auto" />
        <h1 className="text-center font-serif text-3xl">Admin sign in</h1>
        <input name="email" type="email" autoComplete="username" placeholder="Email" required className="w-full rounded-lg border border-champagne/60 bg-white/70 p-3" />
        <input name="password" type="password" autoComplete="current-password" placeholder="Password" required className="w-full rounded-lg border border-champagne/60 bg-white/70 p-3" />
        <button disabled={busy} className="w-full rounded-full bg-claret py-3 text-sm tracking-wide text-ivory disabled:opacity-50">{busy ? "Signing in…" : "Sign in"}</button>
        {error && <p className="text-center text-sm">{error}</p>}
      </form>
    </div>
  );
}
