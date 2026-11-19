"use server";
import { api, ApiError } from "../lib/session";
import type { MsgConfig } from "../lib/messaging";

type Res = { ok?: true; error?: string };
async function call(path: string, method: string, body?: unknown): Promise<Res> {
  try {
    await api(path, { method, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    return { ok: true };
  } catch (e) { if (e instanceof ApiError) return { error: e.message }; throw e; }
}

export async function saveMessagingConfig(c: MsgConfig): Promise<Res> {
  return call("/messaging/config", "PATCH", c);
}
export async function sendTestMessage(channel: string, to: string): Promise<Res> {
  return call("/messaging/test", "POST", { channel, to });
}
export async function retryMessage(id: number): Promise<Res> {
  return call(`/messages/${id}/retry`, "POST");
}
export async function markMessageSent(id: number): Promise<Res> {
  return call(`/messages/${id}/sent`, "POST");
}
