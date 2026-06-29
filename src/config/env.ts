import "dotenv/config";

type AppEnv = "development" | "staging" | "production" | "test";

interface Config {
  env: AppEnv;
  isProduction: boolean;
  port: number;
  anthropicApiKey: string | undefined;
  groqApiKey: string | undefined;
  supabaseUrl: string | undefined;
  supabaseAnonKey: string | undefined;
}

const env = (process.env.NODE_ENV as AppEnv) || "development";

export const config: Config = {
  env,
  isProduction: env === "production",
  port: Number(process.env.PORT) || 4827,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  groqApiKey: process.env.GROQ_API_KEY,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
};

// Fail loud at startup if a deploy is missing required keys, rather than
// surfacing the error mid-request. Only enforced in production.
if (config.isProduction) {
  const missing = (
    ["ANTHROPIC_API_KEY", "GROQ_API_KEY", "SUPABASE_URL", "SUPABASE_ANON_KEY"] as const
  ).filter(
    (key) => !process.env[key],
  );
  if (missing.length > 0) {
    throw new Error(`Missing required env vars in production: ${missing.join(", ")}`);
  }
}
