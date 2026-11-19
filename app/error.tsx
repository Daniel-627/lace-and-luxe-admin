"use client";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="mx-auto max-w-lg space-y-4 p-10 text-center">
      <h1 className="font-serif text-4xl">Something went wrong</h1>
      <p className="text-sm text-claret/70">This page could not load. It is usually temporary: the server may be waking up. Try again, and if it keeps happening, tell the developer{error.digest ? ` and quote ${error.digest}` : ""}.</p>
      <button onClick={reset} className="rounded-full bg-claret px-6 py-2.5 text-sm text-ivory">Try again</button>
    </div>
  );
}
