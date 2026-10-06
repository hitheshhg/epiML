"use client";

import React, { useState, useRef, useEffect } from "react";
import { translations, LANGUAGES, Language } from "@/lib/translations";
import {
  Sprout,
  Cpu,
  Wifi,
  Globe,
  Settings,
  ChevronDown,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Check
} from "lucide-react";

interface NavbarProps {
  lang: Language;
  setLang: (lang: Language) => void;
  mode: number;
  setMode: (m: number) => void;
  isLive: boolean;
  onConnectSerial: () => Promise<boolean>;
  serialConnected: boolean;
  portName?: string;
  onRefresh: () => void;
}

export default function Navbar({
  lang,
  setLang,
  mode,
  setMode,
  isLive,
  onConnectSerial,
  serialConnected,
  portName = "COM8",
  onRefresh,
}: NavbarProps) {
  const t = translations[lang];
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connMessage, setConnMessage] = useState<string | null>(null);

  const langMenuRef = useRef<HTMLDivElement>(null);

  // Close language menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleWebSerial = async () => {
    setIsConnecting(true);
    setConnMessage("Requesting USB Serial port in browser...");
    try {
      const ok = await onConnectSerial();
      if (ok) {
        setConnMessage("Hardware Serial stream connected successfully!");
        setTimeout(() => setShowConnectModal(false), 1200);
      } else {
        setConnMessage("Connection canceled or unsupported in this browser.");
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setConnMessage("Error: " + errorMsg);
    } finally {
      setIsConnecting(false);
    }
  };

  const currentLangMeta = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/85 border-b border-[#E2E8DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1E4D36] to-[#2D6A4F] flex items-center justify-center text-white shadow-md shadow-[#1E4D36]/20">
              <Sprout className="w-7 h-7 text-[#74C69D]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-[#163828]">
                  {t.appName}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium badge-sprout hidden sm:inline-block">
                  v1.0 CPS
                </span>
              </div>
              <p className="text-xs text-[#52796F] font-medium hidden md:block">
                {t.teamName}
              </p>
            </div>
          </div>

          {/* Center Mode Controls */}
          <div className="hidden lg:flex items-center gap-1.5 p-1 rounded-xl bg-[#F0F4EC] border border-[#E2E8DC]">
            <button
              onClick={() => setMode(0)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 0
                  ? "bg-[#1E4D36] text-white shadow-sm"
                  : "text-[#4F6D5E] hover:text-[#163828] hover:bg-white/60"
              }`}
            >
              0: {t.mode0}
            </button>
            <button
              onClick={() => setMode(1)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 1
                  ? "bg-[#1E4D36] text-white shadow-sm"
                  : "text-[#4F6D5E] hover:text-[#163828] hover:bg-white/60"
              }`}
            >
              1: {t.mode1}
            </button>
            <button
              onClick={() => setMode(2)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 2
                  ? "bg-[#1E4D36] text-white shadow-sm"
                  : "text-[#4F6D5E] hover:text-[#163828] hover:bg-white/60"
              }`}
            >
              2: {t.mode2}
            </button>
          </div>

          {/* Right Action Stack: Hardware Connection + Language Selector */}
          <div className="flex items-center gap-2.5">
            
            {/* Live Hardware Status Pill */}
            <button
              onClick={() => setShowConnectModal(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                serialConnected || isLive
                  ? "bg-[#E8F7EC] text-[#1E4D36] border-[#A7E2BA] hover:bg-[#D8F3DC]"
                  : "bg-[#FFF8F0] text-[#9A6700] border-[#FBD6A4] hover:bg-[#FFF2E0]"
              }`}
              title="Click to manage Hardware Connection"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    serialConnected || isLive ? "bg-[#2D6A4F]" : "bg-[#F4A261]"
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    serialConnected || isLive ? "bg-[#2D6A4F]" : "bg-[#E76F51]"
                  }`}
                />
              </span>
              <span className="font-semibold">
                {serialConnected
                  ? `USB: ${portName}`
                  : isLive
                  ? "Bridge: COM8"
                  : t.hardwareDisconnected}
              </span>
              <Cpu className="w-3.5 h-3.5 opacity-70" />
            </button>

            {/* Best-in-Class Interactive Click-to-Toggle Language Selector */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F0F4EC] hover:bg-[#E4EBDD] text-[#163828] text-xs font-bold border border-[#E2E8DC] transition-all shadow-sm active:scale-95"
                aria-label="Language Selector Menu"
              >
                <Globe className="w-4 h-4 text-[#2D6A4F]" />
                <span className="font-semibold text-xs tracking-wide">
                  {currentLangMeta.nativeName}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#52796F] transition-transform duration-200 ${showLangMenu ? "rotate-180" : ""}`} />
              </button>

              {/* Working Language Dropdown Menu Card */}
              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-2xl border border-[#D5E1CD] p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-[#F0F4EC] mb-1">
                    <span className="text-[11px] font-bold text-[#52796F] uppercase tracking-wider block">
                      Select Interface Language
                    </span>
                    <span className="text-[10px] text-[#7C9A8B]">
                      ಕೃಷಿಕರ ಅನುಕೂಲಕ್ಕಾಗಿ ಬಹುಭಾಷಾ ವ್ಯವಸ್ಥೆ
                    </span>
                  </div>

                  <div className="space-y-1">
                    {LANGUAGES.map((l) => {
                      const isSelected = lang === l.code;
                      return (
                        <button
                          key={l.code}
                          onClick={() => {
                            setLang(l.code);
                            setShowLangMenu(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center justify-between group ${
                            isSelected
                              ? "bg-gradient-to-r from-[#E8F7EC] to-[#D8F3DC] text-[#163828] font-bold border border-[#A7E2BA]"
                              : "text-[#3D5A4C] hover:bg-[#F5F8F2] hover:text-[#163828]"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-lg bg-[#F0F4EC] text-[#2D6A4F] group-hover:bg-white text-[11px] font-extrabold flex items-center justify-center font-mono">
                              {l.badge}
                            </span>
                            <div>
                              <div className="font-bold text-xs text-[#163828]">
                                {l.nativeName}
                              </div>
                              <div className="text-[10px] text-[#7C9A8B]">
                                {l.name} · {l.region}
                              </div>
                            </div>
                          </div>

                          {isSelected && (
                            <Check className="w-4 h-4 text-[#2D6A4F] stroke-[2.5]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Refresh */}
            <button
              onClick={onRefresh}
              className="p-2 rounded-xl bg-[#F0F4EC] hover:bg-[#E4EBDD] text-[#1E4D36] border border-[#E2E8DC] transition-colors"
              title="Refresh Telemetry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hardware Connection Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#E2E8DC] relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8F7EC] flex items-center justify-center text-[#1E4D36]">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#163828]">{t.connectHardware}</h3>
                  <p className="text-xs text-[#52796F]">Link Arduino Uno microcontroller</p>
                </div>
              </div>
              <button
                onClick={() => setShowConnectModal(false)}
                className="w-8 h-8 rounded-full bg-[#F0F4EC] hover:bg-[#E2E8DC] flex items-center justify-center text-sm font-bold text-[#4F6D5E]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 my-6">
              
              {/* Option A: Direct Web Serial API */}
              <div className="p-4 rounded-2xl bg-[#F7F9F5] border border-[#E2E8DC] hover:border-[#A7E2BA] transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#163828] flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-[#2D6A4F]" />
                      Direct Browser USB Serial
                    </h4>
                    <p className="text-xs text-[#52796F] mt-1">
                      Direct connection via Web Serial API. Works in Google Chrome & Edge. Select COM port (115200 baud).
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleWebSerial}
                  disabled={isConnecting}
                  className="mt-3 w-full py-2.5 px-4 rounded-xl bg-[#1E4D36] hover:bg-[#163828] text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Connecting...
                    </>
                  ) : serialConnected ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#74C69D]" />
                      Connected (Click to Reconnect)
                    </>
                  ) : (
                    t.selectUsb
                  )}
                </button>
              </div>

              {/* Option B: Local Python PySerial Bridge */}
              <div className="p-4 rounded-2xl bg-[#F7F9F5] border border-[#E2E8DC]">
                <h4 className="text-sm font-bold text-[#163828] flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[#40916C]" />
                  Local Bridge Mode (Automatic)
                </h4>
                <p className="text-xs text-[#52796F] mt-1">
                  Run <code className="px-1.5 py-0.5 rounded bg-white border border-[#E2E8DC] text-[#1E4D36] font-mono">run_bridge.bat</code> in the project root to stream Arduino COM8 to <code className="text-[#1E4D36] font-mono">data/log.csv</code>.
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs font-medium text-[#1E4D36]">
                  <span className={`w-2 h-2 rounded-full ${isLive ? "bg-[#2D6A4F]" : "bg-[#F4A261]"}`} />
                  Status: {isLive ? t.bridgeActive : "Waiting for Bridge..."}
                </div>
              </div>
            </div>

            {connMessage && (
              <div className="p-3 rounded-xl bg-[#E8F7EC] text-[#1E4D36] text-xs font-medium mb-4 flex items-center gap-2 border border-[#A7E2BA]">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{connMessage}</span>
              </div>
            )}

            <button
              onClick={() => setShowConnectModal(false)}
              className="w-full py-2.5 rounded-xl border border-[#E2E8DC] hover:bg-[#F0F4EC] text-xs font-semibold text-[#4F6D5E] transition-colors"
            >
              {t.done}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
