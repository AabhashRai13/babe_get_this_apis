import type { ShoppingItem } from "../dtos/transcribe.dto.js";

// import Anthropic from "@anthropic-ai/sdk";
// import { config } from "../config/env.js";
// const anthropic = new Anthropic({ apiKey: config.anthropicApiKey });

export async function parseItems(transcript: string): Promise<ShoppingItem[]> {
  // STUB: fake items until the real Claude call below is wired in.
  return [
    { name: "eggs", quantity: 1, unit: "crate" },
    { name: "coke", quantity: 2, unit: "L" },
  ];

  // const ITEM_SCHEMA = {
  //   type: "object",
  //   properties: {
  //     items: {
  //       type: "array",
  //       items: {
  //         type: "object",
  //         properties: {
  //           name: { type: "string" },
  //           quantity: { type: "number" },
  //           unit: { type: "string" },
  //         },
  //         required: ["name", "quantity", "unit"],
  //         additionalProperties: false,
  //       },
  //     },
  //   },
  //   required: ["items"],
  //   additionalProperties: false,
  // };
  //
  // const response = await anthropic.messages.create({
  //   model: "claude-haiku-4-5",
  //   max_tokens: 1024,
  //   system: "You extract grocery items from a shopping voice note. Return each item with a name, a numeric quantity, and a unit (use \"\" if none).",
  //   messages: [{ role: "user", content: transcript }],
  //   output_config: { format: { type: "json_schema", schema: ITEM_SCHEMA } },
  // });
  // const text = response.content.find((block) => block.type === "text").text;
  // return JSON.parse(text).items;
}
