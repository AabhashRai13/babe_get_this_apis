import type { ErrorRequestHandler } from "express";

// The four-argument signature is what makes Express treat this as the error
// handler. Returns a clean message so stack traces never leak to the client.
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);

  const statusCode =
    typeof err === "object" && err !== null && "statusCode" in err
      ? Number((err as { statusCode?: number }).statusCode) || 500
      : 500;

  const message = err instanceof Error ? err.message : "Internal server error";

  res.status(statusCode).json({ error: message });
};
