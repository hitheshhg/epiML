"use client";

import React, { useState } from "react";
import {
  PlantProfile,
  CropType,
  GrowthStage,
  CROPS_CATALOG,
  SensorState,
  ActuatorHistory,
  DecisionResult,
} from "@/lib/plantProfiles";
import { Language } from "@/lib/translations";
import {
  Sprout,
  ShieldAlert,
  ShieldCheck,
  Droplets,
  Sun,
  Thermometer,
  Cloud,
  CloudOff,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Zap,
  Info,
  Clock,
  Compass,
} from "lucide-react";

interface CropAdaptiveControlProps {
  lang: Language;
  activeProfile: PlantProfile;
  onSelectCrop: (crop: CropType) => void;
  onSelectStage: (stage: GrowthStage) => void;
  decision: DecisionResult;
  cloudStatus: "connected" | "cached" | "offline";
  lastSyncTime: string;
  onToggleCloudSim: () => void;
  // Demo Mode props
  isDemoMode: boolean;
  onToggleDemoMode: (val: boolean) => void;
  demoSensors: SensorState;
  onUpdateDemoSensors: (partial: Partial<SensorState>) => void;
  demoRecentIrrigation: boolean;
  onToggleDemoRecentIrrigation: (val: boolean) => void;
  decisionHistory: DecisionResult[];
  onApplyPresetScenario: (scenarioNum: number) => void;
}

