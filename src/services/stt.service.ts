// import Groq from "groq-sdk";
// import { config } from "../config/env.js";
// const groq = new Groq({ apiKey: config.groqApiKey });

export async function transcribeAudio(
  audioBuffer: Buffer,
  mimeType: string,
): Promise<string> {
  // STUB: fake text until the real Whisper call below is wired in.
  return "one crate eggs, 2L coke";

  // const file = new File([audioBuffer], "audio.m4a", { type: mimeType });
  // const result = await groq.audio.transcriptions.create({
  //   file,
  //   model: "whisper-large-v3-turbo",
  // });
  // return result.text;
}
