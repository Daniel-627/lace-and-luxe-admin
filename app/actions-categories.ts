"use server";
import { api, ApiError } from "../lib/session";

type Res = { ok?: true; error?: string };
async function call(path: string, method: string, body?: unknown): Promise<Res> {
  try {
    await api(path, { method, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    return { ok: true };
  } catch (e) { if (e instanceof ApiError) return { error: e.message }; throw e; }
}

export async function createCategory(name: string): Promise<Res> {
  return call("/categories", "POST", { name });
}
export async function renameCategory(id: number, name: string): Promise<Res> {
  return call(`/categories/${id}`, "PATCH", { name });
}
export async function deleteCategory(id: number): Promise<Res> {
  return call(`/categories/${id}`, "DELETE");
}
export async function saveCategoryOrder(slugs: string[]): Promise<Res> {
  return call("/categories/order", "PUT", { slugs });
}
