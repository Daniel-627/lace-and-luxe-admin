// Server-only helpers. Sanity is used purely as the content store; the token never reaches the browser.
const PROJECT = process.env.SANITY_PROJECT_ID ?? "h8sdwy2z";
const DATASET = process.env.SANITY_DATASET ?? "production";
const V = "v2025-01-01";
const base = `https://${PROJECT}.api.sanity.io/${V}`;

function token(): string {
  const t = process.env.SANITY_WRITE_TOKEN;
  if (!t) throw new Error("SANITY_WRITE_TOKEN is not set on this deployment");
  return t;
}

async function fail(r: Response): Promise<never> {
  const d = (await r.json().catch(() => ({}))) as { error?: { description?: string } | string; message?: string };
  const msg = typeof d.error === "string" ? d.error : d.error?.description ?? d.message ?? `Sanity returned ${r.status}`;
  throw new Error(msg);
}

export async function sanityQuery<T>(groq: string): Promise<T> {
  const r = await fetch(`${base}/data/query/${DATASET}?query=${encodeURIComponent(groq)}`, { headers: { Authorization: `Bearer ${token()}` }, cache: "no-store" });
  if (!r.ok) return fail(r);
  return ((await r.json()) as { result: T }).result;
}

export async function sanityMutate(mutations: unknown[]): Promise<void> {
  const r = await fetch(`${base}/data/mutate/${DATASET}`, {
    method: "POST", cache: "no-store",
    headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ mutations }),
  });
  if (!r.ok) await fail(r);
}

export async function sanityUploadImage(file: Blob, filename: string): Promise<string> {
  const r = await fetch(`${base}/assets/images/${DATASET}?filename=${encodeURIComponent(filename)}`, {
    method: "POST", cache: "no-store",
    headers: { Authorization: `Bearer ${token()}`, "Content-Type": file.type || "image/jpeg" },
    body: file,
  });
  if (!r.ok) return fail(r);
  const d = (await r.json()) as { document?: { url?: string } };
  if (!d.document?.url) throw new Error("Upload worked but no address came back");
  return d.document.url;
}
