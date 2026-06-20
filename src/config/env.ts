import "dotenv/config";

interface Config {
  port: number;
  anthropicApiKey: string | undefined;
  groqApiKey: string | undefined;
}

export const config: Config = {
  port: Number(process.env.PORT) || 4827,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  groqApiKey: process.env.GROQ_API_KEY,
};
