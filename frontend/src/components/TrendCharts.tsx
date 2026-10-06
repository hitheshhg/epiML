"use client";

import React, { useState, useEffect } from "react";
import { translations, Language } from "@/lib/translations";
import { TrendingUp, Activity, Droplets, Sun, Gauge } from "lucide-react";

interface TrendPoint {
  timestamp: string;
  temp1: number;
  hum1: number;
  soil1: number;
  gas: number;
}

interface TrendChartsProps {
  lang: Language;
}

export default function TrendCharts({ lang }: TrendChartsProps) {
  const [data, setData] = useState<TrendPoint[]>([]);
  const [activeMetric, setActiveMetric] = useState<"soil" | "temp" | "hum" | "gas">("soil");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/history");
        if (res.ok) {
          const json = await res.json();
          if (json.history && json.history.length > 0) {
            setData(json.history);
          }
        }
      } catch {
        // Keep initial
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 3000);
    return () => clearInterval(interval);
  }, []);

  // Compute SVG polyline points
  const points = data.map((d, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * 500;
    let val = 0;
    if (activeMetric === "soil") val = d.soil1;
    else if (activeMetric === "temp") val = (d.temp1 - 20) * 5; // Scale 20-40C to 0-100
    else if (activeMetric === "hum") val = d.hum1;
    else val = (d.gas / 100) * 100;

    const y = 140 - (Math.min(Math.max(val, 0), 100) / 100) * 120;
    return `${x},${y}`;
  }).join(" ");

  const latestVal = data.length > 0 ? data[data.length - 1] : null;

  return (
    <div className="agri-card rounded-3xl p-6 sm:p-8 mb-8 border border-[#E2E8DC]">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8DC]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#2D6A4F] flex items-center gap-1.5 mb-1">
            <Activity className="w-4 h-4 text-[#52B788]" />
            Continuous Time-Series Metrology
          </span>
          <h3 className="text-xl font-bold text-[#163828]">
            Real-Time Environmental Trendlines
          </h3>
          <p className="text-xs text-[#52796F] mt-0.5">
            Synchronized rolling data buffer recorded at 1 Hz from Arduino Uno
          </p>
        </div>

        {/* Metric Selector Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#F0F4EC] border border-[#E2E8DC]">
          <button
            onClick={() => setActiveMetric("soil")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeMetric === "soil"
                ? "bg-[#1E4D36] text-white shadow-sm"
                : "text-[#4F6D5E] hover:text-[#163828]"
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Soil (M1)</span>
          </button>
          <button
            onClick={() => setActiveMetric("temp")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeMetric === "temp"
                ? "bg-[#1E4D36] text-white shadow-sm"
                : "text-[#4F6D5E] hover:text-[#163828]"
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Temp (°C)</span>
          </button>
          <button
            onClick={() => setActiveMetric("hum")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeMetric === "hum"
                ? "bg-[#1E4D36] text-white shadow-sm"
                : "text-[#4F6D5E] hover:text-[#163828]"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Humidity (%)</span>
          </button>
          <button
            onClick={() => setActiveMetric("gas")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeMetric === "gas"
                ? "bg-[#1E4D36] text-white shadow-sm"
                : "text-[#4F6D5E] hover:text-[#163828]"
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>Gas (ADC)</span>
          </button>
        </div>
      </div>

      {/* SVG Trendline Graphic */}
      <div className="my-6 p-4 rounded-2xl bg-[#F7F9F5] border border-[#E2E8DC] relative">
        <div className="h-44 w-full">
          <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible" preserveAspectRatio="none">
            
            {/* Grid lines */}
            <line x1="0" y1="20" x2="500" y2="20" stroke="#E2E8DC" strokeDasharray="3,3" />
            <line x1="0" y1="80" x2="500" y2="80" stroke="#E2E8DC" strokeDasharray="3,3" />
            <line x1="0" y1="140" x2="500" y2="140" stroke="#E2E8DC" />

            {/* Area fill */}
            {points && (
              <polygon
                points={`0,140 ${points} 500,140`}
                fill="url(#trend-gradient)"
                opacity="0.25"
              />
            )}

            {/* Trend line */}
            {points && (
              <polyline
                fill="none"
                stroke="#2D6A4F"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />
            )}

            <defs>
              <linearGradient id="trend-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#52B788" />
                <stop offset="100%" stopColor="#52B788" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#52796F] mt-2 pt-2 border-t border-[#E2E8DC]">
          <span>Past 30 Data Samples (Live Window)</span>
          <span className="font-bold text-[#163828]">
            Current:{" "}
            {activeMetric === "soil"
              ? `${latestVal?.soil1 ?? 52}% Moisture`
              : activeMetric === "temp"
              ? `${latestVal?.temp1 ?? 27.4}°C`
              : activeMetric === "hum"
              ? `${latestVal?.hum1 ?? 64.2}% RH`
              : `${latestVal?.gas ?? 38} ADC`}
          </span>
        </div>
      </div>

    </div>
  );
}
