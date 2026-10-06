"use client";

import React, { useState, useEffect } from "react";
import {
  Sprout,
  ArrowRight,
  Play,
  Eye,
  Layers,
  Compass,
  CheckCircle2,
  Usb,
  User,
  Lock,
  Mail,
  Loader2,
  ShieldCheck,
  AlertCircle,
  LogOut,
  Sparkles
} from "lucide-react";
import { supabase, isSupabaseConfigured, setLocalUser, ChiguruUser } from "@/lib/supabaseClient";

interface LandingHeroProps {
  onStartMonitoring: () => void;
  onLearnMore: () => void;
  onOpenJuryFlow: () => void;
  onOpenHardwareModal?: () => void;
  user?: ChiguruUser | null;
  onAuthenticated?: (user: ChiguruUser) => void;
  onOpenDashboard?: () => void;
  onLogout?: () => void;
}

export default function LandingHero({
  onStartMonitoring,
  onLearnMore,
  onOpenJuryFlow,
  onOpenHardwareModal,
  user,
  onAuthenticated,
  onOpenDashboard,
  onLogout,
}: LandingHeroProps) {
  // Animated progression: Seed (0) -> Emergence (1) -> Young Seedling (2)
  const [animStage, setAnimStage] = useState<number>(0);

  // Embedded Landing Auth State (Simple Sign In / Sign Up right on /)
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimStage((prev) => (prev + 1) % 3);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const handleInlineAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (!email || !password) {
      setAuthError("Please provide both email and password.");
      return;
    }

    setAuthLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        if (authMode === "signup") {
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
            if (onAuthenticated) onAuthenticated(newUser);
          } else if (data.user) {
            setAuthSuccess("Account created! Check email or sign in below.");
            setAuthMode("signin");
          }
        } else {
          // Sign In
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
            if (onAuthenticated) onAuthenticated(authedUser);
          }
        }
      } else {
        // Fallback local guest login
        const guestUser: ChiguruUser = {
          id: "local-user-session",
          email: email || "researcher@example.com",
          name: fullName.trim() || (email ? email.split("@")[0] : "Dr. Researcher"),
          role: "researcher",
        };
        setLocalUser(guestUser);
        if (onAuthenticated) onAuthenticated(guestUser);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setAuthError(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleInstantGuestLogin = () => {
    const guestUser: ChiguruUser = {
      id: "evaluator-session-01",
      email: "evaluator@chiguru.org",
      name: "Dr. Evaluator (YEN NOVA)",
      role: "evaluator",
      isGuest: true,
    };
    setLocalUser(guestUser);
    if (onAuthenticated) onAuthenticated(guestUser);
  };

  return (
    <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-20 border-b border-[#E2E8DC] bg-gradient-to-b from-[#FAFBF9] via-[#F4F7F2] to-white">
      
      {/* Background Subtle Geometry Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#E8EFE5_1px,transparent_1px),linear-gradient(to_bottom,#E8EFE5_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Product Category Pill */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#2D6A4F]/10 text-[#2D6A4F] border border-[#2D6A4F]/20">
            <Sprout className="w-3.5 h-3.5 text-[#2D6A4F]" />
            Intelligent Seed & Seedling Monitoring
          </span>
          <span className="text-xs text-[#52796F] font-mono">
            TerraByte • YEN NOVA 1.0
          </span>
        </div>

        {/* Hero Headlines */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#163828] tracking-tight leading-[1.1]">
            CHIGURU
          </h1>
          <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-[#2D6A4F] tracking-tight">
            See the seed become a seedling.
          </h2>
          <p className="mt-5 text-base sm:text-lg text-[#52796F] leading-relaxed max-w-2xl mx-auto font-normal">
            A simple intelligent platform for monitoring seed germination and early seedling growth using real environmental measurements and computer vision.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onStartMonitoring}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-sm font-bold bg-[#2D6A4F] hover:bg-[#1B4332] text-white shadow-md shadow-[#2D6A4F]/15 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Start Monitoring</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={onLearnMore}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-bold text-[#163828] hover:bg-[#EBF2E8] border border-[#D5E0D0] transition-all"
            >
              How It Works
            </button>

            <button
              onClick={onOpenJuryFlow}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl text-sm font-bold text-[#C85038] hover:bg-[#E76F51]/10 border border-[#E76F51]/30 transition-all flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 text-[#E76F51]" />
              2-Min Jury Tour
            </button>

            {onOpenHardwareModal && (
              <button
                onClick={onOpenHardwareModal}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl text-sm font-bold text-[#2D6A4F] hover:bg-[#EBF2E8] border border-[#B7D1C5] transition-all flex items-center justify-center gap-1.5"
              >
                <Usb className="w-4 h-4 text-[#2D6A4F]" />
                Connect Hardware
              </button>
            )}
          </div>

          <p className="mt-4 text-xs text-[#748E84] italic">
            “You tell Chiguru the seed. Chiguru watches it grow.”
          </p>
        </div>

        {/* ========================================================================= */}
        {/* SIMPLE SIGN IN / SIGN UP CARD ON ROOT (LANDING PAGE) */}
        {/* ========================================================================= */}
        <div className="mt-12 max-w-xl mx-auto bg-white rounded-3xl border border-[#D5E0D0] shadow-lg shadow-black/5 p-6 sm:p-7">
          
          {user ? (
            /* Logged-In Active User Callout with Complete Covered Profile Summary */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <div className="w-13 h-13 rounded-2xl bg-[#EBF2E8] text-[#2D6A4F] flex items-center justify-center font-black text-xl border border-[#B7D1C5] shadow-xs">
                      {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#2D6A4F] border-2 border-white ring-1 ring-[#52B788]" title="Active Session" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <span className="text-base font-extrabold text-[#163828]">
                        Welcome, {user.name || user.email.split("@")[0]}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#EBF2E8] text-[#2D6A4F] uppercase border border-[#B7D1C5]">
                        {user.role}
                      </span>
                      {user.isGuest && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          Demo Mode
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#52796F] mt-0.5">
                      {user.email} • Session Authenticated
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={onOpenDashboard || onStartMonitoring}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold bg-[#2D6A4F] hover:bg-[#1B4332] text-white shadow-md shadow-[#2D6A4F]/20 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Open Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  {onLogout && (
                    <button
                      onClick={onLogout}
                      title="Sign Out"
                      className="p-2.5 rounded-xl bg-[#FAFBF9] hover:bg-black/5 text-[#52796F] hover:text-[#163828] border border-[#D5E0D0] transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Covered profile preview bar */}
              <div className="p-3 rounded-2xl bg-[#F4F7F2] border border-[#E2E8DC] text-xs text-[#2D6A4F] flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#2D6A4F]" />
                  <span>Profile verified • Full actuator & computer vision controls active</span>
                </span>
                <span className="font-mono text-[11px] text-[#52796F]">
                  ID: {user.id.slice(0, 14)}...
                </span>
              </div>
            </div>
          ) : (
            /* Unauthenticated: Simple Sign In & Sign Up Form */
            <div className="space-y-4">
              
              {/* Tab Header: Sign In vs Sign Up */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8EFE5] pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-[#163828]">
                    {authMode === "signin" ? "Sign In to Chiguru" : "Create Research Account"}
                  </h3>
                  <p className="text-xs text-[#52796F] mt-0.5">
                    {authMode === "signin"
                      ? "Sign in with any email (Gmail, personal, work) to open your dashboard."
                      : "Simple signup with any email address. No institutional email required."}
                  </p>
                </div>

                <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F4F7F2] border border-[#E2E8DC] text-xs font-bold self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signin");
                      setAuthError(null);
                      setAuthSuccess(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      authMode === "signin"
                        ? "bg-[#2D6A4F] text-white shadow-xs"
                        : "text-[#52796F] hover:text-[#163828]"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signup");
                      setAuthError(null);
                      setAuthSuccess(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      authMode === "signup"
                        ? "bg-[#2D6A4F] text-white shadow-xs"
                        : "text-[#52796F] hover:text-[#163828]"
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
              </div>

              {/* Status Alerts */}
              {authError && (
                <div className="p-3 rounded-xl bg-[#FFF5F3] border border-[#FAD2CA] text-xs text-[#C85038] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {authSuccess && (
                <div className="p-3 rounded-xl bg-[#E8F7EC] border border-[#A7E2BA] text-xs text-[#1E4D36] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2D6A4F]" />
                  <span>{authSuccess}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleInlineAuthSubmit} className="space-y-3">
                
                {authMode === "signup" && (
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
                        required={authMode === "signup"}
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D5E0D0] focus:border-[#2D6A4F] focus:outline-none text-xs text-[#163828] bg-[#FAFBF9]"
                      />
                      <User className="w-4 h-4 text-[#748E84] absolute left-3 top-2.5" />
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
                      placeholder="you@example.com (or yourname@gmail.com)"
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D5E0D0] focus:border-[#2D6A4F] focus:outline-none text-xs text-[#163828] bg-[#FAFBF9]"
                    />
                    <Mail className="w-4 h-4 text-[#748E84] absolute left-3 top-2.5" />
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
                      placeholder="Min 6 characters"
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D5E0D0] focus:border-[#2D6A4F] focus:outline-none text-xs text-[#163828] bg-[#FAFBF9]"
                    />
                    <Lock className="w-4 h-4 text-[#748E84] absolute left-3 top-2.5" />
                  </div>
                </div>

                <div className="pt-1 flex flex-col sm:flex-row gap-2">
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#2D6A4F] hover:bg-[#1B4332] text-white shadow-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    {authLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>{authMode === "signin" ? "Sign In & Open Dashboard" : "Create Account & Open Dashboard"}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleInstantGuestLogin}
                    className="py-2.5 px-3.5 rounded-xl text-xs font-semibold bg-[#FAFBF9] hover:bg-[#EBF2E8] text-[#163828] border border-[#D5E0D0] transition-all flex items-center justify-center gap-1.5"
                    title="1-Click immediate demo access"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#2D6A4F]" />
                    <span>1-Click Evaluator</span>
                  </button>
                </div>
              </form>

              <div className="pt-2 border-t border-[#E8EFE5] flex items-center justify-between text-[11px] text-[#748E84]">
                <span className="flex items-center gap-1 text-[#2D6A4F] font-medium">
                  <Sparkles className="w-3 h-3 text-[#2D6A4F]" />
                  <span>No institutional email required</span>
                </span>
                <span>Supabase PostgreSQL Auth</span>
              </div>

            </div>
          )}

        </div>

        {/* Real 40-Cell Tray Interactive Emergence Visualizer */}
        <div className="mt-14 max-w-4xl mx-auto rounded-2xl bg-white border border-[#D5E0D0] p-6 sm:p-8 shadow-sm">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#E8EFE5]">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#52B788]" />
                <h3 className="text-sm font-extrabold text-[#163828] uppercase tracking-wider">
                  The 40-Cell Nursery Tray Matrix
                </h3>
              </div>
              <p className="text-xs text-[#52796F] mt-0.5">
                Fixed 420mm overhead computer vision geometry tracks every individual seedling cell.
              </p>
            </div>

            {/* Micro Stage Progression Pill */}
            <div className="flex items-center gap-1.5 bg-[#F4F7F2] p-1 rounded-xl border border-[#E2E8DC] text-xs font-semibold self-start sm:self-auto">
              <span
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  animStage === 0
                    ? "bg-[#2D6A4F] text-white"
                    : "text-[#52796F]"
                }`}
              >
                1. Sown
              </span>
              <span
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  animStage === 1
                    ? "bg-[#2D6A4F] text-white"
                    : "text-[#52796F]"
                }`}
              >
                2. Emergence
              </span>
              <span
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  animStage === 2
                    ? "bg-[#2D6A4F] text-white"
                    : "text-[#52796F]"
                }`}
              >
                3. Seedling
              </span>
            </div>
          </div>

          {/* Tray Visualization Preview */}
          <div className="mt-6 grid grid-cols-8 gap-2 max-w-2xl mx-auto p-4 rounded-xl bg-[#F0F4EC] border border-[#E2E8DC]">
            {Array.from({ length: 40 }).map((_, idx) => {
              const cellNum = idx + 1;
              const isGerminated = cellNum === 17 || cellNum === 8 || cellNum === 24 || (animStage >= 1 && (cellNum % 3 === 0));
              const isEmerging = animStage >= 1 && (cellNum % 5 === 0);

              return (
                <div
                  key={idx}
                  className={`aspect-square rounded-lg border flex flex-col items-center justify-center p-1 transition-all ${
                    isGerminated
                      ? "bg-[#D8F3DC] border-[#74C69D] text-[#1B4332]"
                      : isEmerging
                      ? "bg-[#FFF3CD] border-[#FFE69C] text-[#856404]"
                      : "bg-white border-[#E2E8DC] text-[#748E84]"
                  }`}
                >
                  <span className="text-[9px] font-mono font-bold leading-none">
                    C{cellNum < 10 ? `0${cellNum}` : cellNum}
                  </span>
                  <div
                    className={`w-2 h-2 rounded-full mt-1 ${
                      isGerminated
                        ? "bg-[#2D6A4F]"
                        : isEmerging
                        ? "bg-[#E76F51]"
                        : "bg-[#D5E0D0]"
                    }`}
                  />
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
