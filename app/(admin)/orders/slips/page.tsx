import Link from "next/link";
import { api } from "../../../../lib/session";
import type { AdminOrder } from "../../../../lib/orders";
import PackingSlip from "../../../../components/PackingSlip";
import PrintButton from "../../../../components/PrintButton";

export const dynamic = "force-dynamic";

/** Slips for every new order that is ready to pack: paid, or pay on delivery. Most recent 30 new orders. */
export default async function Slips() {
  const data = await api<{ total: number; orders: AdminOrder[] }>("/orders?fulfilment=NEW");
  const ready = data.orders.filter((o) => o.status === "PAID" || (o.payTiming === "ON_DELIVERY" && o.status === "PENDING")).reverse();
  const held = data.orders.length - ready.length;
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="space-y-3 print:hidden">
        <Link href="/orders" className="text-sm underline">← All orders</Link>
        <h1 className="font-serif text-4xl">Packing slips</h1>
        <p className="text-sm text-claret/70">
          {ready.length === 0 ? "Nothing is ready to pack." : `${ready.length} new ${ready.length === 1 ? "order is" : "orders are"} ready to pack (paid, or pay on delivery), oldest first. Each slip prints on its own page.`}
          {held > 0 && ` ${held} new ${held === 1 ? "order is" : "orders are"} left out because payment is still pending.`}
          {data.total > data.orders.length && " Only the latest 30 new orders are shown; print again after packing these."}
        </p>
        {ready.length > 0 && <PrintButton>Print {ready.length} {ready.length === 1 ? "slip" : "slips"}</PrintButton>}
      </div>
      {ready.map((o) => <PackingSlip key={o.id} o={o} />)}
    </div>
  );
}
