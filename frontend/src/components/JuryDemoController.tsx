"use client";

import React from "react";
import {
  PlayCircle,
  X,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldCheck,
  Compass,
  Database,
  Clock,
  Sparkles,
} from "lucide-react";

interface JuryDemoControllerProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyScenario: (num: number) => void;
  activeScenarioNum: number;
}

export default function JuryDemoController({
  isOpen,
  onClose,
  onApplyScenario,
  activeScenarioNum,
}: JuryDemoControllerProps) {
  if (!isOpen) return null;

  const scenarios = [
    {
      id: 1,
      badge: "SCENARIO 1",
      title: "Tomato Moisture Trial (Primary Measured Recording)",
      description: "Solanum lycopersicum var. Pusa Ruby across 4 treatments. Shows 40-cell digital twin, emergence tracking, and T50 calculation.",
      dataClass: "MEASURED (Live / Recorded Baseline)",
    },
    {
      id: 2,
      badge: "SCENARIO 2",
      title: "SeedGerm-VIG Benchmark Replay (Public Scientific Data)",
      description: "BioImage Archive Accession S-BIAD1852 Cadenza wheat dataset. Demonstrates how CHIGURU benchmarks against published peer-reviewed pipelines.",
      dataClass: "REAL_PUBLIC_DATA (BioImage Archive)",
    },
    {
      id: 3,
      badge: "SCENARIO 3",
      title: "Treatment Comparison & Statistical Honesty",
      description: "Compares T1 Control vs T2 Deficit vs T4 Cyclic. Highlights sample size warnings (n = 10) and prevents ungrounded causal claims.",
      dataClass: "DERIVED ANALYSIS",
    },
    {
      id: 4,
      badge: "SCENARIO 4",
      title: "Intelligent Action Withholding (Closed-Loop Refusal)",
      description: "Simulates high chamber RH (92%) with low soil moisture. Demonstrates the cyber-physical engine refusing to irrigate to prevent root rot.",
      dataClass: "SIMULATED / SANDBOX",
    },
    {
      id: 5,
      badge: "SCENARIO 5",
      title: "Sensor Disconnect & Data Gap Integrity",
      description: "Simulates probe disconnection. Proves CHIGURU renders transparent 'DATA GAP' empty states rather than inventing fake numbers.",
      dataClass: "SIMULATED / FAULT INJECTION",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl max-w-2xl w-full p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#EA580C] text-white">
              <PlayCircle className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-extrabold text-[#0F172A]">
                YEN NOVA 1.0 — 3-Minute Jury Demonstration Scenarios
              </h3>
              <p className="text-xs text-[#64748B]">
                Curated scientific test sequences to prove cell-level phenotyping, data integrity, and provenance.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#E2E8F0] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scenarios List */}
        <div className="space-y-3">
          {scenarios.map((sc) => {
            const isActive = activeScenarioNum === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => {
                  onApplyScenario(sc.id);
                  onClose();
                }}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                  isActive
                    ? "bg-[#F0FDF4] border-[#059669] shadow-sm ring-2 ring-[#059669]/20"
                    : "bg-[#F8FAFC] hover:bg-white border-[#E2E8F0] hover:border-[#CBD5E1]"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0F291E] text-white">
                      {sc.badge}
                    </span>
                    <h4 className="text-xs font-bold text-[#0F172A]">{sc.title}</h4>
                  </div>
                  <p className="text-xs text-[#475569] leading-relaxed">{sc.description}</p>
                  <span className="text-[10px] font-mono text-[#059669] font-semibold block">
                    Data Class: {sc.dataClass}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-white border border-[#CBD5E1] text-[#0F291E] shrink-0 self-center">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>

        {/* 3-Minute Presentation Pitch Card */}
        <div className="p-4 rounded-xl bg-[#FAFBF9] border border-[#E2E8F0] text-xs text-[#334155] space-y-1.5">
          <strong className="text-[#0F291E] block font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#059669]" />
            Recommended 3-Minute Presentation Flow:
          </strong>
          <ol className="list-decimal list-inside space-y-1 text-[#475569]">
            <li><strong>Show 40-Cell Tray:</strong> Click cell C17 $\to$ show image timeline & emergence hour.</li>
            <li><strong>Open Exposure ↔ Response:</strong> Show how the microclimate graph aligns with canopy growth.</li>
            <li><strong>Compare Treatments:</strong> Show T1 vs T2 vs T4 with sample sizes and standard deviation.</li>
            <li><strong>Show Evidence:</strong> Point to SeedGerm (2020) and SeedGerm-VIG BioImage Archive references.</li>
            <li><strong>Click "Generate Report":</strong> Produce the automated research paper for the jury!</li>
          </ol>
        </div>

      </div>
    </div>
  );
}
