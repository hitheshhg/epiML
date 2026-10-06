"use client";

import React from "react";
import { translations, Language } from "@/lib/translations";
import {
  Brain,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Tv,
  ArrowRight,
  HelpCircle
} from "lucide-react";

interface ExplainableAiProps {
  lang: Language;
  mode: number;
  reason: string;
  soil1: number;
  temp: number;
  hum: number;
  gas: number;
  pump: number;
  fan: number;
  alert: number;
}

export default function ExplainableAi({
  lang,
  mode,
  reason,
  soil1,
  temp,
  hum,
  gas,
  pump,
  alert,
}: ExplainableAiProps) {
  const t = translations[lang];

  // Map reason to farmer-friendly explanations
  const getExplanation = (r: string) => {
    if (r.includes("M1<35")) {
      return {
        rule: "Rule IRRIG-01: Nursery Moisture Deficit",
        measurement: `Moisture M1 = ${soil1}% (< 35% Threshold)`,
        rationale: "Germination seeds risk osmotic desiccation. Closed-loop relay opened to inject micro-irrigation pulse.",
        status: "Pump Activated",
        type: "action",
      };
    }
    if (r.includes("OUTSIDE DAMP") || r.includes("VENT BLOCKED")) {
      return {
        rule: "Rule PSYCHRO-02: Negative Feedback Humidity Guard",
        measurement: "Ambient Air Humidity > Tray Humidity + 6%",
        rationale: "Refused to open vent flap despite heat because outdoor atmospheric moisture would introduce fungal mold into the seedling chamber.",
        status: "Refusal to Act (Smart Constraint)",
        type: "refusal",
      };
    }
    if (r.includes("GAS")) {
      return {
        rule: "Rule SILO-03: Anaerobic Fermentation Alert",
        measurement: `MQ135 Gas Index = ${gas} ADC (> 1.5x Baseline)`,
        rationale: "Decomposition gases detected from grain mold. Activated buzzer warning and status LED.",
        status: "Alarm Broadcast",
        type: "alert",
      };
    }
    if (r.includes("CDWN") || r.includes("REFUSE")) {
      return {
        rule: "Rule SAFETY-04: Sub-Surface Thermal Anti-Choke",
        measurement: "Cooldown interval active (< 30s elapsed)",
        rationale: "Preventing soil waterlogging and motor coil overheating. Wait cycle active.",
        status: "Refusal to Act (Cooling Guard)",
        type: "refusal",
      };
    }
    return {
      rule: "Rule AUTO-00: Optimal Equilibrium Equilibrium",
      measurement: `M1=${soil1}%, T=${temp}°C, H=${hum}%, Gas=${gas}`,
      rationale: "All environmental parameters are within safe agronomic agronomic tolerance. Passive autonomous state maintained.",
      status: "Steady State",
      type: "steady",
    };
  };

  const exp = getExplanation(reason);

  return (
    <div className="agri-card rounded-3xl p-6 sm:p-8 mb-8 border border-[#E2E8DC]">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8DC]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#2D6A4F] flex items-center gap-1.5 mb-1">
            <Brain className="w-4 h-4 text-[#52B788]" />
            Explainable Cyber-Physical Systems (X-CPS)
          </span>
          <h3 className="text-xl font-bold text-[#163828]">
            {t.explainableTitle}
          </h3>
          <p className="text-xs text-[#52796F] mt-0.5">
            Transparent causal reasoning engine: Measurement $\to$ Rationale $\to$ Action or Refusal
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#E8F7EC] text-[#1E4D36] border border-[#A7E2BA] self-start sm:self-auto">
          Patent-Grade Decision Engine
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6 items-center">
        
        {/* Left: 16x2 LCD Live Hardware Mirror */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#1E3A2B] text-[#74C69D] font-mono shadow-xl border-4 border-[#0F291E]">
          <div className="flex items-center justify-between text-[10px] text-white/60 mb-2 border-b border-white/10 pb-1">
            <span className="flex items-center gap-1">
              <Tv className="w-3.5 h-3.5 text-[#52B788]" />
              ARDUINO 16x2 LCD HARDWARE MIRROR
            </span>
            <span>HD44780 4-BIT</span>
          </div>

          <div className="p-3 bg-[#0A1A12] rounded-xl border border-[#2D6A4F]/60 text-sm leading-relaxed space-y-1 shadow-inner select-none tracking-widest">
            <div className="text-[#A7E2BA] font-bold">
              {mode === 0
                ? `STG ${temp.toFixed(0)}C ${hum.toFixed(0)}% G:${gas}`
                : mode === 1
                ? `GERM ${temp.toFixed(0)}C M1:${soil1}%`
                : `FLD M1:${soil1}% M2:${soil1}%`}
            </div>
            <div className="text-[#D8F3DC]">
              {reason ? reason.padEnd(16, " ").slice(0, 16) : "SYS: OK         "}
            </div>
          </div>

          <p className="text-[10px] text-[#A7E2BA]/70 mt-2 text-center">
            Row 1: Telemetry · Row 2: Explainable Action / Refusal
          </p>
        </div>

        {/* Right: Causal Logic Deconstruction */}
        <div className="lg:col-span-7 space-y-3.5">
          
          <div className="p-4 rounded-2xl bg-[#F7F9F5] border border-[#E2E8DC] space-y-1.5">
            <span className="text-[11px] font-bold text-[#52796F] uppercase">Active Scientific Rule</span>
            <h4 className="text-sm font-bold text-[#163828]">{exp.rule}</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#F7F9F5] border border-[#E2E8DC]">
              <span className="text-[#52796F] block font-medium">Sensor Input Trigger</span>
              <strong className="text-[#163828] text-sm mt-0.5 block">{exp.measurement}</strong>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F7F9F5] border border-[#E2E8DC]">
              <span className="text-[#52796F] block font-medium">Action or Refusal Status</span>
              <strong className={`text-sm mt-0.5 block ${exp.type === "refusal" ? "text-[#E76F51]" : "text-[#2D6A4F]"}`}>
                {exp.status}
              </strong>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#E8F7EC] border border-[#A7E2BA] text-xs leading-relaxed text-[#1E4D36]">
            <strong>Causal Rationale:</strong> {exp.rationale}
          </div>

        </div>

      </div>

    </div>
  );
}
