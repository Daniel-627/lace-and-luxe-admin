"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { addStaff, updateStaff } from "../app/actions-staff";
import type { StaffMember } from "../lib/staff";
import Badge from "./Badge";

const box = "w-full rounded-lg border border-champagne/60 bg-white/70 p-2.5 text-sm";

export default function StaffManager({ staff, meId }: { staff: StaffMember[]; meId: number }) {
  const router = useRouter();
  const [f, setF] = useState({ name: "", email: "", role: "STAFF" });
  const [secret, setSecret] = useState<{ who: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function add() {
    setMsg("");
    if (f.name.trim().length < 2) return setMsg("Add the person's name.");
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) return setMsg("Add a valid email address.");
    setBusy(true);
    const r = await addStaff(f.email.trim(), f.name.trim(), f.role);
    setBusy(false);
    if (r.temporaryPassword) { setSecret({ who: r.email ?? f.email, password: r.temporaryPassword }); setCopied(false); setF({ name: "", email: "", role: "STAFF" }); router.refresh(); }
    else setMsg(r.error ?? "Could not add this person");
  }

  async function change(s: StaffMember, patch: { active?: boolean; role?: string; resetPassword?: boolean }, confirmText?: string) {
    if (confirmText && !confirm(confirmText)) return;
    setBusy(true); setMsg("");
    const r = await updateStaff(s.id, patch);
    setBusy(false);
    if (!r.ok) return setMsg(r.error ?? "Could not update");
    if (r.temporaryPassword) { setSecret({ who: s.email, password: r.temporaryPassword }); setCopied(false); }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {secret && (
        <section className="space-y-3 rounded-2xl bg-claret p-5 text-ivory">
          <p className="font-serif text-2xl">Temporary password for {secret.who}</p>
          <code className="block rounded-lg bg-ivory/10 p-3 text-lg tracking-wide">{secret.password}</code>
          <p className="text-sm text-ivory/80">This is shown only once. Send it to them privately, and ask them to sign in and change it under Account straight away.</p>
          <div className="flex gap-3">
            <button onClick={async () => { await navigator.clipboard.writeText(secret.password); setCopied(true); }} className="rounded-full bg-champagne px-5 py-2 text-sm text-claret">{copied ? "Copied" : "Copy"}</button>
            <button onClick={() => setSecret(null)} className="rounded-full border border-ivory/60 px-5 py-2 text-sm">I&apos;ve saved it</button>
          </div>
        </section>
      )}

      <ul className="divide-y divide-champagne/30 rounded-2xl border border-champagne/40 bg-white/60">
        {staff.map((s) => {
          const me = s.id === meId;
          return (
            <li key={s.id} className={`flex flex-wrap items-center gap-x-5 gap-y-3 p-4 ${s.active ? "" : "opacity-60"}`}>
              <div className="min-w-0 flex-1">
                <p className="truncate font-serif text-xl">{s.name}{me && <span className="ml-2 text-xs text-claret/60">(you)</span>}</p>
                <p className="truncate text-sm text-claret/60">{s.email}</p>
              </div>
              <div className="flex gap-2"><Badge tone={s.role === "OWNER" ? "ok" : "muted"}>{s.role === "OWNER" ? "Owner" : "Staff"}</Badge>{!s.active && <Badge tone="bad">Inactive</Badge>}</div>
              <div className="flex flex-wrap gap-2 text-sm">
                {!me && <button disabled={busy} onClick={() => void change(s, { role: s.role === "OWNER" ? "STAFF" : "OWNER" }, s.role === "OWNER" ? `Make ${s.name} regular staff? They will lose access to settings and staff.` : `Make ${s.name} an owner? Owners can manage settings and staff.`)} className="rounded-full border border-claret/30 px-3 py-1 hover:border-claret">{s.role === "OWNER" ? "Make staff" : "Make owner"}</button>}
                <button disabled={busy} onClick={() => void change(s, { resetPassword: true }, `Reset the password for ${s.name}? They will be signed out everywhere.`)} className="rounded-full border border-claret/30 px-3 py-1 hover:border-claret">Reset password</button>
                {!me && <button disabled={busy} onClick={() => void change(s, { active: !s.active }, s.active ? `Turn off ${s.name}'s access? They are signed out straight away.` : undefined)} className="rounded-full border border-claret/30 px-3 py-1 hover:border-claret">{s.active ? "Deactivate" : "Reactivate"}</button>}
              </div>
            </li>
          );
        })}
      </ul>

      <section className="space-y-3 rounded-2xl border border-champagne/40 bg-white/60 p-5">
        <h2 className="font-serif text-2xl">Add a person</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <input className={box} placeholder="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <input className={box} type="email" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          <select className={box} value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}><option value="STAFF">Staff</option><option value="OWNER">Owner</option></select>
        </div>
        <p className="text-xs text-claret/60">Staff can manage products, orders, leads and the homepage. Owners can also change settings and manage staff. You&apos;ll get a one-time password to pass on.</p>
        <button disabled={busy} onClick={() => void add()} className="rounded-full bg-claret px-6 py-2.5 text-sm text-ivory disabled:opacity-50">{busy ? "Working…" : "Add person"}</button>
      </section>
      {msg && <p className="text-sm">{msg}</p>}
    </div>
  );
}
