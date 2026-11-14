import { api } from "../../../../lib/session";
import type { Me } from "../../../../lib/types";
import type { AdminCategory } from "../../../../lib/catalog";
import ProductForm from "../../../../components/ProductForm";

export default async function NewProduct() {
  const [me, categories] = await Promise.all([api<Me>("/me"), api<AdminCategory[]>("/categories")]);
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-4xl">Add product</h1>
      <ProductForm categories={categories} canDelete={me.role === "OWNER"} />
    </div>
  );
}
