"use server";
import { api, ApiError } from "../lib/session";

type Res = { ok?: true; error?: string };

export async function updateOrder(id: number, patch: { fulfilment?: string; notes?: string; markPaid?: boolean; method?: string; mpesaReceipt?: string }): Promise<Res> {
  try {
    await api(`/orders/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
    return { ok: true };
  } catch (e) { if (e instanceof ApiError) return { error: e.message }; throw e; }
}

export async function updateLeadStatus(id: number, status: string): Promise<Res> {
  try {
    await api(`/leads/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    return { ok: true };
  } catch (e) { if (e instanceof ApiError) return { error: e.message }; throw e; }
}

export interface ConvertInput {
  name: string; phone: string; email?: string;
  delivery: { name?: string; phone?: string; county: string; area: string; details?: string };
  paid: boolean; method: string; mpesaReceipt?: string;
}

export async function convertLead(id: number, input: ConvertInput): Promise<{ orderId?: number; error?: string }> {
  try {
    const o = await api<{ id: number }>(`/leads/${id}/convert`, { method: "POST", body: JSON.stringify(input) });
    return { orderId: o.id };
  } catch (e) { if (e instanceof ApiError) return { error: e.message }; throw e; }
}
