"use server";
import { api } from "../lib/session";
import { sanityMutate, sanityUploadImage } from "../lib/sanity";
import { sanitizeBlocks } from "../lib/blocks";

const msg = (e: unknown) => (e instanceof Error ? e.message : "Something went wrong");

export async function saveHomePage(input: unknown): Promise<{ ok?: true; error?: string }> {
  await api("/me"); // must be a signed-in staff member
  const { blocks, errors } = sanitizeBlocks(input);
  if (errors.length) return { error: errors[0] };
  try {
    await sanityMutate([{ createOrReplace: { _id: "homePage", _type: "homePage", blocks } }]);
    return { ok: true };
  } catch (e) { return { error: msg(e) }; }
}

export async function saveSiteSettings(enabled: boolean, text: string): Promise<{ ok?: true; error?: string }> {
  await api("/me");
  try {
    await sanityMutate([{ createOrReplace: { _id: "siteSettings", _type: "siteSettings", announcementEnabled: !!enabled, announcement: String(text ?? "").trim().slice(0, 200) } }]);
    return { ok: true };
  } catch (e) { return { error: msg(e) }; }
}

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export async function uploadImage(fd: FormData): Promise<{ url?: string; error?: string }> {
  await api("/me");
  const file = fd.get("file");
  if (!(file instanceof Blob) || file.size === 0) return { error: "No photo received" };
  if (!ALLOWED.includes(file.type)) return { error: "Use a JPG, PNG or WebP photo" };
  if (file.size > 1_000_000) return { error: "That photo is too large. Try a smaller one." };
  try {
    const name = String(fd.get("name") ?? "photo.jpg").replace(/[^\w.\-]+/g, "-").slice(0, 80);
    return { url: await sanityUploadImage(file, name) };
  } catch (e) { return { error: msg(e) }; }
}
