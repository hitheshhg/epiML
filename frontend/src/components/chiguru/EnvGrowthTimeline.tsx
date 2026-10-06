"use client";

import React, { useState } from "react";
import { SynchronizedTimelinePoint } from "@/lib/types/monitoring";
import {
  Activity,
  Droplets,
  Thermometer,
  Cloud,
  Sparkles,
  Clock,
  Wind,
  Zap,
  CheckCircle2
} from "lucide-react";

interface EnvGrowthTimelineProps {
  timeline: SynchronizedTimelinePoint[];
  onSelectEventTime?: (point: SynchronizedTimelinePoint) => void;
}

export default function EnvGrowthTimeline({
  timeline,
  onSelectEventTime,
}: EnvGrowthTimelineProps) {
  // Scrubber cursor index
  const [selectedIndex, setSelectedIndex] = useState<number>(timeline.length - 1);

  const activePoint = timeline[selectedIndex] || timeline[timeline.length - 1];

  // Helper to jump cursor to specific milestone
  const jumpToHour = (hr: number) => {
    const idx = timeline.findIndex((p) => p.elapsedHours >= hr);
    if (idx >= 0) setSelectedIndex(idx);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#D5E0D0] p-6 shadow-sm">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E8EFE5]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2D6A4F]" />
            <h3 className="text-base font-extrabold text-[#163828]">
              Environment → Growth Synchronized Timeline
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EBF2E8] text-[#2D6A4F] font-bold">
              96-Hour Horizon
            </span>
          </div>
          <p className="text-xs text-[#52796F] mt-0.5">
            Synchronized temporal cursor connects what the seed experienced with what happened to the seedling.
          </p>
        </div>

        {/* Quick Milestone Jumper Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-[11px] text-[#748E84] font-medium mr-1">Milestones:</span>
          <button
            onClick={() => jumpToHour(0)}
            className="px-2.5 py-1 rounded-lg bg-[#FAFBF9] border border-[#E2E8DC] hover:bg-[#EBF2E8] text-[#2D4A3E] font-medium"
          >
            Hour 0 (Sown)
          </button>
          <button
            onClick={() => jumpToHour(36)}
            className="px-2.5 py-1 rounded-lg bg-[#FAFBF9] border border-[#E2E8DC] hover:bg-[#EBF2E8] text-[#2D4A3E] font-medium"
          >
            Hour 36 (Irrigation)
          </button>
          <button
            onClick={() => jumpToHour(48)}
            className="px-2.5 py-1 rounded-lg bg-[#EBF2E8] border border-[#B7D1C5] text-[#2D6A4F] font-bold"
          >
            Hour 48 (C17 Emergence)
          </button>
          <button
            onClick={() => jumpToHour(96)}
            className="px-2.5 py-1 rounded-lg bg-[#FAFBF9] border border-[#E2E8DC] hover:bg-[#EBF2E8] text-[#2D4A3E] font-medium"
          >
            Hour 96 (Current)
          </button>
        </div>
      </div>

      {/* Synchronized Inspection Cursor HUD Card */}
      <div className="my-5 p-4 rounded-xl bg-[#FAFBF9] border border-[#D5E0D0] grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
        <div>
          <span className="text-[10px] text-[#748E84] font-mono block">Timeline Position</span>
          <span className="font-extrabold text-[#163828] text-sm font-mono block mt-0.5">
            {activePoint.timeLabel}
          </span>
          {activePoint.keyEvent && (
            <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#2D6A4F] text-white">
              {activePoint.keyEvent}
            </span>
          )}
        </div>

        <div>
          <span className="text-[10px] text-[#52796F] block flex items-center gap-1">
            <Thermometer className="w-3 h-3 text-[#E76F51]" /> Temp
          </span>
          <span className="font-black text-[#163828] text-base">{activePoint.temperature}°C</span>
          <span className="text-[10px] text-[#84A98C] block">Canopy probe</span>
        </div>

        <div>
          <span className="text-[10px] text-[#52796F] block flex items-center gap-1">
            <Cloud className="w-3 h-3 text-[#52796F]" /> Humidity
          </span>
          <span className="font-black text-[#163828] text-base">{activePoint.humidity}%</span>
          <span className="text-[10px] text-[#84A98C] block">RH Dewpt: {activePoint.dewPoint}°C</span>
        </div>

        <div>
          <span className="text-[10px] text-[#52796F] block flex items-center gap-1">
            <Droplets className="w-3 h-3 text-[#2D6A4F]" /> Soil Moisture
          </span>
          <span className="font-black text-[#163828] text-base">{activePoint.moistureIndex}%</span>
          <span className="text-[10px] text-[#84A98C] block">
            {activePoint.pumpEvent ? "Irrigation event" : "Stable capillary"}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-[#52796F] block flex items-center gap-1">
            <Wind className="w-3 h-3 text-[#52796F]" /> Actuators
          </span>
          <span className="font-black text-[#163828] text-xs font-mono block mt-1">
            Vent: {activePoint.ventState}
          </span>
          <span className="text-[10px] text-[#84A98C] block">Fan: {activePoint.fanState}</span>
        </div>

        <div>
          <span className="text-[10px] text-[#52796F] block flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#2D6A4F]" /> Phenotype State
          </span>
          <span className="font-black text-[#2D6A4F] text-base">
            {activePoint.germinatedCount}/40 Cells
          </span>
          <span className="text-[10px] text-[#84A98C] block">ExG Index: {activePoint.greenFractionExg}</span>
        </div>
      </div>

      {/* Scrubber Range Slider Control */}
      <div className="mb-6 px-2">
        <div className="flex justify-between text-[11px] font-mono text-[#748E84] mb-1.5">
          <span>Hour 0 (Planting)</span>
          <span className="text-[#2D6A4F] font-bold">Drag slider to scrub through 96 hours of history</span>
          <span>Hour 96 (Live)</span>
        </div>
        <input
          type="range"
          min="0"
          max={timeline.length - 1}
          value={selectedIndex}
          onChange={(e) => setSelectedIndex(parseInt(e.target.value, 10))}
          className="w-full accent-[#2D6A4F] cursor-pointer"
        />
      </div>

      {/* Dual Stacked SVG Sparkline Timelines */}
      <div className="space-y-6">
        
        {/* Top Chart: Microclimate Trends (Temp, Humidity, Moisture) */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-[#163828] mb-2">
            <span className="flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-[#E76F51]" />
              Microclimate Environment Timeline (Temp, Humidity %, Moisture Index %)
            </span>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="text-[#E76F51]">■ Temp (°C)</span>
              <span className="text-[#52796F]">■ Humidity (%)</span>
              <span className="text-[#2D6A4F]">■ Moisture (%)</span>
            </div>
          </div>

          <div className="relative h-28 w-full bg-[#FAFBF9] rounded-xl border border-[#E2E8DC] p-2 overflow-hidden">
            <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${timeline.length * 20} 80`} preserveAspectRatio="none">
              
              {/* Humidity Line (Blue/Gray) */}
              <polyline
                fill="none"
                stroke="#52796F"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                points={timeline
                  .map((p, i) => `${i * 20},${80 - (p.humidity - 50) * 1.5}`)
                  .join(" ")}
              />

              {/* Moisture Line (Green) */}
              <polyline
                fill="none"
                stroke="#2D6A4F"
                strokeWidth="2"
                points={timeline
                  .map((p, i) => `${i * 20},${80 - (p.moistureIndex - 40) * 1.6}`)
                  .join(" ")}
              />

              {/* Temperature Line (Coral) */}
              <polyline
                fill="none"
                stroke="#E76F51"
                strokeWidth="2"
                points={timeline
                  .map((p, i) => `${i * 20},${80 - (p.temperature - 15) * 4}`)
                  .join(" ")}
              />

              {/* Synchronized Vertical Cursor Line */}
              <line
                x1={selectedIndex * 20}
                y1="0"
                x2={selectedIndex * 20}
                y2="80"
                stroke="#163828"
                strokeWidth="2"
                strokeDasharray="2 2"
              />
              <circle
                cx={selectedIndex * 20}
                cy={80 - (activePoint.temperature - 15) * 4}
                r="4"
                fill="#E76F51"
              />
            </svg>
          </div>
        </div>

        {/* Bottom Chart: Green Area & Emergence Count Phenotype */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-[#163828] mb-2">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#2D6A4F]" />
              Seedling Phenotype Progression (Cumulative Germination Count & ExG Score)
            </span>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="text-[#2D6A4F]">■ Germinated Cells (0-40)</span>
              <span className="text-[#52B788]">■ ExG Green Fraction</span>
            </div>
          </div>

          <div className="relative h-28 w-full bg-[#FAFBF9] rounded-xl border border-[#E2E8DC] p-2 overflow-hidden">
            <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${timeline.length * 20} 80`} preserveAspectRatio="none">
              
              {/* ExG Area polygon */}
              <polygon
                fill="#52B788"
                fillOpacity="0.2"
                stroke="#52B788"
                strokeWidth="1.5"
                points={`0,80 ${timeline
                  .map((p, i) => `${i * 20},${80 - p.greenFractionExg * 75}`)
                  .join(" ")} ${(timeline.length - 1) * 20},80`}
              />

              {/* Germination Step/Curve */}
              <polyline
                fill="none"
                stroke="#2D6A4F"
                strokeWidth="2.5"
                points={timeline
                  .map((p, i) => `${i * 20},${80 - (p.germinatedCount / 40) * 72}`)
                  .join(" ")}
              />

              {/* Synchronized Vertical Cursor Line */}
              <line
                x1={selectedIndex * 20}
                y1="0"
                x2={selectedIndex * 20}
                y2="80"
                stroke="#163828"
                strokeWidth="2"
                strokeDasharray="2 2"
              />
              <circle
                cx={selectedIndex * 20}
                cy={80 - (activePoint.germinatedCount / 40) * 72}
                r="4"
                fill="#2D6A4F"
              />
            </svg>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="mt-5 pt-3 border-t border-[#E8EFE5] flex items-center justify-between text-xs text-[#748E84]">
        <span>Click 'Hour 48' above to see the microclimate when C17 emerged</span>
        <span className="font-mono text-[#2D6A4F] font-bold">
          Continuous Historical Recording: Active
        </span>
      </div>

    </div>
  );
}
