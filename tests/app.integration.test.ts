import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

// Mock the paid external services so tests never hit Groq or Claude.
vi.mock("../src/services/transcription.service.js", () => ({
  transcribeAudio: vi.fn(),
}));
vi.mock("../src/services/claude.service.js", () => ({
  parseItems: vi.fn(),
}));

import { createApp } from "../src/app.js";
import { transcribeAudio } from "../src/services/transcription.service.js";
import { parseItems } from "../src/services/claude.service.js";

const app = createApp();
const mockTranscribe = vi.mocked(transcribeAudio);
const mockParse = vi.mocked(parseItems);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /health", () => {
  it("returns ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

describe("POST /transcribe", () => {
  it("returns 400 when no file is uploaded", async () => {
    const res = await request(app).post("/transcribe");
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/no audio uploaded/i);
    expect(mockTranscribe).not.toHaveBeenCalled();
  });

  it("rejects a non-audio upload with 400", async () => {
    const res = await request(app)
      .post("/transcribe")
      .attach("audio", Buffer.from("not audio"), {
        filename: "notes.txt",
        contentType: "text/plain",
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/only audio uploads are allowed/i);
    expect(mockTranscribe).not.toHaveBeenCalled();
  });

  it("transcribes and parses a valid audio upload", async () => {
    mockTranscribe.mockResolvedValue("two litres of milk and protein shake");
    mockParse.mockResolvedValue([
      { name: "milk", quantity: 2, unit: "litres" },
      { name: "protein shake", quantity: 1, unit: "" },
    ]);

    const res = await request(app)
      .post("/transcribe")
      .attach("audio", Buffer.from("fake audio bytes"), {
        filename: "note.m4a",
        contentType: "audio/m4a",
      });

    expect(res.status).toBe(200);
    expect(res.body.transcript).toBe("two litres of milk and protein shake");
    expect(res.body.items).toHaveLength(2);
    expect(mockTranscribe).toHaveBeenCalledOnce();
    expect(mockParse).toHaveBeenCalledWith(
      "two litres of milk and protein shake",
    );
  });

  it("returns a 500 error shape when a service throws", async () => {
    mockTranscribe.mockRejectedValue(new Error("Groq exploded"));

    const res = await request(app)
      .post("/transcribe")
      .attach("audio", Buffer.from("fake audio bytes"), {
        filename: "note.m4a",
        contentType: "audio/m4a",
      });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error");
    // Dev/test mode exposes the real message; production hides it (see errorHandler test).
    expect(res.body.error).toBe("Groq exploded");
  });
});
