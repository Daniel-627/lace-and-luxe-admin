"use client";
import { useState } from "react";
import { saveSizeGuide } from "../app/actions-reviews";
import type { GuideSection, SizeGuide } from "../lib/content";

const box = "w-full rounded-lg border border-champagne/60 bg-white/70 p-2.5 text-sm";
const rows = (t: string) => t.split("\n").map((l) => l.split("|").map((c) => c.trim())).filter((r) => r.some(Boolean));

export default function SizeGuideEditor({ initial }: { initial: SizeGuide }) {
  const [intro, setIntro] = useState(initial.intro);
  const [sections, setSections] = useState<GuideSection[]>(initial.sections);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const set = (i: number, p: Partial<GuideSection>) => setSections(sections.map((s, j) => (j === i ? { ...s, ...p } : s)));
  const move = (i: number, d: number) => { const j = i + d; if (j < 0 || j >= sections.length) return; const n = [...sections]; [n[i], n[j]] = [n[j], n[i]]; setSections(n); };

  async function save() {
    if (sections.some((s) => !s.title.trim())) return setMsg("Every section needs a title.");
    setBusy(true); setMsg("");
    const r = await saveSizeGuide({ intro, sections });
    setBusy(false);
    setMsg(r.ok ? "Saved. The shop shows it within a minute." : r.error ?? "Could not save");
  }

  return (
    <div className="space-y-6">
      <div><label className="mb-1 block text-sm font-medium">Introduction</label><textarea rows={2} className={box} value={intro} onChange={(e) => setIntro(e.target.value)} /></div>

      {sections.map((s, i) => {
        const t = rows(s.table);
        return (
          <div key={i} className="space-y-3 rounded-2xl border border-champagne/40 bg-white/60 p-5">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.15em] text-claret/60">
              <span>Section {i + 1}</span>
              <span className="flex gap-3 normal-case tracking-normal">
                <button disabled={i === 0} onClick={() => move(i, -1)} className="underline disabled:opacity-30">Move up</button>
                <button disabled={i === sections.length - 1} onClick={() => move(i, 1)} className="underline disabled:opacity-30">Move down</button>
                <button onClick={() => setSections(sections.filter((_, j) => j !== i))} className="underline">Remove</button>
              </span>
            </div>
            <input className={box} placeholder="Title, for example Bras" value={s.title} onChange={(e) => set(i, { title: e.target.value })} />
            <textarea rows={3} className={box} placeholder="Text (optional)" value={s.text} onChange={(e) => set(i, { text: e.target.value })} />
            <div>
              <label className="mb-1 block text-xs font-medium">Size chart (optional)</label>
              <textarea rows={5} className={`${box} font-mono`} placeholder={"Size | Bust (cm) | Band (cm)\n34B | 86 | 74"} value={s.table} onChange={(e) => set(i, { table: e.target.value })} />
              <p className="mt-1 text-xs text-claret/60">One row per line, cells separated by |. The first line is the heading row. Use the measurements for your own products.</p>
            </div>
            {t.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-champagne/40 bg-white/50">
                <table className="w-full text-left text-xs"><thead><tr className="bg-rose/15">{t[0].map((c, j) => <th key={j} className="px-3 py-1.5 font-medium">{c}</th>)}</tr></thead>
                  <tbody>{t.slice(1).map((r, k) => <tr key={k}>{r.map((c, j) => <td key={j} className="px-3 py-1.5">{c}</td>)}</tr>)}</tbody></table>
              </div>
            )}
          </div>
        );
      })}
      {sections.length < 12 && <button onClick={() => setSections([...sections, { title: "", text: "", table: "" }])} className="rounded-full border border-claret px-5 py-2 text-sm">+ Add a section</button>}

      <div className="sticky bottom-4 flex flex-wrap items-center gap-4 rounded-2xl bg-claret p-4 text-ivory">
        <button disabled={busy} onClick={() => void save()} className="rounded-full bg-champagne px-8 py-2.5 text-sm text-claret disabled:opacity-50">{busy ? "Saving…" : "Save size guide"}</button>
        {msg && <span className="text-sm">{msg}</span>}
      </div>
    </div>
  );
}
