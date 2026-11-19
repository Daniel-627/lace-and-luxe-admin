import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { api } from "../../lib/session";
import type { Me } from "../../lib/types";
import Sidebar from "../../components/Sidebar";
import { logout } from "../actions";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const me = await api<Me>("/me");
  if (me.mustChangePassword) redirect("/change-password");
  return (
    <div className="min-h-screen md:flex print:block">
      <Sidebar owner={me.role === "OWNER"} name={me.name} role={me.role === "OWNER" ? "Owner" : "Staff"} logout={logout} />
      <main className="min-w-0 flex-1 p-4 sm:p-6 md:p-10 print:p-0">{children}</main>
    </div>
  );
}
