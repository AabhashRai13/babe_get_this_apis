import type { ShoppingItem } from "../dtos/transcribe.dto.js";

// import Anthropic from "@anthropic-ai/sdk";
// import { config } from "../config/env.js";
// const anthropic = new Anthropic({ apiKey: config.anthropicApiKey });

const SYSTEM_PROMPT = `You extract shopping items from an Australian shopping voice note.

For each item return:
- name: the item, singular, lowercase (e.g. "beer", "chicken")
- quantity: a number (default 1 if not said)
- unit: e.g. "pack", "kg", "bottle"; "" if none
- location: the STORE to buy/find it, normalized to its canonical Australian
  name (see list). "" if no store is mentioned.
- notes: everything else — home spot (fridge/pantry/garage), aisle/shelf,
  condition (chilled/ripe), preference (nice/cheap). "" if none.

Canonical store names (map nicknames to these):
  woolies/wollies/woolworth's   -> Woolworths
  dan murphy/dan's/danny's      -> Dan Murphy's
  bunnings warehouse/bunnos     -> Bunnings
  Also recognize: Coles, ALDI, IGA, Foodland, Harris Farm, Costco, Drakes,
  BWS, Liquorland, First Choice, Vintage Cellars, Cellarbrations,
  Kmart, Target, Big W, Mitre 10, Total Tools,
  Chemist Warehouse, Priceline, Terry White, Amcal,
  JB Hi-Fi, Harvey Norman, The Good Guys, Officeworks,
  Petbarn, PetStock, butcher, fishmonger, deli, farmers market, bakery.

Rules:
- A store is a location. An aisle/shelf is a NOTE, not a location.
- A home spot (fridge, pantry, garage) is a NOTE, not a location.
- A location stated for a group of items applies to each of them.

Examples:
"6 packs of beer very chilled, in the fridge"
  -> name:"beer", quantity:6, unit:"pack", location:"", notes:"chilled, in fridge"
"2 Red Label, nice bottles of soju, get them from dan murphy"
  -> name:"red label", quantity:2, unit:"bottle", location:"Dan Murphy's", notes:""
  -> name:"soju", quantity:1, unit:"bottle", location:"Dan Murphy's", notes:"nice"
"pork and chicken, in wollies"
  -> name:"pork", quantity:1, unit:"", location:"Woolworths", notes:""
  -> name:"chicken", quantity:1, unit:"", location:"Woolworths", notes:""
"chicken feet, they are in aisle 4"
  -> name:"chicken feet", quantity:1, unit:"", location:"", notes:"aisle 4"`;

const ITEM_SCHEMA = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          quantity: { type: "number" },
          unit: { type: "string" },
          location: { type: "string" },
          notes: { type: "string" },
        },
        required: ["name", "quantity", "unit", "location", "notes"],
        additionalProperties: false,
      },
    },
  },
  required: ["items"],
  additionalProperties: false,
};

export async function parseItems(transcript: string): Promise<ShoppingItem[]> {
  // STUB: fake items until the real Claude call below is wired in.
  return [
    { name: "eggs", quantity: 1, unit: "crate", location: "Coles", notes: "" },
    { name: "coke", quantity: 2, unit: "L", location: "", notes: "chilled" },
  ];

  // const response = await anthropic.messages.create({
  //   model: "claude-haiku-4-5",
  //   max_tokens: 1024,
  //   system: SYSTEM_PROMPT,
  //   messages: [{ role: "user", content: transcript }],
  //   output_config: { format: { type: "json_schema", schema: ITEM_SCHEMA } },
  // });
  // const text = response.content.find((block) => block.type === "text").text;
  // return JSON.parse(text).items;
}
