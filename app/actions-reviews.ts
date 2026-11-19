"use server";
import { api, ApiError } from "../lib/session";
import type { SizeGuide } from "../lib/content";

type Res = { ok?: true; error?: string };
async function call(path: string, method: string, body: unknown): Promise<Res> {
  try { await api(path, { method, body: JSON.stringify(body) }); return { ok: true }; }
  catch (e) { if (e instanceof ApiError) return { error: e.message }; throw e; }
}

export async function moderateReview(id: number, patch: { status?: string; reply?: string | null }): Promise<Res> {
  return call(`/reviews/${id}`, "PATCH", patch);
}
export async function saveSizeGuide(g: SizeGuide): Promise<Res> {
  return call("/size-guide", "PUT", g);
}
