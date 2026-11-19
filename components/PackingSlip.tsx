import { kes, localPhone, when } from "../lib/format";
import type { AdminOrder } from "../lib/orders";

/** One printable page per order: what to pack, where it goes, and whether cash is due at the door. */
export default function PackingSlip({ o }: { o: AdminOrder }) {
  const paid = o.status === "PAID";
  const collect = !paid && o.payTiming === "ON_DELIVERY";
  const units = o.items.reduce((s, i) => s + i.qty, 0);
  return (
    <article className="break-after-page space-y-5 rounded-2xl border border-champagne/40 bg-white p-8 text-sm text-black print:rounded-none print:border-0 print:p-0">
      <header className="flex items-start justify-between gap-4 border-b border-black/20 pb-4">
        <div>
          <p className="font-serif text-3xl">Lace &amp; Luxe</p>
          <p className="text-xs uppercase tracking-[0.2em]">Packing slip</p>
        </div>
        <div className="text-right">
          <p className="font-serif text-2xl">{o.reference}</p>
          <p className="text-xs">{when(o.createdAt)}</p>
        </div>
      </header>

      <section>
        <p className="text-xs uppercase tracking-[0.2em]">Deliver to</p>
        <p className="mt-1 text-base font-medium">{o.deliveryName}</p>
        <p>{localPhone(o.deliveryPhone)}</p>
        <p>{o.area}, {o.county}</p>
        {o.addressDetails && <p>{o.addressDetails}</p>}
        {o.deliveryServiceName && <p className="mt-1 text-xs">Delivery: {o.deliveryServiceName}</p>}
      </section>

      <div className="overflow-x-auto print:overflow-visible"><table className="w-full">
        <thead><tr className="border-y border-black/30 text-left text-xs uppercase tracking-[0.15em]"><th className="w-8 py-2 font-normal">Packed</th><th className="py-2 font-normal">Item</th><th className="py-2 font-normal">Size</th><th className="py-2 font-normal">Colour</th><th className="py-2 text-right font-normal">Qty</th></tr></thead>
        <tbody>
          {o.items.map((i) => (
            <tr key={i.id} className="border-b border-black/10">
              <td className="py-2"><span className="inline-block h-4 w-4 border border-black" /></td>
              <td className="py-2 pr-2">{i.name}</td><td className="py-2">{i.size}</td><td className="py-2">{i.colour}</td><td className="py-2 text-right font-medium">{i.qty}</td>
            </tr>
          ))}
        </tbody>
        <tfoot><tr><td colSpan={4} className="pt-2 text-right text-xs uppercase tracking-[0.15em]">Total items</td><td className="pt-2 text-right font-medium">{units}</td></tr></tfoot>
      </table></div>

      {collect ? (
        <p className="border-2 border-black p-3 text-center text-lg font-medium">COLLECT {kes(o.total)} ON DELIVERY</p>
      ) : (
        <p className="text-xs">{paid ? "Paid in full." : "Payment not yet confirmed. Check the order before sending."}</p>
      )}
      {o.notes && <p className="text-xs"><b>Note:</b> {o.notes}</p>}
      <p className="pt-2 text-center text-xs">Thank you for shopping with Lace &amp; Luxe.</p>
    </article>
  );
}
