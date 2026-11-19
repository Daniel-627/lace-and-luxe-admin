// Shared by the editor screen (browser) and the save action (server).
export type FieldKind = "text" | "area" | "link" | "image" | "number" | "choice" | "lines" | "list" | "toggle";
export interface Field {
  name: string; label: string; kind: FieldKind; help?: string;
  options?: [string, string][]; fields?: Field[]; min?: number; max?: number;
}
export interface BlockDef {
  label: string; blurb: string; titleField?: string; required?: string[];
  fields: Field[]; defaults?: Record<string, unknown>;
}
export type BlockData = { _key: string; _type: string; enabled?: boolean; startsAt?: string; endsAt?: string } & Record<string, unknown>;

const star = "Wrap a word in *stars* to make it italic.";
const eyebrow: Field = { name: "eyebrow", label: "Small line above", kind: "text" };
const T = (name: string, label: string, help?: string): Field => ({ name, label, kind: "text", help });
const A = (name: string, label: string, help?: string): Field => ({ name, label, kind: "area", help });
const L = (name: string, label: string): Field => ({ name, label, kind: "link", help: "A shop page like /shop?category=bras, or a full link starting with https://" });
const I = (name: string, label: string, help?: string): Field => ({ name, label, kind: "image", help });

export const BLOCKS: Record<string, BlockDef> = {
  heroBlock: {
    label: "Hero", blurb: "The big opening section with a headline, buttons and a photo. Add more slides to make it a slider.", titleField: "headline", required: ["headline"],
    fields: [eyebrow, A("headline", "Headline", `${star} Press Enter for a new line.`), A("subheading", "Sub-heading"),
      T("primaryLabel", "Main button text"), L("primaryHref", "Main button link"), T("secondaryLabel", "Second button text"), L("secondaryHref", "Second button link"),
      I("imageUrl", "Photo", "Shown inside an arch. Leave empty to show the placeholder."),
      { name: "slides", label: "More slides (optional)", kind: "list", max: 4, help: "Everything above is slide 1. Add up to 4 more and the hero becomes a slider. A slide without a headline is skipped.",
        fields: [eyebrow, A("headline", "Headline", `${star} Press Enter for a new line.`), A("subheading", "Sub-heading"), T("primaryLabel", "Main button text"), L("primaryHref", "Main button link"), T("secondaryLabel", "Second button text"), L("secondaryHref", "Second button link"), I("imageUrl", "Photo")] },
      { name: "seconds", label: "Seconds on each slide", kind: "number", min: 3, max: 15, help: "Only used when there is more than one slide." }],
    defaults: { seconds: 6 },
  },
  tickerBlock: {
    label: "Scrolling ticker", blurb: "A strip of short lines that scrolls across.", required: ["items"],
    fields: [{ name: "items", label: "Lines", kind: "lines", help: "One line per row." }],
  },
  categoryRowBlock: {
    label: "Category circles", blurb: "Round category pictures, built from your products.", titleField: "title",
    fields: [eyebrow, T("title", "Title", star)],
  },
  productRowBlock: {
    label: "Product row", blurb: "A grid of products: the newest, or one category.", titleField: "title",
    fields: [eyebrow, T("title", "Title", star),
      T("category", "Only this category (optional)", "Use the category's short name, like bras, panties, lingerie-sets, sleepwear or mens-underwear. Empty shows the newest."),
      { name: "limit", label: "How many products", kind: "number", min: 2, max: 12 }],
    defaults: { limit: 8 },
  },
  bannerPairBlock: {
    label: "Banners", blurb: "One to four image banners that link somewhere.", required: ["banners"],
    fields: [{ name: "banners", label: "Banners", kind: "list", max: 4, fields: [T("title", "Title"), T("subtitle", "Sub-title"), L("href", "Link"), I("imageUrl", "Image")] }],
  },
  promoBlock: {
    label: "Promotion", blurb: "A highlighted offer with an optional discount code. Schedule it to start and stop on its own.", titleField: "title", required: ["title"],
    fields: [T("title", "Headline", star), A("text", "Details"), T("code", "Discount code (optional)", "Shown as a tag. Customers mention it when ordering."),
      T("ctaLabel", "Button text"), L("ctaHref", "Button link"),
      { name: "theme", label: "Colour", kind: "choice", options: [["Claret", "claret"], ["Champagne", "champagne"], ["Rose", "rose"]] }, I("imageUrl", "Image (optional)")],
    defaults: { theme: "claret" },
  },
  adBlock: {
    label: "Ad / sponsored banner", blurb: "A wide image that links out, for ads or partners.", titleField: "alt", required: ["imageUrl"],
    fields: [I("imageUrl", "Banner image", "Wide images work best."), T("alt", "Describe the image"), L("href", "Where it links to"),
      { name: "sponsored", label: "Label as sponsored", kind: "toggle" }],
    defaults: { sponsored: true },
  },
  textMediaBlock: {
    label: "Text with photo or video", blurb: "A story or feature next to a photo or a video.", titleField: "title", required: ["title"],
    fields: [eyebrow, T("title", "Title", star), A("body", "Text"), I("imageUrl", "Photo"),
      { name: "videoUrl", label: "Video link (optional)", kind: "link", help: "A direct .mp4 file plays on the page; any other link opens in a new tab." },
      { name: "imageSide", label: "Photo on the", kind: "choice", options: [["Left", "left"], ["Right", "right"]] }, T("ctaLabel", "Button text"), L("ctaHref", "Button link")],
    defaults: { imageSide: "right" },
  },
  promisesBlock: {
    label: "Numbered points", blurb: "Up to four short numbered points.", titleField: "title", required: ["items"],
    fields: [eyebrow, T("title", "Title", star), { name: "items", label: "Points", kind: "list", max: 4, fields: [T("title", "Title"), A("text", "Text")] }],
  },
  ctaBlock: {
    label: "Closing call to action", blurb: "A big closing message with one button.", titleField: "heading", required: ["heading"],
    fields: [A("heading", "Heading", star), T("buttonLabel", "Button text"), L("buttonHref", "Button link")],
  },
};
export const BLOCK_ORDER = Object.keys(BLOCKS);

