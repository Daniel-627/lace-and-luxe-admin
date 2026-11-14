import Link from "next/link";
import { api } from "../../../lib/session";
import { kes } from "../../../lib/format";
import type { AdminProduct } from "../../../lib/catalog";

export default async function Products() {
  const products = await api<AdminProduct[]>("/products");
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-4xl">Products</h1>
        <Link href="/products/new" className="rounded-full bg-claret px-6 py-2.5 text-sm text-ivory">+ Add product</Link>
      </div>
      {products.length === 0 ? (
        <p className="text-claret/70">No products yet. Add your first one.</p>
      ) : (
        <ul className="divide-y divide-champagne/30 rounded-2xl border border-champagne/40 bg-white/60">
          {products.map((p) => {
            const prices = p.variants.map((v) => v.price);
            const min = Math.min(...prices), max = Math.max(...prices);
            const stock = p.variants.reduce((s, v) => s + v.stock, 0);
            const low = p.variants.some((v) => v.stock <= 3);
            const thumb = p.image && p.image.includes("cdn.sanity.io") ? `${p.image}?w=120&auto=format` : p.image;
            return (
              <li key={p.id}>
                <Link href={`/products/${p.id}`} className="flex items-center gap-4 p-4 transition hover:bg-ivory/70">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-rose/20">{thumb && <img src={thumb} alt="" className="h-full w-full object-cover" />}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-serif text-xl">{p.name}</p>
                    <p className="text-xs text-claret/60">{p.category?.name ?? "No category"} · {p.variants.length} {p.variants.length === 1 ? "variant" : "variants"}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p>{prices.length === 0 ? "No prices" : min === max ? kes(min) : `From ${kes(min)}`}</p>
                    <p className="text-claret/60">{stock} in stock</p>
                  </div>
                  <div className="flex w-24 flex-col items-end gap-1 text-[11px] uppercase tracking-[0.1em]">
                    {!p.active && <span className="rounded-full bg-claret px-2 py-0.5 text-ivory">Hidden</span>}
                    {p.active && low && <span className="rounded-full bg-champagne px-2 py-0.5 text-claret">Low stock</span>}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
