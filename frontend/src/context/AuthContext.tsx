"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured, ChiguruUser, getLocalUser, setLocalUser } from "../lib/supabaseClient";

interface AuthContextType {
  user: ChiguruUser | null;
  loading: boolean;
  signIn: (email: string, password?: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name: string, institution?: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signInAsGuest: () => void;
  signOut: () => Promise<void>;
  isSupabaseConnected: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({}),
  signUp: async () => ({}),
  signInWithGoogle: async () => ({}),
  signInAsGuest: () => {},
  signOut: async () => {},
  isSupabaseConnected: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ChiguruUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check local session first
    const local = getLocalUser();
    if (local) {
      setUser(local);
      setLoading(false);
      return;
    }

    // 2. If Supabase is configured, check auth state
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const u: ChiguruUser = {
            id: session.user.id,
            email: session.user.email || "",
            name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "Researcher",
            institution: session.user.user_metadata?.institution || "",
          };
          setUser(u);
          setLocalUser(u);
        }
        setLoading(false);
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const u: ChiguruUser = {
            id: session.user.id,
            email: session.user.email || "",
            name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "Researcher",
            institution: session.user.user_metadata?.institution || "",
          };
          setUser(u);
          setLocalUser(u);
        } else {
          setUser(null);
          setLocalUser(null);
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password?: string): Promise<{ error?: string }> => {
    setLoading(true);
    if (isSupabaseConfigured && supabase && password) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setLoading(false);
        return { error: error.message };
      }
      if (data.user) {
        const u: ChiguruUser = {
          id: data.user.id,
          email: data.user.email || "",
          name: data.user.user_metadata?.name || email.split("@")[0],
          institution: data.user.user_metadata?.institution || "",
        };
        setUser(u);
        setLocalUser(u);
      }
      setLoading(false);
      return {};
    } else {
      // Offline / Demo authentication
      const u: ChiguruUser = {
        id: `usr_${Date.now()}`,
        email,
        name: email.split("@")[0] || "Chiguru Researcher",
        institution: "Yenepoya Institute of Technology",
        isGuest: false,
      };
      setUser(u);
      setLocalUser(u);
      setLoading(false);
      return {};
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    institution?: string
  ): Promise<{ error?: string }> => {
    setLoading(true);
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, institution },
        },
      });
      if (error) {
        setLoading(false);
        return { error: error.message };
      }
      if (data.user) {
        const u: ChiguruUser = {
          id: data.user.id,
          email: data.user.email || "",
          name,
          institution: institution || "",
        };
        setUser(u);
        setLocalUser(u);
      }
      setLoading(false);
      return {};
    } else {
      const u: ChiguruUser = {
        id: `usr_${Date.now()}`,
        email,
        name: name || "Chiguru Researcher",
        institution: institution || "Yenepoya Institute of Technology",
        isGuest: false,
      };
      setUser(u);
      setLocalUser(u);
      setLoading(false);
      return {};
    }
  };

  const signInWithGoogle = async (): Promise<{ error?: string }> => {
    setLoading(true);
    if (isSupabaseConfigured && supabase) {
      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/monitor/new`
          : "http://localhost:3000/monitor/new";

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        setLoading(false);
        return { error: error.message };
      }
      return {};
    } else {
      // Fallback for offline demo
      signInAsGuest();
      setLoading(false);
      return {};
    }
  };

  const signInAsGuest = () => {
    const u: ChiguruUser = {
      id: "usr_guest_demo",
      email: "guest@chiguru.lab",
      name: "Guest Researcher",
      institution: "Laboratory Evaluation Mode",
      isGuest: true,
    };
    setUser(u);
    setLocalUser(u);
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setLocalUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signInAsGuest,
        signOut,
        isSupabaseConnected: isSupabaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
