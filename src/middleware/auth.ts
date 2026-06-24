import type { Request, Response, NextFunction } from "express";
import { supabase } from "../services/supabase.js";

// Uniform 401 — missing, malformed, invalid, and expired all look the same to
// the client (refresh and retry), and we don't leak which check failed.
function unauthorized(res: Response): Error {
  res.setHeader("WWW-Authenticate", "Bearer");
  return Object.assign(new Error("Unauthorized"), { statusCode: 401 });
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const header = req.get("authorization") ?? "";
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
      throw unauthorized(res);
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      throw unauthorized(res);
    }

    req.user = { id: data.user.id, email: data.user.email };
    next();
  } catch (err) {
    next(err);
  }
}
