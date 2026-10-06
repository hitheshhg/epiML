"use client";

import React, { useState } from "react";
import { Language, translations, LANGUAGES } from "@/lib/translations";
import { DataClass, DATA_CLASS_META } from "@/lib/experimentTypes";
import {
  Microscope,
  Cpu,
  Globe,
  Settings,
  ChevronDown,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileText,
  Layers,
  Activity,
  Compass,
  Database,
  BookOpen,
  Sliders,
  PlayCircle,
} from "lucide-react";

interface ResearchNavbarProps {
  lang: Language;
  setLang: (lang: Language) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  dataClass: DataClass;
  activeExperimentId: string;
  activeCropName: string;
  isHardwareLive: boolean;
  serialConnected: boolean;
  onConnectSerial: () => Promise<boolean>;
  onRefresh: () => void;
  onOpenReport: () => void;
  onOpenJuryDemo: () => void;
}

export default function ResearchNavbar({
  lang,
  setLang,
  activeTab,
  setActiveTab,
  dataClass,
  activeExperimentId,
  activeCropName,
  isHardwareLive,
  serialConnected,
  onConnectSerial,
  onRefresh,
  onOpenReport,
  onOpenJuryDemo,
}: ResearchNavbarProps) {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const meta = DATA_CLASS_META[dataClass] || DATA_CLASS_META.MEASURED;

  const handleSerialClick = async () => {
    setIsConnecting(true);
    try {
      await onConnectSerial();
    } finally {
      setIsConnecting(false);
    }
  };

  const currentLang = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Operational Bar */}
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1B4332] flex items-center justify-center text-white shadow-md">
              <Microscope className="w-5 h-5 text-[#74C69D]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-[#0F291E] tracking-tight">
                  CHIGURU 2.0
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E8F5E9] text-[#2D6A4F] border border-[#C8E6C9]">
                  RESEARCH PLATFORM
                </span>
              </div>
              <p className="text-[11px] text-[#4A5568] hidden sm:block">
                Intelligent Seed & Seedling Research Platform • Team TerraByte
              </p>
            </div>
          </div>

          {/* Active Experiment & Data Integrity Badges */}
          <div className="hidden md:flex items-center gap-2.5">
            <div className="px-3 py-1 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-xs font-mono flex items-center gap-2">
              <span className="text-[#64748B] font-medium">EXPERIMENT:</span>
              <strong className="text-[#0F172A] font-bold">{activeExperimentId}</strong>
              <span className="text-[#94A3B8]">|</span>
              <span className="text-[#059669] font-semibold">{activeCropName}</span>
            </div>

            <div className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border flex items-center gap-1.5 ${meta.colorClass}`}>
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              {meta.badgeText}
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2">
            
            {/* Jury Demo Button */}
            <button
              onClick={onOpenJuryDemo}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#EA580C] hover:bg-[#C2410C] text-white flex items-center gap-1.5 shadow-sm transition-all"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Jury Scenarios</span>
            </button>

            {/* Hardware Connect Pill */}
            <button
              onClick={handleSerialClick}
              disabled={isConnecting}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border flex items-center gap-1.5 transition-all ${
                serialConnected || isHardwareLive
                  ? "bg-[#EBF7EE] text-[#1B4332] border-[#A7D7B5]"
                  : "bg-[#F1F5F9] text-[#475569] border-[#CBD5E1] hover:bg-[#E2E8F0]"
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-[#2D6A4F]" />
              <span>{serialConnected ? "USB: LIVE" : "Connect Hardware"}</span>
            </button>

            {/* Generate Report Button */}
            <button
              onClick={onOpenReport}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold bg-[#0F291E] hover:bg-[#1B4332] text-white flex items-center gap-1.5 transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-[#74C69D]" />
              <span className="hidden sm:inline">Report</span>
            </button>

            {/* Language Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="p-2 rounded-lg text-xs font-medium bg-[#F8FAFC] border border-[#CBD5E1] text-[#334155] flex items-center gap-1 hover:bg-[#E2E8F0]"
              >
                <Globe className="w-3.5 h-3.5 text-[#0F291E]" />
                <span className="text-[11px] font-bold">{currentLang.code.toUpperCase()}</span>
                <ChevronDown className="w-3 h-3 text-[#64748B]" />
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-1 w-36 rounded-xl bg-white border border-[#E2E8F0] shadow-xl py-1 z-50">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLang(l.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-[#F1F5F9] ${
                        lang === l.code ? "font-bold text-[#1B4332] bg-[#E8F5E9]" : "text-[#475569]"
                      }`}
                    >
                      <span>{l.nativeName}</span>
                      <span className="text-[10px] text-[#94A3B8] font-mono">{l.code.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Bottom Scientific Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto py-2 border-t border-[#F1F5F9] no-scrollbar text-xs font-semibold">
          {[
            { id: "overview", label: "Active Experiment", icon: Activity },
            { id: "tray", label: "40-Cell Digital Twin", icon: Layers },
            { id: "analytics", label: "Exposure ↔ Response", icon: Compass },
            { id: "treatments", label: "Treatment Analysis", icon: Sliders },
            { id: "sensors", label: "Micro-Environment", icon: Cpu },
            { id: "calibration", label: "Sensor Calibration", icon: Settings },
            { id: "evidence", label: "Evidence & Citations", icon: BookOpen },
            { id: "publicdata", label: "External Repositories", icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shrink-0 ${
                  isActive
                    ? "bg-[#1B4332] text-white shadow-sm"
                    : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#74C69D]" : "text-[#64748B]"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

      </div>
    </header>
  );
}
