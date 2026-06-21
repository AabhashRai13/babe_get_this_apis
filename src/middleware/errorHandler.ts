import type { ErrorRequestHandler } from "express";
import { config } from "../config/env.js";

// The four-argument signature is what makes Express treat this as the error
// handler. In production, server errors (5xx) return a generic message so
// internals never leak; client errors (4xx) and dev keep the real message.
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);

  const statusCode =
    typeof err === "object" && err !== null && "statusCode" in err
      ? Number((err as { statusCode?: number }).statusCode) || 500
      : 500;

  const expose = !config.isProduction || statusCode < 500;
  const message =
    expose && err instanceof Error ? err.message : "Internal server error";

  res.status(statusCode).json({ error: message });
};
