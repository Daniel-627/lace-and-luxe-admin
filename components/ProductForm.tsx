"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { uploadPhoto } from "./ImageField";
import { createCategory, deleteProduct, saveProduct } from "../app/actions-products";
import { COLOUR_HEX, type AdminCategory, type AdminProduct, type ProductPayload } from "../lib/catalog";

interface MediaRow { key: string; kind: "IMAGE" | "VIDEO"; url: string; colour: string }
interface Row { key: string; id?: number; sku?: string; size: string; colour: string; colourHex: string; price: string; stock: string }
const rk = () => Math.random().toString(36).slice(2, 9);
const box = "w-full rounded-lg border border-champagne/60 bg-white/70 p-2.5 text-sm";
const split = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

export default function ProductForm({ product, categories: initialCats, canDelete }: { product?: AdminProduct; categories: AdminCategory[]; canDelete: boolean }) {
  const router = useRouter();
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [media, setMedia] = useState<MediaRow[]>(
    !product ? [] : product.media.length
      ? product.media.map((m) => ({ key: rk(), kind: m.kind, url: m.url, colour: m.colour ?? "" }))
      : product.image ? [{ key: rk(), kind: "IMAGE" as const, url: product.image, colour: "" }] : []);
  const [videoUrl, setVideoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState(initialCats);
  const [categoryId, setCategoryId] = useState<number | null>(product?.categoryId ?? null);
  const [newCat, setNewCat] = useState("");
  const [active, setActive] = useState(product?.active ?? true);
  const [payNow, setPayNow] = useState(product?.payNow ?? true);
  const [payOnDelivery, setPayOnDelivery] = useState(product?.payOnDelivery ?? false);
  const [rows, setRows] = useState<Row[]>((product?.variants ?? []).map((v) => ({ key: rk(), id: v.id, sku: v.sku, size: v.size, colour: v.colour, colourHex: v.colourHex ?? "", price: String(v.price), stock: String(v.stock) })));
  const [q, setQ] = useState({ colours: "", sizes: "", price: "", stock: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const setRow = (key: string, p: Partial<Row>) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...p } : r)));
  const setHexFor = (colour: string, hex: string) => setRows((rs) => rs.map((r) => (r.colour.toLowerCase() === colour.toLowerCase() ? { ...r, colourHex: hex } : r)));

  function quickAdd() {
    const colours = split(q.colours), sizes = split(q.sizes);
    if (!colours.length || !sizes.length) return setMsg({ ok: false, text: "Type at least one colour and one size, separated by commas." });
    if (!/^\d+$/.test(q.price) || Number(q.price) < 1) return setMsg({ ok: false, text: "Type a price for the new rows (whole shillings)." });
    const have = new Set(rows.map((r) => `${r.size.toLowerCase()}|${r.colour.toLowerCase()}`));
    const added: Row[] = [];
    for (const colour of colours) for (const size of sizes) {
      if (have.has(`${size.toLowerCase()}|${colour.toLowerCase()}`)) continue;
      const known = rows.find((r) => r.colour.toLowerCase() === colour.toLowerCase())?.colourHex;
      added.push({ key: rk(), size, colour, colourHex: known ?? COLOUR_HEX[colour.toLowerCase()] ?? "", price: q.price, stock: /^\d+$/.test(q.stock) ? q.stock : "0" });
    }
    setRows((rs) => [...rs, ...added]); setMsg(null);
  }

  async function addCategory() {
    if (newCat.trim().length < 2) return;
    const r = await createCategory(newCat.trim());
    if (r.category) { setCategories([...categories, r.category]); setCategoryId(r.category.id); setNewCat(""); }
    else setMsg({ ok: false, text: r.error ?? "Could not add the category" });
  }

  async function save() {
    setMsg(null);
    if (name.trim().length < 2) return setMsg({ ok: false, text: "Give the product a name." });
    if (rows.length === 0) return setMsg({ ok: false, text: "Add at least one size and colour." });
    if (!payNow && !payOnDelivery) return setMsg({ ok: false, text: "Allow at least one way to pay." });
    const seen = new Set<string>();
    const variants: ProductPayload["variants"] = [];
    for (const [i, r] of rows.entries()) {
      const n = `Row ${i + 1}`;
      if (!r.size.trim() || !r.colour.trim()) return setMsg({ ok: false, text: `${n}: size and colour are needed.` });
      const sig = `${r.size.trim().toLowerCase()}|${r.colour.trim().toLowerCase()}`;
      if (seen.has(sig)) return setMsg({ ok: false, text: `${n}: ${r.size} ${r.colour} appears twice.` });
      seen.add(sig);
      const price = Number(r.price), stock = Number(r.stock);
      if (!Number.isInteger(price) || price < 1) return setMsg({ ok: false, text: `${n}: price must be a whole number of shillings.` });
      if (!Number.isInteger(stock) || stock < 0) return setMsg({ ok: false, text: `${n}: stock must be 0 or more.` });
      variants.push({ ...(r.id ? { id: r.id } : {}), ...(r.sku ? { sku: r.sku } : {}), size: r.size.trim(), colour: r.colour.trim(), colourHex: /^#[0-9a-fA-F]{6}$/.test(r.colourHex) ? r.colourHex : null, price, stock });
    }
    const have = new Set(rows.map((r) => r.colour.trim().toLowerCase()));
    const orphan = media.find((m) => m.colour && !have.has(m.colour.toLowerCase()));
    if (orphan) return setMsg({ ok: false, text: `A ${orphan.kind === "VIDEO" ? "video" : "photo"} is set for "${orphan.colour}", which has no sizes yet.` });
    setBusy(true);
    const res = await saveProduct(product?.id ?? null, { name: name.trim(), ...(slug.trim() ? { slug: slug.trim() } : {}), description, media: media.map((m) => ({ kind: m.kind, url: m.url, colour: m.colour || null })), categoryId, active, payNow, payOnDelivery, variants });
    setBusy(false);
    if (!res.ok) return setMsg({ ok: false, text: res.error ?? "Could not save" });
    setMsg({ ok: true, text: "Saved. The shop shows it within about a minute." });
    if (!product && res.id) router.push(`/products/${res.id}`);
    else router.refresh();
  }

  async function remove() {
    if (!product || !confirm(`Delete "${product.name}" for good? Hiding it is usually better.`)) return;
    const r = await deleteProduct(product.id);
    if (r?.error) setMsg({ ok: false, text: r.error });
  }

  const colourOptions = Array.from(new Set(rows.map((r) => r.colour.trim()).filter(Boolean)));
  const thumb = (u: string) => (u.includes("cdn.sanity.io") ? `${u}?w=300&auto=format` : u);

  async function addPhotos(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true); setMsg(null);
    try {
      for (const f of Array.from(files)) {
        const url = await uploadPhoto(f);
        setMedia((m) => [...m, { key: rk(), kind: "IMAGE", url, colour: "" }]);
      }
    } catch (e) { setMsg({ ok: false, text: e instanceof Error ? e.message : "Upload failed" }); }
    finally { setUploading(false); }
  }

  function addVideo() {
    const u = videoUrl.trim();
    if (!/^https:\/\//i.test(u)) return setMsg({ ok: false, text: "A video link must start with https://" });
    setMedia((m) => [...m, { key: rk(), kind: "VIDEO", url: u, colour: "" }]);
    setVideoUrl(""); setMsg(null);
  }

  const moveMedia = (i: number, d: number) => setMedia((m) => {
    const j = i + d; if (j < 0 || j >= m.length) return m;
    const next = [...m]; [next[i], next[j]] = [next[j], next[i]]; return next;
  });

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/products" className="text-sm underline">← All products</Link>
        {canDelete && product && <button onClick={remove} className="text-sm underline">Delete product</button>}
      </div>

      <section className="grid gap-6">
        <div className="space-y-4">
          <div><label className="mb-1 block text-sm font-medium">Name</label><input className={box} value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><label className="mb-1 block text-sm font-medium">Description</label><textarea className={box} rows={4} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div>
            <label className="mb-1 block text-sm font-medium">Category</label>
            <select className={box} value={categoryId ?? ""} onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}>
              <option value="">No category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div className="mt-2 flex gap-2">
              <input className={box} placeholder="Or add a new category" value={newCat} onChange={(e) => setNewCat(e.target.value)} />
              <button type="button" onClick={addCategory} className="shrink-0 rounded-full border border-claret px-4 text-sm">Add</button>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Show in the shop <span className="text-claret/60">(untick to hide without deleting)</span></label>
          <div className="space-y-1 rounded-xl border border-champagne/40 bg-white/60 p-3">
            <p className="text-sm font-medium">How customers can pay for this product</p>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={payNow} onChange={(e) => setPayNow(e.target.checked)} /> Pay now (M-Pesa)</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={payOnDelivery} onChange={(e) => setPayOnDelivery(e.target.checked)} /> Pay on delivery</label>
            <p className="text-xs text-claret/60">If a customer&apos;s basket has several products, they only see the options every product allows.</p>
          </div>
          <div><label className="mb-1 block text-sm font-medium">Web address (optional)</label><input className={box} value={slug} placeholder="Made from the name if empty" onChange={(e) => setSlug(e.target.value)} /></div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-2xl">Sizes, colours, prices and stock</h2>
        <div className="space-y-3 rounded-2xl border border-dashed border-champagne p-4">
          <p className="text-sm font-medium">Quick add</p>
          <p className="text-xs text-claret/60">Type colours and sizes separated by commas. One row is made for each combination you don&apos;t have yet.</p>
          <div className="grid gap-3 md:grid-cols-4">
            <input className={box} placeholder="Colours: Black, Nude" value={q.colours} onChange={(e) => setQ({ ...q, colours: e.target.value })} />
            <input className={box} placeholder="Sizes: S, M, L" value={q.sizes} onChange={(e) => setQ({ ...q, sizes: e.target.value })} />
            <input className={box} inputMode="numeric" placeholder="Price (KES)" value={q.price} onChange={(e) => setQ({ ...q, price: e.target.value })} />
            <input className={box} inputMode="numeric" placeholder="Stock each" value={q.stock} onChange={(e) => setQ({ ...q, stock: e.target.value })} />
          </div>
          <button type="button" onClick={quickAdd} className="rounded-full border border-claret px-5 py-2 text-sm">Add these rows</button>
        </div>

        {rows.length > 0 && (
          <div className="space-y-2">
            <div className="hidden grid-cols-[1fr_1fr_auto_1fr_1fr_auto] gap-2 px-1 text-xs uppercase tracking-[0.12em] text-claret/60 md:grid"><span>Size</span><span>Colour</span><span>Swatch</span><span>Price (KES)</span><span>Stock</span><span /></div>
            {rows.map((r) => (
              <div key={r.key} className="grid grid-cols-2 items-center gap-2 rounded-xl border border-champagne/40 bg-white/60 p-2 md:grid-cols-[1fr_1fr_auto_1fr_1fr_auto]">
                <input className={box} aria-label="Size" placeholder="Size" value={r.size} onChange={(e) => setRow(r.key, { size: e.target.value })} />
                <input className={box} aria-label="Colour" placeholder="Colour" value={r.colour} onChange={(e) => setRow(r.key, { colour: e.target.value })} />
                <input type="color" aria-label="Swatch colour" className="h-10 w-12 cursor-pointer rounded border border-champagne/60 bg-white" value={/^#[0-9a-fA-F]{6}$/.test(r.colourHex) ? r.colourHex : "#c99a9a"} onChange={(e) => setHexFor(r.colour, e.target.value)} />
                <input className={box} aria-label="Price" inputMode="numeric" placeholder="Price" value={r.price} onChange={(e) => setRow(r.key, { price: e.target.value })} />
                <input className={box} aria-label="Stock" inputMode="numeric" placeholder="Stock" value={r.stock} onChange={(e) => setRow(r.key, { stock: e.target.value })} />
                <button type="button" onClick={() => setRows(rows.filter((x) => x.key !== r.key))} className="text-sm underline">Remove</button>
              </div>
            ))}
          </div>
        )}
        <button type="button" onClick={() => setRows([...rows, { key: rk(), size: "", colour: rows.at(-1)?.colour ?? "", colourHex: rows.at(-1)?.colourHex ?? "", price: rows.at(-1)?.price ?? "", stock: "0" }])} className="rounded-full border border-claret px-5 py-2 text-sm">+ Add one row</button>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-2xl">Photos and video</h2>
        <p className="text-sm text-claret/70">The first photo is the cover in the shop&apos;s lists. Set a colour on a photo to show it only when customers choose that colour. Photos set to &quot;All colours&quot; always show.</p>
        {media.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {media.map((m, i) => (
              <div key={m.key} className="space-y-2 rounded-xl border border-champagne/40 bg-white/60 p-3">
                <div className="aspect-[3/4] overflow-hidden rounded-lg bg-rose/20">
                  {m.kind === "IMAGE"
                    ? <img src={thumb(m.url)} alt="" className="h-full w-full object-cover" />
                    : <div className="flex h-full flex-col items-center justify-center gap-2 break-all p-3 text-center text-xs"><span className="text-2xl">▶</span>Video<span className="text-claret/60">{m.url}</span></div>}
                </div>
                <select className={box} value={m.colour} onChange={(e) => setMedia(media.map((x) => (x.key === m.key ? { ...x, colour: e.target.value } : x)))}>
                  <option value="">All colours</option>
                  {colourOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                  {m.colour && !colourOptions.some((c) => c.toLowerCase() === m.colour.toLowerCase()) && <option value={m.colour}>{m.colour} (no sizes yet)</option>}
                </select>
                <div className="flex justify-between text-sm">
                  <span className="flex gap-2">
                    <button type="button" disabled={i === 0} onClick={() => moveMedia(i, -1)} aria-label="Move earlier" className="rounded-full border border-claret/30 px-3 disabled:opacity-30">←</button>
                    <button type="button" disabled={i === media.length - 1} onClick={() => moveMedia(i, 1)} aria-label="Move later" className="rounded-full border border-claret/30 px-3 disabled:opacity-30">→</button>
                  </span>
                  <button type="button" onClick={() => setMedia(media.filter((x) => x.key !== m.key))} className="underline">Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
        <label className="inline-block cursor-pointer rounded-full border border-claret px-5 py-2 text-sm">
          {uploading ? "Uploading…" : "+ Add photos"}
          <input type="file" accept="image/*" multiple className="hidden" disabled={uploading} onChange={(e) => { void addPhotos(e.target.files); e.target.value = ""; }} />
        </label>
        <div className="flex gap-2">
          <input className={box} placeholder="Video link: YouTube, Vimeo or a direct .mp4 link" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
          <button type="button" onClick={addVideo} className="shrink-0 rounded-full border border-claret px-5 text-sm">Add video</button>
        </div>
      </section>

      <div className="sticky bottom-4 flex flex-wrap items-center gap-4 rounded-2xl bg-claret p-4 text-ivory">
        <button onClick={save} disabled={busy} className="rounded-full bg-champagne px-8 py-2.5 text-sm text-claret disabled:opacity-50">{busy ? "Saving…" : product ? "Save changes" : "Create product"}</button>
        {msg && <span className="text-sm">{msg.text}</span>}
      </div>
    </div>
  );
}
