import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl.length > 5 && supabaseAnonKey.length > 5
);

// Create client if configured, otherwise null
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface ChiguruUser {
  id: string;
  email: string;
  name?: string;
  role: "researcher" | "evaluator" | "guest";
  isGuest?: boolean;
}

// Session store in localStorage for guest/evaluator demo mode
export function getLocalUser(): ChiguruUser | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("chiguru_auth_user");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }
  return null;
}

export function setLocalUser(user: ChiguruUser | null): void {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem("chiguru_auth_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("chiguru_auth_user");
  }
}
