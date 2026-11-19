"use client";

export default function PrintButton({ children }: { children: React.ReactNode }) {
  return <button onClick={() => window.print()} className="rounded-full bg-claret px-6 py-2.5 text-sm text-ivory">{children}</button>;
}
