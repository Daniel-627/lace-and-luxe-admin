"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { convertLead, updateLeadStatus } from "../app/actions-orders";
import { METHODS, type AdminLead } from "../lib/orders";
import { kes } from "../lib/format";
import Badge from "./Badge";

const box = "w-full rounded-lg border border-champagne/60 bg-white/70 p-2.5 text-sm";
const STATUS: [string, string][] = [["NEW", "New"], ["CONTACTED", "Contacted"], ["LOST", "Lost"]];

export default function LeadCard({ lead, whenLabel }: { lead: AdminLead; whenLabel: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [f, setF] = useState({ name: "", phone: "", email: "", dName: "", dPhone: "", county: "", area: "", details: "", paid: false, method: "MPESA", receipt: "" });
  const set = (k: keyof typeof f, v: string | boolean) => setF((x) => ({ ...x, [k]: v }));
  const converted = lead.status === "CONVERTED";

  async function status(s: string) {
    setBusy(true); setMsg("");
    const r = await updateLeadStatus(lead.id, s);
    setBusy(false);
    if (r.ok) router.refresh(); else setMsg(r.error ?? "Could not update");
  }

  async function create() {
    setMsg("");
    if (f.name.trim().length < 2) return setMsg("Add the customer's name.");
    if (!f.phone.trim()) return setMsg("Add the customer's phone number.");
    if (f.county.trim().length < 2 || f.area.trim().length < 2) return setMsg("Add the county and area for delivery.");
    setBusy(true);
    const r = await convertLead(lead.id, {
      name: f.name.trim(), phone: f.phone.trim(), ...(f.email.trim() ? { email: f.email.trim() } : {}),
      delivery: { ...(f.dName.trim() ? { name: f.dName.trim() } : {}), ...(f.dPhone.trim() ? { phone: f.dPhone.trim() } : {}), county: f.county.trim(), area: f.area.trim(), details: f.details.trim() },
      paid: f.paid, method: f.method, ...(f.paid && f.receipt.trim() ? { mpesaReceipt: f.receipt.trim() } : {}),
    });
    setBusy(false);
    if (r.orderId) router.push(`/orders/${r.orderId}`); else setMsg(r.error ?? "Could not create the order");
  }

  return (
    <div className="space-y-4 rounded-2xl border border-champagne/40 bg-white/60 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-serif text-2xl">{lead.reference}</p>
          <p className="text-xs text-claret/60">{whenLabel} · from the {lead.source === "product" ? "product page" : "cart"}</p>
        </div>
        <Badge tone={converted ? "ok" : lead.status === "LOST" ? "bad" : lead.status === "NEW" ? "warn" : "muted"}>{lead.status.toLowerCase()}</Badge>
      </div>

      <ul className="divide-y divide-champagne/30 text-sm">
        {lead.items.map((i, k) => (
          <li key={k} className="flex justify-between py-1.5"><span>{i.name} <span className="text-claret/60">({i.size}, {i.colour})</span> × {i.qty}</span><span>{kes(i.price * i.qty)}</span></li>
        ))}
        <li className="flex justify-between pt-2 font-medium"><span>Total</span><span>{kes(lead.total)}</span></li>
      </ul>

      {!converted && <p className="text-xs text-claret/60">Find this customer in your WhatsApp chats by the reference {lead.reference}.</p>}

      {converted ? (
        lead.orderId && <Link href={`/orders/${lead.orderId}`} className="inline-block rounded-full border border-claret px-5 py-2 text-sm">View the order</Link>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          {STATUS.map(([v, l]) => (
            <button key={v} disabled={busy || lead.status === v} onClick={() => void status(v)}
              className={`rounded-full border px-4 py-1.5 text-sm ${lead.status === v ? "border-claret bg-claret text-ivory" : "border-claret/30 hover:border-claret"}`}>{l}</button>
          ))}
          <button onClick={() => setOpen(!open)} className="ml-auto rounded-full bg-claret px-5 py-2 text-sm text-ivory">{open ? "Close" : "Create order"}</button>
        </div>
      )}

      {open && !converted && (
        <div className="space-y-3 rounded-xl bg-ivory/70 p-4">
          <p className="text-sm font-medium">Customer</p>
          <div className="grid gap-3 md:grid-cols-3">
            <input className={box} placeholder="Name" value={f.name} onChange={(e) => set("name", e.target.value)} />
            <input className={box} inputMode="tel" placeholder="Phone (07xx…)" value={f.phone} onChange={(e) => set("phone", e.target.value)} />
            <input className={box} placeholder="Email (optional)" value={f.email} onChange={(e) => set("email", e.target.value)} />
          </div>
          <p className="text-sm font-medium">Delivery</p>
          <div className="grid gap-3 md:grid-cols-2">
            <input className={box} placeholder="Receiver name (if different)" value={f.dName} onChange={(e) => set("dName", e.target.value)} />
            <input className={box} inputMode="tel" placeholder="Receiver phone (if different)" value={f.dPhone} onChange={(e) => set("dPhone", e.target.value)} />
            <input className={box} placeholder="County" value={f.county} onChange={(e) => set("county", e.target.value)} />
            <input className={box} placeholder="Area / town" value={f.area} onChange={(e) => set("area", e.target.value)} />
          </div>
          <input className={box} placeholder="Building, landmark, directions (optional)" value={f.details} onChange={(e) => set("details", e.target.value)} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.paid} onChange={(e) => set("paid", e.target.checked)} /> Already paid <span className="text-claret/60">(takes the items out of stock)</span></label>
          {f.paid && (
            <div className="grid gap-3 md:grid-cols-2">
              <select className={box} value={f.method} onChange={(e) => set("method", e.target.value)}>{METHODS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
              <input className={box} placeholder="M-Pesa code (optional)" value={f.receipt} onChange={(e) => set("receipt", e.target.value)} />
            </div>
          )}
          <button disabled={busy} onClick={() => void create()} className="rounded-full bg-claret px-6 py-2.5 text-sm text-ivory disabled:opacity-50">{busy ? "Creating…" : "Create the order"}</button>
        </div>
      )}
      {msg && <p className="text-sm">{msg}</p>}
    </div>
  );
}
