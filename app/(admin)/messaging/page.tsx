import { api } from "../../../lib/session";
import type { Me } from "../../../lib/types";
import type { CategoryInfo, ChannelKey, ChannelStatus, MsgConfig } from "../../../lib/messaging";
import MessagingSettings from "../../../components/MessagingSettings";

export const dynamic = "force-dynamic";

export default async function Messaging() {
  const me = await api<Me>("/me");
  if (me.role !== "OWNER") return <p>Only the owner can change messaging.</p>;
  const d = await api<{ config: MsgConfig; channels: Record<ChannelKey, ChannelStatus>; categories: CategoryInfo[] }>("/messaging/config");
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-serif text-4xl">Messaging</h1>
        <p className="mt-2 text-sm text-claret/70">How WhatsApp, SMS and email are used to tell customers about their orders and to alert your team, and what happens when one doesn&apos;t work.</p>
      </div>
      <MessagingSettings initial={d.config} channels={d.channels} categories={d.categories} />
    </div>
  );
}
