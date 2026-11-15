"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { COUNTIES } from "../lib/counties";
import { deleteService, saveService } from "../app/actions-commerce";
import { kes } from "../lib/format";
import type { DeliveryServiceDTO } from "../lib/commerce";
import Badge from "./Badge";

const box = "w-full rounded-lg border border-champagne/60 bg-white/70 p-2.5 text-sm";
const rk = () => Math.random().toString(36).slice(2, 9);
interface Row { key: string; county: string; area: string; fee: string; freeAbove: string; etaText: string }
const canon = (s: string) => COUNTIES.find((c) => c.toLowerCase() === s.trim().toLowerCase());

function Editor({ service, onClose }: { service?: DeliveryServiceDTO; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState(service?.name ?? "");
  const [description, setDescription] = useState(service?.description ?? "");
  const [etaText, setEta] = useState(service?.etaText ?? "");
  const [active, setActive] = useState(service?.active ?? true);
  const [allowsCod, setCod] = useState(service?.allowsCod ?? false);
  const [rows, setRows] = useState<Row[]>((service?.rates ?? []).map((r) => ({ key: rk(), county: r.county, area: r.area ?? "", fee: String(r.fee), freeAbove: r.freeAbove ? String(r.freeAbove) : "", etaText: r.etaText ?? "" })));
  const [q, setQ] = useState({ counties: "", fee: "", eta: "" });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const setRow = (key: string, p: Partial<Row>) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...p } : r)));

  function quickAdd() {
    const words = q.counties.split(",").map((s) => s.trim()).filter(Boolean);
    if (!words.length) return setMsg("Type county names separated by commas, or the word all.");
    if (!/^\d+$/.test(q.fee)) return setMsg("Type the delivery fee for these counties.");
    const names = words.some((w) => w.toLowerCase() === "all") ? [...COUNTIES] : words.map(canon);
    const unknown = words.filter((_, i) => !names[i] && words[0].toLowerCase() !== "all");
    if (unknown.length) return setMsg(`Not a county: ${unknown.join(", ")}`);
    const have = new Set(rows.filter((r) => !r.area.trim()).map((r) => r.county));
    const add = (names as string[]).filter((c) => !have.has(c)).map((county) => ({ key: rk(), county, area: "", fee: q.fee, freeAbove: "", etaText: q.eta }));
    setRows([...rows, ...add]); setQ({ counties: "", fee: q.fee, eta: q.eta }); setMsg(`${add.length} added.`);
  }

  async function save() {
    setMsg("");
    if (name.trim().length < 2) return setMsg("Give the service a name.");
    const rates: NonNullable<Parameters<typeof saveService>[1]>["rates"] = [];
    for (const [i, r] of rows.entries()) {
      const c = canon(r.county);
      if (!c) return setMsg(`Row ${i + 1}: choose a county.`);
      if (!/^\d+$/.test(r.fee)) return setMsg(`Row ${i + 1}: the fee must be a whole number (0 for free).`);
      if (r.freeAbove && !/^\d+$/.test(r.freeAbove)) return setMsg(`Row ${i + 1}: "free above" must be a whole number.`);
      rates.push({ county: c, area: r.area.trim() || null, fee: Number(r.fee), freeAbove: r.freeAbove ? Number(r.freeAbove) : null, etaText: r.etaText.trim() || null });
    }
    setBusy(true);
    const res = await saveService(service?.id ?? null, { name: name.trim(), description, etaText, active, allowsCod, rates });
    setBusy(false);
    if (res.ok) { router.refresh(); onClose(); } else setMsg(res.error ?? "Could not save");
  }

  async function remove() {
    if (!service || !confirm(`Delete "${service.name}" and all its rates?`)) return;
    const r = await deleteService(service.id);
    if (r.ok) { router.refresh(); onClose(); } else setMsg(r.error ?? "Could not delete");
  }

  return (
    <div className="space-y-5 rounded-2xl border border-champagne/40 bg-white/60 p-5">
      <div className="grid gap-3 md:grid-cols-2">
        <div><label className="mb-1 block text-sm font-medium">Service name</label><input className={box} value={name} placeholder="Own riders, a courier…" onChange={(e) => setName(e.target.value)} /></div>
        <div><label className="mb-1 block text-sm font-medium">Usual time (shown to customers)</label><input className={box} value={etaText} placeholder="1 to 2 days" onChange={(e) => setEta(e.target.value)} /></div>
        <div className="md:col-span-2"><label className="mb-1 block text-sm font-medium">Short note (optional)</label><input className={box} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
      </div>
      <div className="flex flex-wrap gap-6 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Offer this service to customers</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={allowsCod} onChange={(e) => setCod(e.target.checked)} /> Can collect cash on delivery</label>
      </div>

      <div className="space-y-3 rounded-xl border border-dashed border-champagne p-4">
        <p className="text-sm font-medium">Quick add counties</p>
        <p className="text-xs text-claret/60">Type county names separated by commas, or <b>all</b> for every county. Each gets the same fee. Add town or estate rates below for places that cost more or less.</p>
        <div className="grid gap-3 md:grid-cols-3">
          <input className={box} placeholder="Nairobi, Kisumu, Mombasa" value={q.counties} onChange={(e) => setQ({ ...q, counties: e.target.value })} />
          <input className={box} inputMode="numeric" placeholder="Fee (KES)" value={q.fee} onChange={(e) => setQ({ ...q, fee: e.target.value })} />
          <input className={box} placeholder="Time, e.g. 1 to 2 days (optional)" value={q.eta} onChange={(e) => setQ({ ...q, eta: e.target.value })} />
        </div>
        <button type="button" onClick={quickAdd} className="rounded-full border border-claret px-5 py-2 text-sm">Add these counties</button>
      </div>

      {rows.length > 0 && (
        <div className="space-y-2">
          <div className="hidden grid-cols-[1.2fr_1.2fr_.8fr_.9fr_1fr_auto] gap-2 px-1 text-xs uppercase tracking-[0.12em] text-claret/60 md:grid"><span>County</span><span>Town or estate</span><span>Fee</span><span>Free above</span><span>Time</span><span /></div>
          {rows.map((r) => (
            <div key={r.key} className="grid grid-cols-2 items-center gap-2 rounded-xl border border-champagne/40 bg-white/60 p-2 md:grid-cols-[1.2fr_1.2fr_.8fr_.9fr_1fr_auto]">
              <select className={box} aria-label="County" value={r.county} onChange={(e) => setRow(r.key, { county: e.target.value })}>
                <option value="">County…</option>{COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input className={box} aria-label="Town or estate" placeholder="Whole county" value={r.area} onChange={(e) => setRow(r.key, { area: e.target.value })} />
              <input className={box} aria-label="Fee" inputMode="numeric" placeholder="Fee" value={r.fee} onChange={(e) => setRow(r.key, { fee: e.target.value })} />
              <input className={box} aria-label="Free above" inputMode="numeric" placeholder="Free above" value={r.freeAbove} onChange={(e) => setRow(r.key, { freeAbove: e.target.value })} />
              <input className={box} aria-label="Time" placeholder="Time" value={r.etaText} onChange={(e) => setRow(r.key, { etaText: e.target.value })} />
              <button type="button" onClick={() => setRows(rows.filter((x) => x.key !== r.key))} className="text-sm underline">Remove</button>
            </div>
          ))}
        </div>
      )}
      <button type="button" onClick={() => setRows([...rows, { key: rk(), county: "", area: "", fee: "", freeAbove: "", etaText: "" }])} className="rounded-full border border-claret px-5 py-2 text-sm">+ Add one rate</button>
      <p className="text-xs text-claret/60">A town or estate rate beats the county rate for that place. &quot;Free above&quot; makes delivery free once the items come to that amount.</p>

      <div className="flex flex-wrap items-center gap-4">
        <button disabled={busy} onClick={() => void save()} className="rounded-full bg-claret px-7 py-2.5 text-sm text-ivory disabled:opacity-50">{busy ? "Saving…" : "Save service"}</button>
        <button onClick={onClose} className="text-sm underline">Close</button>
        {service && <button onClick={() => void remove()} className="ml-auto text-sm underline">Delete service</button>}
      </div>
      {msg && <p className="text-sm">{msg}</p>}
    </div>
  );
}

