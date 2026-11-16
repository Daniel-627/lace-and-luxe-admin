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

export const saveMessagingConfig = (c: MsgConfig) => call("/messaging/config", "PATCH", c);
export const sendTestMessage = (channel: string, to: string) => call("/messaging/test", "POST", { channel, to });
export const retryMessage = (id: number) => call(`/messages/${id}/retry`, "POST");
export const markMessageSent = (id: number) => call(`/messages/${id}/sent`, "POST");
