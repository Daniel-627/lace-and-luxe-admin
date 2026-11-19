"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCategory, deleteCategory, renameCategory, saveCategoryOrder } from "../app/actions-categories";
import { SHOP_MENU_SLOTS } from "../lib/catalog";
import type { CategoryRow } from "../lib/reports";

const box = "w-full rounded-lg border border-champagne/60 bg-white/70 p-2.5 text-sm";

function Row({ c, i, total, inMenu, owner, move }: { c: CategoryRow; i: number; total: number; inMenu: boolean; owner: boolean; move: (i: number, d: number) => Promise<string | null> }) {
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
  async function go(d: number) { setBusy(true); const e = await move(i, d); setBusy(false); if (e) setMsg(e); }

  return (
    <li className="space-y-2 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          <button disabled={busy || i === 0} onClick={() => void go(-1)} aria-label={`Move ${c.name} up`} className="rounded-full border border-claret/30 px-3 py-1 text-sm disabled:opacity-30">↑</button>
          <button disabled={busy || i === total - 1} onClick={() => void go(1)} aria-label={`Move ${c.name} down`} className="rounded-full border border-claret/30 px-3 py-1 text-sm disabled:opacity-30">↓</button>
        </div>
        <input className={`${box} min-w-0 flex-1 sm:max-w-xs`} value={name} onChange={(e) => setName(e.target.value)} aria-label={`Name of ${c.name}`} />
        <button disabled={busy || name.trim() === c.name || name.trim().length < 2} onClick={() => void rename()} className="rounded-full border border-claret px-4 py-1.5 text-sm disabled:opacity-40">Rename</button>
        {owner && <button disabled={busy} onClick={() => void remove()} className="ml-auto text-sm underline disabled:opacity-40">Delete</button>}
      </div>
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-claret/60">
        <span>{n} {n === 1 ? "product" : "products"} · link name: {c.slug}</span>
        {n === 0 ? <span className="rounded-full bg-rose/25 px-2 py-0.5 uppercase tracking-[0.1em]">Not shown (empty)</span>
          : <span className={`rounded-full px-2 py-0.5 uppercase tracking-[0.1em] ${inMenu ? "bg-claret text-ivory" : "bg-rose/25 text-claret"}`}>{inMenu ? "In the shop menu" : "Under \u201cMore\u201d"}</span>}
      </p>
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

  async function move(i: number, d: number): Promise<string | null> {
    const j = i + d; if (j < 0 || j >= categories.length) return null;
    const slugs = categories.map((c) => c.slug);
    [slugs[i], slugs[j]] = [slugs[j], slugs[i]];
    const r = await saveCategoryOrder(slugs);
    if (r.ok) { router.refresh(); return null; }
    return r.error ?? "Could not reorder";
  }

  // Only categories that have products appear in the shop, so count menu slots among those.
  let shown = 0;
  const inMenu = categories.map((c) => (c._count.products > 0 ? ++shown <= SHOP_MENU_SLOTS : false));

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-champagne/40 bg-white/60 p-5">
        <label className="mb-1 block text-sm font-medium">New category</label>
        <div className="flex flex-wrap gap-3">
          <input className={`${box} min-w-0 flex-1 sm:max-w-xs`} value={name} placeholder="e.g. Swimwear" onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") void add(); }} />
          <button disabled={busy} onClick={() => void add()} className="rounded-full bg-claret px-6 py-2.5 text-sm text-ivory disabled:opacity-50">{busy ? "Adding…" : "Add category"}</button>
        </div>
        {msg && <p className="mt-2 text-sm">{msg}</p>}
      </div>
      {categories.length === 0 ? <p className="text-claret/70">No categories yet.</p> : (
        <ul className="divide-y divide-champagne/30 rounded-2xl border border-champagne/40 bg-white/60">
          {categories.map((c, i) => <Row key={`${c.id}:${c.name}`} c={c} i={i} total={categories.length} inMenu={inMenu[i]} owner={owner} move={move} />)}
        </ul>
      )}
    </div>
  );
}
