import { api } from "../../../lib/session";
import type { SizeGuide } from "../../../lib/content";
import SizeGuideEditor from "../../../components/SizeGuideEditor";

export const dynamic = "force-dynamic";

export default async function SizeGuidePage() {
  const g = await api<SizeGuide>("/size-guide");
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-serif text-4xl">Size guide</h1>
        <p className="mt-2 text-sm text-claret/70">The page customers open from the &quot;Size guide&quot; link on every product. Add the real measurements for your own sizes, since sizing differs between brands.</p>
      </div>
      <SizeGuideEditor initial={g} />
    </div>
  );
}
