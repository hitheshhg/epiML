"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { Sprout, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInWithGoogle, signInAsGuest, isSupabaseConnected } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    const res = await signIn(email, password);
    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      router.push("/monitor/new");
    }
  };

  const handleGuestDemo = () => {
    signInAsGuest();
    router.push("/monitor/new");
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-[#F8FAF6] px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2D6A4F] text-white shadow-sm">
            <Sprout className="h-6 w-6" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-[#163828]">
                CHIGURU
              </span>
              <span className="text-xs font-semibold text-[#52796F]">
                ಚಿಗುರು
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-wider text-[#4A6B5D]">
              Intelligent Seed Monitoring
            </p>
          </div>
        </Link>

        <h1 className="mt-8 text-center text-2xl font-bold tracking-tight text-[#163828]">
          Welcome back
        </h1>
        <p className="mt-2 text-center text-xs text-[#52796F]">
          Sign in to access your monitored seeds and biological sessions.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-2xl border border-[#E2E8DC] bg-white p-8 shadow-sm">
          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-[#163828]"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="researcher@lab.org"
                className="mt-1 block w-full rounded-xl border border-[#D1D5DB] bg-[#F8FAF6] px-3.5 py-2.5 text-sm text-[#163828] placeholder-[#9CA3AF] focus:border-[#2D6A4F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-wider text-[#163828]"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert("For evaluation demo, sign in with your email or use the 1-click Jury Mode.")}
                  className="text-[11px] text-[#2D6A4F] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 block w-full rounded-xl border border-[#D1D5DB] bg-[#F8FAF6] px-3.5 py-2.5 text-sm text-[#163828] placeholder-[#9CA3AF] focus:border-[#2D6A4F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2D6A4F] py-3 text-sm font-bold text-white shadow-sm hover:bg-[#1B4332] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] transition-all disabled:opacity-50"
            >
              <span>{loading ? "Signing in..." : "Sign in"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Google OAuth Login */}
          <div className="mt-4">
            <button
              type="button"
              onClick={async () => {
                const res = await signInWithGoogle();
                if (res.error) setError(res.error);
              }}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-[#D1D5DB] bg-white py-2.5 text-xs font-bold text-[#1F2937] hover:bg-[#F9FAFB] shadow-xs transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </div>

          {/* 1-Click Evaluation Mode */}
          <div className="mt-5 border-t border-[#F0F4EC] pt-4">
            <button
              type="button"
              onClick={handleGuestDemo}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#74C69D] bg-[#E8F7EC] py-2.5 text-xs font-bold text-[#1E4D36] hover:bg-[#D8F3DC] transition-colors"
            >
              <Sparkles className="h-4 w-4 text-[#2D6A4F]" />
              <span>Continue as Guest / Jury Evaluation Mode</span>
            </button>
            <p className="mt-2 text-center text-[10px] text-[#52796F]">
              Instant access without email verification for YEN NOVA 1.0 judges.
            </p>
          </div>

          <div className="mt-6 text-center text-xs text-[#52796F]">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-bold text-[#2D6A4F] hover:underline"
            >
              Create account
            </Link>
          </div>
        </div>

        {/* Supabase Status Pill */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-[#6C757D]">
          <ShieldCheck className="h-3.5 w-3.5 text-[#2D6A4F]" />
          <span>
            {isSupabaseConnected ? "Supabase Auth Active" : "Local-First Authenticated Mode Active"}
          </span>
        </div>
      </div>
    </div>
  );
}
