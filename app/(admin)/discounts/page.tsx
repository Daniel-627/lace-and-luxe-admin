import { api } from "../../../lib/session";
import type { Me } from "../../../lib/types";
import type { DiscountDTO } from "../../../lib/commerce";
import DiscountsManager from "../../../components/DiscountsManager";

export const dynamic = "force-dynamic";

export default async function Page() {
  const me = await api<Me>("/me");
  if (me.role !== "OWNER") return <p>Only the owner can change this.</p>;
  const data = await api<DiscountDTO[]>("/discounts");
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="font-serif text-4xl">Discount codes</h1>
        <p className="mt-2 text-sm text-claret/70">Codes customers can type at checkout.</p>
      </div>
      <DiscountsManager codes={data} />
    </div>
  );
}
