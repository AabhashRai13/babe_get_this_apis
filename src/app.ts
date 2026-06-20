import express, { type Express } from "express";
import transcribeRoutes from "./routes/transcribe.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

export function createApp(): Express {
  const app = express();

  app.use(express.json());

  // Serves the test page at GET / from the public/ folder.
  app.use(express.static("public"));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/transcribe", transcribeRoutes);

  // Must be registered last so it catches errors from the routes above.
  app.use(errorHandler);

  return app;
}
