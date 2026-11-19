"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Nav from "./Nav";

function Body({ owner, name, role, logout }: { owner: boolean; name: string; role: string; logout: () => Promise<void> }) {
  return (
    <>
      <div className="mb-6 hidden items-center gap-3 md:flex">
        <img src="/brand/monogram-ivory.svg" alt="" className="h-9 w-auto" />
        <div>
          <p className="font-serif text-xl leading-none">Lace &amp; Luxe</p>
          <p className="text-[10px] uppercase tracking-[0.25em] text-champagne">Admin</p>
        </div>
      </div>
      <Nav owner={owner} />
      <form action={logout} className="mt-6 border-t border-ivory/15 pt-4">
        <p className="mb-1 text-xs text-ivory/60">{name} · {role}</p>
        <button className="text-sm text-champagne underline">Sign out</button>
      </form>
    </>
  );
}

/** Desktop: a fixed side panel. Phones and small tablets: a top bar with a slide-out menu. */
export default function Sidebar(props: { owner: boolean; name: string; role: string; logout: () => Promise<void> }) {
  const path = usePathname();
  const [menu, setMenu] = useState(false);

  useEffect(() => { setMenu(false); }, [path]);
  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenu(false); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [menu]);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between bg-claret px-4 py-3 text-ivory md:hidden print:hidden">
        <div className="flex items-center gap-3">
          <img src="/brand/monogram-ivory.svg" alt="" className="h-8 w-auto" />
          <p className="font-serif text-xl leading-none">Lace &amp; Luxe <span className="ml-1 text-[10px] uppercase tracking-[0.25em] text-champagne">Admin</span></p>
        </div>
        <button type="button" onClick={() => setMenu(true)} aria-label="Open menu" aria-expanded={menu} className="rounded-full border border-ivory/40 px-4 py-1.5 text-sm">Menu</button>
      </header>

      {menu && (
        <div className="fixed inset-0 z-40 md:hidden print:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" aria-label="Close menu" onClick={() => setMenu(false)} className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto bg-claret p-5 text-ivory shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <p className="font-serif text-2xl">Menu</p>
              <button type="button" onClick={() => setMenu(false)} aria-label="Close menu" className="rounded-full border border-ivory/40 px-3 py-1 text-sm">Close</button>
            </div>
            <Body {...props} />
          </div>
        </div>
      )}

      <aside className="hidden bg-claret p-6 text-ivory md:sticky md:top-0 md:block md:h-screen md:w-64 md:shrink-0 md:overflow-y-auto print:hidden">
        <Body {...props} />
      </aside>
    </>
  );
}
