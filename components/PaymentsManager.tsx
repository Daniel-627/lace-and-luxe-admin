"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteAccount, savePaymentSettings, saveAccount } from "../app/actions-commerce";
import { KIND_LABEL, describeAccount, type PaymentAccountDTO, type PaymentSettingsDTO } from "../lib/commerce";
import Badge from "./Badge";

const box = "w-full rounded-lg border border-champagne/60 bg-white/70 p-2.5 text-sm";

function AccountEditor({ account, onClose }: { account?: PaymentAccountDTO; onClose: () => void }) {
  const router = useRouter();
  const [kind, setKind] = useState<PaymentAccountDTO["kind"]>(account?.kind ?? "TILL");
  const [displayName, setName] = useState(account?.displayName ?? "");
  const [number, setNumber] = useState(account?.number ?? "");
  const [accountNumber, setAcc] = useState(account?.accountNumber ?? "");
  const [useOrderRef, setRef] = useState(account?.useOrderRef ?? false);
  const [active, setActive] = useState(account?.active ?? true);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true); setMsg("");
    const r = await saveAccount(account?.id ?? null, { kind, displayName, number, accountNumber: kind === "PAYBILL" && !useOrderRef ? accountNumber : null, useOrderRef: kind === "PAYBILL" && useOrderRef, active });
    setBusy(false);
    if (r.ok) { router.refresh(); onClose(); } else setMsg(r.error ?? "Could not save");
  }
  async function remove() {
    if (!account || !confirm("Remove this payment account?")) return;
    const r = await deleteAccount(account.id);
    if (r.ok) { router.refresh(); onClose(); } else setMsg(r.error ?? "Could not remove");
  }

  const preview = describeAccount({ kind, number: kind === "POCHI" ? (number.replace(/\D/g, "").replace(/^0/, "254")) : number, accountNumber, useOrderRef, displayName: displayName || "Business name" });
  return (
    <div className="space-y-4 rounded-2xl border border-champagne/40 bg-white/60 p-5">
      <div className="grid gap-3 md:grid-cols-2">
        <div><label className="mb-1 block text-sm font-medium">Type</label>
          <select className={box} value={kind} onChange={(e) => setKind(e.target.value as PaymentAccountDTO["kind"])}>{Object.entries(KIND_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
        <div><label className="mb-1 block text-sm font-medium">Name customers will see on M-Pesa</label><input className={box} value={displayName} placeholder="LACE AND LUXE" onChange={(e) => setName(e.target.value)} /></div>
        <div><label className="mb-1 block text-sm font-medium">{kind === "TILL" ? "Till number" : kind === "PAYBILL" ? "Paybill (business) number" : "Pochi la Biashara phone number"}</label><input className={box} inputMode="tel" value={number} onChange={(e) => setNumber(e.target.value)} /></div>
        {kind === "PAYBILL" && (
          <div><label className="mb-1 block text-sm font-medium">Account number</label>
            <input className={box} value={accountNumber} disabled={useOrderRef} placeholder={useOrderRef ? "The order reference is used" : ""} onChange={(e) => setAcc(e.target.value)} />
            <label className="mt-2 flex items-center gap-2 text-xs"><input type="checkbox" checked={useOrderRef} onChange={(e) => setRef(e.target.checked)} /> Use the order reference (like LL-7KQ4) as the account number</label></div>
        )}
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Offer this to customers</label>
      <p className="rounded-lg bg-ivory/80 p-3 text-sm"><span className="text-xs uppercase tracking-[0.12em] text-claret/60">Customers will see</span><br />{preview}</p>
      <div className="flex flex-wrap items-center gap-4">
        <button disabled={busy} onClick={() => void save()} className="rounded-full bg-claret px-6 py-2.5 text-sm text-ivory disabled:opacity-50">{busy ? "Saving…" : "Save"}</button>
        <button onClick={onClose} className="text-sm underline">Close</button>
        {account && <button onClick={() => void remove()} className="ml-auto text-sm underline">Remove</button>}
      </div>
      {msg && <p className="text-sm">{msg}</p>}
    </div>
  );
}

export default function PaymentsManager({ initial }: { initial: PaymentSettingsDTO }) {
  const router = useRouter();
  const [stk, setStk] = useState(initial.stk);
  const [cod, setCod] = useState(initial.cod);
  const [hold, setHold] = useState(String(initial.holdMinutes));
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState<number | "new" | null>(null);

  async function save() {
    const minutes = Number(hold);
    if (!Number.isInteger(minutes) || minutes < 5 || minutes > 1440) return setMsg("Hold time must be between 5 and 1440 minutes.");
    setBusy(true); setMsg("");
    const r = await savePaymentSettings({ stk, cod, holdMinutes: minutes });
    setBusy(false);
    setMsg(r.ok ? "Saved." : r.error ?? "Could not save");
    if (r.ok) router.refresh();
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4 rounded-2xl border border-champagne/40 bg-white/60 p-5">
        <h2 className="font-serif text-2xl">Ways to pay</h2>
        <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={stk} onChange={(e) => setStk(e.target.checked)} /> <span><b>M-Pesa prompt</b> on the customer&apos;s phone. Needs your Daraja details set up on the server.</span></label>
        <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={cod} onChange={(e) => setCod(e.target.checked)} /> <span><b>Pay on delivery.</b> Each product and each delivery service must also allow it.</span></label>
        <div className="max-w-xs"><label className="mb-1 block text-sm font-medium">Hold unpaid orders for (minutes)</label><input className={box} inputMode="numeric" value={hold} onChange={(e) => setHold(e.target.value)} />
          <p className="mt-1 text-xs text-claret/60">After this, an unpaid pay-now order is cancelled and its stock goes back. Orders where the customer has sent an M-Pesa code are kept for you to check.</p></div>
        <p className="text-sm text-claret/70">Card payments (Paystack) are paused for now.</p>
        <div className="flex items-center gap-4"><button onClick={() => void save()} disabled={busy} className="rounded-full bg-claret px-6 py-2 text-sm text-ivory disabled:opacity-50">{busy ? "Saving…" : "Save"}</button>{msg && <span className="text-sm">{msg}</span>}</div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-serif text-2xl">Pay to our till, paybill or Pochi</h2>
          <p className="mt-1 text-sm text-claret/70">Customers pay these by hand and then type in their M-Pesa code, which you check. It is also the back-up when the M-Pesa prompt doesn&apos;t work. A paybill has a business number and an account number. A till has only a till number. Pochi la Biashara has only a phone number.</p>
        </div>
        {initial.accounts.map((a) => open === a.id ? <AccountEditor key={a.id} account={a} onClose={() => setOpen(null)} /> : (
          <button key={a.id} onClick={() => setOpen(a.id)} className="flex w-full flex-wrap items-center gap-3 rounded-2xl border border-champagne/40 bg-white/60 p-4 text-left transition hover:bg-white">
            <span className="min-w-0 flex-1 text-sm">{describeAccount(a)}</span><Badge tone={a.active ? "ok" : "bad"}>{a.active ? "Offered" : "Off"}</Badge>
          </button>
        ))}
        {open === "new" ? <AccountEditor onClose={() => setOpen(null)} /> : <button onClick={() => setOpen("new")} className="rounded-full bg-claret px-6 py-2.5 text-sm text-ivory">+ Add an account</button>}
      </section>
    </div>
  );
}
