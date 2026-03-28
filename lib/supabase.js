import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ryijvbmeyzwkkpxhdcwx.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5aWp2Ym1leXp3a2tweGhkY3d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2NjM5MzMsImV4cCI6MjA5MDIzOTkzM30.1R1LK680vV4z854iHH9GhCUlVGUFNCSu3WxzICYF4BA";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Client-side (anon key — read only via RLS)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Server-side (service role — full access, only use in API routes)
export function getServiceClient() {
  const key = SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY;
  return createClient(SUPABASE_URL, key);
}
