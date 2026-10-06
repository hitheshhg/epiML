"use client";

import React from "react";
import {
  Sprout,
  Activity,
  BarChart3,
  Cpu,
  BookOpen,
  User,
  LogOut,
  Play,
  RotateCcw,
  Wifi,
  WifiOff,
  Globe,
  Sliders,
  CheckCircle2,
  Usb
} from "lucide-react";
import { ChiguruUser } from "@/lib/supabaseClient";
import { Language } from "@/lib/translations";

export type ActiveTab = "home" | "monitor" | "research" | "technology" | "references";

interface HeaderNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  user: ChiguruUser | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  isHardwareLive: boolean;
  serialConnected: boolean;
  onOpenHardwareModal: () => void;
  onOpenPlantSearch: () => void;
  onTriggerJuryDemo: () => void;
  lang: Language;
  onLangChange: (lang: Language) => void;
  activeCropName: string;
}

export default function HeaderNav({
  activeTab,
  onTabChange,
  user,
  onOpenAuth,
  onLogout,
  isHardwareLive,
  serialConnected,
  onOpenHardwareModal,
  onOpenPlantSearch,
  onTriggerJuryDemo,
  lang,
  onLangChange,
  activeCropName,
}: HeaderNavProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E2E8DC] bg-[#FAFBF9]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left Brand Identity */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => onTabChange("home")}
              className="flex items-center gap-2.5 text-left group transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-[#2D6A4F] flex items-center justify-center text-white shadow-sm group-hover:bg-[#1B4332] transition-colors">
                <Sprout className="w-5 h-5 text-[#D8F3DC]" />
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-extrabold tracking-tight text-[#163828]">
                    CHIGURU
                  </span>
                  <span className="text-xs font-medium text-[#52796F]">
                    (ಚಿಗುರು)
                  </span>
                </div>
                <p className="text-[10px] text-[#748E84] font-medium tracking-wide">
                  Seed & Seedling Intelligence
                </p>
              </div>
            </button>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => onTabChange("home")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "home"
                    ? "bg-[#EBF2E8] text-[#163828]"
                    : "text-[#52796F] hover:text-[#163828] hover:bg-black/5"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => onTabChange("monitor")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === "monitor"
                    ? "bg-[#2D6A4F] text-white shadow-sm"
                    : "text-[#52796F] hover:text-[#163828] hover:bg-black/5"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                Monitor
                {activeCropName && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20 text-white font-normal">
                    {activeCropName}
                  </span>
                )}
              </button>
              <button
                onClick={() => onTabChange("research")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === "research"
                    ? "bg-[#EBF2E8] text-[#163828]"
                    : "text-[#52796F] hover:text-[#163828] hover:bg-black/5"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Research
              </button>
              <button
                onClick={() => onTabChange("technology")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === "technology"
                    ? "bg-[#EBF2E8] text-[#163828]"
                    : "text-[#52796F] hover:text-[#163828] hover:bg-black/5"
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                Technology
              </button>
              <button
                onClick={() => onTabChange("references")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === "references"
                    ? "bg-[#EBF2E8] text-[#163828]"
                    : "text-[#52796F] hover:text-[#163828] hover:bg-black/5"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                References
              </button>
            </nav>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2.5">
            
            {/* Quick 1-Click Jury Flow Button */}
            <button
              onClick={onTriggerJuryDemo}
              title="Launch 2-minute Jury Demonstration Flow"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#E76F51]/10 text-[#C85038] hover:bg-[#E76F51]/20 border border-[#E76F51]/30 transition-all shadow-sm"
            >
              <Play className="w-3.5 h-3.5 text-[#E76F51]" />
              Jury Flow (2 Min)
            </button>

            {/* Hardware Connection Button & Indicator */}
            <button
              onClick={onOpenHardwareModal}
              title="Connect physical Arduino Uno or manage hardware connection"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isHardwareLive || serialConnected
                  ? "bg-[#EBF2E8] text-[#2D6A4F] border-[#B7D1C5] hover:bg-[#DDF0DC]"
                  : "bg-[#FFF9F5] text-[#C85038] border-[#F2C4B8] hover:bg-[#FDECE8]"
              }`}
            >
              <Usb className="w-3.5 h-3.5" />
              {isHardwareLive || serialConnected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#2D6A4F] animate-pulse" />
                  <span>Hardware Connected</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#E76F51]" />
                  <span>Connect Hardware</span>
                </>
              )}
            </button>

            {/* Auth / Account Profile Button */}
            {user ? (
              <div className="flex items-center gap-2 pl-1">
                <span className="hidden sm:inline-block text-xs font-medium text-[#2D4A3E]">
                  {user.name || user.email.split("@")[0]}
                </span>
                <button
                  onClick={onLogout}
                  title="Sign out"
                  className="p-1.5 rounded-lg hover:bg-black/5 text-[#52796F] hover:text-[#163828]"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-[#163828] hover:bg-black/5 border border-[#D5E0D0] transition-all"
              >
                Sign In
              </button>
            )}

            {/* Primary Seed CTA */}
            <button
              onClick={onOpenPlantSearch}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#2D6A4F] hover:bg-[#1B4332] text-white shadow-sm transition-all flex items-center gap-1.5"
            >
              <Sprout className="w-3.5 h-3.5" />
              <span>Select Seed</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}
