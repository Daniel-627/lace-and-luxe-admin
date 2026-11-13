import { defineArrayMember, defineField, defineType, type FieldDefinition } from "sanity";

const str = (name: string, title: string, description?: string) => defineField({ name, title, type: "string", description });
const txt = (name: string, title: string, description?: string, rows = 3) => defineField({ name, title, type: "text", rows, description });
const img = (name: string, title: string, description?: string) => defineField({ name, title, type: "image", options: { hotspot: true }, description });
const link = (name: string, title: string) =>
  defineField({
    name, title, type: "string",
    description: "A page on the shop like /shop?category=bras, or a full link starting with https://",
    validation: (r) => r.custom((v) => !v || /^(\/(?!\/)|https?:\/\/)/.test(String(v)) || "Start with / or https://"),
  });
const choice = (name: string, title: string, list: [string, string][], initial: string) =>
  defineField({ name, title, type: "string", initialValue: initial, options: { list: list.map(([t, value]) => ({ title: t, value })), layout: "radio" } });

const schedule: FieldDefinition[] = [
  defineField({ name: "enabled", title: "Show this section", type: "boolean", initialValue: true }),
  defineField({ name: "startsAt", title: "Show from", type: "datetime", description: "Leave empty to show straight away.", fieldset: "schedule" }),
  defineField({ name: "endsAt", title: "Hide after", type: "datetime", description: "Leave empty to keep showing.", fieldset: "schedule" }),
];

function block(name: string, label: string, titleField: string | null, fields: FieldDefinition[]) {
  return defineType({
    name, title: label, type: "object",
    fieldsets: [{ name: "schedule", title: "Schedule (optional)", options: { collapsible: true, collapsed: true } }],
    fields: [...fields, ...schedule],
    preview: {
      select: titleField ? { title: titleField, enabled: "enabled" } : { enabled: "enabled" },
      prepare: ({ title, enabled }: { title?: string; enabled?: boolean }) => ({
        title: title || label,
        subtitle: enabled === false ? `${label} · hidden` : label,
      }),
    },
  });
}

export const blockTypes = [
  block("heroBlock", "Hero", "headline", [
    str("eyebrow", "Small line above"),
    txt("headline", "Headline", "Wrap one word in *stars* to make it italic, like: Soft lace, *quiet* luxury. Press Enter for a new line.", 2),
    txt("subheading", "Sub-heading", undefined, 2),
    str("primaryLabel", "Main button text"), link("primaryHref", "Main button link"),
    str("secondaryLabel", "Second button text"), link("secondaryHref", "Second button link"),
    img("image", "Photo", "Shown in the arch. Leave empty to show the placeholder."),
  ]),
  block("tickerBlock", "Scrolling ticker", null, [
    defineField({ name: "items", title: "Lines", type: "array", of: [defineArrayMember({ type: "string" })], validation: (r) => r.min(1) }),
  ]),
  block("categoryRowBlock", "Category circles", "title", [str("eyebrow", "Small line above"), str("title", "Title", "Wrap a word in *stars* for italics.")]),
  block("productRowBlock", "Product row", "title", [
    str("eyebrow", "Small line above"), str("title", "Title", "Wrap a word in *stars* for italics."),
    str("category", "Only this category (optional)", "Use the category's short name: bras, panties, lingerie-sets, sleepwear or mens-underwear. Empty shows the newest products."),
    defineField({ name: "limit", title: "How many products", type: "number", initialValue: 8, validation: (r) => r.min(2).max(12).integer() }),
  ]),
  block("bannerPairBlock", "Banners (one to four)", null, [
    defineField({
      name: "banners", title: "Banners", type: "array", validation: (r) => r.min(1).max(4),
      of: [defineArrayMember({
        type: "object",
        fields: [str("title", "Title"), str("subtitle", "Sub-title"), link("href", "Link"), img("image", "Image")],
        preview: { select: { title: "title", media: "image" } },
      })],
    }),
  ]),
  block("promoBlock", "Promotion", "title", [
    str("title", "Headline"), txt("text", "Details"),
    str("code", "Discount code (optional)", "Shown as a tag. Customers mention it when ordering."),
    str("ctaLabel", "Button text"), link("ctaHref", "Button link"),
    choice("theme", "Colour", [["Claret", "claret"], ["Champagne", "champagne"], ["Rose", "rose"]], "claret"),
    img("image", "Image (optional)"),
  ]),
  block("adBlock", "Ad / sponsored banner", "alt", [
    img("image", "Banner image", "Wide images work best."), str("alt", "Describe the image"), link("href", "Where it links to"),
    defineField({ name: "sponsored", title: "Label as sponsored", type: "boolean", initialValue: true }),
  ]),
  block("textMediaBlock", "Text with photo or video", "title", [
    str("eyebrow", "Small line above"), str("title", "Title"), txt("body", "Text", undefined, 5),
    img("image", "Photo"), link("videoUrl", "Video link (optional)"),
    choice("imageSide", "Photo on the", [["Left", "left"], ["Right", "right"]], "right"),
    str("ctaLabel", "Button text"), link("ctaHref", "Button link"),
  ]),
  block("promisesBlock", "Numbered points", "title", [
    str("eyebrow", "Small line above"), str("title", "Title", "Wrap a word in *stars* for italics."),
    defineField({
      name: "items", title: "Points", type: "array", validation: (r) => r.min(1).max(4),
      of: [defineArrayMember({ type: "object", fields: [str("title", "Title"), txt("text", "Text", undefined, 2)], preview: { select: { title: "title", subtitle: "text" } } })],
    }),
  ]),
  block("ctaBlock", "Closing call to action", "heading", [
    txt("heading", "Heading", "Wrap a word in *stars* for italics.", 2), str("buttonLabel", "Button text"), link("buttonHref", "Button link"),
  ]),
];
