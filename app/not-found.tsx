import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg space-y-4 p-10 text-center">
      <h1 className="font-serif text-4xl">Page not found</h1>
      <p className="text-sm text-claret/70">That page does not exist, or it was removed.</p>
      <Link href="/" className="inline-block rounded-full bg-claret px-6 py-2.5 text-sm text-ivory">Back to the dashboard</Link>
    </div>
  );
}
