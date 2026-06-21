import multer from "multer";

// Reject non-audio uploads early (by mime type, or extension when the browser
// sends a generic type) so junk never reaches the paid transcription call.
export const audioFileFilter: NonNullable<multer.Options["fileFilter"]> = (
  _req,
  file,
  cb,
) => {
  const ok =
    file.mimetype.startsWith("audio/") ||
    /\.(m4a|mp3|wav|ogg|webm|flac|mp4|mpga|mpeg)$/i.test(file.originalname);
  if (ok) return cb(null, true);
  cb(Object.assign(new Error("Only audio uploads are allowed."), { statusCode: 400 }));
};

// Memory storage: the file arrives as req.file.buffer, forwarded straight to
// the transcription service without ever touching disk.
export const uploadAudio = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: audioFileFilter,
});
