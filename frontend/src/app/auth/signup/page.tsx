"use client";

export const dynamic = "force-dynamic";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { User, Mail, Lock, AlertCircle, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccessAwaitingConfirmation, setIsSuccessAwaitingConfirmation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    const cleanName = fullName.trim() || cleanEmail.split("@")[0];

    if (!cleanEmail || !password) {
      setError("Please provide all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
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

        // If auto-confirm is enabled or session is immediately returned
        if (data?.session && data?.user) {
          const authedUser = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            name: cleanName,
          };
          if (typeof window !== "undefined") {
            localStorage.setItem("chiguru_auth_user", JSON.stringify(authedUser));
          }
          if (redirectTarget === "step-1" || redirectTarget.includes("step=1")) {
            router.push("/?step=1");
          } else {
            router.push(redirectTarget);
          }
          return;
        }

        // If email confirmation is required by Supabase project settings
        if (data?.user && !data?.session) {
          setIsSuccessAwaitingConfirmation(true);
          return;
        }
      } else {
        // Local offline fallback
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "chiguru_auth_user",
            JSON.stringify({
              id: "user-" + Date.now(),
              email: cleanEmail,
              name: cleanName,
            })
          );
        }
        if (redirectTarget === "step-1" || redirectTarget.includes("step=1")) {
          router.push("/?step=1");
        } else {
          router.push(redirectTarget);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (isSuccessAwaitingConfirmation) {
    return (
      <Card className="border border-border bg-card shadow-sm rounded-2xl p-6 sm:p-8 text-center space-y-6">
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-light tracking-tight text-foreground">
            Account Created
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            Your researcher account has been registered for <strong className="text-foreground">{email}</strong>.
            You can now sign in to start your autonomous experiment.
          </p>
        </div>
        <Button
          onClick={() => {
            router.push(`/auth/login?redirect=${encodeURIComponent(redirectTarget)}`);
          }}
          className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
        >
          Proceed to Sign In
        </Button>
      </Card>
    );
  }

  return (
    <Card className="border border-border bg-card shadow-sm rounded-2xl p-6 sm:p-8">
      <CardContent className="p-0 space-y-6">
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-xl font-light tracking-tight hover:opacity-80 transition-opacity"
          >
            <span>🌱</span>
            <span>epiML</span>
          </Link>
          <h1 className="text-2xl font-light tracking-tight text-foreground">
            Create Lab Account
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Register to initialize autonomous growth protocols and hardware telemetry.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Full Name
            </label>
            <Input
              type="text"
              placeholder="Dr. Alex Morgan"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
              autoComplete="name"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Email
            </label>
            <Input
              type="email"
              placeholder="scientist@laboratory.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Password
            </label>
            <Input
              type="password"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              autoComplete="new-password"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Confirm Password
            </label>
            <Input
              type="password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              autoComplete="new-password"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="w-full h-12 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Create Account & Start</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        {/* Bottom link toggle */}
        <div className="text-center pt-2 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href={
                redirectTarget === "step-1"
                  ? "/auth/login?redirect=step-1"
                  : `/auth/login${redirectTarget !== "/" ? `?redirect=${encodeURIComponent(redirectTarget)}` : ""}`
              }
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          }
        >
          <SignUpForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
