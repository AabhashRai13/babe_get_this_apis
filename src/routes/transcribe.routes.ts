import { Router } from "express";
import { uploadAudio } from "../middleware/upload.js";
import { transcribeLimiter } from "../middleware/rateLimit.js";
import { transcribe } from "../controllers/transcribe.controller.js";

const router = Router();

router.post("/", transcribeLimiter, uploadAudio.single("audio"), transcribe);

export default router;
