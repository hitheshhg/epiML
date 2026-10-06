"use client";

import React, { useState, useEffect } from "react";
import { Sprout, ArrowRight, Play, Eye, Layers, Compass, CheckCircle2, Usb } from "lucide-react";

interface LandingHeroProps {
  onStartMonitoring: () => void;
  onLearnMore: () => void;
  onOpenJuryFlow: () => void;
  onOpenHardwareModal?: () => void;
}

export default function LandingHero({
  onStartMonitoring,
  onLearnMore,
  onOpenJuryFlow,
  onOpenHardwareModal,
}: LandingHeroProps) {
  // Animated progression: Seed (0) -> Emergence (1) -> Young Seedling (2)
  const [animStage, setAnimStage] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimStage((prev) => (prev + 1) % 3);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

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
                1. Seed
              </span>
              <span
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  animStage === 1
                    ? "bg-[#52B788] text-[#163828]"
                    : "text-[#52796F]"
                }`}
              >
                2. Emergence
              </span>
              <span
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  animStage === 2
                    ? "bg-[#1B4332] text-white"
                    : "text-[#52796F]"
                }`}
              >
                3. Seedling
              </span>
            </div>
          </div>

          {/* 40-Cell Tray Grid Preview */}
          <div className="mt-6 grid grid-cols-8 gap-2 sm:gap-2.5">
            {Array.from({ length: 40 }).map((_, i) => {
              const cellNum = (i + 1).toString().padStart(2, "0");
              const isHighlight = i === 16; // C17 showcase
              const isGerminated = i < 28;

              return (
                <div
                  key={i}
                  className={`aspect-square rounded-xl p-1 sm:p-2 border transition-all flex flex-col justify-between ${
                    isHighlight
                      ? "bg-[#EBF2E8] border-[#2D6A4F] ring-2 ring-[#2D6A4F]/30 shadow-sm"
                      : isGerminated
                      ? "bg-[#F8FAF7] border-[#DCE7D7] hover:border-[#B7D1C5]"
                      : "bg-[#FDFEFC] border-[#E8ECE4]"
                  }`}
                >
                  <span className={`text-[9px] font-mono font-bold block ${isHighlight ? "text-[#2D6A4F]" : "text-[#748E84]"}`}>
                    C{cellNum}
                  </span>

                  {/* Seedling Micro Visual based on animated stage */}
                  <div className="flex items-center justify-center flex-1">
                    {isHighlight ? (
                      <div className="transition-transform duration-500 transform hover:scale-110">
                        {animStage === 0 && (
                          <div className="w-2.5 h-3.5 rounded-full bg-[#B78D63] shadow-inner" title="Dormant imbibing seed" />
                        )}
                        {animStage === 1 && (
                          <div className="flex flex-col items-center">
                            <div className="w-1.5 h-3 rounded-full bg-[#52B788] rotate-12" />
                            <div className="w-2 h-2 rounded-full bg-[#B78D63]" />
                          </div>
                        )}
                        {animStage === 2 && (
                          <div className="flex items-center gap-0.5">
                            <div className="w-2 h-3.5 rounded-full bg-[#2D6A4F] -rotate-12" />
                            <div className="w-2 h-3.5 rounded-full bg-[#2D6A4F] rotate-12" />
                          </div>
                        )}
                      </div>
                    ) : isGerminated ? (
                      <div className="w-2 h-2 rounded-full bg-[#52B788]/60" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#D5DDD2]" />
                    )}
                  </div>

                  <span className="text-[8px] text-center font-mono text-[#84A98C]">
                    {isHighlight ? (animStage === 0 ? "SEEDED" : (animStage === 1 ? "EMERGE" : "GROW")) : (isGerminated ? "GERM" : "SEED")}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex items-center justify-between text-xs text-[#52796F] font-mono pt-3 border-t border-[#E8EFE5]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
              Persistent Identity for every cell (C01–C40)
            </span>
            <span className="hidden sm:inline text-[#748E84]">
              Click any cell inside the Monitor to inspect individual emergence history
            </span>
          </div>

        </div>

      </div>
    </section>
  );
}
