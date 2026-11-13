"use client";
import { useEffect, useState } from "react";
import { BLOCKS, BLOCK_ORDER, standardHomepage, type BlockData } from "../lib/blocks";
import { saveHomePage } from "../app/actions-content";
import FieldInput from "./FieldInput";

const newKey = () => Math.random().toString(36).slice(2, 12);
const pad = (n: number) => String(n).padStart(2, "0");
const toInput = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(+d) ? "" : `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const fromInput = (v: string) => (v ? new Date(v).toISOString() : undefined);
const box = "w-full rounded-lg border border-champagne/60 bg-white/70 p-2.5 text-sm";

export default function HomeEditor({ initial, shopUrl }: { initial: BlockData[]; shopUrl?: string }) {
  const [blocks, setBlocks] = useState<BlockData[]>(initial);
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState("heroBlock");
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const change = (next: BlockData[]) => { setBlocks(next); setDirty(true); setMsg(null); };
  const patch = (key: string, p: Record<string, unknown>) => change(blocks.map((b) => (b._key === key ? { ...b, ...p } : b)));
  const move = (i: number, d: number) => {
    const j = i + d; if (j < 0 || j >= blocks.length) return;
    const next = [...blocks]; [next[i], next[j]] = [next[j], next[i]]; change(next);
  };
  const add = () => { const b: BlockData = { _key: newKey(), _type: adding, enabled: true, ...(BLOCKS[adding].defaults ?? {}) }; change([...blocks, b]); setOpen(b._key); };
  const duplicate = (b: BlockData) => { const copy = JSON.parse(JSON.stringify(b)) as BlockData; copy._key = newKey(); const i = blocks.findIndex((x) => x._key === b._key); const next = [...blocks]; next.splice(i + 1, 0, copy); change(next); setOpen(copy._key); };
  const remove = (b: BlockData) => { if (confirm("Delete this section?")) change(blocks.filter((x) => x._key !== b._key)); };

  async function save() {
    setBusy(true); setMsg(null);
    const r = await saveHomePage(blocks);
    setBusy(false);
    if (r.ok) { setDirty(false); setMsg({ ok: true, text: "Saved. The shop shows it within about a minute." }); }
    else setMsg({ ok: false, text: r.error ?? "Could not save" });
  }

  return (
    <div className="space-y-5">
      {blocks.length === 0 && (
        <div className="rounded-2xl border border-champagne/40 bg-white/60 p-6">
          <p>Nothing saved yet, so the shop shows its built-in homepage. Start from a copy of it and change what you like.</p>
          <button onClick={() => change(standardHomepage())} className="mt-4 rounded-full bg-claret px-6 py-2.5 text-sm text-ivory">Start from the standard homepage</button>
        </div>
      )}

      <div className="space-y-3">
        {blocks.map((b, i) => {
          const def = BLOCKS[b._type]; if (!def) return null;
          const isOpen = open === b._key;
          const title = def.titleField ? String(b[def.titleField] ?? "").replace(/\*/g, "").split("\n")[0] : "";
          return (
            <div key={b._key} className="rounded-2xl border border-champagne/40 bg-white/60">
              <div className="flex flex-wrap items-center gap-3 p-4">
                <button onClick={() => setOpen(isOpen ? null : b._key)} className="min-w-0 flex-1 text-left">
                  <span className="text-xs uppercase tracking-[0.15em] text-claret/60">{i + 1}. {def.label}{b.enabled === false && " · hidden"}{(b.startsAt || b.endsAt) && " · scheduled"}</span>
                  <span className="block truncate font-serif text-xl">{title || def.blurb}</span>
                </button>
                <div className="flex gap-2 text-sm">
                  <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="rounded-full border border-claret/30 px-3 py-1 disabled:opacity-30">↑</button>
                  <button onClick={() => move(i, 1)} disabled={i === blocks.length - 1} aria-label="Move down" className="rounded-full border border-claret/30 px-3 py-1 disabled:opacity-30">↓</button>
                  <button onClick={() => duplicate(b)} className="rounded-full border border-claret/30 px-3 py-1">Copy</button>
                  <button onClick={() => remove(b)} className="rounded-full border border-claret/30 px-3 py-1">Delete</button>
                </div>
              </div>
              {isOpen && (
                <div className="space-y-5 border-t border-champagne/40 p-5">
                  {def.fields.map((f) => <FieldInput key={f.name} f={f} value={b[f.name]} onChange={(v) => patch(b._key, { [f.name]: v })} />)}
                  <div className="space-y-3 rounded-xl bg-ivory/70 p-4">
                    <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={b.enabled !== false} onChange={(e) => patch(b._key, { enabled: e.target.checked })} /> Show this section</label>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div><label className="mb-1 block text-sm">Show from (optional)</label><input type="datetime-local" className={box} value={toInput(b.startsAt)} onChange={(e) => patch(b._key, { startsAt: fromInput(e.target.value) })} /></div>
                      <div><label className="mb-1 block text-sm">Hide after (optional)</label><input type="datetime-local" className={box} value={toInput(b.endsAt)} onChange={(e) => patch(b._key, { endsAt: fromInput(e.target.value) })} /></div>
                    </div>
                    <p className="text-xs text-claret/60">Times are in your device&apos;s time zone. Leave empty to show with no schedule.</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-champagne p-4">
        <select value={adding} onChange={(e) => setAdding(e.target.value)} className="rounded-lg border border-champagne/60 bg-white/70 p-2.5 text-sm">
          {BLOCK_ORDER.map((t) => <option key={t} value={t}>{BLOCKS[t].label}</option>)}
        </select>
        <button onClick={add} className="rounded-full border border-claret px-5 py-2 text-sm">+ Add section</button>
        <span className="text-xs text-claret/60">{BLOCKS[adding].blurb}</span>
      </div>

      <div className="sticky bottom-4 flex flex-wrap items-center gap-4 rounded-2xl bg-claret p-4 text-ivory">
        <button onClick={save} disabled={busy || !dirty} className="rounded-full bg-champagne px-8 py-2.5 text-sm text-claret disabled:opacity-50">{busy ? "Saving…" : "Save homepage"}</button>
        <span className="text-sm">{msg ? msg.text : dirty ? "You have unsaved changes." : "All changes saved."}</span>
        {shopUrl && <a href={shopUrl} target="_blank" rel="noopener noreferrer" className="ml-auto text-sm text-champagne underline">View the shop</a>}
      </div>
    </div>
  );
}
