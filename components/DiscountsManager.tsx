"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteDiscount, saveDiscount } from "../app/actions-commerce";
import { fromInput, toInput } from "../lib/dt";
import { kes } from "../lib/format";
import type { DiscountDTO } from "../lib/commerce";
import Badge from "./Badge";

const box = "w-full rounded-lg border border-champagne/60 bg-white/70 p-2.5 text-sm";
const label = (d: DiscountDTO) => (d.kind === "PERCENT" ? `${d.value}% off` : `${kes(d.value)} off`);

function Editor({ d, onClose }: { d?: DiscountDTO; onClose: () => void }) {
  const router = useRouter();
  const [f, setF] = useState({ code: d?.code ?? "", description: d?.description ?? "", kind: d?.kind ?? "PERCENT", value: d ? String(d.value) : "", minSubtotal: d ? String(d.minSubtotal) : "0", startsAt: toInput(d?.startsAt), endsAt: toInput(d?.endsAt), maxUses: d?.maxUses ? String(d.maxUses) : "", active: d?.active ?? true });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f, v: string | boolean) => setF((x) => ({ ...x, [k]: v }));

  async function save() {
    setMsg("");
    if (!/^[A-Za-z0-9_-]{3,20}$/.test(f.code)) return setMsg("The code needs 3 to 20 letters or numbers.");
    if (!/^\d+$/.test(f.value) || Number(f.value) < 1) return setMsg("Type the discount amount.");
    if (!/^\d+$/.test(f.minSubtotal || "0")) return setMsg("The minimum order must be a whole number.");
    if (f.maxUses && !/^\d+$/.test(f.maxUses)) return setMsg("Maximum uses must be a whole number.");
    setBusy(true);
    const r = await saveDiscount(d?.id ?? null, { code: f.code, description: f.description, kind: f.kind, value: Number(f.value), minSubtotal: Number(f.minSubtotal || 0), startsAt: fromInput(f.startsAt), endsAt: fromInput(f.endsAt), maxUses: f.maxUses ? Number(f.maxUses) : null, active: f.active });
    setBusy(false);
    if (r.ok) { router.refresh(); onClose(); } else setMsg(r.error ?? "Could not save");
  }
  async function remove() {
    if (!d || !confirm(`Delete the code ${d.code}?`)) return;
    const r = await deleteDiscount(d.id);
    if (r.ok) { router.refresh(); onClose(); } else setMsg(r.error ?? "Could not delete");
  }

  return (
    <div className="space-y-4 rounded-2xl border border-champagne/40 bg-white/60 p-5">
      <div className="grid gap-3 md:grid-cols-3">
        <div><label className="mb-1 block text-sm font-medium">Code</label><input className={box} value={f.code} placeholder="WELCOME10" onChange={(e) => set("code", e.target.value.toUpperCase())} /></div>
        <div><label className="mb-1 block text-sm font-medium">Type</label><select className={box} value={f.kind} onChange={(e) => set("kind", e.target.value)}><option value="PERCENT">Percentage off</option><option value="FIXED">Fixed amount off (KES)</option></select></div>
        <div><label className="mb-1 block text-sm font-medium">{f.kind === "PERCENT" ? "Percent" : "Amount (KES)"}</label><input className={box} inputMode="numeric" value={f.value} onChange={(e) => set("value", e.target.value)} /></div>
        <div><label className="mb-1 block text-sm font-medium">Minimum items total (KES)</label><input className={box} inputMode="numeric" value={f.minSubtotal} onChange={(e) => set("minSubtotal", e.target.value)} /></div>
        <div><label className="mb-1 block text-sm font-medium">Starts (optional)</label><input type="datetime-local" className={box} value={f.startsAt} onChange={(e) => set("startsAt", e.target.value)} /></div>
        <div><label className="mb-1 block text-sm font-medium">Ends (optional)</label><input type="datetime-local" className={box} value={f.endsAt} onChange={(e) => set("endsAt", e.target.value)} /></div>
        <div><label className="mb-1 block text-sm font-medium">Most times it can be used (optional)</label><input className={box} inputMode="numeric" value={f.maxUses} onChange={(e) => set("maxUses", e.target.value)} /></div>
        <div className="md:col-span-2"><label className="mb-1 block text-sm font-medium">Note for staff (optional)</label><input className={box} value={f.description} onChange={(e) => set("description", e.target.value)} /></div>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.active} onChange={(e) => set("active", e.target.checked)} /> Code is active</label>
      <p className="text-xs text-claret/60">The discount comes off the items total, never the delivery fee. Times are in your device&apos;s time zone.</p>
      <div className="flex flex-wrap items-center gap-4">
        <button disabled={busy} onClick={() => void save()} className="rounded-full bg-claret px-6 py-2.5 text-sm text-ivory disabled:opacity-50">{busy ? "Saving…" : "Save code"}</button>
        <button onClick={onClose} className="text-sm underline">Close</button>
        {d && <button onClick={() => void remove()} className="ml-auto text-sm underline">Delete</button>}
      </div>
      {msg && <p className="text-sm">{msg}</p>}
    </div>
  );
}

export default function DiscountsManager({ codes }: { codes: DiscountDTO[] }) {
  const [open, setOpen] = useState<number | "new" | null>(null);
  return (
    <div className="space-y-4">
      {codes.length === 0 && open !== "new" && <p className="text-claret/70">No discount codes yet.</p>}
      {codes.map((d) => open === d.id ? <Editor key={d.id} d={d} onClose={() => setOpen(null)} /> : (
        <button key={d.id} onClick={() => setOpen(d.id)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-champagne/40 bg-white/60 p-4 text-left transition hover:bg-white">
          <div className="min-w-0 flex-1"><p className="font-serif text-2xl tracking-wide">{d.code}</p><p className="text-xs text-claret/60">{label(d)}{d.minSubtotal ? ` · over ${kes(d.minSubtotal)}` : ""} · used {d.uses}{d.maxUses ? ` of ${d.maxUses}` : ""} times{d.endsAt ? ` · ends ${new Date(d.endsAt).toLocaleDateString("en-KE")}` : ""}</p></div>
          <Badge tone={d.active ? "ok" : "bad"}>{d.active ? "Active" : "Off"}</Badge>
        </button>
      ))}
      {open === "new" ? <Editor onClose={() => setOpen(null)} /> : <button onClick={() => setOpen("new")} className="rounded-full bg-claret px-6 py-2.5 text-sm text-ivory">+ Add a discount code</button>}
    </div>
  );
}
