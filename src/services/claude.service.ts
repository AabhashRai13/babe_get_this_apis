import Anthropic from "@anthropic-ai/sdk";
import { config } from "../config/env.js";
import {
  CATEGORY_LABELS,
  ITEM_CATEGORIES,
  type ShoppingItem,
} from "../dtos/transcribe.dto.js";

let client: Anthropic | undefined;

function anthropic(): Anthropic {
  if (!config.anthropicApiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set — add it to your .env");
  }
  return (client ??= new Anthropic({ apiKey: config.anthropicApiKey }));
}

// Structured output: constrains Claude's reply to exactly this shape, so the
// response is guaranteed-parseable JSON instead of prose we'd have to scrape.
const ITEMS_SCHEMA = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          // Union with "null" = always present, value may be null (unspecified).
          quantity: { type: ["number", "null"] },
          unit: { type: ["string", "null"] },
          category: { type: "string", enum: [...ITEM_CATEGORIES] },
          location: { type: ["string", "null"] },
          note: { type: ["string", "null"] },
        },
        required: ["name", "quantity", "unit", "category", "location", "note"],
        additionalProperties: false,
      },
    },
  },
  required: ["items"],
  additionalProperties: false,
};

const STORE_LIST = [
  "Coles, ALDI, IGA, Foodland, Harris Farm, Costco, Drakes,",
  "BWS, Liquorland, First Choice, Vintage Cellars, Cellarbrations,",
  "Kmart, Target, Big W, Mitre 10, Total Tools,",
  "Chemist Warehouse, Priceline, Terry White, Amcal,",
  "JB Hi-Fi, Harvey Norman, The Good Guys, Officeworks,",
  "Petbarn, PetStock, butcher, fishmonger, deli, farmers market, bakery",
].join(" ");

const SYSTEM_PROMPT = [
  "You extract grocery items from an Australian shopping voice-note transcript.",
  "For each item return: name; quantity (a number, or null if unspecified — never invent one);",
  'unit (e.g. "litre", "kg", or null if none);',
  `category (the matching category id, one of: ${ITEM_CATEGORIES.map((id) => `${id} (${CATEGORY_LABELS[id]})`).join(", ")}; pick the closest, or cat-pantry-dry-goods if none fit);`,
  "location (the STORE to buy/find it, normalized to its canonical Australian name — see list — or null if no store is mentioned);",
  'and note (preferences, conditions, substitutions, aisle/shelf, or home spot only — e.g. "cage-free", "skip if unavailable", "aisle 4", "in the fridge" — or null if none; never restate the item name).',
  "Map store nicknames to canonical names: woolies/wollies/woolworth's → Woolworths; dan murphy/dan's/danny's → Dan Murphy's; bunnings warehouse/bunnos → Bunnings.",
  `Other recognized stores: ${STORE_LIST}.`,
  "A store is a location; an aisle/shelf or home spot (fridge/pantry/garage) is a note, not a location. A location stated for a group of items applies to each of them.",
  "Fix obvious speech-to-text errors using grocery context",
  '(e.g. "protein sake" → "protein shake", "to litres" → 2 litres).',
].join(" ");

export async function parseItems(transcript: string): Promise<ShoppingItem[]> {
  const response = await anthropic().messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: transcript }],
    output_config: { format: { type: "json_schema", schema: ITEMS_SCHEMA } },
  });

  const block = response.content.find((b) => b.type === "text");
  if (block?.type !== "text") {
    throw new Error("Claude returned no text content");
  }
  return (JSON.parse(block.text) as { items: ShoppingItem[] }).items;
}
