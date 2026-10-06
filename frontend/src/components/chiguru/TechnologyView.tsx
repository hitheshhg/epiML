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
  Wind,
  Database,
  ExternalLink,
  Download,
  AlertTriangle
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

      {/* 5. Supabase Cloud Architecture & PostgreSQL Schema (Section 30) */}
      <div className="bg-white rounded-2xl border border-[#D5E0D0] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E8EFE5]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2D6A4F]" />
              <h3 className="text-xl font-extrabold text-[#163828]">
                Supabase PostgreSQL Cloud Architecture
              </h3>
              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#EBF2E8] text-[#2D6A4F] border border-[#B7D1C5]">
                REF: qbeqacmwaoufiwhafvyj
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#52796F] mt-1">
              Persistent storage of plant profiles, 40-cell growth matrices, actuator telemetry, and verified research datasets.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="/api/database/schema"
              download="chiguru_schema.sql"
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FAFBF9] hover:bg-[#EBF2E8] text-[#2D6A4F] border border-[#D5E0D0] transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download SQL Schema</span>
            </a>

            <a
              href="https://supabase.com/dashboard/project/qbeqacmwaoufiwhafvyj/sql"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#2D6A4F] hover:bg-[#1B4332] text-white transition-all flex items-center gap-1.5 shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Supabase SQL Editor</span>
            </a>
          </div>
        </div>

        {/* 10 Core Entities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
          <div className="p-3.5 rounded-xl bg-[#FAFBF9] border border-[#E2E8DC] space-y-1">
            <div className="flex items-center justify-between font-mono font-bold text-[#163828]">
              <span>public.profiles</span>
              <span className="text-[10px] text-[#2D6A4F]">AUTH • RLS</span>
            </div>
            <p className="text-[#52796F] text-[11px]">
              Researcher accounts linked directly to Supabase Auth (`auth.users`) with automatic trigger onboarding.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAFBF9] border border-[#E2E8DC] space-y-1">
            <div className="flex items-center justify-between font-mono font-bold text-[#163828]">
              <span>public.plant_profiles</span>
              <span className="text-[10px] text-[#2D6A4F]">BOTANICAL</span>
            </div>
            <p className="text-[#52796F] text-[11px]">
              Validated GBIF taxonomy, accepted scientific names, ISTA/FAO thermal sums, and moisture index targets.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAFBF9] border border-[#E2E8DC] space-y-1">
            <div className="flex items-center justify-between font-mono font-bold text-[#163828]">
              <span>public.monitoring_sessions</span>
              <span className="text-[10px] text-[#2D6A4F]">IMMUTABLE</span>
            </div>
            <p className="text-[#52796F] text-[11px]">
              Persistent session runs freezing the botanical profile snapshot, camera geometry, and algorithm version.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAFBF9] border border-[#E2E8DC] space-y-1">
            <div className="flex items-center justify-between font-mono font-bold text-[#163828]">
              <span>public.cells (C01 - C40)</span>
              <span className="text-[10px] text-[#2D6A4F]">40-CELL TRAY</span>
            </div>
            <p className="text-[#52796F] text-[11px]">
              Persistent identities for every cell in the 5×8 nursery tray, tracking emergence dates and green area mm².
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAFBF9] border border-[#E2E8DC] space-y-1">
            <div className="flex items-center justify-between font-mono font-bold text-[#163828]">
              <span>public.sensor_samples</span>
              <span className="text-[10px] text-[#2D6A4F]">TIMESERIES</span>
            </div>
            <p className="text-[#52796F] text-[11px]">
              High-frequency sensor telemetry tagged with provenance: MEASURED, DERIVED, SIMULATED, or REPLAY.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAFBF9] border border-[#E2E8DC] space-y-1">
            <div className="flex items-center justify-between font-mono font-bold text-[#163828]">
              <span>public.actuator_events</span>
              <span className="text-[10px] text-[#2D6A4F]">AUDIT LOG</span>
            </div>
            <p className="text-[#52796F] text-[11px]">
              Immutable audit history of irrigation pump runs (D13), vent servo degrees (D5), and chamber fan airflow (A5).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAFBF9] border border-[#E2E8DC] space-y-1">
            <div className="flex items-center justify-between font-mono font-bold text-[#163828]">
              <span>public.phenotype_observations</span>
              <span className="text-[10px] text-[#2D6A4F]">VISION</span>
            </div>
            <p className="text-[#52796F] text-[11px]">
              Overhead crops, Excess Green (ExG) segmentations, bounding boxes, and cotyledon pixel expansions.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAFBF9] border border-[#E2E8DC] space-y-1">
            <div className="flex items-center justify-between font-mono font-bold text-[#163828]">
              <span>public.verified_dataset</span>
              <span className="text-[10px] text-[#2D6A4F]">HITL LEARNING</span>
            </div>
            <p className="text-[#52796F] text-[11px]">
              Human-in-the-loop validated ground truths (YES / NO / UNCERTAIN) forming versioned training sets.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAFBF9] border border-[#E2E8DC] space-y-1">
            <div className="flex items-center justify-between font-mono font-bold text-[#163828]">
              <span>public.models</span>
              <span className="text-[10px] text-[#2D6A4F]">V0 • V1 • V2</span>
            </div>
            <p className="text-[#52796F] text-[11px]">
              Model version tracking recording real Precision, Recall, F1, and IoU before deployment promotion.
            </p>
          </div>
        </div>

        {/* Quick Migration Instructions Box */}
        <div className="p-4 rounded-xl bg-[#F4F7F2] border border-[#D5E0D0] text-xs text-[#163828] space-y-2">
          <div className="font-bold flex items-center gap-1.5 text-[#2D6A4F]">
            <span>1-Step Setup in Supabase Dashboard:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-[#52796F]">
            <li>Open the Supabase SQL Editor: <a href="https://supabase.com/dashboard/project/qbeqacmwaoufiwhafvyj/sql" target="_blank" rel="noopener noreferrer" className="font-mono text-[#2D6A4F] underline">supabase.com/dashboard/project/qbeqacmwaoufiwhafvyj/sql</a></li>
            <li>Click <strong>“New query”</strong> and paste the contents of <code className="bg-white px-1.5 py-0.5 rounded border border-[#D5E0D0]">supabase/migrations/20261007_chiguru_schema.sql</code> (or click <strong>Download SQL Schema</strong> above).</li>
            <li>Click <strong>“Run”</strong> (or press Ctrl+Enter). All 10 tables, Row Level Security policies, indexes, and storage buckets will be provisioned in ~2 seconds.</li>
          </ol>
        </div>
      </div>

    </div>
  );
}
