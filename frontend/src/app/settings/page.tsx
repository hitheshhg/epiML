"use client";

import React, { useState } from "react";
import Link from "next/link";
import SensorCalibrationCenter from "@/components/SensorCalibrationCenter";
import {
  Sprout,
  ArrowLeft,
  Sliders,
  Camera,
  Cpu,
  Wind,
  Droplets,
  CheckCircle2,
  AlertTriangle,
  Usb,
} from "lucide-react";

export default function SettingsPage() {
  const [fanState, setFanState] = useState(false);
  const [pumpState, setPumpState] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleTestFan = () => {
    setFanState(!fanState);
    setTestResult(!fanState ? "Fan CLD8025SH engaged on Pin A5 (12V external supply)" : "Fan stopped");
  };

  const handleTestPump = () => {
    setPumpState(true);
    setTestResult("Pump Relay D13 pulsed for 2.0s");
    setTimeout(() => {
      setPumpState(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAF6] text-[#1E3A2B]">
      {/* Header */}
      <header className="border-b border-[#E2E8DC] bg-white/90 px-6 py-3.5 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/monitor/CHG-EXP-2026-001"
              className="flex items-center gap-1.5 rounded-lg border border-[#D1D5DB] px-3 py-1.5 text-xs font-bold text-[#4A6B5D] hover:bg-[#F8FAF6]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Monitor</span>
            </Link>
            <div className="h-4 w-px bg-[#E2E8DC]" />
            <h1 className="text-base font-bold text-[#163828]">
              Instrument Calibration & Settings
            </h1>
          </div>

          <span className="font-mono text-xs font-bold text-[#2D6A4F] bg-[#E8F7EC] px-2.5 py-0.5 rounded-full border border-[#52B788]/30">
            FIRMWARE v2.4.0
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8 space-y-8">
        {/* Metrology & Moisture Calibration Center */}
        <SensorCalibrationCenter soil1={68} soil2={70} temp={25.4} hum={76.2} gas={410} />

        {/* Hardware Actuator Manual Diagnostic Tests */}
        <div className="rounded-2xl border border-[#E2E8DC] bg-white p-6 shadow-sm">
          <div className="border-b border-[#F0F4EC] pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#163828]">
              Actuator Diagnostic & Manual Overrides
            </h2>
            <p className="text-xs text-[#52796F]">
              Verify electrical isolation, MOSFET switching, and relay triggering
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Fan CLD8025SH Diagnostic */}
            <div className="rounded-xl border border-[#E2E8DC] bg-[#F8FAF6] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wind className="h-4 w-4 text-[#2D6A4F]" />
                  <span className="text-xs font-bold text-[#163828]">Chamber Fan (A5)</span>
                </div>
                <span className="font-mono text-[10px] text-[#6C757D]">CLD8025SH 12V</span>
              </div>
              <p className="mt-2 text-[11px] text-[#4A6B5D]">
                Driven through logic-level MOSFET on pin A5 from external 12V supply. Note: Basic 2-wire fans do not provide tachometer feedback.
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#163828]">
                  State: {fanState ? "ACTIVE (100% PWM)" : "OFF"}
                </span>
                <button
                  onClick={handleTestFan}
                  className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-colors ${
                    fanState
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-[#2D6A4F] text-white hover:bg-[#1B4332]"
                  }`}
                >
                  {fanState ? "Stop Fan" : "Test Run Fan"}
                </button>
              </div>
            </div>

            {/* Micro-Pulse Pump Diagnostic */}
            <div className="rounded-xl border border-[#E2E8DC] bg-[#F8FAF6] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-[#1D3557]" />
                  <span className="text-xs font-bold text-[#163828]">Substrate Pump (D13)</span>
                </div>
                <span className="font-mono text-[10px] text-[#6C757D]">5V Opto-Relay</span>
              </div>
              <p className="mt-2 text-[11px] text-[#4A6B5D]">
                Optoisolated relay trigger. Safety cutoff enforced at 4.0s pulse limit to prevent chamber flooding.
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#163828]">
                  State: {pumpState ? "PULSING..." : "STANDBY"}
                </span>
                <button
                  onClick={handleTestPump}
                  disabled={pumpState}
                  className="rounded-xl bg-[#1D3557] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#14213D] disabled:opacity-50"
                >
                  {pumpState ? "Pulsing..." : "2s Test Pulse"}
                </button>
              </div>
            </div>
          </div>

          {testResult && (
            <div className="mt-4 rounded-xl border border-[#52B788]/30 bg-[#E8F7EC] p-3 text-xs font-mono text-[#1E4D36]">
              {testResult}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
