"use client";

import React from "react";
import { Sprout, Clock, Camera, CheckCircle2, Droplets } from "lucide-react";

interface Milestone {
  id: string;
  hour: number;
  label: string;
  state: string;
  timestamp: string;
  description: string;
  imageThumbnail: string;
  smi: number;
  temp: number;
  exg: number;
}

const MILESTONES: Milestone[] = [
  {
    id: "m0",
    hour: 0,
    label: "Planted & Imbibition",
    state: "SEEDED",
    timestamp: "2026-10-01 08:00 UTC",
    description: "Seed placed in washed cocopeat 70% + perlite 30%. Baseline camera gantry registration.",
    imageThumbnail: "/images/benchmarks/bench_0%_seeds_visible.jpg",
    smi: 72,
    temp: 24.8,
    exg: -3.2,
  },
  {
    id: "m1",
    hour: 1,
    label: "First Gantry Registration",
    state: "SEEDED",
    timestamp: "2026-10-01 09:00 UTC",
    description: "40-cell grid perspective lock confirmed. Initial baseline substrate color recorded.",
    imageThumbnail: "/images/benchmarks/bench_0%_seeds_visible.jpg",
    smi: 73,
    temp: 24.9,
    exg: -2.8,
  },
  {
    id: "m2",
    hour: 44,
    label: "First Hypocotyl Emergence",
    state: "EMERGING",
    timestamp: "2026-10-03 04:00 UTC",
    description: "Initial hypocotyl hook breach detected in cell C17. First non-zero Excess Green contrast.",
    imageThumbnail: "/images/benchmarks/bench_25%_green_dots.jpg",
    smi: 71,
    temp: 25.2,
    exg: +14.5,
  },
  {
    id: "m3",
    hour: 72,
    label: "Cotyledon Deployment",
    state: "GERMINATED",
    timestamp: "2026-10-04 08:00 UTC",
    description: "Bilateral cotyledon opening. Projected canopy area exceeds 15% threshold.",
    imageThumbnail: "/images/benchmarks/bench_50%_radicle.jpg",
    smi: 70,
    temp: 25.4,
    exg: +34.2,
  },
  {
    id: "m4",
    hour: 96,
    label: "Active Canopy Expansion",
    state: "GROWING",
    timestamp: "2026-10-05 08:00 UTC",
    description: "Cotyledon expansion rate stable at +0.32%/hr. Projected canopy reaches 28.5% (680 px).",
    imageThumbnail: "/images/benchmarks/bench_100%_full_emergence.jpg",
    smi: 72,
    temp: 25.2,
    exg: +42.8,
  },
];

export function GrowthStoryTimeline({ cellId = "C17" }: { cellId?: string }) {
  const [selectedMilestone, setSelectedMilestone] = React.useState<Milestone>(MILESTONES[4]);

  return (
    <div className="rounded-2xl border border-[#E2E8DC] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F0F4EC] pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2D6A4F]/10 text-[#2D6A4F]">
            <Sprout className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#163828]">
              Cell {cellId} Biological Growth Story
            </h3>
            <p className="text-[11px] text-[#52796F]">
              Chronological milestone progression from seed placement to current expansion
            </p>
          </div>
        </div>

        <span className="font-mono text-[11px] text-[#2D6A4F] font-bold bg-[#E8F7EC] px-2.5 py-0.5 rounded-full">
          T + {selectedMilestone.hour}h Milestone Selected
        </span>
      </div>

      {/* Horizontal Interactive Timeline */}
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {MILESTONES.map((m) => {
          const isSelected = selectedMilestone.id === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setSelectedMilestone(m)}
              className={`flex flex-col text-left rounded-xl border p-3 transition-all ${
                isSelected
                  ? "border-[#2D6A4F] bg-[#E8F7EC]/60 ring-2 ring-[#2D6A4F]/20 shadow-xs"
                  : "border-[#E2E8DC] bg-[#F8FAF6] hover:border-[#74C69D] hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-[#2D6A4F]">
                  T + {m.hour}h
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/80 border border-[#E2E8DC] text-[#163828]">
                  {m.state}
                </span>
              </div>
              <div className="mt-2 text-xs font-bold text-[#163828] line-clamp-1">
                {m.label}
              </div>
              <div className="mt-1 text-[10px] text-[#6C757D]">
                {m.timestamp.split(" ")[0]}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Milestone Detail Banner */}
      <div className="mt-4 rounded-xl border border-[#D8F3DC] bg-[#F8FAF6] p-4 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="font-bold text-[#163828] text-sm">
            {selectedMilestone.label} (Hour {selectedMilestone.hour})
          </div>
          <span className="font-mono text-[11px] text-[#52796F]">
            {selectedMilestone.timestamp}
          </span>
        </div>
        <p className="mt-1 text-[#4A6B5D] leading-relaxed">
          {selectedMilestone.description}
        </p>

        {/* Micro-climate context at that exact event */}
        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-[#E8EDE2] pt-2 font-mono text-[11px]">
          <div>
            <span className="text-[#6C757D]">Substrate Moisture: </span>
            <strong className="text-[#2D6A4F]">{selectedMilestone.smi}% SMI</strong>
          </div>
          <div>
            <span className="text-[#6C757D]">Chamber Temp: </span>
            <strong className="text-[#163828]">{selectedMilestone.temp}°C</strong>
          </div>
          <div>
            <span className="text-[#6C757D]">Excess Green (ExG): </span>
            <strong className="text-[#2D6A4F]">{selectedMilestone.exg > 0 ? "+" + selectedMilestone.exg : selectedMilestone.exg}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
