import Link from "next/link";
import { api } from "../../../lib/session";
import type { MessageRow } from "../../../lib/messaging";
import MessagesList from "../../../components/MessagesList";

export const dynamic = "force-dynamic";

const TABS: [string, string][] = [["NEEDS", "Needs sending"], ["PENDING", "Sending"], ["SENT", "Sent"], ["ALL", "All"]];
const LABELS: Record<string, string> = {
  ORDER_PLACED: "Order received", PAYMENT_RECEIVED: "Payment received", ORDER_PACKED: "Order packed", OUT_FOR_DELIVERY: "Out for delivery", DELIVERED: "Delivered",
  ORDER_CANCELLED: "Order cancelled", ORDER_EXPIRED: "Order expired", STAFF_NEW_ORDER: "New order alert", STAFF_PAYMENT_CLAIM: "Payment to check", STAFF_NEW_LEAD: "New WhatsApp lead", STAFF_STOCK_SHORT: "Stock short alert",
};

export default async function Messages({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  const sp = await searchParams;
  const tab = sp.status ?? "NEEDS";
  const data = await api<{ total: number; page: number; pageSize: number; counts: { needs: number; pending: number }; messages: MessageRow[] }>(`/messages?status=${encodeURIComponent(tab)}&page=${sp.page ?? 1}`);
  const pages = Math.max(1, Math.ceil(data.total / data.pageSize));
  const link = (p: number) => `/messages?status=${tab}&page=${p}`;
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-serif text-4xl">Messages</h1>
        <p className="mt-2 text-sm text-claret/70">Everything we send to customers and staff. If no channel could deliver a message, it waits here for you to send by hand on WhatsApp.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {TABS.map(([v, l]) => (
          <Link key={v} href={`/messages?status=${v}`} className={`rounded-full border px-4 py-1.5 text-sm ${tab === v ? "border-claret bg-claret text-ivory" : "border-claret/30"}`}>
            {l}{v === "NEEDS" && data.counts.needs > 0 ? ` (${data.counts.needs})` : v === "PENDING" && data.counts.pending > 0 ? ` (${data.counts.pending})` : ""}
          </Link>
        ))}
      </div>
      <MessagesList messages={data.messages} labels={LABELS} />
      <div className="flex items-center justify-between text-sm">
        <span className="text-claret/60">Page {data.page} of {pages}</span>
        <span className="flex gap-3">{data.page > 1 && <Link href={link(data.page - 1)} className="underline">← Newer</Link>}{data.page < pages && <Link href={link(data.page + 1)} className="underline">Older →</Link>}</span>
      </div>
    </div>
  );
}
