import { Router } from "express";
import { uploadAudio } from "../middleware/upload.js";
import { transcribeLimiter } from "../middleware/rateLimit.js";
import { requireAuth } from "../middleware/auth.js";
import { transcribe } from "../controllers/transcribe.controller.js";

const router = Router();

router.post(
  "/",
  transcribeLimiter,
  requireAuth,
  uploadAudio.single("audio"),
  transcribe,
);

export default router;
