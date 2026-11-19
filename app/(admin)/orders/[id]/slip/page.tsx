import Link from "next/link";
import { notFound } from "next/navigation";
import { api, ApiError } from "../../../../../lib/session";
import type { AdminOrder } from "../../../../../lib/orders";
import PackingSlip from "../../../../../components/PackingSlip";
import PrintButton from "../../../../../components/PrintButton";

export const dynamic = "force-dynamic";

export default async function Slip({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let o: AdminOrder;
  try {
    o = await api<AdminOrder>(`/orders/${id}`);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 400)) notFound();
    throw e;
  }
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between gap-3 print:hidden">
        <Link href={`/orders/${o.id}`} className="text-sm underline">← Back to order</Link>
        <PrintButton>Print packing slip</PrintButton>
      </div>
      <PackingSlip o={o} />
    </div>
  );
}
