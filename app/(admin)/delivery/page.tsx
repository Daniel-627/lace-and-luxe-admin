import { api } from "../../../lib/session";
import type { Me } from "../../../lib/types";
import type { DeliveryServiceDTO } from "../../../lib/commerce";
import DeliveryManager from "../../../components/DeliveryManager";

export const dynamic = "force-dynamic";

export default async function Page() {
  const me = await api<Me>("/me");
  if (me.role !== "OWNER") return <p>Only the owner can change this.</p>;
  const data = await api<DeliveryServiceDTO[]>("/delivery");
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="font-serif text-4xl">Delivery</h1>
        <p className="mt-2 text-sm text-claret/70">Your delivery services and what each charges, by county and by town or estate. Customers choose from the services that reach their location.</p>
      </div>
      <DeliveryManager services={data} />
    </div>
  );
}
