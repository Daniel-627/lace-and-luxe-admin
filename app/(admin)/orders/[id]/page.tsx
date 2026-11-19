import Link from "next/link";
import { notFound } from "next/navigation";
import { api, ApiError } from "../../../../lib/session";
import { kes, localPhone, when } from "../../../../lib/format";
import { FULFILMENT, PAYMENT, label, payBadge, type AdminOrder } from "../../../../lib/orders";
import Badge, { fulfilTone, payTone } from "../../../../components/Badge";
import OrderActions from "../../../../components/OrderActions";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let o: AdminOrder;
  try {
    o = await api<AdminOrder>(`/orders/${id}`);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 400)) notFound();
    throw e;
  }
  const shop = process.env.SHOP_URL?.replace(/\/$/, "");
  const trackUrl = shop ? `${shop}/track/${o.trackingToken}` : null;
  const text = `Hi ${o.contactName.split(" ")[0]}, this is Lace & Luxe about your order ${o.reference}.${trackUrl ? ` You can follow it here: ${trackUrl}` : ""}`;

  return (
    <div className="max-w-4xl space-y-6">
      <Link href="/orders" className="text-sm underline">← All orders</Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl">{o.reference}</h1>
          <p className="text-sm text-claret/60">{when(o.createdAt)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2"><Link href={`/orders/${o.id}/slip`} className="mr-2 rounded-full border border-claret px-4 py-1.5 text-sm">Packing slip</Link><Badge tone={payBadge(o).tone}>{payBadge(o).text}</Badge><Badge tone={fulfilTone(o.fulfilment)}>{label(FULFILMENT, o.fulfilment)}</Badge></div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="space-y-1 rounded-2xl border border-champagne/40 bg-white/60 p-5 text-sm">
          <h2 className="mb-2 font-serif text-2xl">Customer</h2>
          <p>{o.contactName}</p>
          <p>{localPhone(o.contactPhone)}</p>
          {o.email && <p>{o.email}</p>}
          <a href={`https://wa.me/${o.contactPhone}?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block rounded-full border border-claret px-4 py-1.5">Message on WhatsApp</a>
        </section>
        <section className="space-y-1 rounded-2xl border border-champagne/40 bg-white/60 p-5 text-sm">
          <h2 className="mb-2 font-serif text-2xl">Deliver to</h2>
          <p>{o.deliveryName} · {localPhone(o.deliveryPhone)}</p>
          <p>{o.area}, {o.county}</p>
          {o.addressDetails && <p className="text-claret/70">{o.addressDetails}</p>}
        </section>
      </div>

      <section className="rounded-2xl border border-champagne/40 bg-white/60 p-5">
        <h2 className="mb-3 font-serif text-2xl">Items</h2>
        <ul className="divide-y divide-champagne/30 text-sm">
          {o.items.map((i) => (
            <li key={i.id} className="flex justify-between gap-4 py-2"><span>{i.name} <span className="text-claret/60">({i.size}, {i.colour})</span> × {i.qty}</span><span>{kes(i.price * i.qty)}</span></li>
          ))}
          {o.subtotal > 0 && <li className="flex justify-between pt-3 text-claret/70"><span>Items</span><span>{kes(o.subtotal)}</span></li>}
          {o.discountAmount > 0 && <li className="flex justify-between text-claret/70"><span>Discount {o.discountCode}</span><span>− {kes(o.discountAmount)}</span></li>}
          {o.subtotal > 0 && <li className="flex justify-between text-claret/70"><span>Delivery{o.deliveryServiceName ? ` (${o.deliveryServiceName})` : ""}</span><span>{o.deliveryFee ? kes(o.deliveryFee) : "Free"}</span></li>}
          <li className="flex justify-between pt-3 text-base font-medium"><span>Total</span><span>{kes(o.total)}</span></li>
        </ul>
        <p className="mt-3 text-xs text-claret/60">
          Payment: {payBadge(o).text}{o.method ? ` · ${o.method.toLowerCase()}` : ""}{o.mpesaReceipt ? ` · code ${o.mpesaReceipt}` : ""}
          {trackUrl && <> · <a href={trackUrl} target="_blank" rel="noopener noreferrer" className="underline">customer tracking page</a></>}
        </p>
      </section>

      {o.paymentClaim && o.status !== "PAID" && (
        <section className="rounded-2xl bg-champagne p-5 text-claret">
          <p className="font-serif text-2xl">Check this M-Pesa payment</p>
          <p className="mt-1 text-sm">The customer says they paid {kes(o.total)} with the code <b>{o.paymentClaim}</b>. Look for it in your M-Pesa statement. If it matches, record the payment below.</p>
        </section>
      )}
      {o.payTiming === "ON_DELIVERY" && o.status !== "PAID" && (
        <section className="rounded-2xl border border-champagne/40 bg-white/60 p-5 text-sm"><b>Pay on delivery.</b> Collect {kes(o.total)} when it arrives, then record the payment below.</section>
      )}
      {o.payNote && o.status === "PENDING" && <p className="text-sm text-claret/70">Last payment attempt: {o.payNote}</p>}
      <OrderActions order={o} />
    </div>
  );
}
