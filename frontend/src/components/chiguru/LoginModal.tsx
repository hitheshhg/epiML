"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  AlertCircle,
  Loader2,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: { id: string; email: string; name?: string }) => void;
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    if (tab === "signup" && password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      if (tab === "signin") {
        if (supabase) {
          const { data, error: signInErr } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });

          if (signInErr) {
            if (signInErr.message.includes("Invalid login credentials")) {
              throw new Error("Invalid email or password. Please verify your credentials and try again.");
            } else if (signInErr.message.includes("Email not confirmed")) {
              throw new Error("Email has not been verified yet. Check your inbox or run the auto-confirm query in Supabase.");
            }
            throw signInErr;
          }

          if (data?.user) {
            const authed = {
              id: data.user.id,
              email: data.user.email || cleanEmail,
              name:
                (data.user.user_metadata?.full_name as string) ||
                (data.user.user_metadata?.name as string) ||
                data.user.email?.split("@")[0] ||
                "Researcher",
            };
            if (typeof window !== "undefined") {
              localStorage.setItem("chiguru_auth_user", JSON.stringify(authed));
            }
            onSuccess(authed);
            onClose();
            return;
          }
        }

        // Offline / fallback
        const fallbackUser = {
          id: "local-" + Date.now(),
          email: cleanEmail,
          name: cleanEmail.split("@")[0],
        };
        if (typeof window !== "undefined") {
          localStorage.setItem("chiguru_auth_user", JSON.stringify(fallbackUser));
        }
        onSuccess(fallbackUser);
        onClose();
      } else {
        // Tab === "signup"
        const cleanName = fullName.trim() || cleanEmail.split("@")[0];

        if (supabase) {
          const { data, error: signUpErr } = await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              data: {
                full_name: cleanName,
                name: cleanName,
              },
            },
          });

          if (signUpErr) {
            if (signUpErr.message.includes("User already registered")) {
              throw new Error("This email is already registered. Please sign in instead.");
            }
            throw signUpErr;
          }

          if (data?.session && data?.user) {
            const authed = {
              id: data.user.id,
              email: data.user.email || cleanEmail,
              name: cleanName,
            };
            if (typeof window !== "undefined") {
              localStorage.setItem("chiguru_auth_user", JSON.stringify(authed));
            }
            onSuccess(authed);
            onClose();
            return;
          }

          if (data?.user && !data?.session) {
            // Email confirmation required by Supabase settings
            setNotice("Account registered! A confirmation link has been sent to your email. You can also sign in right away if auto-confirm is enabled.");
            setTab("signin");
            setLoading(false);
            return;
          }
        }

        // Offline / fallback
        const fallbackUser = {
          id: "local-" + Date.now(),
          email: cleanEmail,
          name: cleanName,
        };
        if (typeof window !== "undefined") {
          localStorage.setItem("chiguru_auth_user", JSON.stringify(fallbackUser));
        }
        onSuccess(fallbackUser);
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="relative z-10 w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 sm:p-7 overflow-hidden text-foreground"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-left space-y-1.5 mb-5 pr-8">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌱</span>
            <span className="font-mono text-sm uppercase tracking-wider text-primary font-semibold">
              epiML Authentication
            </span>
          </div>
          <h2 className="text-xl font-light tracking-tight text-foreground">
            {tab === "signin" ? "Sign In to Start Experiment" : "Create Account to Start Experiment"}
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            An authenticated researcher session is required to initialize deterministic hardware protocols and save experiment telemetry.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 p-1 bg-muted rounded-xl mb-4 text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              setTab("signin");
              setError(null);
            }}
            className={`py-1.5 rounded-lg transition-all text-center ${
              tab === "signin"
                ? "bg-background text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("signup");
              setError(null);
            }}
            className={`py-1.5 rounded-lg transition-all text-center ${
              tab === "signup"
                ? "bg-background text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Notice Alert */}
        {notice && (
          <div className="mb-4 p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{notice}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {tab === "signup" && (
            <div className="space-y-1">
              <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Full Name
              </label>
              <Input
                type="text"
                placeholder="Dr. Alex Morgan"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                leftIcon={<UserIcon className="w-4 h-4" />}
                className="h-10 text-xs"
                autoComplete="name"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="scientist@laboratory.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              className="h-10 text-xs"
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Password
            </label>
            <Input
              type="password"
              placeholder={tab === "signup" ? "Min 6 characters" : "••••••••••••"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              className="h-10 text-xs"
              autoComplete={tab === "signup" ? "new-password" : "current-password"}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{tab === "signin" ? "Sign In & Start Experiment" : "Create Account & Start Experiment"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </Button>
        </form>

        {/* Footer links */}
        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Need full screen auth?</span>
          <Link
            href={tab === "signin" ? "/auth/login?redirect=step-1" : "/auth/signup?redirect=step-1"}
            className="text-primary hover:underline font-medium inline-flex items-center gap-1"
          >
            <span>Open {tab === "signin" ? "Login" : "Sign Up"} Page</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
