import Link from "next/link";
import { api } from "../../../lib/session";
import { kes, localPhone, when } from "../../../lib/format";
import type { CustomerList } from "../../../lib/reports";
import Badge from "../../../components/Badge";

export const dynamic = "force-dynamic";
const box = "rounded-lg border border-champagne/60 bg-white/70 p-2.5 text-sm";

export default async function Customers({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const k of ["q", "page"]) if (sp[k]) qs.set(k, sp[k]!);
  const data = await api<CustomerList>(`/customers?${qs}`);
  const pages = Math.max(1, Math.ceil(data.total / data.pageSize));
  const link = (page: number) => { const p = new URLSearchParams(qs); p.set("page", String(page)); return `/customers?${p}`; };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-4xl">Customers</h1>
        <p className="mt-2 text-sm text-claret/70">Everyone who has placed an order, grouped by phone number. Guests who checked out without an account are included. Spent counts paid orders that were not cancelled.</p>
      </div>
      <form className="flex flex-wrap gap-2">
        <input name="q" defaultValue={sp.q ?? ""} placeholder="Search name or phone" className={`${box} min-w-64 flex-1`} />
        <button className="rounded-full bg-claret px-6 text-sm text-ivory">Search</button>
      </form>

      {data.customers.length === 0 ? <p className="text-claret/70">No customers match.</p> : (
        <ul className="divide-y divide-champagne/30 rounded-2xl border border-champagne/40 bg-white/60">
          {data.customers.map((c) => (
            <li key={c.phone}>
              <Link href={`/customers/${c.phone}`} className="flex flex-wrap items-center gap-x-5 gap-y-2 p-4 transition hover:bg-ivory/70">
                <div className="min-w-0 flex-1 text-sm">
                  <p className="truncate font-serif text-xl">{c.name || "No name"}</p>
                  <p className="text-claret/60">{localPhone(c.phone)}{c.email ? ` · ${c.email}` : ""}</p>
                </div>
                <div className="text-sm text-claret/70">{c.orders} {c.orders === 1 ? "order" : "orders"}</div>
                <div className="min-w-28 text-right text-sm font-medium">{kes(c.spent)}</div>
                <div className="min-w-36 text-right text-xs text-claret/60">Last order<br />{when(c.lastOrderAt)}</div>
                <Badge tone={c.hasAccount ? "ok" : "muted"}>{c.hasAccount ? "Has account" : "Guest"}</Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between text-sm">
        <span className="text-claret/60">{data.total} {data.total === 1 ? "customer" : "customers"} · page {data.page} of {pages}</span>
        <span className="flex gap-3">
          {data.page > 1 && <Link href={link(data.page - 1)} className="underline">← Previous</Link>}
          {data.page < pages && <Link href={link(data.page + 1)} className="underline">Next →</Link>}
        </span>
      </div>
    </div>
  );
}
