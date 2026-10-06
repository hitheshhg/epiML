"use client";

import React, { useState } from "react";
import { Experiment, Treatment } from "@/lib/experimentTypes";
import {
  Compass,
  Sliders,
  TrendingUp,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface ExposureResponseAnalyticsProps {
  experiment: Experiment;
}

export default function ExposureResponseAnalytics({
  experiment,
}: ExposureResponseAnalyticsProps) {
  const [hoveredHour, setHoveredHour] = useState<number>(48);
  const m = experiment.metrics;

  // 6 discrete time-lapse evaluation intervals
  const timepoints = [0, 24, 48, 72, 96, 120];

  // Environment data points along the timeline
  const envTimeline = [
    { hour: 0, temp: 24.8, hum: 74.2, moist: 72, event: "PLANTED: 40 seeds imbibed" },
    { hour: 24, temp: 25.1, hum: 76.5, moist: 71, event: "IMBIBITION: seed coat softening" },
    { hour: 48, temp: 25.4, hum: 78.0, moist: 73, event: "IRRIGATION: 3.5s micro-pulse" },
    { hour: 72, temp: 24.9, hum: 75.0, moist: 72, event: "SHADE: canopy deployed to 60%" },
    { hour: 96, temp: 25.2, hum: 76.1, moist: 74, event: "VENT: louvers adjusted 30°" },
    { hour: 120, temp: 25.0, hum: 75.5, moist: 73, event: "FINAL PHENOTYPE AUDIT" },
  ];

  // Treatment-wise canopy trajectories (% coverage)
  const trajectoryData: Record<string, number[]> = {
    T1: [0, 0, 8.5, 18.2, 28.5, 34.0], // Control (Optimal)
    T2: [0, 0, 2.1, 8.4, 15.2, 18.5],  // Deficit (Stunted)
    T3: [0, 0, 4.0, 11.0, 16.5, 17.0], // Saturated (Rotting/Sluggish)
    T4: [0, 0, 9.2, 21.0, 31.0, 36.8], // Cyclic (High Vigor)
  };

  const activeEnvPoint = envTimeline.find((p) => p.hour === hoveredHour) || envTimeline[2];

  return (
    <section className="mb-8 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm overflow-hidden">
      
      {/* Header */}
      <div className="bg-[#FAFBF9] border-b border-[#E2E8F0] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#EBF5FB] text-[#0284C7]">
              <Compass className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0284C7]">
              Signature Research Visualization #2
            </span>
          </div>
          <h2 className="text-xl font-black text-[#0F172A] tracking-tight">
            Exposure ↔ Response Synchronized Analytics
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Connecting environmental exposure and actuator interventions to cell-level biological phenotype trajectories.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-white border border-[#CBD5E1] text-xs font-mono text-[#334155] shadow-sm">
          Scrubber Timeline: <strong className="text-[#0F291E]">{hoveredHour} Hours Post-Sowing</strong>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-8 bg-white">
        
        {/* Timeline Interaction Scrubber Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#475569]">
            <span>Timeline Scrubber (Drag or Click to Align Hours):</span>
            <span className="font-mono text-[#059669]">{hoveredHour}h</span>
          </div>

          <div className="grid grid-cols-6 gap-2">
            {timepoints.map((hr) => (
              <button
                key={hr}
                onClick={() => setHoveredHour(hr)}
                className={`p-2 rounded-xl text-center border font-mono transition-all ${
                  hoveredHour === hr
                    ? "bg-[#0F291E] text-white border-[#0F291E] shadow-md ring-2 ring-[#0F291E]/20"
                    : "bg-[#F8FAFC] hover:bg-[#F1F5F9] border-[#E2E8F0] text-[#334155]"
                }`}
              >
                <span className="text-xs font-bold block">{hr} Hours</span>
                <span className="text-[10px] opacity-75 block">Day {Math.floor(hr / 24)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dual Axis Research Chart Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Axis 1: Environmental Exposure Profile */}
          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#059669]" />
                Axis 1: Environmental Exposure @ {hoveredHour}h
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-[#CBD5E1] text-[#475569]">
                Continuous Sensing
              </span>
            </div>

            {/* Environmental Metric Gauges */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] text-center">
                <span className="text-[10px] uppercase font-bold text-[#64748B] block">Chamber Temp</span>
                <span className="text-xl font-black font-mono text-[#EA580C] mt-1 block">
                  {activeEnvPoint.temp}°C
                </span>
                <span className="text-[10px] text-[#94A3B8]">Target: 25.0°C</span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] text-center">
                <span className="text-[10px] uppercase font-bold text-[#64748B] block">Relative Humidity</span>
                <span className="text-xl font-black font-mono text-[#0284C7] mt-1 block">
                  {activeEnvPoint.hum}%
                </span>
                <span className="text-[10px] text-[#94A3B8]">Target: 75.0%</span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] text-center">
                <span className="text-[10px] uppercase font-bold text-[#64748B] block">Substrate Index</span>
                <span className="text-xl font-black font-mono text-[#059669] mt-1 block">
                  {activeEnvPoint.moist}%
                </span>
                <span className="text-[10px] text-[#94A3B8]">Target: 72%</span>
              </div>
            </div>

            {/* Synchronized Intervention Record at this time point */}
            <div className="p-3 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-xs text-[#065F46] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#059669] shrink-0" />
              <span>
                <strong>System Intervention:</strong> {activeEnvPoint.event}
              </span>
            </div>
          </div>

          {/* Axis 2: Biological Phenotype Trajectory */}
          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#2563EB]" />
                Axis 2: Phenotypic Response @ {hoveredHour}h
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-[#CBD5E1] text-[#475569]">
                ExG Canopy %
              </span>
            </div>

            {/* Treatment Response Bars at Scrubber Hour */}
            <div className="space-y-3">
              {experiment.treatments.map((t) => {
                const hourIdx = timepoints.indexOf(hoveredHour);
                const currentPct = trajectoryData[t.id]?.[hourIdx] || 0;
                return (
                  <div key={t.id} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span style={{ color: t.color }}>{t.name}</span>
                      <span className="font-mono font-bold text-[#0F172A]">{currentPct}% Canopy</span>
                    </div>
                    <div className="w-full h-3 bg-[#E2E8F0] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, (currentPct / 40) * 100)}%`,
                          backgroundColor: t.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-[#64748B] italic">
              *T4 Cyclic dry-back shows the highest foliar expansion slope (+36.8% at 120h) with 28% lower total water volume.
            </p>
          </div>

        </div>

        {/* Treatment-Wise Comparison Matrix Table */}
        <div className="border border-[#E2E8F0] rounded-2xl overflow-hidden">
          <div className="bg-[#FAFBF9] p-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
              Treatment-Wise Comparative Germination & Phenotype Matrix
            </h4>
            <span className="text-[11px] text-[#64748B]">
              Standardized Seed-Science Metrics (n = 10 per group)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-mono font-bold text-[#64748B] uppercase">
                <tr>
                  <th className="p-3">Treatment Group</th>
                  <th className="p-3">Replicates (n)</th>
                  <th className="p-3">Final Germination</th>
                  <th className="p-3">Mean Emergence</th>
                  <th className="p-3">T50</th>
                  <th className="p-3">Canopy Area</th>
                  <th className="p-3">Std Dev</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {m.treatmentMetrics.map((tm) => {
                  const tr = experiment.treatments.find((t) => t.id === tm.treatmentId);
                  return (
                    <tr key={tm.treatmentId} className="hover:bg-[#F8FAFC]">
                      <td className="p-3 font-bold text-[#0F172A] flex items-center gap-2">
                        <span className="w-3 h-3 rounded shrink-0" style={{ backgroundColor: tr?.color }} />
                        {tm.treatmentName}
                      </td>
                      <td className="p-3 font-mono text-[#475569]">n = {tm.replicatesN}</td>
                      <td className="p-3 font-mono font-black text-[#0F291E]">{tm.germinationPct}%</td>
                      <td className="p-3 font-mono">{tm.meanEmergenceHours}h</td>
                      <td className="p-3 font-mono font-bold">{tm.t50Hours}h</td>
                      <td className="p-3 font-mono">{tm.meanGreenAreaPx} px</td>
                      <td className="p-3 font-mono text-[#64748B]">±{tm.stdDevHours}h</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Statistical Honesty Banner */}
          <div className="bg-[#FFFBEB] p-3 px-4 border-t border-[#FDE68A] flex items-start gap-2 text-xs text-[#92400E]">
            <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Methodological Rigor Notice:</strong>
              Descriptive comparison only. Sample size (n = 10 per treatment) is intended for prototype calibration and exploratory screening. Larger sample sizes (n ≥ 30) are recommended before running inferential ANOVA significance tests.
            </div>
          </div>
        </div>

      </div>

    </section>
  );
}
