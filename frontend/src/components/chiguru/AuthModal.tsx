"use client";

import React, { useState } from "react";
import { X, Lock, Mail, User, Sprout, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { supabase, isSupabaseConfigured, setLocalUser, ChiguruUser } from "@/lib/supabaseClient";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (user: ChiguruUser) => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  onAuthenticated,
}: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSupabaseAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);

    if (isSupabaseConfigured && supabase) {
      try {
        if (isSignUp) {
          const { data, error: signUpErr } = await supabase.auth.signUp({
            email,
            password,
          });
          if (signUpErr) throw signUpErr;
          if (data.user) {
            const newUser: ChiguruUser = {
              id: data.user.id,
              email: data.user.email || email,
              role: "researcher",
            };
            setLocalUser(newUser);
            onAuthenticated(newUser);
            onClose();
          }
        } else {
          const { data, error: signInErr } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (signInErr) throw signInErr;
          if (data.user) {
            const newUser: ChiguruUser = {
              id: data.user.id,
              email: data.user.email || email,
              role: "researcher",
            };
            setLocalUser(newUser);
            onAuthenticated(newUser);
            onClose();
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
      } finally {
        setLoading(false);
      }
    } else {
      // Offline / Local evaluation mode when Supabase env vars not yet deployed
      const guestUser: ChiguruUser = {
        id: "evaluator-session-01",
        email: email || "evaluator@chiguru.org",
        name: "YEN NOVA Evaluator",
        role: "evaluator",
        isGuest: true,
      };
      setLocalUser(guestUser);
      onAuthenticated(guestUser);
      onClose();
    }
  };

  const handleInstantEvaluatorLogin = () => {
    const guestUser: ChiguruUser = {
      id: "evaluator-session-01",
      email: "evaluator@yenepoya.edu.in",
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
      <div className="bg-white rounded-2xl border border-[#D5E0D0] shadow-2xl max-w-md w-full overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-[#E2E8DC] bg-[#FAFBF9] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2D6A4F] text-white flex items-center justify-center">
              <Sprout className="w-4 h-4 text-[#D8F3DC]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#163828]">
                {isSignUp ? "Create Research Account" : "Sign In to Chiguru"}
              </h3>
              <p className="text-xs text-[#52796F]">
                Access persistent seedling monitoring histories.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-black/5 text-[#52796F]"
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

          <form onSubmit={handleSupabaseAuth} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-[#163828] mb-1">
                Institutional Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="researcher@institution.edu"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D5E0D0] focus:border-[#2D6A4F] focus:outline-none text-xs text-[#163828] bg-[#FAFBF9]"
                />
                <Mail className="w-4 h-4 text-[#748E84] absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#163828] mb-1">
                Password
              </label>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-xs font-bold bg-[#2D6A4F] hover:bg-[#1B4332] text-white shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? "Create Account" : "Sign In"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

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
              Enables full evaluation without setting up an external database.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E2E8DC] bg-[#FAFBF9] text-center text-xs text-[#52796F]">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-bold text-[#2D6A4F] hover:underline"
          >
            {isSignUp ? "Already have an account? Sign In" : "Need an account? Create one"}
          </button>
        </div>

      </div>
    </div>
  );
}
