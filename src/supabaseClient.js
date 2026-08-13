import { createClient } from "@supabase/supabase-js";

// These come from your .env file (see README.md).
// They are safe to expose publicly — the anon key only ever does
// what your Row Level Security policies in Supabase allow it to do.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
