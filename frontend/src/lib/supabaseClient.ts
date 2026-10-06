import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qbeqacmwaoufiwhafvyj.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_tWlRokroPLJ_EdaZzHti_w_wIz2phgZ";

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && supabaseUrl.length > 10 && supabaseAnonKey.length > 10
);

// Singleton Supabase browser client
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
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

/**
 * Retrieves the active user from Supabase or local evaluator storage
 */
export async function getCurrentUser(): Promise<ChiguruUser | null> {
  if (supabase) {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!error && session?.user) {
        const u = session.user;
        const mapped: ChiguruUser = {
          id: u.id,
          email: u.email || "",
          name: (u.user_metadata?.full_name as string) || (u.user_metadata?.name as string) || u.email?.split("@")[0],
          role: "researcher",
        };
        setLocalUser(mapped);
        return mapped;
      }
    } catch (e) {
      console.warn("Supabase session check error:", e);
    }
  }
  return getLocalUser();
}

/**
 * Signs out current user from Supabase and clears local storage
 */
export async function signOutUser(): Promise<void> {
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch {}
  }
  setLocalUser(null);
}
