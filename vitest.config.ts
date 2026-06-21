import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // No real API keys in tests — every external call (Groq/Claude) is mocked.
    env: { NODE_ENV: "test" },
  },
});
