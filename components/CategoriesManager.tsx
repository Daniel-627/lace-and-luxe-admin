"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCategory, deleteCategory, renameCategory } from "../app/actions-categories";
import type { CategoryRow } from "../lib/reports";

const box = "w-full rounded-lg border border-champagne/60 bg-white/70 p-2.5 text-sm";

function Row({ c, owner }: { c: CategoryRow; owner: boolean }) {
  const router = useRouter();
  const [name, setName] = useState(c.name);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const n = c._count.products;

  async function rename() {
    setMsg(""); setBusy(true);
    const r = await renameCategory(c.id, name);
    setBusy(false);
    if (r.ok) router.refresh(); else setMsg(r.error ?? "Could not rename");
  }
  async function remove() {
    if (!confirm(`Delete the category "${c.name}"?`)) return;
    setMsg(""); setBusy(true);
    const r = await deleteCategory(c.id);
    setBusy(false);
    if (r.ok) router.refresh(); else setMsg(r.error ?? "Could not delete");
  }

  return (
    <li className="space-y-1 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <input className={`${box} max-w-xs`} value={name} onChange={(e) => setName(e.target.value)} aria-label={`Name of ${c.name}`} />
        <button disabled={busy || name.trim() === c.name || name.trim().length < 2} onClick={() => void rename()} className="rounded-full border border-claret px-4 py-1.5 text-sm disabled:opacity-40">Rename</button>
        <span className="text-xs text-claret/60">{n} {n === 1 ? "product" : "products"} · link name: {c.slug}</span>
        {owner && <button disabled={busy} onClick={() => void remove()} className="ml-auto text-sm underline disabled:opacity-40">Delete</button>}
      </div>
      {msg && <p className="text-sm">{msg}</p>}
    </li>
  );
}

export default function CategoriesManager({ categories, owner }: { categories: CategoryRow[]; owner: boolean }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function add() {
    setMsg("");
    if (name.trim().length < 2) return setMsg("Type a category name.");
    setBusy(true);
    const r = await createCategory(name);
    setBusy(false);
    if (r.ok) { setName(""); router.refresh(); } else setMsg(r.error ?? "Could not add");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-champagne/40 bg-white/60 p-5">
        <label className="mb-1 block text-sm font-medium">New category</label>
        <div className="flex flex-wrap gap-3">
          <input className={`${box} max-w-xs`} value={name} placeholder="e.g. Swimwear" onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") void add(); }} />
          <button disabled={busy} onClick={() => void add()} className="rounded-full bg-claret px-6 py-2.5 text-sm text-ivory disabled:opacity-50">{busy ? "Adding…" : "Add category"}</button>
        </div>
        {msg && <p className="mt-2 text-sm">{msg}</p>}
      </div>
      {categories.length === 0 ? <p className="text-claret/70">No categories yet.</p> : (
        <ul className="divide-y divide-champagne/30 rounded-2xl border border-champagne/40 bg-white/60">
          {categories.map((c) => <Row key={`${c.id}:${c.name}`} c={c} owner={owner} />)}
        </ul>
      )}
    </div>
  );
}
