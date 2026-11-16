import Link from "next/link";
import { api } from "../../../lib/session";
import { kes, localPhone, when } from "../../../lib/format";
import { FULFILMENT, PAYMENT, label, payBadge, type AdminOrder } from "../../../lib/orders";
import Badge, { fulfilTone, payTone } from "../../../components/Badge";

const box = "rounded-lg border border-champagne/60 bg-white/70 p-2.5 text-sm";

export default async function Orders({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const k of ["status", "fulfilment", "q", "page"]) if (sp[k]) qs.set(k, sp[k]!);
  const data = await api<{ total: number; page: number; pageSize: number; orders: AdminOrder[] }>(`/orders?${qs}`);
  const pages = Math.max(1, Math.ceil(data.total / data.pageSize));
  const link = (page: number) => { const p = new URLSearchParams(qs); p.set("page", String(page)); return `/orders?${p}`; };

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-4xl">Orders</h1>
      <form className="flex flex-wrap gap-2">
        <input name="q" defaultValue={sp.q ?? ""} placeholder="Search name, phone or reference" className={`${box} min-w-64 flex-1`} />
        <select name="status" defaultValue={sp.status ?? ""} className={box}><option value="">Any payment</option>{PAYMENT.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        <select name="fulfilment" defaultValue={sp.fulfilment ?? ""} className={box}><option value="">Any delivery status</option>{FULFILMENT.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        <button className="rounded-full bg-claret px-6 text-sm text-ivory">Filter</button>
      </form>

      {data.orders.length === 0 ? (
        <p className="text-claret/70">No orders match.</p>
      ) : (
        <ul className="divide-y divide-champagne/30 rounded-2xl border border-champagne/40 bg-white/60">
          {data.orders.map((o) => (
            <li key={o.id}>
              <Link href={`/orders/${o.id}`} className="flex flex-wrap items-center gap-x-5 gap-y-2 p-4 transition hover:bg-ivory/70">
                <div className="min-w-36">
                  <p className="font-serif text-xl">{o.reference}</p>
                  <p className="text-xs text-claret/60">{when(o.createdAt)}</p>
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="truncate">{o.contactName}</p>
                  <p className="text-claret/60">{localPhone(o.contactPhone)} · {o.items.reduce((s, i) => s + i.qty, 0)} items</p>
                </div>
                <p className="text-sm font-medium">{kes(o.total)}</p>
                <div className="flex flex-col items-end gap-1">
                  <Badge tone={payBadge(o).tone}>{payBadge(o).text}</Badge>
                  <Badge tone={fulfilTone(o.fulfilment)}>{label(FULFILMENT, o.fulfilment)}</Badge>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between text-sm">
        <span className="text-claret/60">{data.total} {data.total === 1 ? "order" : "orders"} · page {data.page} of {pages}</span>
        <span className="flex gap-3">
          {data.page > 1 && <Link href={link(data.page - 1)} className="underline">← Newer</Link>}
          {data.page < pages && <Link href={link(data.page + 1)} className="underline">Older →</Link>}
        </span>
      </div>
    </div>
  );
}
