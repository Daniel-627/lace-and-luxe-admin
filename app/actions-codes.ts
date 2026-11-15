"use server";
import { api, ApiError } from "../lib/session";

export async function revealCode(id: number): Promise<{ code?: string; phone?: string; error?: string }> {
  try {
    return await api<{ code: string; phone: string }>(`/login-codes/${id}/reveal`, { method: "POST" });
  } catch (e) { if (e instanceof ApiError) return { error: e.message }; throw e; }
}

export async function saveManualCodes(enabled: boolean): Promise<{ ok?: true; error?: string }> {
  try {
    await api("/settings", { method: "PATCH", body: JSON.stringify({ manualCodes: enabled }) });
    return { ok: true };
  } catch (e) { if (e instanceof ApiError) return { error: e.message }; throw e; }
}
