"use client";

import React from "react";
import {
  Thermometer,
  Droplets,
  Cloud,
  Wind,
  Camera,
  Activity,
  AlertTriangle,
  Zap,
  CheckCircle2,
  HelpCircle,
  Usb
} from "lucide-react";

interface LiveSensorDeckProps {
  temperature: number;
  humidity: number;
  moistureIndex1: number;
  moistureIndex2: number;
  gasRaw: number;
  pumpState: number | boolean;
  fanState: number | boolean;
  ventAngle: number;
  isHardwareLive: boolean;
  modeLabel: string;
  onOpenHardwareModal?: () => void;
}

export default function LiveSensorDeck({
  temperature,
  humidity,
  moistureIndex1,
  moistureIndex2,
  gasRaw,
  pumpState,
  fanState,
  ventAngle,
  isHardwareLive,
  modeLabel,
  onOpenHardwareModal,
}: LiveSensorDeckProps) {
  // Average root zone index
  const avgMoisture = Math.round((moistureIndex1 + moistureIndex2) / 2);

  // Magnus-Tetens formula for Dew Point
  const a = 17.27, b = 237.7;
  const alpha = ((a * temperature) / (b + temperature)) + Math.log(humidity / 100);
  const dewPoint = +((b * alpha) / (a - alpha)).toFixed(1);
  const spread = +(temperature - dewPoint).toFixed(1);
  const isCondensationRisk = spread < 2.2;

  // Vent state
  const ventState = ventAngle >= 60 ? "OPEN (90°)" : (ventAngle > 10 ? "MICRO VENT (45°)" : "CLOSED (0°)");

  return (
    <div className="bg-white rounded-2xl border border-[#D5E0D0] p-6 shadow-sm">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#E8EFE5]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2D6A4F]" />
            <h3 className="text-base font-extrabold text-[#163828]">
              Chamber Sensory & Actuation State
            </h3>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                isHardwareLive
                  ? "bg-[#EBF2E8] text-[#2D6A4F] border border-[#B7D1C5]"
                  : "bg-[#F4F6F2] text-[#748E84] border border-[#E2E8DC]"
              }`}
            >
              {isHardwareLive ? "LIVE • MEASURED" : "OFFLINE • CACHED"}
            </span>
          </div>
          <p className="text-xs text-[#52796F] mt-0.5">
            Real physical sensor channels and micro-actuators with verified data source provenance.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {onOpenHardwareModal && (
            <button
              onClick={onOpenHardwareModal}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                isHardwareLive
                  ? "bg-[#EBF2E8] text-[#2D6A4F] border-[#B7D1C5] hover:bg-[#DDF0DC]"
                  : "bg-[#FFF9F5] text-[#C85038] border-[#F2C4B8] hover:bg-[#FDECE8]"
              }`}
            >
              <Usb className="w-3.5 h-3.5" />
              <span>{isHardwareLive ? "Hardware Connected" : "Connect Hardware"}</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 ml-1">
            <span className="text-[#748E84]">Chamber Phase:</span>
            <span className="px-2.5 py-1 rounded-md bg-[#FAFBF9] border border-[#E2E8DC] font-mono font-bold text-[#163828]">
              {modeLabel}
            </span>
          </div>
        </div>
      </div>

      {/* 8 Sensor & Actuator Cards Grid */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        {/* 1. Chamber Air Temperature */}
        <div className="p-4 rounded-xl bg-[#FAFBF9] border border-[#E2E8DC] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold text-[#52796F] flex items-center gap-1">
                <Thermometer className="w-3 h-3 text-[#E76F51]" />
                Temperature
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white text-[#748E84] border border-[#E8EFE5]">
                MEASURED • D2
              </span>
            </div>
            <p className="text-2xl font-black text-[#163828] mt-1">
              {temperature}°C
            </p>
          </div>
          <span className="text-[10px] text-[#84A98C] mt-2 block">
            Digital probe at canopy level
          </span>
        </div>

        {/* 2. Relative Humidity */}
        <div className="p-4 rounded-xl bg-[#FAFBF9] border border-[#E2E8DC] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold text-[#52796F] flex items-center gap-1">
                <Cloud className="w-3 h-3 text-[#52796F]" />
                Relative Humidity
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white text-[#748E84] border border-[#E8EFE5]">
                MEASURED • D2
              </span>
            </div>
            <p className="text-2xl font-black text-[#163828] mt-1">
              {humidity}% RH
            </p>
          </div>
          <span className="text-[10px] text-[#84A98C] mt-2 block">
            Chamber atmosphere
          </span>
        </div>

        {/* 3. Soil Moisture Index */}
        <div className="p-4 rounded-xl bg-[#FAFBF9] border border-[#E2E8DC] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold text-[#52796F] flex items-center gap-1">
                <Droplets className="w-3 h-3 text-[#2D6A4F]" />
                Moisture Index
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white text-[#748E84] border border-[#E8EFE5]">
                MEASURED • A0/A1
              </span>
            </div>
            <p className="text-2xl font-black text-[#163828] mt-1">
              {avgMoisture}%
            </p>
          </div>
          <span className="text-[10px] text-[#84A98C] mt-2 block">
            Probe 1: {moistureIndex1}% | Probe 2: {moistureIndex2}%
          </span>
        </div>

        {/* 4. Dew Point & Condensation Risk */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between ${
          isCondensationRisk ? "bg-[#FFF9F5] border-[#F8D7C8]" : "bg-[#FAFBF9] border-[#E2E8DC]"
        }`}>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold text-[#52796F] flex items-center gap-1">
                <Activity className="w-3 h-3 text-[#457B9D]" />
                Dew Point Spread
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white text-[#748E84] border border-[#E8EFE5]">
                DERIVED
              </span>
            </div>
            <p className="text-2xl font-black text-[#163828] mt-1">
              {spread}°C <span className="text-xs font-normal text-[#52796F]">({dewPoint}°C)</span>
            </p>
          </div>
          <span className={`text-[10px] mt-2 block font-semibold ${
            isCondensationRisk ? "text-[#E76F51]" : "text-[#84A98C]"
          }`}>
            {isCondensationRisk ? "⚠ Condensation Risk Elevated" : "✓ Condensation Risk Low"}
          </span>
        </div>

        {/* 5. Air Quality VOC Proxy */}
        <div className="p-4 rounded-xl bg-[#FAFBF9] border border-[#E2E8DC] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold text-[#52796F] flex items-center gap-1">
                <Wind className="w-3 h-3 text-[#748E84]" />
                VOC Proxy (Air)
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white text-[#748E84] border border-[#E8EFE5]">
                MEASURED • A2
              </span>
            </div>
            <p className="text-2xl font-black text-[#163828] mt-1">
              {gasRaw}
            </p>
          </div>
          <span className="text-[10px] text-[#84A98C] mt-2 block">
            MQ135 Respiration Baseline
          </span>
        </div>

        {/* 6. Germination Ventilation Cover (Servo) */}
        <div className="p-4 rounded-xl bg-[#FAFBF9] border border-[#E2E8DC] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold text-[#52796F]">
                Louver Vent
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white text-[#748E84] border border-[#E8EFE5]">
                ACTUATOR • D5
              </span>
            </div>
            <p className="text-lg font-black text-[#163828] mt-1">
              {ventState}
            </p>
          </div>
          <span className="text-[10px] text-[#84A98C] mt-2 block">
            SG90 Micro-Louver Kinematics
          </span>
        </div>

        {/* 7. Aeration Airflow Fan */}
        <div className="p-4 rounded-xl bg-[#FAFBF9] border border-[#E2E8DC] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold text-[#52796F]">
                Chamber Fan
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white text-[#748E84] border border-[#E8EFE5]">
                ACTUATOR • A5
              </span>
            </div>
            <p className={`text-lg font-black mt-1 ${fanState ? "text-[#2D6A4F]" : "text-[#748E84]"}`}>
              {fanState ? "FAN ON" : "FAN OFF"}
            </p>
          </div>
          <span className="text-[10px] text-[#84A98C] mt-2 block">
            CLD8025SH Transistor Driver
          </span>
        </div>

        {/* 8. Micro-Irrigation Pump */}
        <div className="p-4 rounded-xl bg-[#FAFBF9] border border-[#E2E8DC] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold text-[#52796F]">
                Irrigation Pump
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white text-[#748E84] border border-[#E8EFE5]">
                ACTUATOR • D13
              </span>
            </div>
            <p className={`text-lg font-black mt-1 ${pumpState ? "text-[#2D6A4F] animate-pulse" : "text-[#748E84]"}`}>
              {pumpState ? "IRRIGATING" : "STANDBY"}
            </p>
          </div>
          <span className="text-[10px] text-[#84A98C] mt-2 block">
            Controlled Submersible Pulse
          </span>
        </div>

      </div>

      {/* Provenance Footer */}
      <div className="mt-4 pt-3 border-t border-[#E8EFE5] flex items-center justify-between text-[11px] text-[#84A98C] font-mono">
        <span>Labels: MEASURED (Direct pin ADC) • DERIVED (Mathematical model)</span>
        <span>Never outputs smooth simulated readings on hardware disconnect</span>
      </div>

    </div>
  );
}
