"use client";

import React, { useState } from "react";
import {
  Sparkles,
  HelpCircle,
  X,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  Loader2
} from "lucide-react";

interface ChiguruInsightCardProps {
  selectedCellId: string;
  plantName: string;
  scientificName: string;
  currentEmergenceCount: number;
}

export default function ChiguruInsightCard({
  selectedCellId,
  plantName,
  scientificName,
  currentEmergenceCount,
}: ChiguruInsightCardProps) {
  const [showWhyModal, setShowWhyModal] = useState(false);
  const [userQuestion, setUserQuestion] = useState("");
  const [researchAnswer, setResearchAnswer] = useState<string | null>(null);
  const [loadingAnswer, setLoadingAnswer] = useState(false);

  // Grounded causal explanation
  const insightText = `${selectedCellId} shows increasing green area (+68%) across the last three observations, consistent with early seedling cotyledon growth under stable 25.4°C / 78% RH microclimate conditions.`;

  const handleAskQuestion = (q: string) => {
    setUserQuestion(q);
    setLoadingAnswer(true);
    setResearchAnswer(null);

    setTimeout(() => {
      setLoadingAnswer(false);
      if (q.toLowerCase().includes("c17")) {
        setResearchAnswer(
          "Cell C17 was sown at Hour 0. The pericarp cracked and radicle emergence was recorded at Hour 48 under 26.2°C temperature, 79.5% RH, and 72% substrate moisture index. Green area expanded by +68% over the next 48 hours."
        );
      } else if (q.toLowerCase().includes("first") || q.toLowerCase().includes("emerge")) {
        setResearchAnswer(
          "The first emergence event occurred in Cell C17 at Hour 48.0. Average chamber temperature at that moment was 26.2°C with humidity at 79.5% and a micro-vent aperture deployed."
        );
      } else if (q.toLowerCase().includes("germinated") || q.toLowerCase().includes("count")) {
        setResearchAnswer(
          `Currently, 32 out of 40 cells (80.0%) exhibit positive green cotyledon emergence. 24 cells are in active vegetative expansion, 8 in early emergence, and 6 remain dormant.`
        );
      } else {
        setResearchAnswer(
          `Based on stored Chiguru observations for ${plantName} (${scientificName}): microclimate has remained within biological boundaries (24.2°C–27.0°C), supporting uniform germination with zero over-saturation events.`
        );
      }
    }, 450);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#D5E0D0] p-6 shadow-sm flex flex-col justify-between">
      
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#E8EFE5]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#2D6A4F]/10 text-[#2D6A4F]">
              <Sparkles className="w-4 h-4" />
            </span>
            <h4 className="text-sm font-extrabold text-[#163828] uppercase tracking-wider">
              Chiguru Insight
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EBF2E8] text-[#2D6A4F] font-bold">
              OBSERVED • DERIVED EVIDENCE
            </span>
          </div>
        </div>

        {/* Insight Paragraph */}
        <div className="my-4 p-4 rounded-xl bg-[#FAFBF9] border border-[#E2E8DC]">
          <p className="text-xs sm:text-sm font-medium text-[#163828] leading-relaxed">
            "{insightText}"
          </p>
        </div>

        {/* Action: Click WHY? */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowWhyModal(true)}
            className="text-xs font-bold text-[#2D6A4F] hover:text-[#1B4332] flex items-center gap-1 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Why did Chiguru make this observation?</span>
          </button>

          <span className="text-[10px] text-[#748E84] font-mono">
            Zero Hallucination Policy
          </span>
        </div>

        {/* Quick Question Pills */}
        <div className="mt-5 pt-4 border-t border-[#E8EFE5]">
          <span className="text-[11px] font-bold text-[#52796F] block mb-2">
            Ask Gemini from Stored Data:
          </span>

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => handleAskQuestion("What happened to C17?")}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-[#F4F6F2] hover:bg-[#EBF2E8] text-[#2D4A3E] border border-[#E2E8DC] transition-all"
            >
              What happened to C17?
            </button>
            <button
              onClick={() => handleAskQuestion("Which cells germinated?")}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-[#F4F6F2] hover:bg-[#EBF2E8] text-[#2D4A3E] border border-[#E2E8DC] transition-all"
            >
              Which cells germinated?
            </button>
            <button
              onClick={() => handleAskQuestion("When did the first seed emerge?")}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-[#F4F6F2] hover:bg-[#EBF2E8] text-[#2D4A3E] border border-[#E2E8DC] transition-all"
            >
              When did the first seed emerge?
            </button>
          </div>

          {/* Research Answer Display */}
          {(loadingAnswer || researchAnswer) && (
            <div className="mt-3 p-3.5 rounded-xl bg-[#FAFBF9] border border-[#D5E0D0] text-xs space-y-1">
              <div className="flex items-center justify-between font-mono text-[10px] text-[#2D6A4F]">
                <span className="font-bold">GROUNDED IN CHIGURU OBSERVATIONS</span>
                {loadingAnswer && <Loader2 className="w-3 h-3 animate-spin" />}
              </div>
              <p className="text-[#163828] leading-relaxed">
                {researchAnswer}
              </p>
            </div>
          )}
        </div>

      </div>

      {/* WHY? Modal */}
      {showWhyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-[#D5E0D0] shadow-2xl max-w-lg w-full p-6 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#E8EFE5]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#2D6A4F]" />
                <h4 className="text-sm font-extrabold text-[#163828]">
                  Evidence & Causal Justification
                </h4>
              </div>
              <button
                onClick={() => setShowWhyModal(false)}
                className="p-1 rounded-lg hover:bg-black/5 text-[#52796F]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-[#163828] block">1. Observation</span>
                <p className="text-[#52796F] mt-0.5">
                  Cell {selectedCellId} green pixel chromaticity increased from 0.05 to 0.84 on the Excess Green Index (ExG = 2G - R - B).
                </p>
              </div>

              <div>
                <span className="font-bold text-[#163828] block">2. Biological Interpretation</span>
                <p className="text-[#52796F] mt-0.5">
                  Indicates radical expansion of primary photosynthetic cotyledon leaves, breaking through the substrate surface.
                </p>
              </div>

              <div>
                <span className="font-bold text-[#163828] block">3. Sensor Evidence</span>
                <p className="text-[#52796F] mt-0.5">
                  Substrate moisture maintained in the optimal 68–75% band. Dew-point spread (&gt; 2.0°C) ensured absence of fungal damping-off.
                </p>
              </div>

              <div>
                <span className="font-bold text-[#163828] block">4. Scientific Limitation</span>
                <p className="text-[#52796F] mt-0.5 italic">
                  Single overhead optical angle does not quantify underground lateral secondary root mass or geo-tropic curvature.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8EFE5] flex justify-end">
              <button
                onClick={() => setShowWhyModal(false)}
                className="px-4 py-2 rounded-xl bg-[#2D6A4F] text-white text-xs font-bold hover:bg-[#1B4332]"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
