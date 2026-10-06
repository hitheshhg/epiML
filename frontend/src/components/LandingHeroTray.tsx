"use client";

import React, { useState, useEffect } from "react";
import { Sprout, Eye, CheckCircle2, Sparkles, Activity } from "lucide-react";

export function LandingHeroTray() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [selectedCell, setSelectedCell] = useState<number>(16); // Cell C17 (index 16)

  // Subtle cyclic progression for demonstration
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const stages = [
    {
      title: "Stage 1: Seed Imbibition",
      desc: "Dry seed placed in cocopeat substrate. Microclimate sensor logging begins.",
      badge: "SEEDED",
      color: "bg-[#8D6E63]/20 text-[#5D4037] border-[#8D6E63]/40",
      coverage: 0,
      hour: 0,
    },
    {
      title: "Stage 2: Hypocotyl Emergence",
      desc: "Top-view camera registers first cotyledon arch breaking substrate surface.",
      badge: "EMERGING",
      color: "bg-[#E9C46A]/25 text-[#B58A18] border-[#E9C46A]/50",
      coverage: 6.2,
      hour: 44,
    },
    {
      title: "Stage 3: Cotyledon Deployment",
      desc: "Photosynthetic cotyledons expand horizontally. Excess Green (ExG) index turns strongly positive.",
      badge: "GERMINATED",
      color: "bg-[#74C69D]/25 text-[#1E4D36] border-[#52B788]/40",
      coverage: 21.4,
      hour: 72,
    },
    {
      title: "Stage 4: Active Seedling Growth",
      desc: "Rapid canopy area accumulation synchronized with micro-pulsed hydration events.",
      badge: "GROWING",
      color: "bg-[#2D6A4F] text-white border-[#1B4332]",
      coverage: 48.0,
      hour: 120,
    },
  ];

  const currentStage = stages[activeStep];

  return (
    <div className="relative rounded-2xl border border-[#E2E8DC] bg-white/90 p-6 shadow-xl backdrop-blur-md">
      {/* Tray Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#F0F4EC] pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2D6A4F]/10 text-[#2D6A4F]">
            <Sprout className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#163828]">
              40-Cell Research Tray Digital Twin
            </div>
            <div className="text-[11px] text-[#4A6B5D]">
              5 × 8 Geometry • Individual Seed Tracking
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full border border-[#52B788]/30 bg-[#E8F7EC] px-2.5 py-0.5 text-[10px] font-bold text-[#1E4D36]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2D6A4F]" />
            LIVE OVERHEAD CAMERA
          </span>
        </div>
      </div>

      {/* 40-cell Interactive Grid */}
      <div className="mb-4 grid grid-cols-8 gap-1.5">
        {Array.from({ length: 40 }).map((_, idx) => {
          const cellNum = idx + 1;
          const cellId = `C${cellNum < 10 ? "0" + cellNum : cellNum}`;
          const isSelected = idx === selectedCell;

          // Deterministic states for surrounding cells
          let cellState = "SEEDED";
          let cellBg = "bg-[#F8FAF6] border-[#E8EDE2]";
          let dotColor = "bg-[#D1D5DB]";

          if (idx === 16) {
            // Selected hero cell C17
            cellState = currentStage.badge;
            cellBg =
              activeStep === 0
                ? "bg-[#EFEBE9] border-[#8D6E63]/40"
                : activeStep === 1
                ? "bg-[#FEF9E7] border-[#E9C46A]/60"
                : activeStep === 2
                ? "bg-[#E8F7EC] border-[#52B788]/60"
                : "bg-[#D8F3DC] border-[#2D6A4F]";
            dotColor =
              activeStep === 0
                ? "bg-[#8D6E63]"
                : activeStep === 1
                ? "bg-[#D97706]"
                : activeStep === 2
                ? "bg-[#40916C]"
                : "bg-[#2D6A4F]";
          } else if (idx % 7 === 1 || idx % 5 === 2) {
            cellState = "GERMINATED";
            cellBg = "bg-[#E8F7EC] border-[#A7D7B5]";
            dotColor = "bg-[#40916C]";
          } else if (idx % 4 === 0) {
            cellState = "EMERGING";
            cellBg = "bg-[#FEF9E7] border-[#F1E0A6]";
            dotColor = "bg-[#D97706]";
          } else if (idx % 9 === 0) {
            cellState = "GROWING";
            cellBg = "bg-[#D8F3DC] border-[#74C69D]";
            dotColor = "bg-[#2D6A4F]";
          }

          return (
            <button
              key={cellId}
              onClick={() => setSelectedCell(idx)}
              className={`group relative flex aspect-square flex-col items-center justify-center rounded-lg border transition-all duration-200 ${cellBg} ${
                isSelected
                  ? "ring-2 ring-[#2D6A4F] ring-offset-1 shadow-sm scale-105 z-10"
                  : "hover:border-[#74C69D] hover:scale-102"
              }`}
            >
              <span className="text-[9px] font-mono font-medium text-[#4A6B5D] group-hover:text-[#163828]">
                {cellId}
              </span>
              <div
                className={`mt-0.5 rounded-full transition-all duration-300 ${dotColor} ${
                  isSelected ? "h-2.5 w-2.5 animate-pulse" : "h-1.5 w-1.5"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Hero Progression Banner */}
      <div className="rounded-xl border border-[#E2E8DC] bg-[#F8FAF6]/90 p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#163828]">
              Cell C{selectedCell + 1 < 10 ? "0" + (selectedCell + 1) : selectedCell + 1}
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${currentStage.color}`}
            >
              {currentStage.badge}
            </span>
            <span className="text-[11px] font-mono text-[#52796F]">
              T + {currentStage.hour}h
            </span>
          </div>

          <div className="flex items-center gap-1">
            {[0, 1, 2, 3].map((step) => (
              <button
                key={step}
                onClick={() => setActiveStep(step)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeStep === step ? "w-6 bg-[#2D6A4F]" : "w-2 bg-[#D1D5DB]"
                }`}
                title={`Jump to stage ${step + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="mt-2 text-xs font-semibold text-[#163828]">
          {currentStage.title}
        </div>
        <p className="mt-0.5 text-[11px] leading-relaxed text-[#4A6B5D]">
          {currentStage.desc}
        </p>

        {/* Micro-metrics bar */}
        <div className="mt-2.5 grid grid-cols-3 gap-2 border-t border-[#E8EDE2] pt-2 text-[10px]">
          <div>
            <div className="text-[#6C757D]">Projected Canopy</div>
            <div className="font-mono font-bold text-[#163828]">
              {selectedCell === 16 ? currentStage.coverage : 24.5}%
            </div>
          </div>
          <div>
            <div className="text-[#6C757D]">ExG Index</div>
            <div className="font-mono font-bold text-[#2D6A4F]">
              {selectedCell === 16
                ? activeStep === 0
                  ? "-2.4"
                  : activeStep === 1
                  ? "+14.8"
                  : "+42.5"
                : "+38.1"}
            </div>
          </div>
          <div>
            <div className="text-[#6C757D]">Microclimate (SMI)</div>
            <div className="font-mono font-bold text-[#163828]">72% SMI • 25.1°C</div>
          </div>
        </div>
      </div>
    </div>
  );
}