export default function DeliveryManager({ services }: { services: DeliveryServiceDTO[] }) {
  const [open, setOpen] = useState<number | "new" | null>(null);
  return (
    <div className="space-y-4">
      {services.length === 0 && open !== "new" && <p className="text-claret/70">No delivery services yet. Add your first one, for example your own riders.</p>}
      {services.map((s) => open === s.id ? <Editor key={s.id} service={s} onClose={() => setOpen(null)} /> : (
        <button key={s.id} onClick={() => setOpen(s.id)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-champagne/40 bg-white/60 p-4 text-left transition hover:bg-white">
          <div className="min-w-0 flex-1"><p className="font-serif text-2xl">{s.name}</p><p className="text-xs text-claret/60">{s.rates.length} {s.rates.length === 1 ? "rate" : "rates"}{s.rates.length ? ` · from ${kes(Math.min(...s.rates.map((r) => r.fee)))}` : ""}{s.etaText ? ` · ${s.etaText}` : ""}</p></div>
          {s.allowsCod && <Badge tone="muted">Cash on delivery</Badge>}
          <Badge tone={s.active ? "ok" : "bad"}>{s.active ? "Offered" : "Off"}</Badge>
        </button>
      ))}
      {open === "new" ? <Editor onClose={() => setOpen(null)} /> : <button onClick={() => setOpen("new")} className="rounded-full bg-claret px-6 py-2.5 text-sm text-ivory">+ Add a delivery service</button>}
    </div>
  );
}
