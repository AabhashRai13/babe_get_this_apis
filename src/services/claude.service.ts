import Anthropic from "@anthropic-ai/sdk";
import { config } from "../config/env.js";
import type { ShoppingItem } from "../dtos/transcribe.dto.js";

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
          quantity: { type: "number" },
          unit: { type: "string" },
        },
        required: ["name", "quantity", "unit"],
        additionalProperties: false,
      },
    },
  },
  required: ["items"],
  additionalProperties: false,
};

// TODO(AR) : It will be great if api could also return the category and notes
const SYSTEM_PROMPT = [
  "You extract grocery items from a shopping voice-note transcript.",
  "Return each item with a name, a numeric quantity, and a unit (use \"\" if none).",
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
