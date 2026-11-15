"use server";
import { api, ApiError } from "../lib/session";

type Res = { ok?: true; error?: string };

async function call(path: string, method: string, body?: unknown): Promise<Res> {
  try {
    await api(path, { method, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    return { ok: true };
  } catch (e) { if (e instanceof ApiError) return { error: e.message }; throw e; }
}

export interface ServicePayload {
  name: string; description: string; etaText: string; active: boolean; allowsCod: boolean;
  rates: { county: string; area: string | null; fee: number; freeAbove: number | null; etaText: string | null }[];
}
export const saveService = (id: number | null, p: ServicePayload) => call(id ? `/delivery/${id}` : "/delivery", id ? "PUT" : "POST", p);
export const deleteService = (id: number) => call(`/delivery/${id}`, "DELETE");

export const savePaymentSettings = (p: { stk: boolean; cod: boolean; holdMinutes: number }) => call("/payments", "PATCH", p);
export interface AccountPayload { kind: string; displayName: string; number: string; accountNumber: string | null; useOrderRef: boolean; active: boolean }
export const saveAccount = (id: number | null, p: AccountPayload) => call(id ? `/payments/accounts/${id}` : "/payments/accounts", id ? "PUT" : "POST", p);
export const deleteAccount = (id: number) => call(`/payments/accounts/${id}`, "DELETE");

export interface DiscountPayload {
  code: string; description: string; kind: string; value: number; minSubtotal: number;
  startsAt: string; endsAt: string; maxUses: number | null; active: boolean;
}
export const saveDiscount = (id: number | null, p: DiscountPayload) => call(id ? `/discounts/${id}` : "/discounts", id ? "PUT" : "POST", p);
export const deleteDiscount = (id: number) => call(`/discounts/${id}`, "DELETE");
