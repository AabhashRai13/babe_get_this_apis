import type { Request, Response, NextFunction } from "express";
import { transcribeAudio } from "../services/transcription.service.js";
import { parseItems } from "../services/claude.service.js";
import type { TranscribeResponse } from "../dtos/transcribe.dto.js";

export async function transcribe(
  req: Request,
  res: Response<TranscribeResponse | { error: string }>,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.file) {
      res
        .status(400)
        .json({ error: "No audio uploaded. Send a multipart field named 'audio'." });
      return;
    }

    const transcript = await transcribeAudio(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
    );
    const items = await parseItems(transcript);

    res.json({ transcript, items });
  } catch (error) {
    next(error);
  }
}
