import Link from "next/link";
import { api } from "../../../lib/session";
import type { ReviewRow } from "../../../lib/content";
import ReviewsList from "../../../components/ReviewsList";

export const dynamic = "force-dynamic";

const TABS: [string, string][] = [["PENDING", "Waiting"], ["APPROVED", "Approved"], ["REJECTED", "Rejected"], ["ALL", "All"]];

export default async function Reviews({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "PENDING" } = await searchParams;
  const d = await api<{ pending: number; reviews: ReviewRow[] }>(`/reviews?status=${encodeURIComponent(status)}`);
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-serif text-4xl">Reviews</h1>
        <p className="mt-2 text-sm text-claret/70">Only customers who have received a product can review it, once each. Nothing shows in the shop until you approve it.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {TABS.map(([v, l]) => <Link key={v} href={`/reviews?status=${v}`} className={`rounded-full border px-4 py-1.5 text-sm ${status === v ? "border-claret bg-claret text-ivory" : "border-claret/30"}`}>{l}{v === "PENDING" && d.pending > 0 ? ` (${d.pending})` : ""}</Link>)}
      </div>
      <ReviewsList reviews={d.reviews} />
    </div>
  );
}
