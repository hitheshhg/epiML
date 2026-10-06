"use client";

import React from "react";
import {
  Settings,
  Droplets,
  Thermometer,
  Cloud,
  Wind,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  FileCheck,
} from "lucide-react";

interface SensorCalibrationCenterProps {
  soil1: number;
  soil2: number;
  temp: number;
  hum: number;
  gas: number;
}

export default function SensorCalibrationCenter({
  soil1,
  soil2,
  temp,
  hum,
  gas,
}: SensorCalibrationCenterProps) {
  // Compute dew point
  const a = 17.27, b = 237.7;
  const alpha = ((a * temp) / (b + temp)) + Math.log(hum / 100);
  const dewPoint = +((b * alpha) / (a - alpha)).toFixed(1);
  const dewSpread = +(temp - dewPoint).toFixed(1);

  // Moisture skew
  const skew = Math.abs(soil1 - soil2);

  return (
    <section className="mb-8 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm overflow-hidden">
      
      {/* Header */}
      <div className="bg-[#FAFBF9] border-b border-[#E2E8F0] p-6 sm:p-7">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-lg bg-[#FEF3C7] text-[#D97706]">
            <Settings className="w-4 h-4" />
          </span>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#D97706]">
            Scientific Metrology & Calibration
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
          Sensor Calibration & Data Integrity Center
        </h2>
        <p className="text-xs text-[#64748B] mt-0.5">
          Standardizing raw ADC voltage curves to validated physical units. Distinguishing normalized indices from uncalibrated volumetric water content.
        </p>
      </div>

      <div className="p-6 sm:p-8 space-y-8 bg-white">
        
        {/* Section 1: Soil Moisture Metrology Correction */}
        <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                <Droplets className="w-4 h-4 text-[#059669]" />
                Capacitive Soil Probe 2-Point Reference (Pins A0 & A1)
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Designated: <strong>SUBSTRATE MOISTURE INDEX (SMI)</strong> — Not Uncalibrated Volumetric Water Content (VWC)
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-[#E8F5E9] text-[#2D6A4F] self-start sm:self-auto">
              Status: CALIBRATED (2-POINT)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0]">
              <span className="text-[#64748B] block font-medium">Dry Reference (Air Baseline):</span>
              <span className="text-base font-mono font-black text-[#0F172A] mt-1 block">800 ADC (0% Index)</span>
              <span className="text-[11px] text-[#94A3B8]">Dry cocopeat / air exposure</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0]">
              <span className="text-[#64748B] block font-medium">Wet Reference (Water Saturation):</span>
              <span className="text-base font-mono font-black text-[#0F172A] mt-1 block">300 ADC (100% Index)</span>
              <span className="text-[11px] text-[#94A3B8]">Deionized water immersion @ 25°C</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0]">
              <span className="text-[#64748B] block font-medium">Substrate Porosity Curve:</span>
              <span className="text-sm font-bold text-[#0F291E] mt-1 block">Washed Cocopeat 70% + Perlite</span>
              <span className="text-[11px] text-[#94A3B8]">Dual-point linear normalizer</span>
            </div>
          </div>

          {/* Spatial Moisture Skew Analysis */}
          <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] flex items-start gap-3 text-xs">
            <Info className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-[#0369A1] block">
                Spatial Moisture Skew: |Probe 1 ({soil1}%) - Probe 2 ({soil2}%)| = {skew}%
              </strong>
              <p className="text-[#475569] leading-relaxed">
                A spatial difference between probes indicates natural capillary variation across the 40-cell matrix or localized root uptake gradients, rather than automatic hardware failure. Protocol threshold is configurable.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Psychrometric Dew Point & Condensation Heuristic */}
        <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-[#EA580C]" />
                Psychrometric Condensation Risk Engine (Pins D2 & D3)
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Calculated via Magnus-Tetens Equation (α = (17.27·T)/(237.7+T) + ln(RH/100))
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-[#E8F5E9] text-[#2D6A4F] self-start sm:self-auto">
              Status: CONTINUOUS VALIDATION
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] text-center">
              <span className="text-[#64748B] block font-medium">Ambient Chamber Temp</span>
              <span className="text-xl font-mono font-black text-[#0F172A] mt-1 block">{temp}°C</span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] text-center">
              <span className="text-[#64748B] block font-medium">Relative Humidity</span>
              <span className="text-xl font-mono font-black text-[#0F172A] mt-1 block">{hum}%</span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] text-center">
              <span className="text-[#64748B] block font-medium">Computed Dew Point (Tdew)</span>
              <span className="text-xl font-mono font-black text-[#0284C7] mt-1 block">{dewPoint}°C</span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] text-center">
              <span className="text-[#64748B] block font-medium">Dew Point Spread (T - Tdew)</span>
              <span className={`text-xl font-mono font-black mt-1 block ${dewSpread < 2.0 ? "text-[#DC2626]" : "text-[#059669]"}`}>
                {dewSpread}°C
              </span>
            </div>
          </div>

          <p className="text-[11px] text-[#64748B] italic">
            *Identified as <strong>"Condensation Risk Heuristic"</strong> rather than direct condensation detection (unless a surface leaf-wetness grid sensor is attached).
          </p>
        </div>

        {/* Section 3: MQ135 Air Quality & VOC Proxy */}
        <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                <Wind className="w-4 h-4 text-[#64748B]" />
                MQ135 Chamber Air Quality & Volatiles Proxy (Pin A2)
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Classified as <strong>VOC / Air-Quality Proxy</strong> — Not Quantitative Seed Respiration
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-[#FEF3C7] text-[#D97706] self-start sm:self-auto">
              Burn-In Baseline: 120 ADC
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] text-xs text-[#475569] leading-relaxed">
            The MQ135 is a metal-oxide semiconductor sensor sensitive to ammonia, sulfides, and ethanol vapors. While it detects organic fermentation or mold outgassing during grain storage, it does not quantitatively measure seed respiration ($CO_2$ in $ppm$) without NDIR spectroscopy.
          </div>
        </div>

      </div>

    </section>
  );
}
