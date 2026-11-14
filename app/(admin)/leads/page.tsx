import Link from "next/link";
import { api } from "../../../lib/session";
import { when } from "../../../lib/format";
import type { AdminLead } from "../../../lib/orders";
import LeadCard from "../../../components/LeadCard";

const TABS: [string, string][] = [["", "All"], ["NEW", "New"], ["CONTACTED", "Contacted"], ["CONVERTED", "Converted"], ["LOST", "Lost"]];

export default async function Leads({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const leads = await api<AdminLead[]>(`/leads${status ? `?status=${encodeURIComponent(status)}` : ""}`);
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="font-serif text-4xl">WhatsApp leads</h1>
        <p className="mt-2 text-sm text-claret/70">Each time a customer taps &quot;Order on WhatsApp&quot;, it appears here with what they chose. Once you&apos;ve agreed the order in the chat, turn it into a real order.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {TABS.map(([v, l]) => (
          <Link key={v} href={v ? `/leads?status=${v}` : "/leads"} className={`rounded-full border px-4 py-1.5 text-sm ${(status ?? "") === v ? "border-claret bg-claret text-ivory" : "border-claret/30"}`}>{l}</Link>
        ))}
      </div>
      {leads.length === 0 ? <p className="text-claret/70">No leads here yet.</p> : (
        <div className="space-y-4">{leads.map((l) => <LeadCard key={l.id} lead={l} whenLabel={when(l.createdAt)} />)}</div>
      )}
    </div>
  );
}
