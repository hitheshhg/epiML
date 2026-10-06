"use client";

import React, { useState } from "react";
import { Sparkles, Brain, Eye, HelpCircle, ShieldAlert, CheckCircle2, RefreshCw } from "lucide-react";

interface AIObservationPanelProps {
  cellId?: string;
  crop?: string;
  state?: string;
}

export function AIObservationPanel({
  cellId = "C17",
  crop = "Tomato",
  state = "GERMINATED",
}: AIObservationPanelProps) {
  const [showWhy, setShowWhy] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [observationData, setObservationData] = useState({
    observation: `A distinct photosynthetic region consistent with early cotyledon expansion was detected in cell ${cellId}. Projected canopy area is 28.5% (680 px) with positive Excess Green contrast (ExG = 42.8).`,
    interpretation: `Consistent with normal epigeal hypocotyl arching and bilateral cotyledon deployment for ${crop} (Solanum lycopersicum) under controlled nursery microclimate.`,
    evidence: `Three consecutive hourly time-lapse frames showing progressive green pixel accumulation following first emergence at 44h, aligned with optimal Substrate Moisture Index (72% SMI) and chamber temperature (25.2°C).`,
    limitations: `Top-view perpendicular RGB optical monitoring detects projected horizontal canopy area only; subterranean radicle elongation cannot be quantified without destructive sampling or transparent rhizotrons.`,
    confidence: 0.94,
    source: "LOCAL_DETERMINISTIC_CV",
    decision: "WATERING WITHHELD",
    decisionReason: "Recent micro-pulse 14m ago + elevated chamber relative humidity (78.2% RH). Control policy withheld irrigation to prevent substrate saturation and Pythium damping-off risk.",
  });

  const handleRefreshObservation = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/ai/observation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cellId, crop }),
      });
      if (res.ok) {
        const data = await res.json();
        setObservationData((prev) => ({
          ...prev,
          ...data,
        }));
      }
    } catch (e) {
      console.warn("AI refresh fallback:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#E2E8DC] bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F0F4EC] pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2D6A4F]/10 text-[#2D6A4F]">
            <Brain className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#163828]">
              What is Chiguru Seeing?
            </h3>
            <p className="text-[11px] text-[#52796F]">
              Computer vision phenotyping & evidence-backed biological interpretation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefreshObservation}
            disabled={isRefreshing}
            className="flex items-center gap-1 rounded-lg border border-[#D1D5DB] px-2.5 py-1 text-[11px] font-semibold text-[#4A6B5D] hover:bg-[#F8FAF6]"
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Update</span>
          </button>
          <span className="font-mono text-[10px] font-bold bg-[#E8F7EC] text-[#2D6A4F] px-2.5 py-0.5 rounded-full border border-[#52B788]/30">
            CONFIDENCE: {(observationData.confidence * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Observation Body */}
      <div className="mt-4 space-y-3 text-xs leading-relaxed">
        <div>
          <span className="font-mono text-[10px] font-bold uppercase text-[#52796F]">
            Observed from Camera
          </span>
          <p className="mt-0.5 font-medium text-[#163828]">
            {observationData.observation}
          </p>
        </div>

        <div>
          <span className="font-mono text-[10px] font-bold uppercase text-[#52796F]">
            Biological Interpretation
          </span>
          <p className="mt-0.5 text-[#4A6B5D]">
            {observationData.interpretation}
          </p>
        </div>

        <div className="rounded-xl border border-[#E8EDE2] bg-[#F8FAF6] p-3 text-[11px] space-y-1.5">
          <div>
            <span className="font-semibold text-[#163828]">Measured Sensor Evidence: </span>
            <span className="text-[#4A6B5D]">{observationData.evidence}</span>
          </div>
          <div>
            <span className="font-semibold text-[#6C757D]">Scientific Limitations: </span>
            <span className="text-[#6C757D] italic">{observationData.limitations}</span>
          </div>
        </div>
      </div>

      {/* Closed-Loop Actuator Decision & Explainability (WHY?) */}
      <div className="mt-4 rounded-xl border border-[#E2E8DC] bg-[#F8FAF6] p-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-[#B45309]" />
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6C757D]">
                Closed-Loop Experimental Decision
              </span>
              <div className="text-xs font-bold text-[#163828]">
                CHIGURU DECISION: <span className="text-[#B45309]">{observationData.decision}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowWhy(!showWhy)}
            className="flex items-center gap-1 rounded-lg border border-[#D1D5DB] bg-white px-2.5 py-1 text-[11px] font-bold text-[#2D6A4F] hover:bg-[#E8F7EC]"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>{showWhy ? "Hide Explainability" : "WHY?"}</span>
          </button>
        </div>

        {showWhy && (
          <div className="mt-3 border-t border-[#E8EDE2] pt-2 text-[11px] text-[#4A6B5D] space-y-1">
            <p>
              <strong className="text-[#163828]">Policy Rule:</strong> {observationData.decisionReason}
            </p>
            <p className="text-[10px] text-[#6C757D]">
              Heuristic over-wetness mitigation: Cooldown timer active (6m remaining). Micro-pulse pump D13 inhibited until RH &lt; 75% or moisture index drops below 65%.
            </p>
          </div>
        )}
      </div>

      {/* Footer Attribution */}
      <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-[#6C757D]">
        <span>ALGORITHM: ExG Deterministic Baseline v1.3</span>
        <span>ENGINE: {observationData.source}</span>
      </div>
    </div>
  );
}
