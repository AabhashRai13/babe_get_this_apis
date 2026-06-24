/// <reference path="../src/types/express.d.ts" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

// Mock the Supabase client so the middleware runs without a live Supabase.
vi.mock("../src/services/supabase.js", () => ({
  supabase: { auth: { getUser: vi.fn() } },
}));

import { requireAuth } from "../src/middleware/auth.js";
import { supabase } from "../src/services/supabase.js";
import { errorHandler } from "../src/middleware/errorHandler.js";

const mockGetUser = vi.mocked(supabase.auth.getUser);

const app = express();
app.post("/protected", requireAuth, (req, res) => {
  res.json({ user: req.user });
});
app.use(errorHandler);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("requireAuth", () => {
  it("401s when the Authorization header is missing", async () => {
    const res = await request(app).post("/protected");
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Unauthorized" });
    expect(res.headers["www-authenticate"]).toBe("Bearer");
    expect(mockGetUser).not.toHaveBeenCalled();
  });

  it("401s on a malformed header (not Bearer <token>)", async () => {
    const res = await request(app)
      .post("/protected")
      .set("Authorization", "Token abc123");
    expect(res.status).toBe(401);
    expect(mockGetUser).not.toHaveBeenCalled();
  });

  it("401s on an invalid token", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: "invalid token" },
    } as never);
    const res = await request(app)
      .post("/protected")
      .set("Authorization", "Bearer bad-token");
    expect(res.status).toBe(401);
  });

  it("401s on an expired token", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: "token is expired" },
    } as never);
    const res = await request(app)
      .post("/protected")
      .set("Authorization", "Bearer expired-token");
    expect(res.status).toBe(401);
  });

  it("passes through and populates req.user on a valid token", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "uuid-1", email: "test@example.com" } },
      error: null,
    } as never);
    const res = await request(app)
      .post("/protected")
      .set("Authorization", "Bearer good-token");
    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ id: "uuid-1", email: "test@example.com" });
    expect(mockGetUser).toHaveBeenCalledWith("good-token");
  });
});
