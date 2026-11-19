import Link from "next/link";
import { api } from "../../../lib/session";
import { kes } from "../../../lib/format";
import { METHODS, label } from "../../../lib/orders";
import type { Me } from "../../../lib/types";
import type { SalesReport } from "../../../lib/reports";

export const dynamic = "force-dynamic";
const box = "rounded-lg border border-champagne/60 bg-white/70 p-2.5 text-sm";
const DAY = 86_400_000, EAT = 3 * 3600_000;
const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const nice = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

function Table({ title, head, rows }: { title: string; head: [string, string, string]; rows: [string, string, string][] }) {
  return (
    <section className="rounded-2xl border border-champagne/40 bg-white/60 p-5">
      <h2 className="mb-3 font-serif text-2xl">{title}</h2>
      {rows.length === 0 ? <p className="text-sm text-claret/60">Nothing in this period.</p> : (
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs uppercase tracking-[0.15em] text-claret/60"><th className="pb-2 font-normal">{head[0]}</th><th className="pb-2 text-right font-normal">{head[1]}</th><th className="pb-2 text-right font-normal">{head[2]}</th></tr></thead>
          <tbody className="divide-y divide-champagne/30">{rows.map(([a, b, c]) => <tr key={a}><td className="py-2 pr-3">{a}</td><td className="py-2 text-right text-claret/70">{b}</td><td className="py-2 text-right font-medium">{c}</td></tr>)}</tbody>
        </table>
      )}
    </section>
  );
}

export default async function Reports({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const me = await api<Me>("/me");
  if (me.role !== "OWNER") return <p>Only the owner can see reports.</p>;
  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const k of ["from", "to"]) if (sp[k]) qs.set(k, sp[k]!);
  const r = await api<SalesReport>(`/reports/sales?${qs}`);

  const today = iso(Date.now() + EAT);
  const t = Date.parse(`${today}T00:00:00Z`);
  const monthStart = `${today.slice(0, 8)}01`;
  const lastMonthEnd = iso(Date.parse(`${monthStart}T00:00:00Z`) - DAY);
  const presets: [string, string, string][] = [
    ["Last 7 days", iso(t - 6 * DAY), today], ["Last 30 days", iso(t - 29 * DAY), today],
    ["This month", monthStart, today], ["Last month", `${lastMonthEnd.slice(0, 8)}01`, lastMonthEnd],
  ];
  const max = Math.max(1, ...r.daily.map((d) => d.revenue));
  const T = r.totals;

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="font-serif text-4xl">Sales report</h1>
        <p className="mt-2 text-sm text-claret/70">Counts paid orders that were not cancelled, by the day the order was placed (Kenya time). Orders waiting for payment are shown separately.</p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <form className="flex flex-wrap items-end gap-2">
          <div><label className="mb-1 block text-xs text-claret/60">From</label><input type="date" name="from" defaultValue={r.from} max={today} className={box} /></div>
          <div><label className="mb-1 block text-xs text-claret/60">To</label><input type="date" name="to" defaultValue={r.to} max={today} className={box} /></div>
          <button className="rounded-full bg-claret px-6 py-2.5 text-sm text-ivory">Show</button>
        </form>
        <div className="flex flex-wrap gap-3 pb-2 text-sm">
          {presets.map(([l, f, to]) => <Link key={l} href={`/reports?from=${f}&to=${to}`} className="underline">{l}</Link>)}
        </div>
      </div>
      <p className="text-sm text-claret/70">{nice(r.from)} to {nice(r.to)} · {r.days} {r.days === 1 ? "day" : "days"}</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {([["Revenue", kes(T.revenue)], ["Paid orders", String(T.orders)], ["Average order", kes(T.avgOrder)], ["Items sold", String(T.units)]] as const).map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-champagne/40 bg-white/60 p-5"><p className="text-xs uppercase tracking-[0.2em] text-claret/60">{k}</p><p className="mt-1 font-serif text-3xl">{v}</p></div>
        ))}
      </div>
      <p className="text-sm text-claret/70">Revenue includes {kes(T.deliveryFees)} of delivery fees and is after {kes(T.discounts)} of discounts.</p>

      <section className="rounded-2xl border border-champagne/40 bg-white/60 p-5">
        <h2 className="mb-4 font-serif text-2xl">Revenue by day</h2>
        <div className="flex h-44 items-end gap-px" role="img" aria-label="Bar chart of revenue per day">
          {r.daily.map((d) => (
            <div key={d.date} title={`${nice(d.date)}: ${kes(d.revenue)} from ${d.orders} ${d.orders === 1 ? "order" : "orders"}`} className="flex h-full min-w-0 flex-1 items-end">
              <div className="w-full rounded-t-sm bg-claret" style={{ height: d.revenue ? `${Math.max(2, (d.revenue / max) * 100)}%` : "0" }} />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-claret/60"><span>{nice(r.from)}</span><span>Highest day: {kes(max === 1 && T.revenue === 0 ? 0 : max)}</span><span>{nice(r.to)}</span></div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Table title="Top products" head={["Product", "Sold", "Sales"]} rows={r.topProducts.map((p) => [p.name, String(p.units), kes(p.revenue)])} />
        <Table title="How customers paid" head={["Method", "Orders", "Revenue"]} rows={r.byMethod.map((m) => [m.method === "UNKNOWN" ? "Not recorded" : label(METHODS, m.method), String(m.orders), kes(m.revenue)])} />
        <Table title="Where it was delivered" head={["County", "Orders", "Revenue"]} rows={r.byCounty.map((c) => [c.county, String(c.orders), kes(c.revenue)])} />
        <section className="space-y-3 rounded-2xl border border-champagne/40 bg-white/60 p-5 text-sm">
          <h2 className="font-serif text-2xl">Not counted above</h2>
          <p><b>{r.outstanding.count}</b> {r.outstanding.count === 1 ? "order" : "orders"} still waiting for payment, worth <b>{kes(r.outstanding.value)}</b> (includes pay on delivery orders not yet delivered).</p>
          <p><b>{r.cancelledPaid.count}</b> paid {r.cancelledPaid.count === 1 ? "order was" : "orders were"} cancelled, worth <b>{kes(r.cancelledPaid.value)}</b>. Check whether these need a refund.</p>
          <p className="text-xs text-claret/60">Top product sales are before discounts. These figures are for your own tracking; your accountant should confirm what counts for tax.</p>
        </section>
      </div>
    </div>
  );
}
