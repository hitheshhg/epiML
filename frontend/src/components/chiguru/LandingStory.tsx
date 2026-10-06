"use client";

import React from "react";
import {
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Camera,
  Layers,
  History,
  BrainCircuit,
  ArrowRight,
  Database,
  CheckCircle2,
  Sparkles
} from "lucide-react";

interface LandingStoryProps {
  onStartMonitoring: () => void;
}

export default function LandingStory({ onStartMonitoring }: LandingStoryProps) {
  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-white border-b border-[#E2E8DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section 1: The Question */}
        <div className="max-w-3xl mx-auto text-center mb-16 sm:mb-24">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2D6A4F] px-3 py-1 rounded-full bg-[#EBF2E8] border border-[#B7D1C5]">
            The Scientific Question
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-[#163828] tracking-tight">
            What happens to a seed when its environment changes?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#52796F] leading-relaxed">
            Conventional farming watches fields from satellites after the fact. Chiguru watches the initial 96 hours of radicle emergence at cell-level resolution, connecting what the seed experiences with what happens to the seed.
          </p>
        </div>

        {/* Section 2: The Three Truths (Observes -> Remembers -> Learns) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Chiguru Observes (Sees) */}
          <div className="rounded-2xl p-7 bg-[#FAFBF9] border border-[#D5E0D0] flex flex-col justify-between hover:border-[#95D5B2] transition-colors">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#2D6A4F]/10 text-[#2D6A4F] flex items-center justify-center mb-5">
                <Camera className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold text-[#2D6A4F] uppercase tracking-wider">
                1. Sensory Perception
              </span>
              <h3 className="text-xl font-extrabold text-[#163828] mt-1 mb-3">
                Chiguru Observes
              </h3>
              <p className="text-sm text-[#52796F] leading-relaxed mb-6">
                Calibrated sensors and a fixed overhead optical gantry continuously measure microclimate conditions and sprout progression.
              </p>

              <ul className="space-y-2 text-xs text-[#2D4A3E] font-medium">
                <li className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-[#E76F51]" />
                  <span>Substrate & Canopy Temperature</span>
                </li>
                <li className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-[#457B9D]" />
                  <span>Sub-surface Moisture & RH%</span>
                </li>
                <li className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-[#F4A261]" />
                  <span>Canopy Shade & Louver Aperture</span>
                </li>
                <li className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-[#52796F]" />
                  <span>Airflow & Vapor Dissipation</span>
                </li>
                <li className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#2D6A4F]" />
                  <span>Fixed-geometry 5×8 Optical Phenotyping</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-[#E8EFE5] text-[11px] text-[#748E84] font-mono">
              TRUTH #1: CHIGURU SEES
            </div>
          </div>

          {/* Card 2: Chiguru Remembers (Knows) */}
          <div className="rounded-2xl p-7 bg-[#FAFBF9] border border-[#D5E0D0] flex flex-col justify-between hover:border-[#95D5B2] transition-colors">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#2D6A4F]/10 text-[#2D6A4F] flex items-center justify-center mb-5">
                <History className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold text-[#2D6A4F] uppercase tracking-wider">
                2. Immutable History
              </span>
              <h3 className="text-xl font-extrabold text-[#163828] mt-1 mb-3">
                Chiguru Remembers
              </h3>
              <p className="text-sm text-[#52796F] leading-relaxed mb-6">
                Every monitored session creates an immutable recorded history. Old experiment profiles never silently change, enabling reproducible seed biology.
              </p>

              <div className="p-3.5 rounded-xl bg-white border border-[#E2E8DC] text-xs space-y-1.5 font-mono text-[#52796F]">
                <div className="flex justify-between">
                  <span>Session Identity:</span>
                  <span className="font-bold text-[#163828]">Immutable Hash</span>
                </div>
                <div className="flex justify-between">
                  <span>Cell C17 Emergence:</span>
                  <span className="font-bold text-[#2D6A4F]">Hour 48.2</span>
                </div>
                <div className="flex justify-between">
                  <span>Environment at T0:</span>
                  <span className="font-bold text-[#163828]">26.2°C / 79% RH</span>
                </div>
                <div className="flex justify-between">
                  <span>Actuator Log:</span>
                  <span className="font-bold text-[#163828]">Micro-vent (D5)</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#E8EFE5] text-[11px] text-[#748E84] font-mono">
              TRUTH #2: CHIGURU REMEMBERS
            </div>
          </div>

          {/* Card 3: Chiguru Learns (Improves) */}
          <div className="rounded-2xl p-7 bg-[#FAFBF9] border border-[#D5E0D0] flex flex-col justify-between hover:border-[#95D5B2] transition-colors">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#2D6A4F]/10 text-[#2D6A4F] flex items-center justify-center mb-5">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold text-[#2D6A4F] uppercase tracking-wider">
                3. Continuous Refinement
              </span>
              <h3 className="text-xl font-extrabold text-[#163828] mt-1 mb-3">
                Chiguru Learns
              </h3>
              <p className="text-sm text-[#52796F] leading-relaxed mb-6">
                Not a black-box claim of "self-learning AI". Instead, when researchers review and verify borderline cells, those verified observations become training data for future models.
              </p>

              {/* Loop Progression */}
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#163828] p-2 rounded-lg bg-white border border-[#E2E8DC]">
                <span>OBSERVE</span>
                <span>→</span>
                <span>VERIFY</span>
                <span>→</span>
                <span>TRAIN</span>
                <span>→</span>
                <span className="text-[#2D6A4F]">IMPROVE</span>
              </div>
              <p className="text-[11px] text-[#748E84] mt-2 italic">
                Models are validated and versioned (V0 → V1 → V2) before deployment.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-[#E8EFE5] text-[11px] text-[#748E84] font-mono">
              TRUTH #3: CHIGURU LEARNS
            </div>
          </div>

        </div>

        {/* Bottom Banner */}
        <div className="mt-16 text-center">
          <button
            onClick={onStartMonitoring}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold bg-[#2D6A4F] hover:bg-[#1B4332] text-white shadow-sm transition-all"
          >
            <span>Start Monitoring A Seed</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
}
