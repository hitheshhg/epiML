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
  role: "researcher" | "evaluator" | "guest" | "operator" | "admin";
  isGuest?: boolean;
  avatarUrl?: string;
  preferredCrop?: string;
}

// Local storage session persistence
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
 * Retrieves the active user from Supabase auth session or local storage
 */
export async function getCurrentUser(): Promise<ChiguruUser | null> {
  if (supabase) {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (!error && session?.user) {
        const u = session.user;
        const mapped: ChiguruUser = {
          id: u.id,
          email: u.email || "",
          name:
            (u.user_metadata?.full_name as string) ||
            (u.user_metadata?.name as string) ||
            u.email?.split("@")[0] ||
            "Researcher",
          role: (u.user_metadata?.role as any) || "researcher",
          avatarUrl: u.user_metadata?.avatar_url as string | undefined,
        };

        // Attempt to fetch additional profile attributes from public.profiles if exists
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, role, avatar_url, preferred_crop")
            .eq("id", u.id)
            .maybeSingle();

          if (profile) {
            if (profile.full_name) mapped.name = profile.full_name;
            if (profile.role) mapped.role = profile.role;
            if (profile.avatar_url) mapped.avatarUrl = profile.avatar_url;
            if (profile.preferred_crop) mapped.preferredCrop = profile.preferred_crop;
          }
        } catch {
          // Fall back gracefully if table not yet migrated
        }

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
 * Sign in with standard email and password (no institutional domain requirements)
 */
export async function signInWithEmail(email: string, password: string): Promise<ChiguruUser> {
  if (!supabase) {
    // Local fallback for offline / mock testing
    const fallbackUser: ChiguruUser = {
      id: "local-user-" + Date.now().toString().slice(-4),
      email: email.trim(),
      name: email.split("@")[0],
      role: "researcher",
    };
    setLocalUser(fallbackUser);
    return fallbackUser;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error("Unable to authenticate user.");
  }

  const u = data.user;
  const authedUser: ChiguruUser = {
    id: u.id,
    email: u.email || email.trim(),
    name:
      (u.user_metadata?.full_name as string) ||
      (u.user_metadata?.name as string) ||
      u.email?.split("@")[0] ||
      "Researcher",
    role: "researcher",
  };

  setLocalUser(authedUser);
  return authedUser;
}

/**
 * Sign up with standard email and password
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  fullName?: string
): Promise<{ user: ChiguruUser | null; requiresEmailConfirmation: boolean }> {
  if (!supabase) {
    const fallbackUser: ChiguruUser = {
      id: "local-user-" + Date.now().toString().slice(-4),
      email: email.trim(),
      name: fullName?.trim() || email.split("@")[0],
      role: "researcher",
    };
    setLocalUser(fallbackUser);
    return { user: fallbackUser, requiresEmailConfirmation: false };
  }

  const trimmedEmail = email.trim();
  const displayName = fullName?.trim() || trimmedEmail.split("@")[0];

  const { data, error } = await supabase.auth.signUp({
    email: trimmedEmail,
    password,
    options: {
      data: {
        full_name: displayName,
        name: displayName,
      },
    },
  });

  if (error) {
    throw error;
  }

  if (data.session && data.user) {
    const newUser: ChiguruUser = {
      id: data.user.id,
      email: data.user.email || trimmedEmail,
      name: displayName,
      role: "researcher",
    };
    setLocalUser(newUser);
    return { user: newUser, requiresEmailConfirmation: false };
  }

  // If email confirmation is required by Supabase project settings
  return { user: null, requiresEmailConfirmation: true };
}

/**
 * Fast 1-click evaluator / guest login for judges, evaluators, and demonstration
 */
export function loginAsGuestOrEvaluator(
  role: "evaluator" | "guest" = "evaluator",
  name: string = "Dr. Alex Morgan (Guest Researcher)",
  email: string = "demo@chiguru.ai"
): ChiguruUser {
  const guestUser: ChiguruUser = {
    id: "evaluator-session-01",
    email,
    name,
    role,
    isGuest: true,
  };
  setLocalUser(guestUser);
  return guestUser;
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
