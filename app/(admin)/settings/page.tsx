import { api } from "../../../lib/session";
import type { Me } from "../../../lib/types";
import WhatsappForm from "../../../components/WhatsappForm";

export default async function Settings() {
  const me = await api<Me>("/me");
  if (me.role !== "OWNER") return <p>Only the owner can change settings.</p>;
  const s = await api<{ whatsappNumber: string | null }>("/settings");
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-4xl">Settings</h1>
      <WhatsappForm initial={s.whatsappNumber ?? ""} />
    </div>
  );
}
