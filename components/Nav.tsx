"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav({ owner }: { owner: boolean }) {
  const path = usePathname();
  const items: [string, string][] = [
    ["Dashboard", "/"], ["Products", "/products"], ["Orders", "/orders"], ["WhatsApp leads", "/leads"],
    ...(owner ? ([["Settings", "/settings"]] as [string, string][]) : []),
    ["Account", "/account"],
  ];
  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col">
      {items.map(([label, href]) => {
        const active = href === "/" ? path === "/" : path.startsWith(href);
        return (
          <Link key={href} href={href}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm transition ${active ? "bg-ivory/15 text-champagne" : "text-ivory/80 hover:bg-ivory/10"}`}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
