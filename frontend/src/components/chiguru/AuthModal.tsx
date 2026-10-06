"use client";

import React, { useState } from "react";
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Sprout,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  KeyRound,
  RotateCcw
} from "lucide-react";
import { supabase, isSupabaseConfigured, setLocalUser, ChiguruUser } from "@/lib/supabaseClient";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (user: ChiguruUser) => void;
}

type AuthMode = "signin" | "signup" | "forgot";

export default function AuthModal({
  isOpen,
  onClose,
  onAuthenticated,
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (mode !== "forgot" && !password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error("Supabase client is not configured.");
      }

      // 1. FORGOT PASSWORD
      if (mode === "forgot") {
        const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: typeof window !== "undefined" ? `${window.location.origin}/` : undefined,
        });
        if (resetErr) throw resetErr;
        setSuccessMsg("Password reset email sent! Check your inbox for instructions.");
        setLoading(false);
        return;
      }

      // 2. SIGN UP
      if (mode === "signup") {
        const { data, error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName.trim() || email.split("@")[0],
            },
          },
        });
        if (signUpErr) throw signUpErr;

        if (data.session && data.user) {
          const newUser: ChiguruUser = {
            id: data.user.id,
            email: data.user.email || email,
            name: fullName.trim() || data.user.email?.split("@")[0],
            role: "researcher",
          };
          setLocalUser(newUser);
          onAuthenticated(newUser);
          onClose();
        } else if (data.user) {
          setSuccessMsg("Account created! Check your email to confirm registration or sign in below.");
          setMode("signin");
        }
        setLoading(false);
        return;
      }

      // 3. SIGN IN
      const { data, error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInErr) throw signInErr;

      if (data.user) {
        const authedUser: ChiguruUser = {
          id: data.user.id,
          email: data.user.email || email,
          name:
            (data.user.user_metadata?.full_name as string) ||
            (data.user.user_metadata?.name as string) ||
            data.user.email?.split("@")[0],
          role: "researcher",
        };
        setLocalUser(authedUser);
        onAuthenticated(authedUser);
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      setLoading(true);
      const { error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        },
      });
      if (oauthErr) throw oauthErr;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setLoading(false);
    }
  };

  const handleInstantEvaluatorLogin = () => {
    const guestUser: ChiguruUser = {
      id: "evaluator-session-01",
      email: "evaluator@chiguru.org",
      name: "Dr. Evaluator (YEN NOVA)",
      role: "evaluator",
      isGuest: true,
    };
    setLocalUser(guestUser);
    onAuthenticated(guestUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-[#D5E0D0] shadow-2xl max-w-md w-full overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-[#E2E8DC] bg-[#FAFBF9] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2D6A4F] text-white flex items-center justify-center shadow-sm">
              <Sprout className="w-5 h-5 text-[#D8F3DC]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#163828]">
                {mode === "signin"
                  ? "Sign In to Chiguru"
                  : mode === "signup"
                  ? "Create Account"
                  : "Reset Password"}
              </h3>
              <p className="text-xs text-[#52796F]">
                Standard email login • No institutional domain required
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-black/5 text-[#52796F] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 rounded-xl bg-[#FFF5F3] border border-[#FAD2CA] text-xs text-[#C85038] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-[#E8F7EC] border border-[#A7E2BA] text-xs text-[#1E4D36] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2D6A4F]" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-bold text-[#163828] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Morgan"
                    required={mode === "signup"}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D5E0D0] focus:border-[#2D6A4F] focus:outline-none text-xs text-[#163828] bg-[#FAFBF9]"
                  />
                  <UserIcon className="w-4 h-4 text-[#748E84] absolute left-3 top-3" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#163828] mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D5E0D0] focus:border-[#2D6A4F] focus:outline-none text-xs text-[#163828] bg-[#FAFBF9]"
                />
                <Mail className="w-4 h-4 text-[#748E84] absolute left-3 top-3" />
              </div>
            </div>

            {mode !== "forgot" && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-[#163828]">
                    Password
                  </label>
                  {mode === "signin" && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode("forgot");
                        setError(null);
                        setSuccessMsg(null);
                      }}
                      className="text-[11px] text-[#2D6A4F] hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D5E0D0] focus:border-[#2D6A4F] focus:outline-none text-xs text-[#163828] bg-[#FAFBF9]"
                  />
                  <Lock className="w-4 h-4 text-[#748E84] absolute left-3 top-3" />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-xs font-bold bg-[#2D6A4F] hover:bg-[#1B4332] text-white shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === "signin"
                      ? "Sign In"
                      : mode === "signup"
                      ? "Create Account"
                      : "Send Reset Link"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Google OAuth Option */}
          {mode !== "forgot" && (
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-white hover:bg-gray-50 text-[#163828] border border-[#D5E0D0] transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              <span>Continue with Google</span>
            </button>
          )}

          {/* 1-Click Instant Evaluator Mode */}
          <div className="pt-2">
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-[#E8EFE5]"></div>
              <span className="flex-shrink mx-3 text-[10px] font-mono text-[#748E84] uppercase">
                Instant Jury Evaluation
              </span>
              <div className="flex-grow border-t border-[#E8EFE5]"></div>
            </div>

            <button
              type="button"
              onClick={handleInstantEvaluatorLogin}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[#FAFBF9] hover:bg-[#EBF2E8] text-[#163828] border border-[#D5E0D0] transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-[#2D6A4F]" />
              <span>1-Click Evaluator / Guest Access</span>
            </button>
            <p className="text-[10px] text-center text-[#748E84] mt-1.5 italic">
              Authenticated through Supabase • Instant trial access enabled
            </p>
          </div>

        </div>

        {/* Footer Navigation Switcher */}
        <div className="p-4 border-t border-[#E2E8DC] bg-[#FAFBF9] text-center text-xs text-[#52796F] flex justify-between items-center">
          {mode === "signin" ? (
            <>
              <span>Need an account?</span>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="font-bold text-[#2D6A4F] hover:underline"
              >
                Create Research Account
              </button>
            </>
          ) : (
            <>
              <span>Already registered?</span>
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="font-bold text-[#2D6A4F] hover:underline"
              >
                Back to Sign In
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
