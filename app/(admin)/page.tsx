import Link from "next/link";
import { api } from "../../lib/session";
import { kes } from "../../lib/format";
import type { Stats } from "../../lib/types";

export default async function Dashboard() {
  const s = await api<Stats>("/stats");
  const cards: [string, string, string][] = [
    ["Orders today", String(s.ordersToday), "/orders"], ["Revenue today", kes(s.revenueToday), "/orders?status=PAID"],
    ["Awaiting payment", String(s.pendingOrders), "/orders?status=PENDING"], ["New WhatsApp leads", String(s.newLeads), "/leads?status=NEW"],
  ];
  return (
    <div className="space-y-8">
      <h1 className="font-serif text-4xl">Dashboard</h1>
      {(s.messagesNeedingAction ?? 0) > 0 && (
        <Link href="/messages" className="block rounded-2xl bg-champagne p-4 text-claret transition hover:opacity-90">
          {s.messagesNeedingAction} {s.messagesNeedingAction === 1 ? "message needs" : "messages need"} sending by hand →
        </Link>
      )}
      {(s.pendingCodes ?? 0) > 0 && (
        <Link href="/codes" className="block rounded-2xl bg-champagne p-4 text-claret transition hover:opacity-90">
          {s.pendingCodes} sign-in {s.pendingCodes === 1 ? "code is" : "codes are"} waiting to be sent →
        </Link>
      )}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(([label, value, href]) => (
          <Link key={label} href={href} className="rounded-2xl border border-champagne/40 bg-white/60 p-5 transition hover:bg-white">
            <p className="text-xs uppercase tracking-[0.15em] text-claret/60">{label}</p>
            <p className="mt-2 font-serif text-3xl">{value}</p>
          </Link>
        ))}
      </div>
      <section className="rounded-2xl border border-champagne/40 bg-white/60 p-5">
        <h2 className="font-serif text-2xl">Running low</h2>
        {s.lowStock.length === 0 ? (
          <p className="mt-2 text-sm text-claret/70">Nothing is running low.</p>
        ) : (
          <ul className="mt-3 divide-y divide-champagne/30">
            {s.lowStock.map((v) => (
              <li key={v.variantId} className="flex justify-between py-2 text-sm">
                <span>{v.name} <span className="text-claret/60">({v.size}, {v.colour})</span></span>
                <span className={v.stock === 0 ? "font-semibold" : ""}>{v.stock === 0 ? "Sold out" : `${v.stock} left`}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
