"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import HeroStats from "@/components/HeroStats";
import SeedMonitor from "@/components/SeedMonitor";
import SensorGrid from "@/components/SensorGrid";
import ActuatorControls from "@/components/ActuatorControls";
import ExplainableAi from "@/components/ExplainableAi";
import TrendCharts from "@/components/TrendCharts";
import { Language, translations } from "@/lib/translations";

interface TelemetryData {
  timestamp: string;
  mode: number;
  temp1: number;
  hum1: number;
  temp2: number;
  hum2: number;
  soil1: number;
  soil2: number;
  gas: number;
  pump: number;
  fan: number;
  alert: number;
  reason: string;
  is_hardware_live?: boolean;
}

export default function Home() {
  const [lang, setLang] = useState<Language>("en");
  const [mode, setMode] = useState<number>(1); // Default to Germination
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    timestamp: new Date().toISOString(),
    mode: 1,
    temp1: 27.4,
    hum1: 64.2,
    temp2: 28.1,
    hum2: 68.5,
    soil1: 52,
    soil2: 48,
    gas: 38,
    pump: 0,
    fan: 0,
    alert: 0,
    reason: "SOIL OPTIMAL / TRAY VIGOR: 92%",
    is_hardware_live: false,
  });

  const [serialConnected, setSerialConnected] = useState(false);
  const [portName, setPortName] = useState<string>("COM8");
  const serialPortRef = useRef<any>(null);
  const serialWriterRef = useRef<any>(null);

  // Poll /api/telemetry continuously every 1.2 seconds if not connected via direct WebSerial
  const fetchTelemetry = useCallback(async () => {
    try {
      const res = await fetch("/api/telemetry");
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data);
        if (typeof data.mode === "number") {
          setMode(data.mode);
        }
      }
    } catch {
      // Ignore network drop
    }
  }, []);

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(() => {
      if (!serialConnected) {
        fetchTelemetry();
      }
    }, 1200);
    return () => clearInterval(interval);
  }, [fetchTelemetry, serialConnected]);

  // Connect via Direct Browser Web Serial API (Chrome / Edge)
  const connectWebSerial = async (): Promise<boolean> => {
    if (typeof window === "undefined" || !("serial" in navigator)) {
      alert("Web Serial API is not supported in this browser. Please use Google Chrome or Microsoft Edge, or use run_bridge.bat.");
      return false;
    }

    try {
      // Request serial port from user
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 115200 });
      serialPortRef.current = port;

      const textEncoder = new TextEncoderStream();
      textEncoder.readable.pipeTo(port.writable);
      serialWriterRef.current = textEncoder.writable.getWriter();

      setSerialConnected(true);
      setPortName("USB Serial (Live)");

      // Start reader stream loop
      const textDecoder = new TextDecoderStream();
      port.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();

      (async () => {
        let buffer = "";
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            if (value) {
              buffer += value;
              const lines = buffer.split("\n");
              buffer = lines.pop() || "";
              for (const line of lines) {
                const parts = line.trim().split(",");
                if (parts.length >= 11) {
                  setTelemetry({
                    timestamp: new Date().toISOString(),
                    mode: parseInt(parts[0], 10) || 0,
                    temp1: parseFloat(parts[1]) || 0,
                    hum1: parseFloat(parts[2]) || 0,
                    temp2: parseFloat(parts[3]) || 0,
                    hum2: parseFloat(parts[4]) || 0,
                    soil1: parseInt(parts[5], 10) || 0,
                    soil2: parseInt(parts[6], 10) || 0,
                    gas: parseInt(parts[7], 10) || 38,
                    pump: parseInt(parts[8], 10) || 0,
                    fan: parseInt(parts[9], 10) || 0,
                    alert: parseInt(parts[10], 10) || 0,
                    reason: parts[11]?.trim() || "SYS: OK",
                    is_hardware_live: true,
                  });
                }
              }
            }
          }
        } catch (readErr) {
          console.warn("Serial reader closed:", readErr);
          setSerialConnected(false);
        }
      })();

      return true;
    } catch (err) {
      console.error("WebSerial connect failed:", err);
      return false;
    }
  };

  // Dispatch command to hardware (via direct WebSerial if connected, and always to /api/command)
  const sendCommand = async (cmd: string): Promise<boolean> => {
    // 1. If direct Web Serial writer is open, send bytes directly
    if (serialWriterRef.current) {
      try {
        await serialWriterRef.current.write(cmd + "\n");
      } catch (err) {
        console.warn("WebSerial write error:", err);
      }
    }

    // 2. Also dispatch to /api/command for bridge.py
    try {
      const res = await fetch("/api/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd }),
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  const handleModeChange = async (m: number) => {
    setMode(m);
    await sendCommand(`MODE:${m}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      
      {/* Top Navbar */}
      <Navbar
        lang={lang}
        setLang={setLang}
        mode={mode}
        setMode={handleModeChange}
        isLive={Boolean(telemetry.is_hardware_live)}
        onConnectSerial={connectWebSerial}
        serialConnected={serialConnected}
        portName={portName}
        onRefresh={fetchTelemetry}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Farm Landing Hero Banner & KPI Deck */}
        <HeroStats
          lang={lang}
          mode={mode}
          soil1={telemetry.soil1}
          soil2={telemetry.soil2}
          temp={telemetry.temp1}
          hum={telemetry.hum1}
          gas={telemetry.gas}
          alert={telemetry.alert}
          reason={telemetry.reason}
          germinationPct={85.0}
          sproutCount={34}
          totalSeeds={40}
        />

        {/* Real-Time Seed & Germination Monitor */}
        <SeedMonitor lang={lang} />

        {/* 7-Channel Live Hardware Sensory Grid */}
        <SensorGrid
          lang={lang}
          soil1={telemetry.soil1}
          soil2={telemetry.soil2}
          temp1={telemetry.temp1}
          hum1={telemetry.hum1}
          temp2={telemetry.temp2}
          hum2={telemetry.hum2}
          gas={telemetry.gas}
          alert={telemetry.alert}
          mode={mode}
        />

        {/* Interactive Remote Actuator Controls Deck */}
        <ActuatorControls
          lang={lang}
          pumpState={telemetry.pump}
          fanState={telemetry.fan}
          onSendCommand={sendCommand}
        />

        {/* Explainable AI Decision Engine (X-CPS) & 16x2 LCD Mirror */}
        <ExplainableAi
          lang={lang}
          mode={mode}
          reason={telemetry.reason}
          soil1={telemetry.soil1}
          temp={telemetry.temp1}
          hum={telemetry.hum1}
          gas={telemetry.gas}
          pump={telemetry.pump}
          fan={telemetry.fan}
          alert={telemetry.alert}
        />

        {/* Continuous Time-Series Sparklines */}
        <TrendCharts lang={lang} />

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#E2E8DC] bg-white/70 backdrop-blur-md py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#52796F]">
          <div className="flex items-center gap-2 font-medium">
            <span className="font-bold text-[#163828]">Chiguru (ಚಿಗುರು) Smart Agri-CPS</span>
            <span>·</span>
            <span>Team TerraByte</span>
            <span>·</span>
            <span>YEN NOVA 1.0</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Yenepoya Institute of Technology, Moodbidri</span>
            <span>·</span>
            <span className="text-[#2D6A4F] font-semibold">IEEE Paper & Patent Ready</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
