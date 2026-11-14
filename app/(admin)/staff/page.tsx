import { api } from "../../../lib/session";
import { when } from "../../../lib/format";
import type { Me } from "../../../lib/types";
import { actionLabel, type AuditEntry, type StaffMember } from "../../../lib/staff";
import StaffManager from "../../../components/StaffManager";

export default async function Staff() {
  const me = await api<Me>("/me");
  if (me.role !== "OWNER") return <p>Only the owner can manage staff.</p>;
  const [staff, audit] = await Promise.all([api<StaffMember[]>("/staff"), api<AuditEntry[]>("/audit")]);

  return (
    <div className="max-w-4xl space-y-10">
      <div>
        <h1 className="font-serif text-4xl">Staff</h1>
        <p className="mt-2 text-sm text-claret/70">Everyone who can sign in to this admin.</p>
      </div>
      <StaffManager staff={staff} meId={me.id} />

      <section className="space-y-3">
        <h2 className="font-serif text-3xl">Recent activity</h2>
        {audit.length === 0 ? <p className="text-sm text-claret/70">Nothing yet.</p> : (
          <ul className="divide-y divide-champagne/30 rounded-2xl border border-champagne/40 bg-white/60 text-sm">
            {audit.map((a) => (
              <li key={a.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3">
                <span><span className="font-medium">{a.staffName}</span> {actionLabel(a.action)}{a.detail && a.action !== "order.update" ? <span className="text-claret/60"> · {a.detail.slice(0, 80)}</span> : null}</span>
                <span className="text-xs text-claret/60">{when(a.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