export default function CropAdaptiveControl({
  lang,
  activeProfile,
  onSelectCrop,
  onSelectStage,
  decision,
  cloudStatus,
  lastSyncTime,
  onToggleCloudSim,
  isDemoMode,
  onToggleDemoMode,
  demoSensors,
  onUpdateDemoSensors,
  demoRecentIrrigation,
  onToggleDemoRecentIrrigation,
  decisionHistory,
  onApplyPresetScenario,
}: CropAdaptiveControlProps) {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <section className="mb-10 rounded-2xl bg-white border border-[#D5E3D0] shadow-sm overflow-hidden">
      
      {/* 1. Header Banner & Product Concept */}
      <div className="bg-gradient-to-r from-[#163828] via-[#1B4332] to-[#2D6A4F] text-white p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#52B788]/20 text-[#D8F3DC] border border-[#52B788]/30 flex items-center gap-1.5">
                <Sprout className="w-3.5 h-3.5 text-[#74C69D]" />
                Crop-Adaptive Nursery Control System
              </span>
              
              {/* Cloud Status Indicator */}
              <button
                onClick={onToggleCloudSim}
                title="Click to test Cloud Offline caching behavior"
                className={`px-3 py-1 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5 transition-all ${
                  cloudStatus === "connected"
                    ? "bg-[#2D6A4F]/80 text-[#D8F3DC] border border-[#52B788]/40 hover:bg-[#2D6A4F]"
                    : "bg-[#E76F51]/30 text-[#FFAAA6] border border-[#E76F51]/50 hover:bg-[#E76F51]/40"
                }`}
              >
                {cloudStatus === "connected" ? (
                  <>
                    <Cloud className="w-3.5 h-3.5 text-[#52B788]" />
                    <span className="inline-block w-2 h-2 rounded-full bg-[#52B788] animate-pulse" />
                    CLOUD CONNECTED
                  </>
                ) : (
                  <>
                    <CloudOff className="w-3.5 h-3.5 text-[#FFAAA6]" />
                    <span className="inline-block w-2 h-2 rounded-full bg-[#E76F51]" />
                    CLOUD OFFLINE — USING CACHED PROFILE
                  </>
                )}
              </button>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Adaptive Biological Control Engine
            </h2>
            <p className="text-sm text-[#D8F3DC]/80 mt-1 max-w-2xl">
              <strong className="text-white">One Hardware Platform + Multiple Plant Profiles.</strong> Hardware automatically adapts its irrigation thresholds, louver angles, and refusal rules to the selected crop's biological profile.
            </p>
          </div>

          {/* Mode Switch (Live Hardware vs Interactive Demo) */}
          <div className="bg-black/30 backdrop-blur-md p-1.5 rounded-xl border border-white/10 flex items-center self-start lg:self-center">
            <button
              onClick={() => onToggleDemoMode(false)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                !isDemoMode
                  ? "bg-[#52B788] text-[#163828] shadow-md"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Live Hardware
            </button>
            <button
              onClick={() => onToggleDemoMode(true)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                isDemoMode
                  ? "bg-[#E76F51] text-white shadow-md shadow-[#E76F51]/20"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Interactive Demo Mode
            </button>
          </div>
        </div>

        {/* Demo Mode Banner if active */}
        {isDemoMode && (
          <div className="mt-4 px-4 py-2.5 rounded-xl bg-[#E76F51]/20 border border-[#E76F51]/40 flex items-center justify-between text-xs text-[#FFE8E6]">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#E76F51] font-mono font-bold text-white text-[10px]">
                DEMO MODE
              </span>
              <span>Context sliders active below. Real hardware telemetry is safely decoupled for demonstration.</span>
            </div>
            <button
              onClick={() => onToggleDemoMode(false)}
              className="text-xs underline hover:text-white font-medium"
            >
              Exit Demo
            </button>
          </div>
        )}
      </div>

      {/* 2. Crop & Growth Stage Selection Deck */}
      <div className="p-6 sm:p-8 border-b border-[#E2E8DC] bg-[#FAFBF9]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Selectors Column (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#163828] uppercase tracking-wider mb-2">
                1. Select Crop Species
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CROPS_CATALOG.map((c) => {
                  const isSelected = activeProfile.crop === c.type;
                  return (
                    <button
                      key={c.type}
                      onClick={() => onSelectCrop(c.type)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "bg-[#2D6A4F] text-white border-[#2D6A4F] shadow-sm ring-2 ring-[#2D6A4F]/20"
                          : "bg-white text-[#2D4A3E] border-[#E2E8DC] hover:border-[#95D5B2] hover:bg-[#F2F7F0]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold block">{c.name}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#74C69D]" />}
                      </div>
                      <span className={`text-[10px] italic line-clamp-1 ${isSelected ? "text-white/80" : "text-[#748E84]"}`}>
                        {c.scientific}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#163828] uppercase tracking-wider mb-2">
                2. Select Growth Stage
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onSelectStage("germination")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    activeProfile.stage === "germination"
                      ? "bg-[#2D6A4F] text-white border-[#2D6A4F] shadow-sm ring-2 ring-[#2D6A4F]/20"
                      : "bg-white text-[#2D4A3E] border-[#E2E8DC] hover:border-[#95D5B2] hover:bg-[#F2F7F0]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-bold">Germination</span>
                    {activeProfile.stage === "germination" && <CheckCircle2 className="w-3.5 h-3.5 text-[#74C69D]" />}
                  </div>
                  <span className={`text-[10px] ${activeProfile.stage === "germination" ? "text-white/80" : "text-[#748E84]"}`}>
                    Radicle Emergence (High Moisture)
                  </span>
                </button>

                <button
                  onClick={() => onSelectStage("nursery")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    activeProfile.stage === "nursery"
                      ? "bg-[#2D6A4F] text-white border-[#2D6A4F] shadow-sm ring-2 ring-[#2D6A4F]/20"
                      : "bg-white text-[#2D4A3E] border-[#E2E8DC] hover:border-[#95D5B2] hover:bg-[#F2F7F0]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-bold">Nursery Plug</span>
                    {activeProfile.stage === "nursery" && <CheckCircle2 className="w-3.5 h-3.5 text-[#74C69D]" />}
                  </div>
                  <span className={`text-[10px] ${activeProfile.stage === "nursery" ? "text-white/80" : "text-[#748E84]"}`}>
                    Cotyledon / 2-Leaf (Moderate)
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Active Profile Telemetry Ceiling Deck (7 cols) */}
          <div className="md:col-span-7 bg-white p-5 rounded-2xl border border-[#D5E3D0] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E8EFE5]">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-lg bg-[#EBF2E8] text-[#2D6A4F]">
                    <Sprout className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-extrabold text-[#163828]">
                      {activeProfile.commonName} — {activeProfile.stageName}
                    </h3>
                    <p className="text-xs text-[#52796F] italic">{activeProfile.scientificName}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-[#E8EFE5] text-[#2D6A4F]">
                  Profile v{activeProfile.version}
                </span>
              </div>

              {/* Biological Thresholds Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DC]">
                  <span className="text-[10px] uppercase font-bold text-[#52796F] block flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-[#2D6A4F]" />
                    Moisture
                  </span>
                  <p className="text-lg font-black text-[#163828] mt-0.5">
                    {activeProfile.environment.moisture.min}–{activeProfile.environment.moisture.max}%
                  </p>
                  <span className="text-[10px] text-[#52796F]">Target: {activeProfile.environment.moisture.target}%</span>
                </div>

                <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DC]">
                  <span className="text-[10px] uppercase font-bold text-[#52796F] block flex items-center gap-1">
                    <Thermometer className="w-3 h-3 text-[#E76F51]" />
                    Temperature
                  </span>
                  <p className="text-lg font-black text-[#163828] mt-0.5">
                    {activeProfile.environment.temperature.min}–{activeProfile.environment.temperature.max}°C
                  </p>
                  <span className="text-[10px] text-[#52796F]">Opt: {activeProfile.environment.temperature.optimal}°C</span>
                </div>

                <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DC]">
                  <span className="text-[10px] uppercase font-bold text-[#52796F] block flex items-center gap-1">
                    <Cloud className="w-3 h-3 text-[#52796F]" />
                    Humidity
                  </span>
                  <p className="text-lg font-black text-[#163828] mt-0.5">
                    {activeProfile.environment.humidity.min}–{activeProfile.environment.humidity.max}%
                  </p>
                  <span className="text-[10px] text-[#52796F]">Opt: {activeProfile.environment.humidity.optimal}%</span>
                </div>

                <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DC]">
                  <span className="text-[10px] uppercase font-bold text-[#52796F] block flex items-center gap-1">
                    <Sun className="w-3 h-3 text-[#F4A261]" />
                    Target Shade
                  </span>
                  <p className="text-lg font-black text-[#163828] mt-0.5">
                    {activeProfile.environment.shade.target}%
                  </p>
                  <span className="text-[10px] text-[#52796F]">Servo: {Math.round((activeProfile.environment.shade.target / 100) * 90)}°</span>
                </div>
              </div>

              <p className="text-xs text-[#52796F] leading-relaxed">
                {activeProfile.agronomicNotes}
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-[#E8EFE5] flex items-center justify-between text-[11px] text-[#84A98C]">
              <span className="font-mono">{activeProfile.calibrationNote}</span>
              <span>Last Sync: {new Date(lastSyncTime).toLocaleTimeString()}</span>
            </div>
          </div>

        </div>
      </div>

      {/* 3. The Core Innovation: CURRENT DECISION & EXPLAINABILITY ENGINE */}
      <div className="p-6 sm:p-8 bg-[#F4F7F2] border-b border-[#E2E8DC]">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          
          {/* Main Decision Highlight Card */}
          <div className="flex-1 bg-white p-6 rounded-2xl border-2 border-[#D5E3D0] shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#52796F] flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#2D6A4F]" />
                Live Decision Engine (X-CPS Output)
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide flex items-center gap-1.5 ${
                  decision.irrigation === "ACTIVATE"
                    ? "bg-[#2D6A4F] text-white shadow-sm"
                    : decision.irrigation === "REFUSE"
                    ? "bg-[#E76F51] text-white shadow-sm"
                    : "bg-[#52B788]/20 text-[#163828] border border-[#52B788]/30"
                }`}
              >
                {decision.irrigation === "ACTIVATE" && <Zap className="w-3.5 h-3.5 animate-bounce" />}
                {decision.irrigation === "REFUSE" && <ShieldAlert className="w-3.5 h-3.5" />}
                {decision.irrigation === "OPTIMAL_STANDBY" && <ShieldCheck className="w-3.5 h-3.5" />}
                {decision.summaryBadge}
              </span>
            </div>

            {/* Big Causal Explanation Paragraph */}
            <div className="p-4 rounded-xl bg-[#FAFBF9] border border-[#E2E8DC] my-3">
              <p className="text-sm font-semibold text-[#163828] leading-relaxed">
                "{decision.explanation}"
              </p>
            </div>

            {/* Actuator Direct Action Telemetry */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-2.5 rounded-lg bg-[#F4F7F2] border border-[#E2E8DC]">
                <span className="text-[10px] uppercase font-bold text-[#52796F] block">Pump Actuation</span>
                <span className={`text-sm font-extrabold block mt-0.5 ${decision.targetPumpState ? "text-[#2D6A4F]" : "text-[#748E84]"}`}>
                  {decision.targetPumpState ? "PUMP: ON (IRRIGATING)" : "PUMP: OFF (LOCKED)"}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#F4F7F2] border border-[#E2E8DC]">
                <span className="text-[10px] uppercase font-bold text-[#52796F] block">Canopy Shade</span>
                <span className="text-sm font-extrabold text-[#163828] block mt-0.5">
                  Target: {decision.targetShadePercent}% (Servo: {decision.targetServoAngle}°)
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#F4F7F2] border border-[#E2E8DC] col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-bold text-[#52796F] block">Reason Code</span>
                <span className="text-xs font-mono font-bold text-[#2D6A4F] block mt-0.5 truncate">
                  {decision.reasonCode}
                </span>
              </div>
            </div>
          </div>

          {/* Context Diagnostics Checklist */}
          <div className="w-full md:w-80 bg-white p-5 rounded-2xl border border-[#D5E3D0] shadow-sm shrink-0">
            <h4 className="text-xs font-extrabold uppercase text-[#163828] tracking-wider mb-3 flex items-center justify-between">
              <span>Contextual Health Checks</span>
              <Info className="w-3.5 h-3.5 text-[#52796F]" />
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAFBF9] border border-[#E8EFE5]">
                <span className="text-[#52796F]">Root Moisture Status:</span>
                <span className={`font-bold ${decision.context.moistureStatus === "OPTIMAL" ? "text-[#2D6A4F]" : "text-[#E76F51]"}`}>
                  {decision.context.moistureStatus}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAFBF9] border border-[#E8EFE5]">
                <span className="text-[#52796F]">Ambient Humidity:</span>
                <span className={`font-bold ${decision.context.humidityStatus === "OPTIMAL" ? "text-[#2D6A4F]" : "text-[#F4A261]"}`}>
                  {decision.context.humidityStatus}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAFBF9] border border-[#E8EFE5]">
                <span className="text-[#52796F]">Thermal Condition:</span>
                <span className={`font-bold ${decision.context.tempStatus === "OPTIMAL" ? "text-[#2D6A4F]" : "text-[#E76F51]"}`}>
                  {decision.context.tempStatus}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAFBF9] border border-[#E8EFE5]">
                <span className="text-[#52796F]">Recent Irrigation:</span>
                <span className={`font-bold ${decision.context.recentIrrigationDetected ? "text-[#E76F51]" : "text-[#2D6A4F]"}`}>
                  {decision.context.recentIrrigationDetected ? "YES (MONITORED)" : "NO"}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAFBF9] border border-[#E8EFE5]">
                <span className="text-[#52796F]">Anti-Cycling Cooldown:</span>
                <span className={`font-bold ${decision.context.cooldownActive ? "text-[#F4A261]" : "text-[#2D6A4F]"}`}>
                  {decision.context.cooldownActive ? "ACTIVE" : "STANDBY"}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Interactive Demo Mode Panel (Jury Demonstration Scenarios) */}
      {isDemoMode && (
        <div className="p-6 sm:p-8 bg-[#FFF9F6] border-b border-[#F8D7C8]">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E76F51] text-white uppercase">
                Interactive Jury Sandbox
              </span>
              <h3 className="text-base font-extrabold text-[#6A2518] mt-1">
                Simulate Environmental Context & Test Decisions
              </h3>
            </div>
            
            {/* 1-Click Jury Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => onApplyPresetScenario(1)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#F4A261] text-[#933D22] hover:bg-[#FFEADA]"
              >
                1. Optimal (72%)
              </button>
              <button
                onClick={() => onApplyPresetScenario(2)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#2D6A4F] text-[#2D6A4F] hover:bg-[#EBF2E8]"
              >
                2. Dry (Pump ON)
              </button>
              <button
                onClick={() => onApplyPresetScenario(3)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#E76F51] text-white hover:bg-[#D45D40] shadow-sm"
              >
                3. Refusal (Innovation)
              </button>
              <button
                onClick={() => onApplyPresetScenario(4)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#457B9D] text-[#1D3557] hover:bg-[#E2F0FB]"
              >
                4. Cold Shock
              </button>
            </div>
          </div>

          {/* Context Control Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 bg-white p-5 rounded-2xl border border-[#F8D7C8] shadow-sm">
            
            {/* Soil Moisture Slider */}
            <div>
              <div className="flex justify-between text-xs font-bold text-[#6A2518] mb-1.5">
                <span>Soil Moisture</span>
                <span className="font-mono text-[#E76F51]">{demoSensors.moisture1}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="95"
                value={demoSensors.moisture1}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  onUpdateDemoSensors({ moisture1: val, moisture2: val });
                }}
                className="w-full accent-[#E76F51] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#A6695B] mt-1">
                <span>10% (Bone Dry)</span>
                <span>Target: {activeProfile.environment.moisture.target}%</span>
                <span>95% (Saturated)</span>
              </div>
            </div>

            {/* Chamber Humidity Slider */}
            <div>
              <div className="flex justify-between text-xs font-bold text-[#6A2518] mb-1.5">
                <span>Humidity</span>
                <span className="font-mono text-[#E76F51]">{demoSensors.humidity}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="98"
                value={demoSensors.humidity}
                onChange={(e) => onUpdateDemoSensors({ humidity: parseInt(e.target.value, 10) })}
                className="w-full accent-[#E76F51] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#A6695B] mt-1">
                <span>30% (Dry Air)</span>
                <span>98% (Condensing)</span>
              </div>
            </div>

            {/* Temperature Slider */}
            <div>
              <div className="flex justify-between text-xs font-bold text-[#6A2518] mb-1.5">
                <span>Temperature</span>
                <span className="font-mono text-[#E76F51]">{demoSensors.temperature}°C</span>
              </div>
              <input
                type="range"
                min="12"
                max="40"
                value={demoSensors.temperature}
                onChange={(e) => onUpdateDemoSensors({ temperature: parseInt(e.target.value, 10) })}
                className="w-full accent-[#E76F51] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#A6695B] mt-1">
                <span>12°C (Cold)</span>
                <span>40°C (Scorch)</span>
              </div>
            </div>

            {/* Recent Irrigation Toggle */}
            <div className="flex flex-col justify-between">
              <span className="text-xs font-bold text-[#6A2518] mb-1.5 block">Recent Irrigation Flag</span>
              <button
                onClick={() => onToggleDemoRecentIrrigation(!demoRecentIrrigation)}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  demoRecentIrrigation
                    ? "bg-[#E76F51] text-white border-[#E76F51] shadow-sm"
                    : "bg-[#F4F7F2] text-[#52796F] border-[#E2E8DC] hover:bg-[#E8EFE5]"
                }`}
              >
                {demoRecentIrrigation ? "YES (Recently Irrigated)" : "NO (Resting Dry)"}
              </button>
              <span className="text-[10px] text-[#A6695B] mt-1 block">
                Tests intelligent refusal when humidity is high.
              </span>
            </div>

          </div>
        </div>
      )}

      {/* 5. Decision Event Log (Explainability History) */}
      <div className="p-4 sm:p-6 bg-white flex items-center justify-between">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-xs font-bold text-[#2D6A4F] hover:text-[#163828] flex items-center gap-1.5 transition-colors"
        >
          <Clock className="w-4 h-4" />
          {showHistory ? "Hide Decision History Log" : `View Explainability Event Log (${decisionHistory.length} events)`}
        </button>

        <span className="text-[11px] text-[#748E84]">
          Zero-latency Decision Cycle: Evaluated every 1.2s
        </span>
      </div>

      {showHistory && (
        <div className="border-t border-[#E2E8DC] bg-[#FAFBF9] p-4 sm:p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8DC] text-[10px] uppercase font-bold text-[#52796F]">
                  <th className="pb-2">Time</th>
                  <th className="pb-2">Crop / Stage</th>
                  <th className="pb-2">Moisture</th>
                  <th className="pb-2">Decision</th>
                  <th className="pb-2">Pump / Shade</th>
                  <th className="pb-2">Explanation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EFE5]">
                {decisionHistory.slice(0, 8).map((evt, idx) => (
                  <tr key={idx} className="hover:bg-[#F2F7F0]/60">
                    <td className="py-2.5 font-mono text-[11px] text-[#52796F]">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 font-bold text-[#163828]">
                      {evt.cropName} ({evt.stage})
                    </td>
                    <td className="py-2.5 font-mono">
                      {evt.context.moistureStatus}
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          evt.irrigation === "ACTIVATE"
                            ? "bg-[#2D6A4F] text-white"
                            : evt.irrigation === "REFUSE"
                            ? "bg-[#E76F51] text-white"
                            : "bg-[#E8EFE5] text-[#2D6A4F]"
                        }`}
                      >
                        {evt.irrigation}
                      </span>
                    </td>
                    <td className="py-2.5 text-[11px] font-mono">
                      P:{evt.targetPumpState ? "ON" : "OFF"} | S:{evt.targetShadePercent}%
                    </td>
                    <td className="py-2.5 text-[#52796F] max-w-xs truncate">
                      {evt.explanation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </section>
  );
}
