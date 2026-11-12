import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const COOKIE = "ll_admin";
export const API_BASE = process.env.API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

/** Server-side call to the admin API using the staff token from the httpOnly cookie. */
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = cookies().get(COOKIE)?.value;
  const res = await fetch(`${API_BASE}/api/admin${path}`, {
    ...init,
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init.headers },
  });
  if (res.status === 401) redirect("/login");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, (data as { error?: string }).error ?? "Request failed");
  return data as T;
}
