import { api } from "../../../lib/session";
import type { Me } from "../../../lib/types";
import type { CategoryRow } from "../../../lib/reports";
import CategoriesManager from "../../../components/CategoriesManager";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [me, categories] = await Promise.all([api<Me>("/me"), api<CategoryRow[]>("/categories")]);
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-serif text-4xl">Categories</h1>
        <p className="mt-2 text-sm text-claret/70">Categories group your products in the shop. Renaming one keeps its web address, so links on the shop menu keep working. A category can only be deleted once it has no products.</p>
      </div>
      <CategoriesManager categories={categories} owner={me.role === "OWNER"} />
      <p className="text-xs text-claret/60">The shop menu shows fixed links (Bras, Panties, Lingerie sets, Sleepwear, For him). A new category appears in the shop&apos;s filters, but it only gets a menu link when one is added in the shop&apos;s code.</p>
    </div>
  );
}
