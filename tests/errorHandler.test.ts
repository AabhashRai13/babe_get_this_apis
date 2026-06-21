import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";

// Force production so we test the message-hiding branch.
vi.mock("../src/config/env.js", () => ({
  config: { isProduction: true },
}));

import { errorHandler } from "../src/middleware/errorHandler.js";

function mockRes() {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

const next = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("errorHandler (production)", () => {
  it("hides the message for 5xx server errors", () => {
    const res = mockRes();
    errorHandler(new Error("internal db secret"), {} as Request, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
  });

  it("exposes the message for 4xx client errors", () => {
    const res = mockRes();
    const err = Object.assign(new Error("Only audio uploads are allowed."), {
      statusCode: 400,
    });
    errorHandler(err, {} as Request, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Only audio uploads are allowed.",
    });
  });
});
