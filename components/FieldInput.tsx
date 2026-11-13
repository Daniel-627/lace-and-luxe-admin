"use client";
import type { Field } from "../lib/blocks";
import ImageField from "./ImageField";

const box = "w-full rounded-lg border border-champagne/60 bg-white/70 p-2.5 text-sm";

export default function FieldInput({ f, value, onChange }: { f: Field; value: unknown; onChange: (v: unknown) => void }) {
  const str = typeof value === "string" ? value : "";
  let control: React.ReactNode;

  switch (f.kind) {
    case "text":
      control = <input className={box} value={str} onChange={(e) => onChange(e.target.value)} />; break;
    case "link":
      control = <input className={box} value={str} placeholder="/shop or https://…" onChange={(e) => onChange(e.target.value)} />; break;
    case "area":
      control = <textarea className={box} rows={3} value={str} onChange={(e) => onChange(e.target.value)} />; break;
    case "number":
      control = <input className={box} type="number" min={f.min} max={f.max} value={typeof value === "number" ? value : ""} onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))} />; break;
    case "lines":
      control = <textarea className={box} rows={4} value={Array.isArray(value) ? value.join("\n") : ""} onChange={(e) => onChange(e.target.value.split("\n"))} />; break;
    case "image":
      control = <ImageField value={str || undefined} onChange={onChange} />; break;
    case "toggle":
      control = <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={value !== false} onChange={(e) => onChange(e.target.checked)} /> Yes</label>; break;
    case "choice":
      control = (
        <div className="flex flex-wrap gap-2">
          {(f.options ?? []).map(([label, val]) => (
            <button type="button" key={val} onClick={() => onChange(val)}
              className={`rounded-full border px-4 py-1.5 text-sm ${str === val ? "border-claret bg-claret text-ivory" : "border-claret/30"}`}>{label}</button>
          ))}
        </div>
      ); break;
    case "list": {
      const items = Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
      const set = (i: number, name: string, v: unknown) => onChange(items.map((it, j) => (j === i ? { ...it, [name]: v } : it)));
      control = (
        <div className="space-y-3">
          {items.map((it, i) => (
            <div key={i} className="space-y-3 rounded-xl border border-champagne/40 bg-ivory/60 p-4">
              <div className="flex justify-between text-xs uppercase tracking-[0.15em] text-claret/60">
                <span>{f.label} {i + 1}</span>
                <button type="button" className="underline" onClick={() => onChange(items.filter((_, j) => j !== i))}>Remove</button>
              </div>
              {(f.fields ?? []).map((sf) => <FieldInput key={sf.name} f={sf} value={it[sf.name]} onChange={(v) => set(i, sf.name, v)} />)}
            </div>
          ))}
          {items.length < (f.max ?? 6) && (
            <button type="button" onClick={() => onChange([...items, {}])} className="rounded-full border border-claret px-4 py-1.5 text-sm">+ Add</button>
          )}
        </div>
      ); break;
    }
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{f.label}</label>
      {control}
      {f.help && <p className="mt-1 text-xs text-claret/60">{f.help}</p>}
    </div>
  );
}
