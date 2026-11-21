"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface Item { label: string; href: string; owner?: boolean; needsAccounts?: boolean }
interface Group { title: string; owner?: boolean; items: Item[] }

// Customer sign-in is switched off in the shop for now, so its admin screen is hidden too. See the shop's lib/features.ts.
const ACCOUNTS_ON = process.env.NEXT_PUBLIC_FEATURE_ACCOUNTS === "on";

const TOP: Item = { label: "Dashboard", href: "/" };
const GROUPS: Group[] = [
  { title: "Sales", items: [{ label: "Orders", href: "/orders" }, { label: "Customers", href: "/customers" }, { label: "WhatsApp leads", href: "/leads" }, { label: "Reviews", href: "/reviews" }, { label: "Reports", href: "/reports", owner: true }] },
  { title: "Shop", items: [{ label: "Products", href: "/products" }, { label: "Categories", href: "/categories" }, { label: "Size guide", href: "/size-guide" }, { label: "Homepage", href: "/homepage" }] },
  { title: "Communication", items: [{ label: "Messages", href: "/messages" }, { label: "Sign-in codes", href: "/codes", needsAccounts: true }] },
  { title: "Store setup", owner: true, items: [{ label: "Delivery", href: "/delivery" }, { label: "Payments", href: "/payments" }, { label: "Discounts", href: "/discounts" }, { label: "Messaging", href: "/messaging" }] },
  { title: "Team & account", items: [{ label: "Staff", href: "/staff", owner: true }, { label: "Settings", href: "/settings", owner: true }, { label: "Account", href: "/account" }] },
];

const isActive = (path: string, href: string) => (href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`));
const groupOf = (path: string) => GROUPS.find((g) => g.items.some((i) => isActive(path, i.href)))?.title;

export default function Nav({ owner }: { owner: boolean }) {
  const path = usePathname();
  const groups = GROUPS.filter((g) => !g.owner || owner).map((g) => ({ ...g, items: g.items.filter((i) => (!i.owner || owner) && (!i.needsAccounts || ACCOUNTS_ON)) })).filter((g) => g.items.length > 0);
  const [open, setOpen] = useState<Set<string>>(() => new Set([groupOf(path)].filter((x): x is string => !!x)));

  // Keep the group you are in open as you move around.
  useEffect(() => {
    const g = groupOf(path);
    if (g) setOpen((s) => (s.has(g) ? s : new Set(s).add(g)));
  }, [path]);

  const toggle = (title: string) => setOpen((s) => { const n = new Set(s); if (n.has(title)) n.delete(title); else n.add(title); return n; });
  const link = (i: Item) => (
    <Link key={i.href} href={i.href} aria-current={isActive(path, i.href) ? "page" : undefined}
      className={`block rounded-lg px-4 py-2.5 text-sm transition ${isActive(path, i.href) ? "bg-ivory/15 text-champagne" : "text-ivory/80 hover:bg-ivory/10"}`}>
      {i.label}
    </Link>
  );

  return (
    <nav aria-label="Admin" className="space-y-1">
      {link(TOP)}
      {groups.map((g) => {
        const isOpen = open.has(g.title);
        const hasActive = g.items.some((i) => isActive(path, i.href));
        return (
          <div key={g.title} className="pt-1">
            <button type="button" onClick={() => toggle(g.title)} aria-expanded={isOpen}
              className={`flex w-full items-center justify-between rounded-lg px-4 py-2 text-left text-[11px] uppercase tracking-[0.2em] transition hover:bg-ivory/10 ${hasActive ? "text-champagne" : "text-ivory/60"}`}>
              <span>{g.title}</span>
              <span aria-hidden className={`text-xs transition-transform ${isOpen ? "rotate-90" : ""}`}>›</span>
            </button>
            {isOpen && <div className="mt-0.5 space-y-0.5 border-l border-ivory/15 pl-2 ml-4">{g.items.map(link)}</div>}
          </div>
        );
      })}
    </nav>
  );
}
