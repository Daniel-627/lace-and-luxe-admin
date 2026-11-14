"use server";
import { api, ApiError } from "../lib/session";

export async function addStaff(email: string, name: string, role: string): Promise<{ email?: string; temporaryPassword?: string; error?: string }> {
  try {
    const s = await api<{ email: string; temporaryPassword: string }>("/staff", { method: "POST", body: JSON.stringify({ email, name, role }) });
    return { email: s.email, temporaryPassword: s.temporaryPassword };
  } catch (e) { if (e instanceof ApiError) return { error: e.message }; throw e; }
}

export async function updateStaff(id: number, patch: { active?: boolean; role?: string; resetPassword?: boolean }): Promise<{ ok?: true; email?: string; temporaryPassword?: string; error?: string }> {
  try {
    const s = await api<{ email: string; temporaryPassword?: string }>(`/staff/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
    return { ok: true, email: s.email, temporaryPassword: s.temporaryPassword };
  } catch (e) { if (e instanceof ApiError) return { error: e.message }; throw e; }
}
