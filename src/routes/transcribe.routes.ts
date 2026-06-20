import { Router } from "express";
import { uploadAudio } from "../middleware/upload.js";
import { transcribe } from "../controllers/transcribe.controller.js";

const router = Router();

router.post("/", uploadAudio.single("audio"), transcribe);

export default router;
