"use server";
import { redirect } from "next/navigation";
import { api, ApiError } from "../lib/session";
import type { AdminCategory, ProductPayload } from "../lib/catalog";

export async function saveProduct(id: number | null, payload: ProductPayload): Promise<{ ok?: true; id?: number; error?: string }> {
  try {
    const p = await api<{ id: number }>(id ? `/products/${id}` : "/products", { method: id ? "PUT" : "POST", body: JSON.stringify(payload) });
    return { ok: true, id: p.id };
  } catch (e) { if (e instanceof ApiError) return { error: e.message }; throw e; }
}

export async function createCategory(name: string): Promise<{ category?: AdminCategory; error?: string }> {
  try {
    return { category: await api<AdminCategory>("/categories", { method: "POST", body: JSON.stringify({ name }) }) };
  } catch (e) { if (e instanceof ApiError) return { error: e.message }; throw e; }
}

export async function deleteProduct(id: number): Promise<{ error?: string }> {
  try {
    await api(`/products/${id}`, { method: "DELETE" });
  } catch (e) { if (e instanceof ApiError) return { error: e.message }; throw e; }
  redirect("/products");
}
