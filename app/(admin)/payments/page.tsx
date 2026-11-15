import { api } from "../../../lib/session";
import type { Me } from "../../../lib/types";
import type { PaymentSettingsDTO } from "../../../lib/commerce";
import PaymentsManager from "../../../components/PaymentsManager";

export const dynamic = "force-dynamic";

export default async function Page() {
  const me = await api<Me>("/me");
  if (me.role !== "OWNER") return <p>Only the owner can change this.</p>;
  const data = await api<PaymentSettingsDTO>("/payments");
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="font-serif text-4xl">Payments</h1>
        <p className="mt-2 text-sm text-claret/70">How customers can pay, and the till, paybill or Pochi la Biashara they pay to.</p>
      </div>
      <PaymentsManager initial={data} />
    </div>
  );
}
