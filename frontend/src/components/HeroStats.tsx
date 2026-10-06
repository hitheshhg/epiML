"use client";

import React from "react";
import { translations, Language } from "@/lib/translations";
import {
  Sprout,
  Droplets,
  Gauge,
  Activity,
  ShieldCheck,
  Sun,
  Layers,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

interface HeroStatsProps {
  lang: Language;
  mode: number;
  soil1: number;
  soil2: number;
  temp: number;
  hum: number;
  gas: number;
  alert: number;
  reason: string;
  germinationPct: number;
  sproutCount: number;
  totalSeeds: number;
}

export default function HeroStats({
  lang,
  mode,
  soil1,
  temp,
  hum,
  gas,
  alert,
  reason,
  germinationPct,
  sproutCount,
  totalSeeds,
}: HeroStatsProps) {
  const t = translations[lang];

  const modeLabels = [
    { name: t.mode0, tag: "Pre-Sowing & Storage", color: "from-[#2D6A4F] to-[#1E4D36]" },
    { name: t.mode1, tag: "Nursery & Micro-Irrigation", color: "from-[#40916C] to-[#2D6A4F]" },
    { name: t.mode2, tag: "Vegetative Field Zone", color: "from-[#52B788] to-[#40916C]" },
  ];

  return (
    <div className="relative mb-8">
      
      {/* Farm Landing Hero Banner */}
      <div className="rounded-3xl p-6 sm:p-10 bg-gradient-to-br from-[#163828] via-[#1E4D36] to-[#2D6A4F] text-white shadow-xl relative overflow-hidden">
        
        {/* Organic background decorative leaf ripples */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-[#52B788]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 rounded-full bg-[#E9D8A6]/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Main Title & Vision */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-[#D8F3DC]">
              <Sprout className="w-3.5 h-3.5 text-[#74C69D]" />
              <span>Full-Lifecycle Smart Agri-CPS · patent grade</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
              Cultivating Intelligence for Every Seed.
            </h1>

            <p className="text-sm sm:text-base text-[#D8F3DC]/90 max-w-xl leading-relaxed">
              Autonomous microclimate conditioning, closed-loop sub-surface irrigation, and real-time computer vision seed phenotyping engineered for climate-resilient farming.
            </p>

            {/* Quick Status Pill Badge */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs">
                <Layers className="w-4 h-4 text-[#74C69D]" />
                <span className="text-white/70">Active Phase:</span>
                <span className="font-bold text-white">{modeLabels[mode]?.name}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs">
                {alert > 0 ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-[#F4A261] animate-pulse" />
                    <span className="font-bold text-[#F4A261]">Notice: {reason}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#74C69D]" />
                    <span className="font-bold text-white">Rule: {reason}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* KPI High-Energy Grid */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
            
            {/* KPI 1: Germination Rate */}
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#B7E4C7]">
                <span className="text-xs font-medium">{t.germinationRate}</span>
                <Sprout className="w-4 h-4" />
              </div>
              <div className="my-2">
                <span className="text-3xl font-black tracking-tight">{germinationPct}%</span>
              </div>
              <p className="text-[11px] text-white/70">
                {sproutCount} of {totalSeeds} Seeds Emerged
              </p>
            </div>

            {/* KPI 2: Soil Moisture */}
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#B7E4C7]">
                <span className="text-xs font-medium">{t.soilMoisture1}</span>
                <Droplets className="w-4 h-4" />
              </div>
              <div className="my-2">
                <span className="text-3xl font-black tracking-tight">{soil1}%</span>
              </div>
              <p className="text-[11px] text-white/70">
                {soil1 >= 50 && soil1 <= 75 ? "Optimal Saturation" : soil1 < 35 ? "Irrigation Needed" : "Moist"}
              </p>
            </div>

            {/* KPI 3: Microclimate Temp & Humidity */}
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#B7E4C7]">
                <span className="text-xs font-medium">Climate (DHT)</span>
                <Sun className="w-4 h-4" />
              </div>
              <div className="my-2">
                <span className="text-2xl font-black tracking-tight">{temp}°C</span>
                <span className="text-xs text-white/70 ml-1.5 font-normal">/ {hum}% RH</span>
              </div>
              <p className="text-[11px] text-white/70">
                {temp > 32 ? "Vent Open (>32°C)" : "Climate Normal"}
              </p>
            </div>

            {/* KPI 4: Gas Purity & Rot Guard */}
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#B7E4C7]">
                <span className="text-xs font-medium">Air Purity</span>
                <Gauge className="w-4 h-4" />
              </div>
              <div className="my-2">
                <span className="text-2xl font-black tracking-tight">{gas}</span>
                <span className="text-xs text-white/70 ml-1.5 font-normal">ADC</span>
              </div>
              <p className="text-[11px] text-white/70">
                {gas < 60 ? "Clean Atmosphere" : "Decay Gas Surge"}
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
