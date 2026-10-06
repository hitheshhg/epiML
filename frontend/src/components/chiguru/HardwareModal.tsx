"use client";

import React, { useState, useEffect } from "react";
import {
  Usb,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Terminal,
  Layers,
  Power,
  X,
  Droplets,
  Wind,
  Compass,
  ArrowRight
} from "lucide-react";

interface HardwareModalProps {
  isOpen: boolean;
  onClose: () => void;
  serialConnected: boolean;
  isConnecting: boolean;
  onConnectSerial: () => Promise<boolean>;
  onDisconnectSerial: () => void;
  telemetry: {
    temp1: number;
    hum1: number;
    soil1: number;
    soil2: number;
    gas: number;
    pump: number;
    fan: number;
    vent_angle: number;
    mode: number;
    is_hardware_live: boolean;
  };
  onSendCommand: (cmd: string) => Promise<boolean>;
}

export default function HardwareModal({
  isOpen,
  onClose,
  serialConnected,
  isConnecting,
  onConnectSerial,
  onDisconnectSerial,
  telemetry,
  onSendCommand,
}: HardwareModalProps) {
  const [connectMsg, setConnectMsg] = useState<string | null>(null);
  const [webSerialSupported, setWebSerialSupported] = useState(true);
  const [activeTab, setActiveTab] = useState<"usb" | "bridge" | "pins">("usb");
  const [testPumpBusy, setTestPumpBusy] = useState(false);
  const [testVentBusy, setTestVentBusy] = useState(false);
  const [testFanBusy, setTestFanBusy] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWebSerialSupported("serial" in navigator);
    }
  }, []);

  if (!isOpen) return null;

  const handleConnect = async () => {
    setConnectMsg("Opening Web Serial port selector... Please select your Arduino Uno COM port (e.g. COM8).");
    try {
      const ok = await onConnectSerial();
      if (ok) {
        setConnectMsg("Hardware serial stream connected successfully at 115200 baud!");
      } else {
        setConnectMsg("Port selection canceled or port could not be opened.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setConnectMsg(`Connection error: ${msg}`);
    }
  };

  const handleTogglePump = async () => {
    setTestPumpBusy(true);
    const nextState = telemetry.pump === 1 ? "PUMP:OFF" : "PUMP:ON";
    await onSendCommand(nextState);
    setTimeout(() => setTestPumpBusy(false), 500);
  };

  const handleToggleVent = async () => {
    setTestVentBusy(true);
    const nextAngle = telemetry.vent_angle >= 70 ? 15 : 85;
    await onSendCommand(`VENT:${nextAngle}`);
    setTimeout(() => setTestVentBusy(false), 500);
  };

  const handleToggleFan = async () => {
    setTestFanBusy(true);
    const nextState = telemetry.fan === 1 ? "FAN:OFF" : "FAN:ON";
    await onSendCommand(nextState);
    setTimeout(() => setTestFanBusy(false), 500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#FAFBF9] border border-[#D5E0D0] rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 bg-white border-b border-[#E2E8DC] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              serialConnected || telemetry.is_hardware_live
                ? "bg-[#2D6A4F] text-white"
                : "bg-[#EBF2E8] text-[#2D6A4F]"
            }`}>
              <Usb className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#163828] flex items-center gap-2">
                Connect Hardware
                {(serialConnected || telemetry.is_hardware_live) ? (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#E8F7EC] text-[#1E4D36] border border-[#A7E2BA]">
                    CONNECTED (115200 BAUD)
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#F4F6F2] text-[#748E84] border border-[#E2E8DC]">
                    OFFLINE / SIMULATION
                  </span>
                )}
              </h2>
              <p className="text-xs text-[#52796F]">
                Arduino Uno · 40-Cell Nursery Chamber · 115200 Baud UART
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#52796F] hover:text-[#163828] hover:bg-black/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-3 bg-white border-b border-[#E2E8DC] flex gap-2">
          <button
            onClick={() => setActiveTab("usb")}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === "usb"
                ? "border-[#2D6A4F] text-[#2D6A4F]"
                : "border-transparent text-[#52796F] hover:text-[#163828]"
            }`}
          >
            <Usb className="w-3.5 h-3.5" />
            Web Serial (Direct USB)
          </button>
          <button
            onClick={() => setActiveTab("bridge")}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === "bridge"
                ? "border-[#2D6A4F] text-[#2D6A4F]"
                : "border-transparent text-[#52796F] hover:text-[#163828]"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Python Telemetry Bridge
          </button>
          <button
            onClick={() => setActiveTab("pins")}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === "pins"
                ? "border-[#2D6A4F] text-[#2D6A4F]"
                : "border-transparent text-[#52796F] hover:text-[#163828]"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Hardware Pinout
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* TAB 1: Direct USB Web Serial */}
          {activeTab === "usb" && (
            <div className="space-y-4">
              
              {!webSerialSupported && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Web Serial API not detected.</span>
                    <p className="mt-0.5 text-amber-800">
                      Your browser does not support native USB Serial access. Please use <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong>, or use the <strong>Python Telemetry Bridge</strong> tab.
                    </p>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-white border border-[#E2E8DC] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#163828]">Direct USB Connection</h3>
                    <p className="text-xs text-[#52796F] mt-0.5">
                      Stream raw sensor telemetry directly from Arduino Uno to Chiguru in real-time.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#F4F6F2] text-[#4A6B5D] border border-[#E2E8DC]">
                    115200 8N1
                  </span>
                </div>

                {serialConnected ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-[#E8F7EC] border border-[#A7E2BA] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
                        <span className="text-xs font-semibold text-[#1E4D36]">
                          Arduino Uno Stream Active (Live Telemetry)
                        </span>
                      </div>
                      <button
                        onClick={onDisconnectSerial}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white text-[#C85038] hover:bg-red-50 border border-[#E8C2B8] transition-all"
                      >
                        Disconnect
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="p-2 rounded-xl bg-[#FAFBF9] border border-[#E2E8DC]">
                        <span className="text-[10px] text-[#748E84] block">TEMP 1</span>
                        <span className="font-mono font-bold text-[#163828]">{telemetry.temp1.toFixed(1)}°C</span>
                      </div>
                      <div className="p-2 rounded-xl bg-[#FAFBF9] border border-[#E2E8DC]">
                        <span className="text-[10px] text-[#748E84] block">HUMIDITY</span>
                        <span className="font-mono font-bold text-[#163828]">{telemetry.hum1.toFixed(1)}%</span>
                      </div>
                      <div className="p-2 rounded-xl bg-[#FAFBF9] border border-[#E2E8DC]">
                        <span className="text-[10px] text-[#748E84] block">MOISTURE 1</span>
                        <span className="font-mono font-bold text-[#163828]">{telemetry.soil1}%</span>
                      </div>
                      <div className="p-2 rounded-xl bg-[#FAFBF9] border border-[#E2E8DC]">
                        <span className="text-[10px] text-[#748E84] block">VENT ANGLE</span>
                        <span className="font-mono font-bold text-[#163828]">{telemetry.vent_angle}°</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={handleConnect}
                      disabled={isConnecting || !webSerialSupported}
                      className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-[#2D6A4F] hover:bg-[#1B4332] text-white shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isConnecting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Requesting Serial Port...</span>
                        </>
                      ) : (
                        <>
                          <Usb className="w-4 h-4" />
                          <span>Connect Arduino Uno (COM Port)</span>
                        </>
                      )}
                    </button>
                    <p className="text-[11px] text-[#748E84] text-center">
                      Click above to open the native browser dialog and select your Arduino (e.g. <code>COM8</code> / <code>/dev/ttyACM0</code>).
                    </p>
                  </div>
                )}

                {connectMsg && (
                  <div className="p-2.5 rounded-xl bg-[#F0F4EC] text-[#2D6A4F] text-xs font-mono border border-[#D5E0D0]">
                    {connectMsg}
                  </div>
                )}
              </div>

              {/* Hardware Quick Test Actuators */}
              <div className="p-4 rounded-2xl bg-white border border-[#E2E8DC] space-y-3">
                <h3 className="text-xs font-bold text-[#163828] uppercase tracking-wider">
                  Direct Actuator Test Controls
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={handleTogglePump}
                    disabled={testPumpBusy}
                    className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                      telemetry.pump === 1
                        ? "bg-[#2D6A4F] text-white border-[#2D6A4F]"
                        : "bg-[#FAFBF9] text-[#163828] border-[#E2E8DC] hover:bg-[#EBF2E8]"
                    }`}
                  >
                    <Droplets className="w-4 h-4" />
                    <span>Pump (D13): {telemetry.pump === 1 ? "ON" : "OFF"}</span>
                  </button>

                  <button
                    onClick={handleToggleVent}
                    disabled={testVentBusy}
                    className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                      telemetry.vent_angle > 40
                        ? "bg-[#2D6A4F] text-white border-[#2D6A4F]"
                        : "bg-[#FAFBF9] text-[#163828] border-[#E2E8DC] hover:bg-[#EBF2E8]"
                    }`}
                  >
                    <Compass className="w-4 h-4" />
                    <span>Vent (D5): {telemetry.vent_angle}°</span>
                  </button>

                  <button
                    onClick={handleToggleFan}
                    disabled={testFanBusy}
                    className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                      telemetry.fan === 1
                        ? "bg-[#2D6A4F] text-white border-[#2D6A4F]"
                        : "bg-[#FAFBF9] text-[#163828] border-[#E2E8DC] hover:bg-[#EBF2E8]"
                    }`}
                  >
                    <Wind className="w-4 h-4" />
                    <span>Fan (A5): {telemetry.fan === 1 ? "ON" : "OFF"}</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: Python Telemetry Bridge */}
          {activeTab === "bridge" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white border border-[#E2E8DC] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#163828]">Python Background Bridge</h3>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                    telemetry.is_hardware_live
                      ? "bg-[#E8F7EC] text-[#1E4D36] border-[#A7E2BA]"
                      : "bg-[#FAFBF9] text-[#748E84] border-[#E2E8DC]"
                  }`}>
                    {telemetry.is_hardware_live ? "BRIDGE ACTIVE" : "BRIDGE INACTIVE"}
                  </span>
                </div>
                <p className="text-xs text-[#52796F]">
                  If you prefer background logging to disk (<code>data/log.csv</code>) or are presenting on a headless workstation, launch the Python bridge daemon:
                </p>

                <div className="p-3 rounded-xl bg-[#1E2922] text-[#A7E2BA] font-mono text-xs overflow-x-auto">
                  <code>python software/bridge.py --port COM8 --baud 115200</code>
                </div>

                <p className="text-[11px] text-[#748E84]">
                  Alternatively, double-click <code>run_bridge.bat</code> in the repository root folder. The Next.js dashboard will automatically pick up live telemetry from <code>/api/telemetry</code>.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Hardware Pinout Mapping */}
          {activeTab === "pins" && (
            <div className="p-4 rounded-2xl bg-white border border-[#E2E8DC] space-y-3">
              <h3 className="text-sm font-bold text-[#163828]">Arduino Uno Pin Mapping Specification</h3>
              <p className="text-xs text-[#52796F]">
                Standardized wiring assignments matching physical firmware implementation:
              </p>

              <div className="divide-y divide-[#E2E8DC] text-xs">
                <div className="py-1.5 flex justify-between items-center">
                  <span className="font-mono font-bold text-[#2D6A4F]">D2</span>
                  <span className="text-[#163828]">DHT22 Chamber (Temp 1 / Humidity 1)</span>
                  <span className="text-[10px] text-[#748E84]">MEASURED</span>
                </div>
                <div className="py-1.5 flex justify-between items-center">
                  <span className="font-mono font-bold text-[#2D6A4F]">D3</span>
                  <span className="text-[#163828]">DHT22 Ambient Reference (Temp 2 / Humidity 2)</span>
                  <span className="text-[10px] text-[#748E84]">MEASURED</span>
                </div>
                <div className="py-1.5 flex justify-between items-center">
                  <span className="font-mono font-bold text-[#2D6A4F]">D5</span>
                  <span className="text-[#163828]">Ventilation Aperture Servo (0°-90°)</span>
                  <span className="text-[10px] text-[#748E84]">ACTUATOR</span>
                </div>
                <div className="py-1.5 flex justify-between items-center">
                  <span className="font-mono font-bold text-[#2D6A4F]">D6</span>
                  <span className="text-[#163828]">Shade Canopy Servo (0°-90°)</span>
                  <span className="text-[10px] text-[#748E84]">ACTUATOR</span>
                </div>
                <div className="py-1.5 flex justify-between items-center">
                  <span className="font-mono font-bold text-[#2D6A4F]">D10</span>
                  <span className="text-[#163828]">Hardware Mode Button (Storage / Germination / Field)</span>
                  <span className="text-[10px] text-[#748E84]">INPUT</span>
                </div>
                <div className="py-1.5 flex justify-between items-center">
                  <span className="font-mono font-bold text-[#2D6A4F]">D13</span>
                  <span className="text-[#163828]">Irrigation Pump Motor Relay (5V Signal)</span>
                  <span className="text-[10px] text-[#748E84]">ACTUATOR</span>
                </div>
                <div className="py-1.5 flex justify-between items-center">
                  <span className="font-mono font-bold text-[#2D6A4F]">A0</span>
                  <span className="text-[#163828]">Soil Moisture Probe 1 (Capacitive Index)</span>
                  <span className="text-[10px] text-[#748E84]">MEASURED</span>
                </div>
                <div className="py-1.5 flex justify-between items-center">
                  <span className="font-mono font-bold text-[#2D6A4F]">A1</span>
                  <span className="text-[#163828]">Soil Moisture Probe 2 (Capacitive Index)</span>
                  <span className="text-[10px] text-[#748E84]">MEASURED</span>
                </div>
                <div className="py-1.5 flex justify-between items-center">
                  <span className="font-mono font-bold text-[#2D6A4F]">A2</span>
                  <span className="text-[#163828]">MQ-135 Gas / Air Quality Proxy</span>
                  <span className="text-[10px] text-[#748E84]">MEASURED</span>
                </div>
                <div className="py-1.5 flex justify-between items-center">
                  <span className="font-mono font-bold text-[#2D6A4F]">A5</span>
                  <span className="text-[#163828]">CLD8025SH Airflow Fan Driver</span>
                  <span className="text-[10px] text-[#748E84]">ACTUATOR</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-[#E2E8DC] flex justify-between items-center">
          <span className="text-xs text-[#748E84]">
            Baud Rate: <strong>115200</strong> · Parity: None · Stop Bits: 1
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#163828] text-white hover:bg-[#2D6A4F] transition-all"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
