"use client";

export const dynamic = "force-dynamic";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, AlertCircle, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError("Please provide both email and password.");
      return;
    }

    setLoading(true);
    try {
      if (supabase) {
        const { data, error: signInErr } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (signInErr) {
          // Provide friendly user-facing error messages
          if (signInErr.message.includes("Invalid login credentials")) {
            throw new Error("Invalid email or password. Please verify your credentials and try again.");
          } else if (signInErr.message.includes("Email not confirmed")) {
            throw new Error("Email not confirmed yet. Run the auto-confirm SQL query in Supabase or confirm via your inbox link.");
          } else {
            throw signInErr;
          }
        }

        if (data?.user) {
          const authedUser = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            name:
              (data.user.user_metadata?.full_name as string) ||
              (data.user.user_metadata?.name as string) ||
              data.user.email?.split("@")[0] ||
              "Researcher",
          };
          if (typeof window !== "undefined") {
            localStorage.setItem("chiguru_auth_user", JSON.stringify(authedUser));
          }
        }
      } else {
        // Local fallback when Supabase credentials are offline
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "chiguru_auth_user",
            JSON.stringify({
              id: "user-" + Date.now(),
              email: cleanEmail,
              name: cleanEmail.split("@")[0],
            })
          );
        }
      }

      // Smooth transition to requested target
      if (redirectTarget === "step-1" || redirectTarget.includes("step=1")) {
        router.push("/?step=1");
      } else {
        router.push(redirectTarget);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

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
            Sign In to Lab
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {redirectTarget === "step-1"
              ? "Sign in to start your autonomous crop experiment."
              : "Sign in to manage your experiments and autonomous protocols."}
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
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Password
              </label>
            </div>
            <Input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              autoComplete="current-password"
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
                <span>Sign In & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        {/* Bottom link toggle */}
        <div className="text-center pt-2 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href={
                redirectTarget === "step-1"
                  ? "/auth/signup?redirect=step-1"
                  : `/auth/signup${redirectTarget !== "/" ? `?redirect=${encodeURIComponent(redirectTarget)}` : ""}`
              }
              className="text-primary font-medium hover:underline"
            >
              Create account
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
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
          <LoginForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
