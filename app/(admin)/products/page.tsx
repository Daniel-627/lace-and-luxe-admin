import Link from "next/link";
import { api } from "../../../lib/session";
import { kes } from "../../../lib/format";
import type { AdminProduct } from "../../../lib/catalog";

export const dynamic = "force-dynamic";
const box = "w-full rounded-lg border border-champagne/60 bg-white/70 p-2.5 text-sm";

type View = "all" | "selling" | "soldout" | "hidden";
const stockOf = (p: AdminProduct) => p.variants.reduce((s, v) => s + v.stock, 0);
// Hidden = switched off by hand. Sold out = every size at zero (the shop then keeps or hides it, depending on the product's setting).
const viewOf = (p: AdminProduct): Exclude<View, "all"> => (!p.active ? "hidden" : stockOf(p) <= 0 ? "soldout" : "selling");

export default async function Products({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const all = await api<AdminProduct[]>("/products");
  const view: View = (["selling", "soldout", "hidden"] as const).find((v) => v === sp.show) ?? "all";
  const q = (sp.q ?? "").trim().toLowerCase();

  const counts = { all: all.length, selling: 0, soldout: 0, hidden: 0 };
  for (const p of all) counts[viewOf(p)]++;
  const products = all.filter((p) => (view === "all" || viewOf(p) === view) && (!q || p.name.toLowerCase().includes(q)));
  const tab = (v: View, text: string) => (
    <Link key={v} href={`/products?${new URLSearchParams({ ...(v !== "all" && { show: v }), ...(sp.q && { q: sp.q }) })}`}
      className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm ${view === v ? "border-claret bg-claret text-ivory" : "border-claret/30"}`}>
      {text} <span className="opacity-70">{counts[v]}</span>
    </Link>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-4xl">Products</h1>
        <Link href="/products/new" className="rounded-full bg-claret px-6 py-2.5 text-sm text-ivory">+ Add product</Link>
      </div>

      <div className="space-y-3">
        <form className="flex gap-2">
          {view !== "all" && <input type="hidden" name="show" value={view} />}
          <input name="q" defaultValue={sp.q ?? ""} placeholder="Search products" className={box} />
          <button className="shrink-0 rounded-full bg-claret px-6 text-sm text-ivory">Search</button>
        </form>
        <div className="flex gap-2 overflow-x-auto pb-1">{tab("all", "All")}{tab("selling", "Selling")}{tab("soldout", "Sold out")}{tab("hidden", "Hidden")}</div>
      </div>

      {all.length === 0 ? (
        <p className="text-claret/70">No products yet. Add your first one.</p>
      ) : products.length === 0 ? (
        <p className="text-claret/70">No products match.</p>
      ) : (
        <ul className="divide-y divide-champagne/30 rounded-2xl border border-champagne/40 bg-white/60">
          {products.map((p) => {
            const prices = p.variants.map((v) => v.price);
            const min = Math.min(...prices), max = Math.max(...prices);
            const stock = stockOf(p);
            const soldOut = p.active && stock <= 0;
            const low = p.active && stock > 0 && p.variants.some((v) => v.stock <= 3);
            const thumb = p.image && p.image.includes("cdn.sanity.io") ? `${p.image}?w=120&auto=format` : p.image;
            const price = prices.length === 0 ? "No prices" : min === max ? kes(min) : `From ${kes(min)}`;
            return (
              <li key={p.id}>
                <Link href={`/products/${p.id}`} className="flex items-center gap-3 p-3 transition hover:bg-ivory/70 sm:gap-4 sm:p-4">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-rose/20">{thumb && <img src={thumb} alt="" className="h-full w-full object-cover" />}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-serif text-xl">{p.name}</p>
                    <p className="truncate text-xs text-claret/60">{p.category?.name ?? "No category"} · {p.variants.length} {p.variants.length === 1 ? "variant" : "variants"}</p>
                    <p className="mt-0.5 text-xs text-claret/70 sm:hidden">{price} · {stock} in stock</p>
                  </div>
                  <div className="hidden text-right text-sm sm:block">
                    <p>{price}</p>
                    <p className="text-claret/60">{stock} in stock</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1 text-[11px] uppercase tracking-[0.1em]">
                    {!p.active && <span className="rounded-full bg-claret px-2 py-0.5 text-ivory">Hidden</span>}
                    {soldOut && <span className="rounded-full border border-claret px-2 py-0.5">Sold out</span>}
                    {soldOut && p.soldOutBehavior === "HIDE" && <span className="rounded-full bg-rose/25 px-2 py-0.5">Auto-hidden</span>}
                    {low && <span className="rounded-full bg-champagne px-2 py-0.5 text-claret">Low stock</span>}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      <p className="text-xs text-claret/60">&ldquo;Hidden&rdquo; means you switched it off. &ldquo;Sold out&rdquo; follows your stock: each product can either stay in the shop marked sold out, or hide itself until restocked (set on the product).</p>
    </div>
  );
}
