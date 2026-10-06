"use client";

import React, { useState } from "react";
import { translations, Language } from "@/lib/translations";
import {
  Power,
  RotateCw,
  Sun,
  Moon,
  Volume2,
  Wind,
  Cpu,
  CheckCircle2,
  Sliders,
  Send
} from "lucide-react";

interface ActuatorControlsProps {
  lang: Language;
  pumpState: number;
  fanState: number;
  onSendCommand: (cmd: string) => Promise<boolean>;
}

export default function ActuatorControls({
  lang,
  pumpState,
  fanState,
  onSendCommand,
}: ActuatorControlsProps) {
  const t = translations[lang];

  const [ventAngle, setVentAngle] = useState(0);
  const [coverAngle, setCoverAngle] = useState(0);
  const [sending, setSending] = useState(false);
  const [lastDispatched, setLastDispatched] = useState<string | null>(null);

  const dispatch = async (cmd: string) => {
    setSending(true);
    setLastDispatched(cmd);
    await onSendCommand(cmd);
    setSending(false);
  };

  return (
    <div className="agri-card rounded-3xl p-6 sm:p-8 mb-8 border border-[#E2E8DC]">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8DC]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#2D6A4F] flex items-center gap-1.5 mb-1">
            <Cpu className="w-4 h-4 text-[#52B788]" />
            Actuation & Hardware Tele-operation
          </span>
          <h3 className="text-xl font-bold text-[#163828]">
            {t.actuatorTitle}
          </h3>
          <p className="text-xs text-[#52796F] mt-0.5">
            {t.actuatorSubtitle}
          </p>
        </div>

        {/* Autonomous Reset Button */}
        <button
          onClick={() => dispatch("AUTO")}
          className="py-2 px-4 rounded-xl border border-[#A7E2BA] bg-[#E8F7EC] hover:bg-[#D8F3DC] text-[#1E4D36] text-xs font-bold transition-all shadow-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <RotateCw className="w-3.5 h-3.5" />
          {t.resumeAuto}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-6">
        
        {/* Actuator 1: Water Pump Motor / Relay (Pin D13) */}
        <div className="p-5 rounded-2xl bg-[#F7F9F5] border border-[#E2E8DC] flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#163828]">{t.pumpMotor}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                pumpState === 1
                  ? "bg-[#D8F3DC] text-[#1E4D36] border border-[#A7E2BA]"
                  : "bg-[#F0F4EC] text-[#52796F]"
              }`}
            >
              {pumpState === 1 ? "ACTIVE (CLICK!)" : "STANDBY"}
            </span>
          </div>

          <p className="text-[11px] text-[#52796F]">
            {t.pumpMotorDesc}
          </p>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => dispatch("MOTOR:ON")}
              disabled={sending}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                pumpState === 1
                  ? "bg-[#2D6A4F] text-white shadow-md shadow-[#2D6A4F]/20"
                  : "bg-white hover:bg-[#E8F7EC] text-[#1E4D36] border border-[#E2E8DC]"
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              {t.pumpOn}
            </button>
            <button
              onClick={() => dispatch("MOTOR:OFF")}
              disabled={sending}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                pumpState === 0
                  ? "bg-[#3D5A4C] text-white shadow-sm"
                  : "bg-white hover:bg-[#F0F4EC] text-[#52796F] border border-[#E2E8DC]"
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              {t.pumpOff}
            </button>
          </div>
        </div>

        {/* Actuator 2: Vent Shutter (Servo 1 on D5) */}
        <div className="p-5 rounded-2xl bg-[#F7F9F5] border border-[#E2E8DC] flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#163828]">{t.ventAperture}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F7EC] text-[#1E4D36] font-mono">
              {ventAngle}°
            </span>
          </div>

          <p className="text-[11px] text-[#52796F]">
            {t.ventDesc}
          </p>

          <div className="grid grid-cols-3 gap-1.5 pt-2">
            <button
              onClick={() => {
                setVentAngle(0);
                dispatch("VENT:0");
              }}
              className="py-1.5 px-2 rounded-xl bg-white hover:bg-[#E8F7EC] border border-[#E2E8DC] text-[11px] font-bold text-[#1E4D36] transition-colors"
            >
              0° (Seal)
            </button>
            <button
              onClick={() => {
                setVentAngle(45);
                dispatch("VENT:45");
              }}
              className="py-1.5 px-2 rounded-xl bg-white hover:bg-[#E8F7EC] border border-[#E2E8DC] text-[11px] font-bold text-[#1E4D36] transition-colors"
            >
              45° (Mid)
            </button>
            <button
              onClick={() => {
                setVentAngle(90);
                dispatch("VENT:90");
              }}
              className="py-1.5 px-2 rounded-xl bg-white hover:bg-[#E8F7EC] border border-[#E2E8DC] text-[11px] font-bold text-[#1E4D36] transition-colors"
            >
              90° (Open)
            </button>
          </div>
        </div>

        {/* Actuator 3: Shade Cover (Servo 2 on D6) */}
        <div className="p-5 rounded-2xl bg-[#F7F9F5] border border-[#E2E8DC] flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#163828]">{t.shadeCover}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F7EC] text-[#1E4D36] font-mono">
              {coverAngle === 90 ? "Darkened (90°)" : "Retracted (0°)"}
            </span>
          </div>

          <p className="text-[11px] text-[#52796F]">
            {t.shadeDesc}
          </p>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => {
                setCoverAngle(0);
                dispatch("COVER:0");
              }}
              className="py-2 px-3 rounded-xl bg-white hover:bg-[#E8F7EC] border border-[#E2E8DC] text-xs font-bold text-[#1E4D36] transition-colors flex items-center justify-center gap-1.5"
            >
              <Sun className="w-3.5 h-3.5 text-[#F4A261]" />
              0° (Sun)
            </button>
            <button
              onClick={() => {
                setCoverAngle(90);
                dispatch("COVER:90");
              }}
              className="py-2 px-3 rounded-xl bg-white hover:bg-[#E8F7EC] border border-[#E2E8DC] text-xs font-bold text-[#1E4D36] transition-colors flex items-center justify-center gap-1.5"
            >
              <Moon className="w-3.5 h-3.5 text-[#52796F]" />
              90° (Shade)
            </button>
          </div>
        </div>

        {/* Actuator 4: Acoustic Buzzer & Status Tests */}
        <div className="p-5 rounded-2xl bg-[#F7F9F5] border border-[#E2E8DC] flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#163828]">{t.buzzerAnnunciator}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF2ED] text-[#E76F51]">
              Pin A3
            </span>
          </div>

          <p className="text-[11px] text-[#52796F]">
            {t.buzzerDesc}
          </p>

          <button
            onClick={() => dispatch("MODE:1")}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#1E4D36] to-[#2D6A4F] hover:from-[#163828] hover:to-[#1E4D36] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <Volume2 className="w-4 h-4 text-[#74C69D]" />
            {t.buzzerTest}
          </button>
        </div>

      </div>

      {lastDispatched && (
        <div className="px-4 py-2.5 rounded-xl bg-[#F0F6EE] border border-[#D8E6D3] text-xs text-[#2D6A4F] flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#40916C]" />
            {t.lastCommand}: <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-[#D8E6D3]">{lastDispatched}</code>
          </span>
          <span className="text-[11px] text-[#52796F]">data/cmd.txt</span>
        </div>
      )}

    </div>
  );
}
