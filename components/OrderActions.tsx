"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrder } from "../app/actions-orders";
import { FULFILMENT, METHODS, type AdminOrder } from "../lib/orders";

const box = "w-full rounded-lg border border-champagne/60 bg-white/70 p-2.5 text-sm";

export default function OrderActions({ order }: { order: AdminOrder }) {
  const router = useRouter();
  const [notes, setNotes] = useState(order.notes);
  const [method, setMethod] = useState(order.method === "CASH" || order.method === "BANK" ? order.method : "MPESA");
  const [receipt, setReceipt] = useState(order.paymentClaim ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function run(patch: Parameters<typeof updateOrder>[1], ok: string) {
    setBusy(true); setMsg("");
    const r = await updateOrder(order.id, patch);
    setBusy(false);
    if (r.ok) { setMsg(ok); router.refresh(); } else setMsg(r.error ?? "Could not save");
  }

  function setFulfilment(value: string) {
    if (value === order.fulfilment) return;
    if (value === "CANCELLED" && !confirm("Cancel this order? The items go back into stock.")) return;
    void run({ fulfilment: value }, "Delivery status updated.");
  }

  function markPaid() {
    if (!confirm("Mark this order as paid?")) return;
    void run({ markPaid: true, method, ...(receipt.trim() ? { mpesaReceipt: receipt.trim() } : {}) }, "Marked as paid and stock updated.");
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3 rounded-2xl border border-champagne/40 bg-white/60 p-5">
        <h2 className="font-serif text-2xl">Delivery status</h2>
        <div className="flex flex-wrap gap-2">
          {FULFILMENT.map(([v, l]) => (
            <button key={v} disabled={busy} onClick={() => setFulfilment(v)}
              className={`rounded-full border px-4 py-1.5 text-sm ${order.fulfilment === v ? "border-claret bg-claret text-ivory" : "border-claret/30 hover:border-claret"}`}>{l}</button>
          ))}
        </div>
      </section>

      {order.status !== "PAID" && (
        <section className="space-y-3 rounded-2xl border border-champagne/40 bg-white/60 p-5">
          <h2 className="font-serif text-2xl">Record a payment</h2>
          <p className="text-sm text-claret/70">Use this when the customer has paid you outside the shop, for example by M-Pesa on WhatsApp or cash on delivery.</p>
          <div className="grid gap-3 md:grid-cols-2">
            <select className={box} value={method} onChange={(e) => setMethod(e.target.value)}>{METHODS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            <input className={box} placeholder="M-Pesa code (optional)" value={receipt} onChange={(e) => setReceipt(e.target.value)} />
          </div>
          <button disabled={busy} onClick={markPaid} className="rounded-full bg-claret px-6 py-2.5 text-sm text-ivory disabled:opacity-50">Mark as paid</button>
        </section>
      )}

      <section className="space-y-3 rounded-2xl border border-champagne/40 bg-white/60 p-5">
        <h2 className="font-serif text-2xl">Notes</h2>
        <textarea className={box} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Only staff see this" />
        <button disabled={busy || notes === order.notes} onClick={() => void run({ notes }, "Notes saved.")} className="rounded-full border border-claret px-5 py-2 text-sm disabled:opacity-40">Save notes</button>
      </section>
      {msg && <p className="text-sm">{msg}</p>}
    </div>
  );
}
