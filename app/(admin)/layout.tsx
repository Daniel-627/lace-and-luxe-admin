import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { api } from "../../lib/session";
import type { Me } from "../../lib/types";
import Nav from "../../components/Nav";
import { logout } from "../actions";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const me = await api<Me>("/me");
  if (me.mustChangePassword) redirect("/change-password");
  return (
    <div className="min-h-screen md:flex print:block">
      <aside className="bg-claret print:hidden p-4 text-ivory md:min-h-screen md:w-64 md:shrink-0 md:p-6">
        <div className="mb-4 flex items-center gap-3 md:mb-8">
          <img src="/brand/monogram-ivory.svg" alt="" className="h-9 w-auto" />
          <div>
            <p className="font-serif text-xl leading-none">Lace &amp; Luxe</p>
            <p className="text-[10px] uppercase tracking-[0.25em] text-champagne">Admin</p>
          </div>
        </div>
        <Nav owner={me.role === "OWNER"} />
        <form action={logout} className="mt-4 md:mt-8">
          <p className="mb-1 text-xs text-ivory/60">{me.name} · {me.role === "OWNER" ? "Owner" : "Staff"}</p>
          <button className="text-sm text-champagne underline">Sign out</button>
        </form>
      </aside>
      <main className="min-w-0 flex-1 p-6 md:p-10 print:p-0">{children}</main>
    </div>
  );
}
