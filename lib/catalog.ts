export interface AdminVariant { id: number; sku: string; size: string; colour: string; colourHex: string | null; price: number; stock: number }
export interface AdminCategory { id: number; name: string; slug: string; _count?: { products: number } }
export interface AdminMedia { id: number; kind: "IMAGE" | "VIDEO"; url: string; colour: string | null; position: number }
export interface AdminProduct {
  id: number; name: string; slug: string; description: string; image: string | null; active: boolean;
  categoryId: number | null; category: AdminCategory | null; variants: AdminVariant[]; media: AdminMedia[]; payNow: boolean; payOnDelivery: boolean; soldOutBehavior: "SHOW" | "HIDE";
}
export interface VariantPayload { id?: number; sku?: string; size: string; colour: string; colourHex: string | null; price: number; stock: number }
export interface ProductPayload {
  name: string; slug?: string; description: string; media: { kind: "IMAGE" | "VIDEO"; url: string; colour: string | null }[]; categoryId: number | null; active: boolean; payNow: boolean; payOnDelivery: boolean; soldOutBehavior: "SHOW" | "HIDE"; variants: VariantPayload[];
}

/** Handy defaults so common colour names get a swatch automatically. */
export const COLOUR_HEX: Record<string, string> = {
  black: "#1C1C1C", white: "#FFFFFF", nude: "#D8B8A0", blush: "#E3C6C3", claret: "#5B1F2E", red: "#B3202E", pink: "#E7A1B0",
  navy: "#1F2A44", beige: "#D9C3A5", grey: "#8A8A8A", gray: "#8A8A8A", champagne: "#C8AA7A", ivory: "#F6EFE6", brown: "#6B4A3A", green: "#2F5D50",
};

/** How many categories the shop shows in its menu before the rest go under "More". Keep in step with the shop's lib/categories.ts. */
export const SHOP_MENU_SLOTS = 4;
