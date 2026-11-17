"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { moderateReview } from "../app/actions-reviews";
import { localPhone, when } from "../lib/format";
import type { ReviewRow } from "../lib/content";
import Badge from "./Badge";

const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

function Card({ r }: { r: ReviewRow }) {
  const router = useRouter();
  const [reply, setReply] = useState(r.reply ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function act(patch: { status?: string; reply?: string | null }, ok: string) {
    setBusy(true); setMsg("");
    const res = await moderateReview(r.id, patch);
    setBusy(false);
    if (res.ok) { setMsg(ok); router.refresh(); } else setMsg(res.error ?? "Could not save");
  }

  return (
    <div className="space-y-3 rounded-2xl border border-champagne/40 bg-white/60 p-5 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-serif text-xl">{r.product.name}</p>
          <p className="text-xs text-claret/60">{r.customer.name ?? "Customer"} · {localPhone(r.customer.phone)} · {when(r.createdAt)} · {r.showName ? "name shown" : "shown as Verified buyer"}</p>
        </div>
        <Badge tone={r.status === "APPROVED" ? "ok" : r.status === "REJECTED" ? "bad" : "warn"}>{r.status.toLowerCase()}</Badge>
      </div>
      <p><span className="tracking-wider text-champagne">{stars(r.rating)}</span> {r.title && <b>{r.title}</b>}</p>
      <p className="rounded-lg bg-ivory/80 p-3">{r.body}</p>
      <div className="flex flex-wrap gap-2">
        {r.status !== "APPROVED" && <button disabled={busy} onClick={() => void act({ status: "APPROVED" }, "Approved. It now shows on the product.")} className="rounded-full bg-claret px-5 py-1.5 text-ivory">Approve</button>}
        {r.status !== "REJECTED" && <button disabled={busy} onClick={() => void act({ status: "REJECTED" }, "Rejected. It won't show.")} className="rounded-full border border-claret/40 px-5 py-1.5 hover:border-claret">Reject</button>}
      </div>
      <div className="space-y-2">
        <label className="block text-xs font-medium">Your reply (shown under the review once it is approved)</label>
        <textarea rows={2} maxLength={500} value={reply} onChange={(e) => setReply(e.target.value)} className="w-full rounded-lg border border-champagne/60 bg-white/70 p-2.5" />
        <button disabled={busy || reply === (r.reply ?? "")} onClick={() => void act({ reply: reply.trim() || null }, "Reply saved.")} className="rounded-full border border-claret px-5 py-1.5 disabled:opacity-40">Save reply</button>
      </div>
      {msg && <p>{msg}</p>}
    </div>
  );
}

export default function ReviewsList({ reviews }: { reviews: ReviewRow[] }) {
  if (reviews.length === 0) return <p className="text-claret/70">Nothing here.</p>;
  return <div className="space-y-4">{reviews.map((r) => <Card key={r.id} r={r} />)}</div>;
}
