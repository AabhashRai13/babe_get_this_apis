import rateLimit from "express-rate-limit";

// Broad cap on every endpoint, per IP.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests — please slow down." },
});

// Tighter cap on /transcribe, which spends paid Groq + Claude calls per request.
export const transcribeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many transcription requests — wait a few minutes." },
});
