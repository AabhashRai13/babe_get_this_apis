import Groq, { toFile } from "groq-sdk";
import { config } from "../config/env.js";

// Lazy init so the server still boots without a key; only calls to /transcribe
// fail (cleanly) when GROQ_API_KEY is missing.
let client: Groq | undefined;

function groq(): Groq {
  if (!config.groqApiKey) {
    throw new Error("GROQ_API_KEY is not set — add it to your .env");
  }
  return (client ??= new Groq({ apiKey: config.groqApiKey }));
}

export async function transcribeAudio(
  audioBuffer: Buffer,
  filename: string,
  mimeType: string,
): Promise<string> {
  // Whisper detects the format from the filename extension, so pass the real
  // upload name (e.g. "note.m4a") — a name without an extension is rejected.
  const file = await toFile(audioBuffer, filename, { type: mimeType });
  const result = await groq().audio.transcriptions.create({
    file,
    model: "whisper-large-v3-turbo",
    language: "en",
  });
  return result.text;
}