const LINK = /^(\/(?!\/)|https?:\/\/)/;
const IMG = /^(\/(?!\/)|https:\/\/cdn\.sanity\.io\/)/;

function clean(f: Field, v: unknown, errors: string[], where: string): unknown {
  switch (f.kind) {
    case "text": case "area": {
      const s = typeof v === "string" ? v.trim().slice(0, f.kind === "area" ? 1000 : 200) : "";
      return s || undefined;
    }
    case "link": {
      const s = typeof v === "string" ? v.trim().slice(0, 500) : "";
      if (s && !LINK.test(s)) errors.push(`${where}: "${f.label}" must start with / or https://`);
      return s || undefined;
    }
    case "image": {
      const s = typeof v === "string" ? v.trim().slice(0, 500) : "";
      if (s && !IMG.test(s)) errors.push(`${where}: "${f.label}" must be an uploaded photo`);
      return s || undefined;
    }
    case "number": {
      const n = Number(v);
      return Number.isFinite(n) ? Math.min(f.max ?? 100, Math.max(f.min ?? 0, Math.round(n))) : undefined;
    }
    case "choice": {
      const s = String(v ?? "");
      return f.options?.some(([, val]) => val === s) ? s : undefined;
    }
    case "toggle": return v === false ? false : true;
    case "lines":
      return (Array.isArray(v) ? v : []).map((x) => String(x).trim().slice(0, 200)).filter(Boolean).slice(0, 20);
    case "list":
      return (Array.isArray(v) ? v : []).slice(0, f.max ?? 6).map((item) =>
        Object.fromEntries((f.fields ?? []).map((sf) => [sf.name, clean(sf, (item as Record<string, unknown> | null)?.[sf.name], errors, where)]).filter(([, x]) => x !== undefined)));
  }
}

