import { createClient } from "@supabase/supabase-js";
import { config } from "../config/env.js";

// One shared client. The anon key is publishable; the user's token is passed
// per-call to auth.getUser(token), so there's no per-user session state here.
export const supabase = createClient(
  config.supabaseUrl ?? "",
  config.supabaseAnonKey ?? "",
);
