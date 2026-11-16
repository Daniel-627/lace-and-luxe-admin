export type ChannelKey = "whatsapp" | "sms" | "email";
export const CHANNEL_KEYS: ChannelKey[] = ["whatsapp", "sms", "email"];
export const CHANNEL_LABEL: Record<ChannelKey, string> = { whatsapp: "WhatsApp", sms: "SMS", email: "Email" };
export interface StaffRecipient { name: string; phone: string; email: string }
export interface MsgConfig { channels: Record<ChannelKey, boolean>; chains: Record<string, ChannelKey[]>; templates: Record<string, string>; waLanguage: string; staff: StaffRecipient[]; customerMessages: boolean; staffAlerts: boolean }
export interface CategoryInfo { key: string; label: string; audience: "CUSTOMER" | "STAFF"; description: string; params: string[]; defaultChain: ChannelKey[] }
export interface ChannelStatus { configured: boolean; hint: string }
export interface MessageRow {
  id: number; category: string; audience: string; toPhone: string | null; toEmail: string | null; subject: string | null; body: string;
  status: string; channel: string | null; attempts: number; lastError: string | null; trail: { channel: string; ok: boolean; error?: string; at: string }[] | null;
  createdAt: string; sentAt: string | null;
}
