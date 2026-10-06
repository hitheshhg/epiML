import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface ChiguruUser {
  id: string;
  email: string;
  name: string;
  institution?: string;
  isGuest?: boolean;
}

// Local mock session storage for offline / demonstration operation
const GUEST_STORAGE_KEY = "chiguru_local_session";

export function getLocalUser(): ChiguruUser | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(GUEST_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function setLocalUser(user: ChiguruUser | null): void {
  if (typeof window === "undefined") return;
  if (!user) {
    localStorage.removeItem(GUEST_STORAGE_KEY);
  } else {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(user));
  }
}
