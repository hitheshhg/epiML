"use client";

import React, { useState } from "react";
import { CellData, Treatment, BiologicalEventState } from "@/lib/experimentTypes";
import {
  Layers,
  Shuffle,
  AlertTriangle,
  Info,
  Maximize2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Eye,
  SlidersHorizontal,
} from "lucide-react";

interface DigitalTwinTrayProps {
  cells: CellData[];
  treatments: Treatment[];
  selectedCellId: string | null;
  onSelectCell: (cell: CellData) => void;
  onRandomizeTreatments: () => void;
  spatialClusteringWarning: string | null;
}

type ViewMode = "STATE" | "TREATMENT" | "CANOPY_AREA" | "TIME_TO_EMERGENCE";

export default function DigitalTwinTray({
  cells,
  treatments,
  selectedCellId,
  onSelectCell,
  onRandomizeTreatments,
  spatialClusteringWarning,
}: DigitalTwinTrayProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("STATE");

  const getCellColor = (cell: CellData): string => {
    if (viewMode === "TREATMENT") {
      const tr = treatments.find((t) => t.id === cell.treatmentId);
      return tr?.color || "#64748B";
    }

    if (viewMode === "STATE") {
      switch (cell.currentState) {
        case "SEEDLING_DEVELOPING":
          return "#15803D"; // Strong Green
        case "GERMINATED":
          return "#22C55E"; // Bright Green
        case "EMERGENCE_DETECTED":
          return "#86EFAC"; // Light Green
        case "IMBIBITION":
          return "#FDE047"; // Yellow
        case "PLANTED":
          return "#CBD5E1"; // Slate
        case "FAILED":
          return "#EF4444"; // Red
        case "MANUAL_REVIEW":
          return "#F97316"; // Orange
        default:
          return "#94A3B8";
      }
    }

    if (viewMode === "CANOPY_AREA") {
      // 0% to 35%
      const pct = cell.latestCanopyPct;
      if (pct === 0) return "#E2E8F0";
      if (pct < 10) return "#BBF7D0";
      if (pct < 20) return "#4ADE80";
      if (pct < 30) return "#22C55E";
      return "#15803D";
    }

    if (viewMode === "TIME_TO_EMERGENCE") {
      const h = cell.timeToEmergenceHours;
      if (!h) return "#E2E8F0";
      if (h <= 40) return "#3B82F6"; // Fast (Blue)
      if (h <= 60) return "#60A5FA";
      if (h <= 75) return "#F59E0B"; // Moderate (Amber)
      return "#EF4444"; // Slow (Red)
    }

    return "#CBD5E1";
  };

  return (
    <section className="mb-8 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm overflow-hidden">
      
      {/* Header Bar */}
      <div className="bg-[#FAFBF9] border-b border-[#E2E8F0] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#E8F5E9] text-[#2D6A4F]">
              <Layers className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2D6A4F]">
              Primary Biological Unit
            </span>
          </div>
          <h2 className="text-xl font-black text-[#0F172A] tracking-tight">
            40-Cell Nursery Tray Digital Twin (5 × 8 Matrix)
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Every cell holds persistent experimental identity (C01–C40) with longitudinal time-lapse observations.
          </p>
        </div>

        {/* View Mode & Randomize Actions */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
          
          {/* Heatmap Select */}
          <div className="flex items-center bg-white border border-[#CBD5E1] p-1 rounded-xl text-xs font-semibold">
            <span className="px-2 text-[#64748B] text-[11px] font-bold">VIEW:</span>
            <button
              onClick={() => setViewMode("STATE")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                viewMode === "STATE" ? "bg-[#1B4332] text-white shadow-sm" : "text-[#475569] hover:bg-[#F1F5F9]"
              }`}
            >
              Biological State
            </button>
            <button
              onClick={() => setViewMode("TREATMENT")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                viewMode === "TREATMENT" ? "bg-[#1B4332] text-white shadow-sm" : "text-[#475569] hover:bg-[#F1F5F9]"
              }`}
            >
              Treatments
            </button>
            <button
              onClick={() => setViewMode("CANOPY_AREA")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                viewMode === "CANOPY_AREA" ? "bg-[#1B4332] text-white shadow-sm" : "text-[#475569] hover:bg-[#F1F5F9]"
              }`}
            >
              Canopy %
            </button>
            <button
              onClick={() => setViewMode("TIME_TO_EMERGENCE")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                viewMode === "TIME_TO_EMERGENCE" ? "bg-[#1B4332] text-white shadow-sm" : "text-[#475569] hover:bg-[#F1F5F9]"
              }`}
            >
              Emergence Hours
            </button>
          </div>

          <button
            onClick={onRandomizeTreatments}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-[#F8FAFC] border border-[#CBD5E1] text-[#334155] flex items-center gap-1.5 shadow-sm transition-all"
            title="Re-randomize treatment allocation across cells to eliminate spatial position bias"
          >
            <Shuffle className="w-3.5 h-3.5 text-[#059669]" />
            Randomize Layout
          </button>

        </div>
      </div>

      {/* Spatial Clustering Warning (Methodological Rigor) */}
      {spatialClusteringWarning && (
        <div className="bg-[#FFFBEB] border-b border-[#FDE68A] p-3 px-6 flex items-center gap-2 text-xs text-[#92400E]">
          <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0" />
          <span>{spatialClusteringWarning}</span>
        </div>
      )}

      {/* Main 5x8 Grid Canvas */}
      <div className="p-6 sm:p-8 bg-[#F8FAFC]">
        <div className="max-w-4xl mx-auto">
          
          {/* Top Axis Column Labels (1 to 8) */}
          <div className="grid grid-cols-8 gap-2.5 sm:gap-3.5 mb-2 text-center text-xs font-mono font-bold text-[#64748B]">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((c) => (
              <span key={c}>Col {c}</span>
            ))}
          </div>

          {/* 5 Rows Matrix */}
          <div className="space-y-2.5 sm:space-y-3.5">
            {[1, 2, 3, 4, 5].map((r) => {
              const rowCells = cells.filter((cl) => cl.row === r);
              return (
                <div key={r} className="grid grid-cols-8 gap-2.5 sm:gap-3.5">
                  {rowCells.map((cell) => {
                    const isSelected = selectedCellId === cell.cellId;
                    const color = getCellColor(cell);
                    const treatment = treatments.find((t) => t.id === cell.treatmentId);

                    return (
                      <button
                        key={cell.cellId}
                        onClick={() => onSelectCell(cell)}
                        style={{
                          backgroundColor: color,
                        }}
                        className={`relative aspect-square rounded-xl p-2 sm:p-3 text-left transition-all transform flex flex-col justify-between overflow-hidden shadow-sm hover:scale-[1.04] hover:shadow-md focus:outline-none ${
                          isSelected
                            ? "ring-4 ring-[#0F291E] ring-offset-2 z-10 scale-[1.03]"
                            : "border border-black/10"
                        }`}
                      >
                        {/* Cell Identification Header */}
                        <div className="flex items-center justify-between w-full">
                          <span
                            className={`text-xs sm:text-sm font-mono font-black ${
                              viewMode === "CANOPY_AREA" && cell.latestCanopyPct === 0
                                ? "text-[#475569]"
                                : "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                            }`}
                          >
                            {cell.cellId}
                          </span>

                          <span
                            className="text-[9px] font-mono font-bold px-1 py-0.5 rounded bg-black/40 text-white/90 backdrop-blur-sm"
                          >
                            {cell.treatmentId}
                          </span>
                        </div>

                        {/* Cell Biological Annotation Details */}
                        <div className="w-full text-right mt-1">
                          {viewMode === "STATE" && (
                            <span className="text-[10px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] line-clamp-1">
                              {cell.currentState === "FAILED" ? "FAILED" : (cell.timeToEmergenceHours ? `${cell.timeToEmergenceHours}h` : "PLANTED")}
                            </span>
                          )}

                          {viewMode === "TREATMENT" && (
                            <span className="text-[10px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] truncate">
                              Rep #{cell.replicateIndex}
                            </span>
                          )}

                          {viewMode === "CANOPY_AREA" && (
                            <span className={`text-[10px] font-mono font-black ${cell.latestCanopyPct === 0 ? "text-[#64748B]" : "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"}`}>
                              {cell.latestCanopyPct}%
                            </span>
                          )}

                          {viewMode === "TIME_TO_EMERGENCE" && (
                            <span className="text-[10px] font-mono font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                              {cell.timeToEmergenceHours ? `${cell.timeToEmergenceHours}h` : "N/A"}
                            </span>
                          )}
                        </div>

                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

        </div>

        {/* Legend Tray Bar */}
        <div className="max-w-4xl mx-auto mt-6 pt-4 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-4 text-xs">
          
          {/* Dynamic Legend according to viewMode */}
          <div className="flex flex-wrap items-center gap-3">
            {viewMode === "STATE" && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#15803D]" />
                  <span className="text-[#475569]">Seedling Developing</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#22C55E]" />
                  <span className="text-[#475569]">Germinated</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#86EFAC]" />
                  <span className="text-[#475569]">Emergence Detected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#EF4444]" />
                  <span className="text-[#475569]">Failed / No Emergence</span>
                </div>
              </>
            )}

            {viewMode === "TREATMENT" && (
              treatments.map((t) => (
                <div key={t.id} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded" style={{ backgroundColor: t.color }} />
                  <span className="text-[#334155] font-semibold">{t.name} (n={t.replicateCount})</span>
                </div>
              ))
            )}

            {viewMode === "CANOPY_AREA" && (
              <div className="flex items-center gap-2 text-[#475569] font-mono text-[11px]">
                <span>0% Canopy</span>
                <span className="w-4 h-3 rounded bg-[#E2E8F0]" />
                <span className="w-4 h-3 rounded bg-[#BBF7D0]" />
                <span className="w-4 h-3 rounded bg-[#4ADE80]" />
                <span className="w-4 h-3 rounded bg-[#15803D]" />
                <span>35%+ High Canopy</span>
              </div>
            )}
          </div>

          <span className="text-[11px] text-[#64748B] italic">
            Click any cell to open its longitudinal digital twin record
          </span>

        </div>

      </div>

    </section>
  );
}