export function sanitizeBlocks(input: unknown): { blocks: BlockData[]; errors: string[] } {
  const errors: string[] = [];
  const out: BlockData[] = [];
  const list = Array.isArray(input) ? input.slice(0, 30) : [];
  list.forEach((raw, i) => {
    const b = (raw ?? {}) as Record<string, unknown>;
    const def = BLOCKS[String(b._type)];
    if (!def) { errors.push(`Section ${i + 1} has an unknown type`); return; }
    const where = `Section ${i + 1} (${def.label})`;
    const clean_: BlockData = {
      _key: /^[a-z0-9]{4,40}$/i.test(String(b._key)) ? String(b._key) : Math.random().toString(36).slice(2, 12),
      _type: String(b._type), enabled: b.enabled !== false,
    };
    for (const k of ["startsAt", "endsAt"] as const) {
      const s = typeof b[k] === "string" ? (b[k] as string) : "";
      if (s) { if (Number.isNaN(Date.parse(s))) errors.push(`${where}: invalid date`); else clean_[k] = new Date(s).toISOString(); }
    }
    for (const f of def.fields) {
      const v = clean(f, b[f.name], errors, where);
      if (v !== undefined) clean_[f.name] = v;
    }
    for (const r of def.required ?? []) {
      const v = clean_[r];
      if (v === undefined || (Array.isArray(v) && v.length === 0)) errors.push(`${where}: "${def.fields.find((f) => f.name === r)?.label ?? r}" is required`);
    }
    if (clean_.startsAt && clean_.endsAt && Date.parse(clean_.endsAt as string) <= Date.parse(clean_.startsAt as string)) errors.push(`${where}: "Hide after" must be later than "Show from"`);
    out.push(clean_);
  });
  return { blocks: out, errors };
}

const k = () => Math.random().toString(36).slice(2, 12);
/** A copy of the shop's built-in homepage, to start editing from. */
export const standardHomepage = (): BlockData[] => [
  { _key: k(), _type: "heroBlock", enabled: true, eyebrow: "Lace & Luxe Delicates", headline: "Soft lace,\n*quiet* luxury.", subheading: "Lingerie, sleepwear and everyday essentials, for her and for him.", primaryLabel: "Shop now", primaryHref: "/shop", secondaryLabel: "Shop for him", secondaryHref: "/shop?category=mens-underwear" },
  { _key: k(), _type: "tickerBlock", enabled: true, items: ["Order on WhatsApp", "Pay with M-Pesa", "Discreet packaging", "Delivered across Kenya", "Size help on every product"] },
  { _key: k(), _type: "categoryRowBlock", enabled: true, eyebrow: "Shop by category", title: "Find your *perfect* fit" },
  { _key: k(), _type: "productRowBlock", enabled: true, eyebrow: "Just in", title: "New *arrivals*", limit: 8 },
  { _key: k(), _type: "bannerPairBlock", enabled: true, banners: [
    { title: "For her", subtitle: "Lace, satin and everyday comfort", href: "/shop" },
    { title: "For him", subtitle: "Soft, supportive essentials", href: "/shop?category=mens-underwear" } ] },
  { _key: k(), _type: "promisesBlock", enabled: true, eyebrow: "Why Lace & Luxe", title: "Made to feel *effortless*", items: [
    { title: "Order your way", text: "Pay with M-Pesa at checkout, or send your order on WhatsApp." },
    { title: "Discreet by design", text: "Plain packaging and neutral messages. Only you know what is inside." },
    { title: "Help with sizing", text: "A size guide on every product, and real people to ask." } ] },
  { _key: k(), _type: "ctaBlock", enabled: true, heading: "Find the *one* you will reach for.", buttonLabel: "Start shopping", buttonHref: "/shop" },
];
