"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_BASE, ApiError, COOKIE, api } from "../lib/session";

export async function login(fd: FormData): Promise<{ error: string }> {
  const res = await fetch(`${API_BASE}/api/admin/login`, {
    method: "POST", cache: "no-store", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: String(fd.get("email") ?? ""), password: String(fd.get("password") ?? "") }),
  }).catch(() => null);
  if (!res) return { error: "Can't reach the server. If it was asleep, wait a minute and try again." };
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: (data as { error?: string }).error ?? "Could not sign in" };
  cookies().set(COOKIE, (data as { token: string }).token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 12 * 3600,
  });
  redirect("/");
}

export async function logout(): Promise<void> {
  const token = cookies().get(COOKIE)?.value;
  if (token) await fetch(`${API_BASE}/api/admin/logout`, { method: "POST", cache: "no-store", headers: { Authorization: `Bearer ${token}` } }).catch(() => null);
  cookies().delete(COOKIE);
  redirect("/login");
}

export async function saveWhatsapp(number: string): Promise<{ ok?: true; number?: string; error?: string }> {
  try {
    const d = await api<{ whatsappNumber: string }>("/settings", { method: "PATCH", body: JSON.stringify({ whatsappNumber: number }) });
    return { ok: true, number: d.whatsappNumber };
  } catch (e) { if (e instanceof ApiError) return { error: e.message }; throw e; }
}

export async function changePassword(current: string, next: string): Promise<{ ok?: true; error?: string }> {
  try {
    await api("/password", { method: "POST", body: JSON.stringify({ current, next }) });
    return { ok: true };
  } catch (e) { if (e instanceof ApiError) return { error: e.message }; throw e; }
}
