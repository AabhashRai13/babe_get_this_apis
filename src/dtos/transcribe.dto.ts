// Shared contract with the Android client: these category IDs are the source of
// truth — the schema enum, TS type, and the `category` we return all derive from
// this, so backend and client always line up.
export const ITEM_CATEGORIES = [
  "cat-fruits-vegetables",
  "cat-dairy-eggs",
  "cat-meat-seafood",
  "cat-bakery-bread",
  "cat-frozen-foods",
  "cat-pantry-dry-goods",
  "cat-beverages",
  "cat-snacks",
  "cat-toiletries-personal-care",
  "cat-household-cleaning",
  "cat-baby-kids",
  "cat-pet-supplies",
] as const;

export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  "cat-fruits-vegetables": "Fruits & Vegetables",
  "cat-dairy-eggs": "Dairy & Eggs",
  "cat-meat-seafood": "Meat & Seafood",
  "cat-bakery-bread": "Bakery & Bread",
  "cat-frozen-foods": "Frozen Foods",
  "cat-pantry-dry-goods": "Pantry & Dry Goods",
  "cat-beverages": "Beverages",
  "cat-snacks": "Snacks",
  "cat-toiletries-personal-care": "Toiletries & Personal Care",
  "cat-household-cleaning": "Household & Cleaning",
  "cat-baby-kids": "Baby & Kids",
  "cat-pet-supplies": "Pet Supplies",
};

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
