"use client";

import React from "react";
import CadViewer from "@/components/CadViewer";
import { Language } from "@/lib/translations";
import {
  Cpu,
  Camera,
  Layers,
  Wrench,
  CheckCircle2,
  Box,
  Compass,
  Wind
} from "lucide-react";

interface TechnologyViewProps {
  lang: Language;
}

export default function TechnologyView({ lang }: TechnologyViewProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl border border-[#D5E0D0] p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#2D6A4F]/10 text-[#2D6A4F] border border-[#2D6A4F]/20 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#2D6A4F]" />
            Hardware & Computer Vision Architecture
          </span>
          <span className="text-xs text-[#52796F] font-mono">
            IP54 Hermetic Standard • Scale 1:10 CAD
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#163828] tracking-tight">
          Physical Engineering & Optical Geometry
        </h2>
        <p className="text-xs sm:text-sm text-[#52796F] mt-1 max-w-3xl">
          Chiguru pairs a deterministic 420mm perpendicular optical gantry with an IP54 sealed dual-zone chamber isolating microcontrollers from 95% condensing nursery humidity.
        </p>
      </div>

      {/* 2. Embedded Existing CAD Viewer (3D Assembled + Exploded Blueprint) */}
      <CadViewer lang={lang} />

      {/* 3. Deterministic CV Optical Pipeline Breakdown (Section 22) */}
      <div className="bg-white rounded-2xl border border-[#D5E0D0] p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2D6A4F]">
            Fixed Optical Geometry (420mm Mount)
          </span>
          <h3 className="text-xl font-extrabold text-[#163828] mt-1">
            Deterministic 5 × 8 Computer Vision Pipeline
          </h3>
          <p className="text-xs sm:text-sm text-[#52796F] mt-1">
            Because the camera is rigidly mounted perpendicular to the nursery tray at 420mm, the system does not waste compute asking LLMs to find the tray. It uses deterministic optical calibration.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#FAFBF9] border border-[#E2E8DC]">
            <span className="text-[10px] font-mono text-[#748E84] block">STAGE 1</span>
            <strong className="text-[#163828] block mt-1">CLAHE Contrast Enhancement</strong>
            <p className="text-[11px] text-[#52796F] mt-1">
              Normalizes natural illumination variations on V-channel without blowing out highlights.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAFBF9] border border-[#E2E8DC]">
            <span className="text-[10px] font-mono text-[#748E84] block">STAGE 2</span>
            <strong className="text-[#163828] block mt-1">Perspective Matrix Crop</strong>
            <p className="text-[11px] text-[#52796F] mt-1">
              Deterministic homography transforms camera feed directly into 40 equal cell coordinates.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAFBF9] border border-[#E2E8DC]">
            <span className="text-[10px] font-mono text-[#748E84] block">STAGE 3</span>
            <strong className="text-[#163828] block mt-1">ExG + HSV Chromaticity</strong>
            <p className="text-[11px] text-[#52796F] mt-1">
              Excess Green Index ($2G - R - B$) fused with brown seed rejection masks.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAFBF9] border border-[#E2E8DC]">
            <span className="text-[10px] font-mono text-[#748E84] block">STAGE 4</span>
            <strong className="text-[#163828] block mt-1">Temporal Verification</strong>
            <p className="text-[11px] text-[#52796F] mt-1">
              Flags low-confidence predictions for researcher review to create validated training labels.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Complete Hardware Pin Mapping Table (Section 38) */}
      <div className="bg-white rounded-2xl border border-[#D5E0D0] p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-[#163828]">
          Frozen Microcontroller Pin Assignment (Arduino Uno)
        </h3>
        <p className="text-xs text-[#52796F]">
          Complete 100% pin allocation utilized across digital, analog, PWM, and driver peripherals.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-[#FAFBF9] border border-[#E2E8DC]">
            <span className="text-[#2D6A4F] font-bold block">Pin D2:</span>
            <span className="text-[#163828]">DHT22 #1 (Storage Zone)</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#FAFBF9] border border-[#E2E8DC]">
            <span className="text-[#2D6A4F] font-bold block">Pin D3:</span>
            <span className="text-[#163828]">DHT22 #2 (Germination Zone)</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#FAFBF9] border border-[#E2E8DC]">
            <span className="text-[#2D6A4F] font-bold block">Pin D5 (PWM):</span>
            <span className="text-[#163828]">Servo 1: Louver Vent (0°-90°)</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#FAFBF9] border border-[#E2E8DC]">
            <span className="text-[#2D6A4F] font-bold block">Pin D6 (PWM):</span>
            <span className="text-[#163828]">Servo 2: Canopy Shade (0°-90°)</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#FAFBF9] border border-[#E2E8DC]">
            <span className="text-[#2D6A4F] font-bold block">Pin D10:</span>
            <span className="text-[#163828]">Mode Button (INPUT_PULLUP)</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#FAFBF9] border border-[#E2E8DC]">
            <span className="text-[#2D6A4F] font-bold block">Pin D13:</span>
            <span className="text-[#163828]">Pump Relay (Active-LOW)</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#FAFBF9] border border-[#E2E8DC]">
            <span className="text-[#2D6A4F] font-bold block">Pin A0:</span>
            <span className="text-[#163828]">Moisture Probe #1</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#FAFBF9] border border-[#E2E8DC]">
            <span className="text-[#2D6A4F] font-bold block">Pin A1:</span>
            <span className="text-[#163828]">Moisture Probe #2</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#FAFBF9] border border-[#E2E8DC]">
            <span className="text-[#2D6A4F] font-bold block">Pin A2:</span>
            <span className="text-[#163828]">MQ135 VOC Proxy</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#FAFBF9] border border-[#E2E8DC]">
            <span className="text-[#2D6A4F] font-bold block">Pin A3:</span>
            <span className="text-[#163828]">TMB12A12 Buzzer</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#FAFBF9] border border-[#E2E8DC]">
            <span className="text-[#2D6A4F] font-bold block">Pin A4:</span>
            <span className="text-[#163828]">Status LED</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#FAFBF9] border border-[#E2E8DC]">
            <span className="text-[#2D6A4F] font-bold block">Pin A5:</span>
            <span className="text-[#163828]">Fan Driver (2N2222 Transistor)</span>
          </div>
        </div>
      </div>

    </div>
  );
}
