"use client";

import React, { useState } from "react";
import { CellData, Treatment, BiologicalEventState } from "@/lib/experimentTypes";
import { calculateChiguruPhenotypeScore } from "@/lib/experimentService";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Thermometer,
  Droplets,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
  Sparkles,
  Edit3,
  Calendar,
  Layers,
} from "lucide-react";

interface CellResearchDrawerProps {
  cell: CellData | null;
  treatments: Treatment[];
  onClose: () => void;
  onNavigateCell: (delta: number) => void;
  onSaveManualAnnotation: (cellId: string, annotation: BiologicalEventState, note: string) => void;
}

export default function CellResearchDrawer({
  cell,
  treatments,
  onClose,
  onNavigateCell,
  onSaveManualAnnotation,
}: CellResearchDrawerProps) {
  if (!cell) return null;

  const treatment = treatments.find((t) => t.id === cell.treatmentId);
  const phenotypeBreakdown = calculateChiguruPhenotypeScore(cell);
  const [selectedObsIdx, setSelectedObsIdx] = useState(cell.history.length - 1);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [annotState, setAnnotState] = useState<BiologicalEventState>(cell.manualAnnotation || cell.currentState);
  const [annotNotes, setAnnotNotes] = useState(cell.annotationNotes || "");

  const currentObs = cell.history[selectedObsIdx] || cell.history[0];

  const handleSaveAnnot = () => {
    onSaveManualAnnotation(cell.cellId, annotState, annotNotes);
    setIsAnnotating(false);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-white border-l border-[#E2E8F0] shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
      
      {/* Header */}
      <div className="p-5 border-b border-[#E2E8F0] bg-[#FAFBF9] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onNavigateCell(-1)}
              className="p-1 rounded-lg hover:bg-[#E2E8F0] text-[#64748B] transition-colors"
              title="Previous Cell"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xl font-mono font-black text-[#0F291E] bg-[#E8F5E9] px-2.5 py-0.5 rounded-lg border border-[#C8E6C9]">
              {cell.cellId}
            </span>
            <button
              onClick={() => onNavigateCell(1)}
              className="p-1 rounded-lg hover:bg-[#E2E8F0] text-[#64748B] transition-colors"
              title="Next Cell"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#0F172A]">{treatment?.name || cell.treatmentId}</span>
              <span className="text-[10px] font-mono text-[#64748B]">Rep #{cell.replicateIndex}</span>
            </div>
            <span className="text-[11px] text-[#64748B] block">Seed Lot: {cell.seedLotId}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-[#E2E8F0] text-[#64748B] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Emergence KPI Banner */}
        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#64748B] block">Current Biological State</span>
            <span className="text-base font-extrabold text-[#0F291E] flex items-center gap-1.5 mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-[#059669]" />
              {cell.currentState}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-[#64748B] block">Time to Emergence</span>
            <span className="text-base font-mono font-black text-[#0F172A]">
              {cell.timeToEmergenceHours ? `${cell.timeToEmergenceHours} hours` : "Not Emerged"}
            </span>
          </div>
        </div>

        {/* Longitudinal Observation Timeline Scrubber */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F291E] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#2D6A4F]" />
              Time-Lapse Observation Timeline
            </h3>
            <span className="text-[11px] font-mono text-[#64748B]">
              Observation {selectedObsIdx + 1} of {cell.history.length}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {cell.history.map((obs, idx) => (
              <button
                key={obs.observationHour}
                onClick={() => setSelectedObsIdx(idx)}
                className={`p-2 rounded-lg border text-center transition-all ${
                  selectedObsIdx === idx
                    ? "bg-[#1B4332] text-white border-[#1B4332] shadow-sm ring-2 ring-[#1B4332]/20"
                    : "bg-[#F8FAFC] hover:bg-[#E2E8F0] border-[#E2E8F0] text-[#475569]"
                }`}
              >
                <span className="text-xs font-mono font-bold block">{obs.observationHour}h</span>
                <span className="text-[10px] opacity-80 block truncate">{obs.biologicalState.slice(0, 5)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Active Observation Card (Image + Mask + Phenotypes) */}
        {currentObs && (
          <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#1B4332]">
                Observation @ {currentObs.observationHour} Hours
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E8F5E9] text-[#2D6A4F]">
                Conf: {(currentObs.confidence * 100).toFixed(0)}%
              </span>
            </div>

            {/* Cell Optical Crop Visualization */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black/90 border border-black/10 flex items-center justify-center">
              <img
                src={currentObs.imagePath}
                alt={`Cell ${cell.cellId} @ ${currentObs.observationHour}h`}
                className="w-full h-full object-cover"
              />
              
              <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-sm text-[11px] text-white font-mono flex items-center gap-2">
                <span>ExG: {currentObs.exgMean.toFixed(1)}</span>
                <span>•</span>
                <span>Canopy: {currentObs.projectedCanopyPct}%</span>
              </div>
            </div>

            {/* Synchronized Environmental Snapshot at this hour */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-[10px] uppercase font-bold text-[#64748B] block flex items-center gap-1">
                  <Thermometer className="w-3 h-3 text-[#EA580C]" />
                  Temp
                </span>
                <span className="font-mono font-extrabold text-[#0F172A] block mt-0.5">
                  {currentObs.temperatureC}°C
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-[10px] uppercase font-bold text-[#64748B] block flex items-center gap-1">
                  <Cloud className="w-3 h-3 text-[#0284C7]" />
                  RH
                </span>
                <span className="font-mono font-extrabold text-[#0F172A] block mt-0.5">
                  {currentObs.humidityRH}%
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-[10px] uppercase font-bold text-[#64748B] block flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-[#059669]" />
                  Moisture
                </span>
                <span className="font-mono font-extrabold text-[#0F172A] block mt-0.5">
                  {currentObs.substrateMoistureIndex}%
                </span>
              </div>
            </div>

            {/* Actuator Intervention Event Flag if present */}
            {currentObs.interventionEvent && (
              <div className="p-2.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-xs text-[#065F46] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#059669] shrink-0" />
                <span>
                  <strong>Intervention:</strong> {currentObs.interventionEvent}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Chiguru Phenotype Score (Experimental - With Explicit Formula) */}
        <div className="p-4 rounded-xl bg-[#FAFBF9] border border-[#E2E8F0] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0F291E]">CHIGURU Phenotype Score (Experimental)</span>
            <span className="text-base font-black font-mono text-[#059669]">{phenotypeBreakdown.score}/100</span>
          </div>

          <p className="text-[11px] font-mono text-[#64748B] bg-white p-2 rounded-lg border border-[#E2E8F0]">
            {phenotypeBreakdown.formula}
          </p>

          <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-[#475569]">
            <div>Green Area: {phenotypeBreakdown.components.greenAreaScore}</div>
            <div>Growth Rate: {phenotypeBreakdown.components.growthRateScore}</div>
            <div>Stability: {phenotypeBreakdown.components.colorStabilityScore}</div>
          </div>

          <span className="text-[10px] text-[#94A3B8] block italic leading-tight">
            {phenotypeBreakdown.provenanceNote}
          </span>
        </div>

        {/* Human-in-the-Loop Manual Annotation */}
        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-[#0F291E]" />
              Researcher Ground-Truth Annotation
            </span>
            <button
              onClick={() => setIsAnnotating(!isAnnotating)}
              className="text-xs text-[#059669] hover:underline font-semibold"
            >
              {isAnnotating ? "Cancel" : "Edit Annotation"}
            </button>
          </div>

          {cell.manualAnnotation && (
            <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs flex items-center justify-between">
              <span>Annotated State: <strong>{cell.manualAnnotation}</strong></span>
              <span className="text-[10px] text-[#64748B]">Ground Truth Locked</span>
            </div>
          )}

          {isAnnotating && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="text-[11px] font-bold text-[#475569] block mb-1">Select Verified State:</label>
                <select
                  value={annotState}
                  onChange={(e) => setAnnotState(e.target.value as BiologicalEventState)}
                  className="w-full text-xs p-2 rounded-lg border border-[#CBD5E1] bg-white text-[#0F172A]"
                >
                  <option value="GERMINATED">GERMINATED</option>
                  <option value="SEEDLING_DEVELOPING">SEEDLING_DEVELOPING</option>
                  <option value="EMERGENCE_DETECTED">EMERGENCE_DETECTED</option>
                  <option value="IMBIBITION">IMBIBITION</option>
                  <option value="PLANTED">PLANTED</option>
                  <option value="FAILED">FAILED</option>
                  <option value="MANUAL_REVIEW">MANUAL_REVIEW</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#475569] block mb-1">Researcher Notes:</label>
                <textarea
                  value={annotNotes}
                  onChange={(e) => setAnnotNotes(e.target.value)}
                  placeholder="Record optical observations or protocol deviations..."
                  rows={2}
                  className="w-full text-xs p-2 rounded-lg border border-[#CBD5E1] text-[#0F172A]"
                />
              </div>

              <button
                onClick={handleSaveAnnot}
                className="w-full py-2 rounded-lg text-xs font-bold bg-[#0F291E] text-white hover:bg-[#1B4332] transition-colors"
              >
                Save Ground Truth Annotation
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
