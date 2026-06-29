import { describe, it, expect, vi } from "vitest";
import type { Request } from "express";
import { audioFileFilter } from "../src/middleware/upload.js";

// Minimal stand-in for the multer file object; only the two fields the filter reads.
function file(mimetype: string, originalname: string) {
  return { mimetype, originalname } as Express.Multer.File;
}

function run(mimetype: string, originalname: string) {
  const cb = vi.fn();
  audioFileFilter({} as Request, file(mimetype, originalname), cb);
  return cb;
}

describe("audioFileFilter", () => {
  it("accepts an audio/* mime type", () => {
    expect(run("audio/m4a", "note.m4a").mock.calls[0]).toEqual([null, true]);
  });

  it("accepts a known extension even with a generic mime type", () => {
    expect(run("application/octet-stream", "note.ogg").mock.calls[0]).toEqual([
      null,
      true,
    ]);
  });

  it("rejects a non-audio upload with a 400 error", () => {
    const cb = run("text/plain", "notes.txt");
    const err = cb.mock.calls[0]?.[0] as Error & { statusCode?: number };
    expect(err).toBeInstanceOf(Error);
    expect(err.statusCode).toBe(400);
    expect(err.message).toMatch(/only audio uploads/i);
  });
});
