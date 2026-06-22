// Single source of truth for categories: the schema enum and the TS type both
// derive from this, so they can't drift.
export const ITEM_CATEGORIES = [
  "produce",
  "dairy_eggs",
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

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  produce: "Produce",
  dairy_eggs: "Dairy & Eggs",
  meat_seafood: "Meat & Seafood",
  bakery: "Bakery",
  pantry: "Pantry",
  frozen: "Frozen",
  beverages: "Beverages",
  snacks: "Snacks",
  household: "Household",
  personal_care: "Personal Care",
  other: "Other",
};

export interface ShoppingItem {
  name: string;
  // null = unspecified (e.g. "milk" with no amount) — the app decides how to render.
  quantity: number | null;
  unit: string | null;
  category: string;
  // Preferences/conditions/substitutions only (e.g. "cage-free", "skip if unavailable").
  note: string | null;
}

export interface TranscribeResponse {
  transcript: string;
  items: ShoppingItem[];
}
