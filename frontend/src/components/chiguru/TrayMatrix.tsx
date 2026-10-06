"use client";

import React from "react";
import { CellRecord, CellState } from "@/lib/types/monitoring";
import { CheckCircle2, AlertTriangle, Eye, ShieldCheck, Sparkles } from "lucide-react";

interface TrayMatrixProps {
  cells: CellRecord[];
  selectedCellId: string;
  onSelectCell: (cellId: string) => void;
  plantName: string;
  scientificName: string;
}

export default function TrayMatrix({
  cells,
  selectedCellId,
  onSelectCell,
  plantName,
  scientificName,
}: TrayMatrixProps) {
  // Aggregate statistics
  const total = cells.length;
  const growing = cells.filter((c) => c.state === "GROWING").length;
  const emerging = cells.filter((c) => c.state === "EMERGING").length;
  const seeded = cells.filter((c) => c.state === "SEEDED").length;
  const review = cells.filter((c) => c.state === "REVIEW").length;
  const germinatedTotal = growing + emerging;
  const germPct = Math.round((germinatedTotal / Math.max(1, total)) * 100);

  return (
    <div className="bg-white rounded-2xl border border-[#D5E0D0] p-6 shadow-sm">
      
      {/* Tray Header & Macro Counts */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E8EFE5]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2D6A4F]" />
            <h3 className="text-base font-extrabold text-[#163828]">
              40-Cell Nursery Seedling Matrix (5 × 8)
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#EBF2E8] text-[#2D6A4F] font-bold">
              Fixed 420mm Gantry
            </span>
          </div>
          <p className="text-xs text-[#52796F] mt-0.5">
            Monitoring <strong className="text-[#163828]">{plantName}</strong> (<em>{scientificName}</em>) • Click any cell to inspect individual history.
          </p>
        </div>

        {/* Status Legend Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EBF2E8] text-[#163828] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#2D6A4F]" />
            <span>Growing ({growing})</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F2F8F0] text-[#2D6A4F] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#52B788]" />
            <span>Emerging ({emerging})</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FFF7ED] text-[#C2410C] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#F4A261]" />
            <span>Review ({review})</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAFBF9] text-[#748E84] font-medium border border-[#E2E8DC]">
            <span className="w-2 h-2 rounded-full bg-[#B78D63]" />
            <span>Seeded ({seeded})</span>
          </div>
        </div>
      </div>

      {/* 5 x 8 Cell Grid Container */}
      <div className="mt-6 overflow-x-auto">
        <div className="min-w-[560px]">
          
          {/* Column Coordinate Headers */}
          <div className="grid grid-cols-8 gap-2.5 mb-1.5 text-center text-[10px] font-mono font-bold text-[#84A98C]">
            <span>COL 1</span>
            <span>COL 2</span>
            <span>COL 3</span>
            <span>COL 4</span>
            <span>COL 5</span>
            <span>COL 6</span>
            <span>COL 7</span>
            <span>COL 8</span>
          </div>

          {/* 40 Cells Matrix */}
          <div className="grid grid-cols-8 gap-2.5">
            {cells.map((cell) => {
              const isSelected = cell.cellId === selectedCellId;
              const isGrowing = cell.state === "GROWING";
              const isEmerging = cell.state === "EMERGING";
              const isReview = cell.state === "REVIEW";
              const isSeeded = cell.state === "SEEDED";

              return (
                <button
                  key={cell.cellId}
                  onClick={() => onSelectCell(cell.cellId)}
                  className={`aspect-square rounded-xl p-2.5 text-left border transition-all flex flex-col justify-between relative group ${
                    isSelected
                      ? "bg-[#EBF2E8] border-[#2D6A4F] ring-2 ring-[#2D6A4F] shadow-md scale-[1.02] z-10"
                      : isReview
                      ? "bg-[#FFF9F5] border-[#F8D7C8] hover:border-[#E76F51]"
                      : isGrowing
                      ? "bg-[#FAFBF9] border-[#D5E3D0] hover:border-[#2D6A4F] hover:bg-[#F2F7F0]"
                      : isEmerging
                      ? "bg-[#FCFDFC] border-[#E2EBDC] hover:border-[#52B788]"
                      : "bg-white border-[#E8ECE4] hover:border-[#B7D1C5]"
                  }`}
                >
                  {/* Top: Cell ID + Status Dot */}
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-[11px] font-mono font-extrabold ${
                        isSelected ? "text-[#163828]" : "text-[#52796F]"
                      }`}
                    >
                      {cell.cellId}
                    </span>

                    <span
                      className={`w-2 h-2 rounded-full ${
                        isGrowing
                          ? "bg-[#2D6A4F]"
                          : isEmerging
                          ? "bg-[#52B788]"
                          : isReview
                          ? "bg-[#E76F51] animate-pulse"
                          : "bg-[#B78D63]/50"
                      }`}
                    />
                  </div>

                  {/* Center: Phenotype Green Fraction Micro-Graphic */}
                  <div className="my-auto flex flex-col items-center justify-center">
                    {isGrowing ? (
                      <div className="flex items-center gap-0.5">
                        <div className="w-2.5 h-4 rounded-full bg-[#2D6A4F] -rotate-12 shadow-sm" />
                        <div className="w-2.5 h-4 rounded-full bg-[#2D6A4F] rotate-12 shadow-sm" />
                      </div>
                    ) : isEmerging ? (
                      <div className="flex flex-col items-center">
                        <div className="w-1.5 h-3 rounded-full bg-[#52B788] rotate-6" />
                        <div className="w-2 h-2 rounded-full bg-[#B78D63]" />
                      </div>
                    ) : isReview ? (
                      <div className="flex items-center justify-center text-[#E76F51]">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-2.5 h-3.5 rounded-full bg-[#B78D63]/70 shadow-inner" />
                    )}
                  </div>

                  {/* Bottom: ExG Score & State Label */}
                  <div className="w-full">
                    <div className="flex items-center justify-between text-[9px] font-mono text-[#748E84]">
                      <span>{cell.state}</span>
                      <span>{Math.round(cell.currentObservation.exgScore * 100)}%</span>
                    </div>

                    {/* ExG Progress Bar */}
                    <div className="w-full h-1 rounded-full bg-[#E8ECE4] overflow-hidden mt-0.5">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isGrowing ? "bg-[#2D6A4F]" : isEmerging ? "bg-[#52B788]" : isReview ? "bg-[#E76F51]" : "bg-[#B78D63]"
                        }`}
                        style={{ width: `${Math.min(100, Math.round(cell.currentObservation.exgScore * 100))}%` }}
                      />
                    </div>
                  </div>

                  {/* Subtle Selected Badge */}
                  {isSelected && (
                    <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-[#2D6A4F] text-white flex items-center justify-center text-[9px] font-bold">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* Tray Footer Summary */}
      <div className="mt-6 pt-4 border-t border-[#E8EFE5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#52796F]">
        <div className="flex items-center gap-3">
          <span className="font-bold text-[#163828]">Overall Emergence: {germPct}% ({germinatedTotal}/{total} Cells)</span>
          <span>•</span>
          <span>Deterministic 5×8 Optical Grid Calibration</span>
        </div>
        <span className="font-mono text-[11px] text-[#84A98C]">
          Signature Cell C17 focused by default
        </span>
      </div>

    </div>
  );
}
