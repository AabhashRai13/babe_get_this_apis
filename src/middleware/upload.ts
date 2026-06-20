import multer from "multer";

// Memory storage: the file arrives as req.file.buffer, forwarded straight to
// the STT service without ever touching disk.
export const uploadAudio = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});
