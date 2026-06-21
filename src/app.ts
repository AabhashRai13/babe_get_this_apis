import express, { type Express } from "express";
import helmet from "helmet";
import { config } from "./config/env.js";
import { apiLimiter } from "./middleware/rateLimit.js";
import transcribeRoutes from "./routes/transcribe.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

export function createApp(): Express {
  const app = express();

  // Render (and most hosts) sit behind a proxy; trust it so rate limiting and
  // logging see the real client IP.
  if (config.isProduction) {
    app.set("trust proxy", 1);
  }

  // CSP disabled so the inline-script test page still works; other security
  // headers (HSTS, no-sniff, frameguard, etc.) stay on.
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(apiLimiter);
  app.use(express.json());

  // The browser test page is a dev convenience — not exposed in production.
  if (!config.isProduction) {
    app.use(express.static("public"));
  }

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/transcribe", transcribeRoutes);

  // Must be registered last so it catches errors from the routes above.
  app.use(errorHandler);

  return app;
}
