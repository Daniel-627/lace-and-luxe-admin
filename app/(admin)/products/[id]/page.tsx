import { notFound } from "next/navigation";
import { api, ApiError } from "../../../../lib/session";
import type { Me } from "../../../../lib/types";
import type { AdminCategory, AdminProduct } from "../../../../lib/catalog";
import ProductForm from "../../../../components/ProductForm";

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = await api<Me>("/me");
  let product: AdminProduct;
  try {
    product = await api<AdminProduct>(`/products/${id}`);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 400)) notFound();
    throw e;
  }
  const categories = await api<AdminCategory[]>("/categories");
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-4xl">{product.name}</h1>
      <ProductForm key={product.id} product={product} categories={categories} canDelete={me.role === "OWNER"} />
    </div>
  );
}
