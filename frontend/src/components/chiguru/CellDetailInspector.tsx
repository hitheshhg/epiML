"use client";

import React, { useState } from "react";
import { CellRecord, HumanReviewLabel } from "@/lib/types/monitoring";
import {
  Thermometer,
  Droplets,
  Cloud,
  Wind,
  CheckCircle2,
  AlertTriangle,
  History,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  Eye,
  Check,
  X,
  Clock
} from "lucide-react";

interface CellDetailInspectorProps {
  cell: CellRecord;
  plantName: string;
  onVerifyLabel: (cellId: string, label: HumanReviewLabel) => void;
}

export default function CellDetailInspector({
  cell,
  plantName,
  onVerifyLabel,
}: CellDetailInspectorProps) {
  const [activeTab, setActiveTab] = useState<"detail" | "history" | "story">("detail");
  const [verifiedState, setVerifiedState] = useState<HumanReviewLabel | null>(
    cell.currentObservation.humanVerification?.label || null
  );

  const handleVerify = (lbl: HumanReviewLabel) => {
    setVerifiedState(lbl);
    onVerifyLabel(cell.cellId, lbl);
  };

  const isReview = cell.state === "REVIEW";
  const env = cell.currentObservation.environmentalContext;

  return (
    <div className="bg-white rounded-2xl border border-[#D5E0D0] p-6 shadow-sm flex flex-col justify-between">
      
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-[#E8EFE5]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-[#163828] font-mono">
                {cell.cellId}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                  cell.state === "GROWING"
                    ? "bg-[#EBF2E8] text-[#2D6A4F]"
                    : cell.state === "EMERGING"
                    ? "bg-[#F2F8F0] text-[#52B788]"
                    : cell.state === "REVIEW"
                    ? "bg-[#FFF7ED] text-[#E76F51]"
                    : "bg-[#F4F6F2] text-[#748E84]"
                }`}
              >
                {cell.state}
              </span>
            </div>
            <p className="text-xs text-[#52796F] mt-0.5">
              Individual Seedling History • Row {cell.row + 1}, Col {cell.col + 1}
            </p>
          </div>

          {/* Sub-Tabs: Detail vs History vs Growth Story */}
          <div className="flex items-center gap-1 bg-[#F4F6F2] p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab("detail")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeTab === "detail" ? "bg-white text-[#163828] shadow-sm" : "text-[#52796F]"
              }`}
            >
              Current
            </button>
            <button
              onClick={() => setActiveTab("story")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeTab === "story" ? "bg-white text-[#163828] shadow-sm" : "text-[#52796F]"
              }`}
            >
              Growth Story
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeTab === "history" ? "bg-white text-[#163828] shadow-sm" : "text-[#52796F]"
              }`}
            >
              Timeline
            </button>
          </div>
        </div>

        {/* Tab 1: Current Detail View */}
        {activeTab === "detail" && (
          <div className="mt-5 space-y-5">
            
            {/* Visual Crop + Key Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              
              {/* Synthetic Camera Crop Box */}
              <div className="rounded-xl border border-[#D5E0D0] bg-[#FAFBF9] p-3 flex flex-col items-center justify-center min-h-[140px] relative overflow-hidden">
                <span className="text-[10px] font-mono text-[#748E84] absolute top-2 left-2">
                  OVERHEAD CROP 420mm
                </span>

                {/* Micro Visual representation */}
                <div className="flex flex-col items-center justify-center my-auto">
                  {cell.state === "GROWING" ? (
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-8 rounded-full bg-[#2D6A4F] -rotate-12 shadow-md" />
                      <div className="w-5 h-8 rounded-full bg-[#2D6A4F] rotate-12 shadow-md" />
                    </div>
                  ) : cell.state === "EMERGING" ? (
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-6 rounded-full bg-[#52B788] rotate-6" />
                      <div className="w-4 h-4 rounded-full bg-[#B78D63]" />
                    </div>
                  ) : (
                    <div className="w-6 h-8 rounded-full bg-[#B78D63] shadow-inner" />
                  )}
                  <span className="text-[10px] font-mono text-[#2D6A4F] font-bold mt-2">
                    ExG: {cell.currentObservation.exgScore}
                  </span>
                </div>

                <div className="w-full flex justify-between text-[9px] text-[#748E84] font-mono border-t border-[#E8EFE5] pt-1 mt-1">
                  <span>Area: {cell.currentObservation.greenAreaMm2} mm²</span>
                  <span>Conf: {Math.round(cell.currentObservation.confidence * 100)}%</span>
                </div>
              </div>

              {/* Emergence & Measured Change Card */}
              <div className="rounded-xl border border-[#D5E0D0] bg-[#FAFBF9] p-3 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#52796F] block">
                    First Emergence
                  </span>
                  <p className="text-xs font-bold text-[#163828] mt-0.5">
                    {cell.emergenceTime
                      ? new Date(cell.emergenceTime).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Radicle not yet emerged"}
                  </p>
                </div>

                <div className="my-2">
                  <span className="text-[10px] uppercase font-bold text-[#52796F] block">
                    Measured Change
                  </span>
                  <p className="text-lg font-black text-[#2D6A4F]">
                    +{cell.growthChangePct}%
                  </p>
                  <span className="text-[10px] text-[#748E84]">
                    Vegetative area expansion
                  </span>
                </div>

                <div className="pt-2 border-t border-[#E8EFE5] text-[10px] font-mono text-[#52796F]">
                  <span>Seeded: {new Date(cell.seededAt).toLocaleDateString()}</span>
                </div>
              </div>

            </div>

            {/* Environmental Conditions At Emergence / Present */}
            <div>
              <span className="text-[11px] font-bold uppercase text-[#163828] tracking-wider block mb-2">
                Environmental Context ({cell.cellId})
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-[#FAFBF9] border border-[#E8EFE5]">
                  <span className="text-[10px] text-[#52796F] block flex items-center gap-1">
                    <Thermometer className="w-3 h-3 text-[#E76F51]" /> Temp
                  </span>
                  <span className="font-extrabold text-[#163828]">{env.temperature}°C</span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#FAFBF9] border border-[#E8EFE5]">
                  <span className="text-[10px] text-[#52796F] block flex items-center gap-1">
                    <Cloud className="w-3 h-3 text-[#52796F]" /> Humidity
                  </span>
                  <span className="font-extrabold text-[#163828]">{env.humidity}%</span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#FAFBF9] border border-[#E8EFE5]">
                  <span className="text-[10px] text-[#52796F] block flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-[#2D6A4F]" /> Moisture
                  </span>
                  <span className="font-extrabold text-[#163828]">{env.moistureIndex}% Index</span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#FAFBF9] border border-[#E8EFE5]">
                  <span className="text-[10px] text-[#52796F] block flex items-center gap-1">
                    <Wind className="w-3 h-3 text-[#2D6A4F]" /> Vent State
                  </span>
                  <span className="font-extrabold text-[#163828]">{env.ventState}</span>
                </div>
              </div>
            </div>

            {/* HUMAN-IN-THE-LOOP VERIFICATION (Section 25) */}
            <div className="p-4 rounded-xl border border-[#D5E0D0] bg-[#FAFBF9]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#163828] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#2D6A4F]" />
                  Human-in-the-Loop Review
                </span>
                {verifiedState && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2D6A4F] text-white font-bold">
                    VERIFIED: {verifiedState}
                  </span>
                )}
              </div>

              <p className="text-[11px] text-[#52796F] mb-3">
                Model prediction: <strong className="text-[#163828]">{cell.state}</strong> (Confidence: {Math.round(cell.currentObservation.confidence * 100)}%). Verify observation to contribute to the Chiguru training dataset.
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleVerify("YES")}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 border ${
                    verifiedState === "YES"
                      ? "bg-[#2D6A4F] text-white border-[#2D6A4F] shadow-sm"
                      : "bg-white text-[#2D6A4F] border-[#D5E0D0] hover:bg-[#EBF2E8]"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Yes (Sprouted)</span>
                </button>

                <button
                  onClick={() => handleVerify("NO")}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 border ${
                    verifiedState === "NO"
                      ? "bg-[#E76F51] text-white border-[#E76F51] shadow-sm"
                      : "bg-white text-[#C85038] border-[#D5E0D0] hover:bg-[#FFF5F3]"
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                  <span>No (Dormant)</span>
                </button>

                <button
                  onClick={() => handleVerify("UNCERTAIN")}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all border ${
                    verifiedState === "UNCERTAIN"
                      ? "bg-[#748E84] text-white border-[#748E84]"
                      : "bg-white text-[#748E84] border-[#D5E0D0] hover:bg-black/5"
                  }`}
                >
                  Uncertain
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Growth Story (Section 61) */}
        {activeTab === "story" && (
          <div className="mt-5 space-y-4">
            <span className="text-xs font-bold uppercase text-[#163828] tracking-wider block">
              Growth Story ({cell.cellId})
            </span>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FAFBF9] border border-[#E8EFE5]">
                <div className="w-6 h-6 rounded-full bg-[#B78D63] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h5 className="text-xs font-bold text-[#163828]">Seed In Substrate (Hour 0)</h5>
                  <p className="text-[11px] text-[#52796F] mt-0.5">
                    Dormant seed placed in 35mm cell. Imbibition commenced under 75% substrate moisture.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FAFBF9] border border-[#E8EFE5]">
                <div className="w-6 h-6 rounded-full bg-[#52B788] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h5 className="text-xs font-bold text-[#163828]">Radicle Emergence (Hour 48)</h5>
                  <p className="text-[11px] text-[#52796F] mt-0.5">
                    Pericarp cracked. Micro-vent opened on elevated humidity (79.5% RH). ExG: 0.42.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FAFBF9] border border-[#E8EFE5]">
                <div className="w-6 h-6 rounded-full bg-[#2D6A4F] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h5 className="text-xs font-bold text-[#163828]">Cotyledon Expansion (Hour 72)</h5>
                  <p className="text-[11px] text-[#52796F] mt-0.5">
                    Bilateral green leaf expansion. Vegetative area expanded by +68%.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#EBF2E8] border border-[#B7D1C5]">
                <div className="w-6 h-6 rounded-full bg-[#1B4332] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <h5 className="text-xs font-bold text-[#163828]">Current Observation (Hour 96)</h5>
                  <p className="text-[11px] text-[#2D6A4F] mt-0.5">
                    Healthy seedling established with vigorous hypocotyl growth.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Timeline Table */}
        {activeTab === "history" && (
          <div className="mt-5 space-y-3">
            <span className="text-xs font-bold uppercase text-[#163828] tracking-wider block">
              Recorded Timeline Entries ({cell.cellId})
            </span>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {cell.history.map((h, i) => (
                <div key={i} className="p-2.5 rounded-lg border border-[#E8EFE5] bg-[#FAFBF9] text-xs space-y-1">
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="font-bold text-[#163828]">{h.state}</span>
                    <span className="text-[#748E84]">{new Date(h.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-[#52796F]">
                    <span>ExG: {h.exgScore} ({h.greenAreaMm2} mm²)</span>
                    <span>T:{h.environmentalContext.temperature}°C | H:{h.environmentalContext.humidity}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Footer */}
      <div className="mt-6 pt-3 border-t border-[#E8EFE5] text-[11px] text-[#748E84] flex items-center justify-between">
        <span>Persistent Identity: {cell.cellId}</span>
        <span className="text-[#2D6A4F] font-semibold">Chiguru Remembers</span>
      </div>

    </div>
  );
}
