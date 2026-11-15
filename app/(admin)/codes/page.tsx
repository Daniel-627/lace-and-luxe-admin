import Link from "next/link";
import { api } from "../../../lib/session";
import type { Me } from "../../../lib/types";
import type { LoginCodeRow } from "../../../lib/codes";
import CodesList from "../../../components/CodesList";

export const dynamic = "force-dynamic";

export default async function Codes() {
  const [me, data] = await Promise.all([api<Me>("/me"), api<{ manualMode: boolean; codes: LoginCodeRow[] }>("/login-codes")]);
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-serif text-4xl">Sign-in codes</h1>
        <p className="mt-2 text-sm text-claret/70">When a customer asks for a sign-in code and their text doesn&apos;t arrive, show the code here and send it to that same number on WhatsApp. Codes last 10 minutes. This page refreshes by itself.</p>
      </div>
      {!data.manualMode && (
        <div className="rounded-2xl border border-champagne/40 bg-white/60 p-5 text-sm">
          <p className="font-medium">Manual codes are switched off, so new codes can&apos;t be shown here.</p>
          <p className="mt-1 text-claret/70">{me.role === "OWNER" ? <>Switch them on in <Link href="/settings" className="underline">Settings</Link>.</> : "Ask the owner to switch them on in Settings."}</p>
        </div>
      )}
      <CodesList codes={data.codes} />
    </div>
  );
}
