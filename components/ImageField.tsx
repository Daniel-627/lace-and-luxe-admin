"use client";
import { useState } from "react";
import { uploadImage } from "../app/actions-content";

/** Shrinks the photo in the browser first (fast on weak networks), then uploads it. */
async function compress(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale), h = Math.round(bmp.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bmp, 0, 0, w, h);
  for (const q of [0.82, 0.7, 0.6, 0.5]) {
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", q));
    if (blob && blob.size <= 900_000) return blob;
  }
  throw new Error("That photo is still too large after shrinking. Try a smaller one.");
}

export default function ImageField({ value, onChange }: { value?: string; onChange: (url: string | undefined) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pick(file: File | undefined) {
    if (!file) return;
    setBusy(true); setError("");
    try {
      const blob = await compress(file);
      const fd = new FormData();
      fd.append("file", blob, "photo.jpg");
      fd.append("name", file.name.replace(/\.[^.]+$/, "") + ".jpg");
      const r = await uploadImage(fd);
      if (r.url) onChange(r.url); else setError(r.error ?? "Upload failed");
    } catch (e) { setError(e instanceof Error ? e.message : "Upload failed"); }
    finally { setBusy(false); }
  }

  const preview = value && value.includes("cdn.sanity.io") ? `${value}?w=300&auto=format` : value;
  return (
    <div className="flex items-start gap-4">
      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-champagne/40 bg-rose/15">
        {preview && <img src={preview} alt="" className="h-full w-full object-cover" />}
      </div>
      <div className="space-y-2 text-sm">
        <label className="inline-block cursor-pointer rounded-full border border-claret px-4 py-1.5 transition hover:bg-claret hover:text-ivory">
          {busy ? "Uploading…" : value ? "Change photo" : "Choose photo"}
          <input type="file" accept="image/*" className="hidden" disabled={busy} onChange={(e) => { void pick(e.target.files?.[0]); e.target.value = ""; }} />
        </label>
        {value && !busy && <button type="button" onClick={() => onChange(undefined)} className="ml-3 underline">Remove</button>}
        {error && <p>{error}</p>}
      </div>
    </div>
  );
}
