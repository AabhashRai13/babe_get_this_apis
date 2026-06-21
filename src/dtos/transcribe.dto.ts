// Single source of truth for categories: the schema enum and the TS type both
// derive from this, so they can't drift.
export const ITEM_CATEGORIES = [
  "produce",
  "dairy",
  "meat_seafood",
  "bakery",
  "pantry",
  "frozen",
  "beverages",
  "snacks",
  "household",
  "personal_care",
  "other",
] as const;

export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

export interface ShoppingItem {
  name: string;
  // null = unspecified (e.g. "milk" with no amount) — the app decides how to render.
  quantity: number | null;
  unit: string | null;
  category: ItemCategory;
  // Preferences/conditions/substitutions only (e.g. "cage-free", "skip if unavailable").
  note: string | null;
}

export interface TranscribeResponse {
  transcript: string;
  items: ShoppingItem[];
}
