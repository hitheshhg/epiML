"use client";

import React from "react";
import { translations, Language } from "@/lib/translations";
import {
  Droplets,
  Thermometer,
  CloudRain,
  Gauge,
  ShieldCheck,
  AlertTriangle,
  Wind,
  Layers,
  Flame,
  CheckCircle2,
  Clock
} from "lucide-react";

interface SensorGridProps {
  lang: Language;
  soil1: number;
  soil2: number;
  temp1: number;
  hum1: number;
  temp2: number;
  hum2: number;
  gas: number;
  alert: number;
  mode: number;
}

export default function SensorGrid({
  lang,
  soil1,
  soil2,
  temp1,
  hum1,
  temp2,
  hum2,
  gas,
  alert,
  mode,
}: SensorGridProps) {
  const t = translations[lang];

  // Magnus-Tetens approximation for Dew Point calculation
  const computeDewPoint = (t: number, h: number) => {
    if (h <= 0) return 0;
    const a = 17.27;
    const b = 237.7;
    const alpha = (a * t) / (b + t) + Math.log(h / 100);
    return +((b * alpha) / (a - alpha)).toFixed(1);
  };

  const dewPoint1 = computeDewPoint(temp1 || 27.4, hum1 || 64.2);
  const condensationRisk = (temp1 - dewPoint1) < 2.0 && hum1 > 65;

  return (
    <div className="mb-8">
      
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-[#163828] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#2D6A4F]" />
            Live Hardware Sensory Network
          </h3>
          <p className="text-xs text-[#52796F]">
            10-bit analog conversion & calibrated digital environmental telemetry
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E8F7EC] text-[#1E4D36] border border-[#A7E2BA]">
          7 Channels Active
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Sensor 1: Soil Moisture Probe 1 (Tray A0) */}
        <div className="agri-card rounded-3xl p-5 border border-[#E2E8DC] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#2D6A4F] uppercase tracking-wider">
                Analog Pin A0
              </span>
              <h4 className="text-sm font-bold text-[#163828] mt-0.5">{t.soilMoisture1}</h4>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#E8F7EC] flex items-center justify-center text-[#2D6A4F]">
              <Droplets className="w-5 h-5" />
            </div>
          </div>

          <div className="my-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#163828]">{soil1}%</span>
              <span className="text-xs font-semibold text-[#40916C]">
                {soil1 >= 50 && soil1 <= 75 ? "Optimal" : soil1 < 35 ? "Dry (Needs Water)" : "Saturated"}
              </span>
            </div>

            {/* Gauge Bar with target markers */}
            <div className="relative mt-2">
              <div className="w-full bg-[#E8EFE3] h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    soil1 < 35 ? "bg-[#E76F51]" : soil1 > 80 ? "bg-[#2D6A4F]" : "bg-[#52B788]"
                  }`}
                  style={{ width: `${Math.min(soil1, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#52796F] mt-1 font-mono">
                <span>0% (Air)</span>
                <span className="font-bold text-[#2D6A4F]">Target: 35–60%</span>
                <span>100% (Wet)</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-[#52796F] pt-3 border-t border-[#E8EFE3] flex items-center justify-between">
            <span>Submersible Pump Trigger:</span>
            <span className="font-semibold text-[#163828]">Auto at &lt; 35%</span>
          </div>
        </div>

        {/* Sensor 2: Soil Moisture Probe 2 (Field A1) */}
        <div className="agri-card rounded-3xl p-5 border border-[#E2E8DC] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#40916C] uppercase tracking-wider">
                Analog Pin A1
              </span>
              <h4 className="text-sm font-bold text-[#163828] mt-0.5">{t.soilMoisture2}</h4>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#F0F6EE] flex items-center justify-center text-[#40916C]">
              <Droplets className="w-5 h-5" />
            </div>
          </div>

          <div className="my-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#163828]">{soil2}%</span>
              <span className="text-xs font-semibold text-[#52796F]">
                Zone Skew: {Math.abs(soil1 - soil2)}%
              </span>
            </div>

            <div className="relative mt-2">
              <div className="w-full bg-[#E8EFE3] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#74C69D] to-[#40916C] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(soil2, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#52796F] mt-1 font-mono">
                <span>0%</span>
                <span>Field Baseline</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-[#52796F] pt-3 border-t border-[#E8EFE3] flex items-center justify-between">
            <span>Spatial Cross-Check:</span>
            <span className="font-semibold text-[#163828]">
              {Math.abs(soil1 - soil2) > 50 ? "Zone Discrepancy" : "Balanced"}
            </span>
          </div>
        </div>

        {/* Sensor 3: MQ-135 Gas Air Purity (Pin A2) */}
        <div className="agri-card rounded-3xl p-5 border border-[#E2E8DC] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#E76F51] uppercase tracking-wider">
                Analog Pin A2 (MQ-135)
              </span>
              <h4 className="text-sm font-bold text-[#163828] mt-0.5">{t.gasPurity}</h4>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#FFF2ED] flex items-center justify-center text-[#E76F51]">
              <Gauge className="w-5 h-5" />
            </div>
          </div>

          <div className="my-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#163828]">{gas}</span>
              <span className="text-xs text-[#52796F]">ADC RAW</span>
              <span className={`text-xs font-bold ml-auto ${gas < 60 ? "text-[#2D6A4F]" : "text-[#E76F51]"}`}>
                {gas < 60 ? "Air Clean" : "Grain Ferment Surge"}
              </span>
            </div>

            <div className="w-full bg-[#E8EFE3] h-2.5 rounded-full overflow-hidden mt-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  gas < 60 ? "bg-[#52B788]" : gas < 90 ? "bg-[#F4A261]" : "bg-[#E76F51]"
                }`}
                style={{ width: `${Math.min((gas / 150) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="text-[11px] text-[#52796F] pt-3 border-t border-[#E8EFE3] flex items-center justify-between">
            <span>Spoilage Surge Alarm:</span>
            <span className="font-semibold text-[#163828]">Threshold &gt; 90 ADC</span>
          </div>
        </div>

        {/* Sensor 4: Storage DHT1 Microclimate (Pin D2) */}
        <div className="agri-card rounded-3xl p-5 border border-[#E2E8DC] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#2D6A4F] uppercase tracking-wider">
                Digital Pin D2 (DHT1)
              </span>
              <h4 className="text-sm font-bold text-[#163828] mt-0.5">{t.storageClimate}</h4>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#E8F7EC] flex items-center justify-center text-[#2D6A4F]">
              <Thermometer className="w-5 h-5" />
            </div>
          </div>

          <div className="my-4 grid grid-cols-2 gap-2 text-center">
            <div className="p-3 rounded-2xl bg-[#F7F9F5] border border-[#E8EFE3]">
              <span className="text-[10px] text-[#52796F] block">Temperature</span>
              <span className="text-2xl font-black text-[#163828]">{temp1}°C</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#F7F9F5] border border-[#E8EFE3]">
              <span className="text-[10px] text-[#52796F] block">Humidity</span>
              <span className="text-2xl font-black text-[#163828]">{hum1}%</span>
            </div>
          </div>

          <div className="text-[11px] text-[#52796F] pt-3 border-t border-[#E8EFE3] flex items-center justify-between">
            <span>Ventilation Limit:</span>
            <span className="font-semibold text-[#163828]">Fan ON at &gt; 60% RH</span>
          </div>
        </div>

        {/* Sensor 5: Dew Point Condensation (X-CPS Algorithm) */}
        <div className="agri-card rounded-3xl p-5 border border-[#E2E8DC] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#52796F] uppercase tracking-wider">
                Psychrometric Dew Point
              </span>
              <h4 className="text-sm font-bold text-[#163828] mt-0.5">{t.dewPoint}</h4>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#F0F6EE] flex items-center justify-center text-[#2D6A4F]">
              <CloudRain className="w-5 h-5" />
            </div>
          </div>

          <div className="my-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#163828]">{dewPoint1}°C</span>
              <span className="text-xs text-[#52796F]">Dew Temp (Td)</span>
            </div>
            <p className="text-xs mt-1 text-[#52796F]">
              Margin (T - Td): <strong className="text-[#163828]">{(temp1 - dewPoint1).toFixed(1)}°C</strong>
            </p>
          </div>

          <div className="text-[11px] text-[#52796F] pt-3 border-t border-[#E8EFE3] flex items-center justify-between">
            <span>Grain Sweating Risk:</span>
            <span className={`font-semibold ${condensationRisk ? "text-[#E76F51]" : "text-[#2D6A4F]"}`}>
              {condensationRisk ? "Sweating Warning" : "Dry / Safe"}
            </span>
          </div>
        </div>

        {/* Sensor 6: Irrigation Watchdog Timer */}
        <div className="agri-card rounded-3xl p-5 border border-[#E2E8DC] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#2D6A4F] uppercase tracking-wider">
                Safety Interlock
              </span>
              <h4 className="text-sm font-bold text-[#163828] mt-0.5">Irrigation Safety Loop</h4>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#E8F7EC] flex items-center justify-center text-[#2D6A4F]">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="my-4 space-y-2 text-xs">
            <div className="flex justify-between items-center p-2 rounded-xl bg-[#F7F9F5]">
              <span className="text-[#52796F]">Max Pump Run Cutoff</span>
              <span className="font-bold text-[#163828] font-mono">60s Hard Limit</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-xl bg-[#F7F9F5]">
              <span className="text-[#52796F]">Forced Cooldown</span>
              <span className="font-bold text-[#163828] font-mono">30s Refusal</span>
            </div>
          </div>

          <div className="text-[11px] text-[#52796F] pt-3 border-t border-[#E8EFE3] flex items-center justify-between">
            <span>Relay Logic:</span>
            <span className="font-semibold text-[#2D6A4F]">Active-LOW Inverted</span>
          </div>
        </div>

      </div>
    </div>
  );
}
