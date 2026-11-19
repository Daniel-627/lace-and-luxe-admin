import Link from "next/link";
import { notFound } from "next/navigation";
import { api, ApiError } from "../../../../lib/session";
import { kes, localPhone, when } from "../../../../lib/format";
import { FULFILMENT, label, payBadge } from "../../../../lib/orders";
import type { CustomerDetail } from "../../../../lib/reports";
import Badge, { fulfilTone } from "../../../../components/Badge";

export const dynamic = "force-dynamic";

export default async function CustomerPage({ params }: { params: Promise<{ phone: string }> }) {
  const { phone } = await params;
  let c: CustomerDetail;
  try {
    c = await api<CustomerDetail>(`/customers/${encodeURIComponent(phone)}`);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 400)) notFound();
    throw e;
  }
  const first = c.name.split(" ")[0] || "there";
  const text = `Hi ${first}, this is Lace & Luxe.`;

  return (
    <div className="max-w-4xl space-y-6">
      <Link href="/customers" className="text-sm underline">← All customers</Link>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl">{c.name || "No name"}</h1>
          <p className="text-sm text-claret/70">{localPhone(c.phone)}{c.email ? ` · ${c.email}` : ""}</p>
        </div>
        <a href={`https://wa.me/${c.phone}?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" className="rounded-full border border-claret px-4 py-1.5 text-sm">Message on WhatsApp</a>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[["Orders", String(c.stats.orders)], ["Paid orders", String(c.stats.paidOrders)], ["Total spent", kes(c.stats.spent)]].map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-champagne/40 bg-white/60 p-5"><p className="text-xs uppercase tracking-[0.2em] text-claret/60">{k}</p><p className="mt-1 font-serif text-3xl">{v}</p></div>
        ))}
      </div>

      <section className="space-y-2 rounded-2xl border border-champagne/40 bg-white/60 p-5 text-sm">
        <h2 className="font-serif text-2xl">Account</h2>
        {c.account ? (
          <>
            <p>Signed up {when(c.account.joinedAt)} · {c.account.reviews} {c.account.reviews === 1 ? "review" : "reviews"} · {c.account.wishlist} saved {c.account.wishlist === 1 ? "item" : "items"}</p>
            {c.account.addresses.length > 0 && (
              <ul className="mt-2 space-y-1 text-claret/80">
                {c.account.addresses.map((a) => <li key={a.id}><b>{a.label}:</b> {a.name}, {localPhone(a.phone)} · {a.area}, {a.county}{a.details ? ` · ${a.details}` : ""}</li>)}
              </ul>
            )}
          </>
        ) : <p className="text-claret/70">Guest. This number has ordered without creating an account.</p>}
      </section>

      <section className="rounded-2xl border border-champagne/40 bg-white/60">
        <h2 className="p-5 pb-2 font-serif text-2xl">Orders</h2>
        <ul className="divide-y divide-champagne/30">
          {c.orders.map((o) => (
            <li key={o.id}>
              <Link href={`/orders/${o.id}`} className="flex flex-wrap items-center gap-x-5 gap-y-2 p-4 transition hover:bg-ivory/70">
                <div className="min-w-36"><p className="font-serif text-xl">{o.reference}</p><p className="text-xs text-claret/60">{when(o.createdAt)}</p></div>
                <p className="min-w-0 flex-1 truncate text-sm text-claret/70">{o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}</p>
                <p className="text-sm font-medium">{kes(o.total)}</p>
                <div className="flex flex-col items-end gap-1"><Badge tone={payBadge(o).tone}>{payBadge(o).text}</Badge><Badge tone={fulfilTone(o.fulfilment)}>{label(FULFILMENT, o.fulfilment)}</Badge></div>
              </Link>
            </li>
          ))}
        </ul>
        {c.orders.length >= 100 && <p className="p-4 text-xs text-claret/60">Showing the latest 100 orders.</p>}
      </section>
    </div>
  );
}
