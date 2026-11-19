import { api } from "../../../lib/session";
import type { Me } from "../../../lib/types";
import type { CategoryRow } from "../../../lib/reports";
import { SHOP_MENU_SLOTS } from "../../../lib/catalog";
import CategoriesManager from "../../../components/CategoriesManager";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [me, categories] = await Promise.all([api<Me>("/me"), api<CategoryRow[]>("/categories")]);
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-serif text-4xl">Categories</h1>
        <p className="mt-2 text-sm text-claret/70">Categories group your products in the shop. Use the arrows to choose the order: the first {SHOP_MENU_SLOTS} appear in the shop menu and the rest go under &ldquo;More&rdquo;. Every category is listed on the shop&apos;s All categories page. A category only shows once it has products, and can only be deleted when it is empty. Renaming keeps its web address.</p>
      </div>
      <CategoriesManager categories={categories} owner={me.role === "OWNER"} />
    </div>
  );
}
