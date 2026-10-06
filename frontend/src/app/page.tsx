"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import HeroStats from "@/components/HeroStats";
import CropAdaptiveControl from "@/components/CropAdaptiveControl";
import SeedMonitor from "@/components/SeedMonitor";
import CadViewer from "@/components/CadViewer";
import SensorGrid from "@/components/SensorGrid";
import ActuatorControls from "@/components/ActuatorControls";
import ExplainableAi from "@/components/ExplainableAi";
import TrendCharts from "@/components/TrendCharts";
import { Language } from "@/lib/translations";
import {
  PlantProfile,
  CropType,
  GrowthStage,
  SensorState,
  ActuatorHistory,
  DecisionResult,
  getProfile,
} from "@/lib/plantProfiles";
import { evaluateDecision } from "@/lib/decisionEngine";

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

  // Load saved language on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("chiguru_lang") as Language;
      if (saved && ["en", "kn", "tu", "hi"].includes(saved)) {
        setLang(saved);
      }
    }
  }, []);

  const changeLanguage = (newLang: Language) => {
    setLang(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("chiguru_lang", newLang);
    }
  };

  const [mode, setMode] = useState<number>(1); // 0: STORAGE, 1: GERMINATION, 2: FIELD
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

  // ==========================================
  // CROP-ADAPTIVE PLANT PROFILE STATES
  // ==========================================
  const [selectedCrop, setSelectedCrop] = useState<CropType>("tomato");
  const [selectedStage, setSelectedStage] = useState<GrowthStage>("germination");
  const [activeProfile, setActiveProfile] = useState<PlantProfile>(() =>
    getProfile("tomato", "germination")
  );
  const [cloudStatus, setCloudStatus] = useState<"connected" | "cached" | "offline">("connected");
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toISOString());
  const [simulateCloudOffline, setSimulateCloudOffline] = useState(false);

  // Demo Sandbox States (Jury Live Scenarios)
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoSensors, setDemoSensors] = useState<SensorState>({
    temperature: 25.0,
    humidity: 78.0,
    moisture1: 72,
    moisture2: 72,
    gasPpm: 38,
    lightLux: 10500,
    isHardwareLive: false,
  });
  const [demoRecentIrrigation, setDemoRecentIrrigation] = useState(false);

  // Actuator Context History & Decision Log
  const [actuatorHistory, setActuatorHistory] = useState<ActuatorHistory>({
    isCurrentlyPumping: false,
    pumpCycleCountToday: 2,
    recentIrrigationWithinMinutes: false,
    lastPumpStopTime: Date.now() - 35 * 60 * 1000,
  });
  const [decisionHistory, setDecisionHistory] = useState<DecisionResult[]>([]);
  const lastPumpCmdRef = useRef<boolean>(false);

  // Load saved crop & stage from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCrop = localStorage.getItem("chiguru_crop") as CropType;
      const savedStage = localStorage.getItem("chiguru_stage") as GrowthStage;
      if (savedCrop && ["tomato", "chilli", "capsicum", "brinjal", "cabbage"].includes(savedCrop)) {
        setSelectedCrop(savedCrop);
      }
      if (savedStage && ["germination", "nursery"].includes(savedStage)) {
        setSelectedStage(savedStage);
      }
    }
  }, []);

  // Fetch plant profile on crop or stage change with local caching and offline fallback
  useEffect(() => {
    let isMounted = true;
    const cacheKey = `chiguru_profile_${selectedCrop}_${selectedStage}`;

    const loadProfile = async () => {
      // 1. If simulating cloud offline
      if (simulateCloudOffline) {
        if (typeof window !== "undefined") {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (isMounted) {
                setActiveProfile(parsed);
                setCloudStatus("cached");
                return;
              }
            } catch {}
          }
        }
        if (isMounted) {
          setActiveProfile(getProfile(selectedCrop, selectedStage));
          setCloudStatus("offline");
        }
        return;
      }

      // 2. Try fetching from free cloud API
      try {
        const res = await fetch(`/api/crops?crop=${selectedCrop}&stage=${selectedStage}`);
        if (res.ok) {
          const data = await res.json();
          if (data.profile && isMounted) {
            setActiveProfile(data.profile);
            setCloudStatus("connected");
            setLastSyncTime(new Date().toISOString());
            if (typeof window !== "undefined") {
              localStorage.setItem(cacheKey, JSON.stringify(data.profile));
              localStorage.setItem("chiguru_crop", selectedCrop);
              localStorage.setItem("chiguru_stage", selectedStage);
            }
            return;
          }
        }
        throw new Error("Cloud response non-200");
      } catch {
        // 3. Fallback to local storage cache
        if (typeof window !== "undefined") {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (isMounted) {
                setActiveProfile(parsed);
                setCloudStatus("cached");
                return;
              }
            } catch {}
          }
        }
        if (isMounted) {
          setActiveProfile(getProfile(selectedCrop, selectedStage));
          setCloudStatus("offline");
        }
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [selectedCrop, selectedStage, simulateCloudOffline]);

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

  // Cleanly handle USB disconnects, brownouts, and suppress unhandled rejection overlay
  useEffect(() => {
    const handleDisconnect = () => {
      console.warn("USB Serial hardware was disconnected or reset");
      serialPortRef.current = null;
      serialWriterRef.current = null;
      setSerialConnected(false);
      setPortName("Disconnected");
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const msg = event?.reason?.message || String(event?.reason || "");
      if (
        msg.includes("device has been lost") ||
        msg.includes("NetworkError") ||
        event?.reason?.name === "NetworkError"
      ) {
        // Prevent Next.js red error modal on USB drop/brownout
        event.preventDefault();
        handleDisconnect();
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("unhandledrejection", handleUnhandledRejection);
      if ("serial" in navigator) {
        (navigator as any).serial.addEventListener("disconnect", handleDisconnect);
      }
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("unhandledrejection", handleUnhandledRejection);
        if ("serial" in navigator) {
          (navigator as any).serial.removeEventListener("disconnect", handleDisconnect);
        }
      }
    };
  }, []);

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

      // Start writer stream loop with catch
      const textEncoder = new TextEncoderStream();
      textEncoder.readable.pipeTo(port.writable).catch((err: any) => {
        console.warn("Serial write stream disconnected:", err?.message || err);
      });
      serialWriterRef.current = textEncoder.writable.getWriter();

      setSerialConnected(true);
      setPortName("USB Serial (Live)");

      // Sync active crop profile immediately upon connection
      const syncCmd = `PROFILE,${activeProfile.crop.toUpperCase()},${activeProfile.stage.toUpperCase()},${activeProfile.environment.moisture.min},${activeProfile.environment.moisture.max},${activeProfile.environment.temperature.min},${activeProfile.environment.temperature.max},${activeProfile.environment.shade.target}\n`;
      serialWriterRef.current.write(syncCmd).catch(() => {});

      // Start reader stream loop with catch
      const textDecoder = new TextDecoderStream();
      port.readable.pipeTo(textDecoder.writable).catch((err: any) => {
        console.warn("Serial read stream disconnected:", err?.message || err);
      });
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
        } catch (readErr: any) {
          console.warn("Serial connection ended or reset:", readErr?.message || readErr);
        } finally {
          try {
            await reader.cancel();
          } catch {}
          try {
            reader.releaseLock();
          } catch {}
          serialPortRef.current = null;
          serialWriterRef.current = null;
          setSerialConnected(false);
          setPortName("Disconnected");
        }
      })();

      return true;
    } catch (err: any) {
      console.warn("WebSerial connect cancelled or failed:", err?.message || err);
      setSerialConnected(false);
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

  // ==========================================
  // DECISION ENGINE (X-CPS) EVALUATION CYCLE
  // ==========================================
  const currentSensorState: SensorState = isDemoMode
    ? demoSensors
    : {
        temperature: telemetry.temp1 || 25,
        humidity: telemetry.hum1 || 65,
        moisture1: telemetry.soil1 || 50,
        moisture2: telemetry.soil2 || 50,
        gasPpm: telemetry.gas || 38,
        lightLux: 10500,
        isHardwareLive: Boolean(telemetry.is_hardware_live),
      };

  const currentDecision = evaluateDecision(
    activeProfile,
    currentSensorState,
    {
      ...actuatorHistory,
      recentIrrigationWithinMinutes: isDemoMode
        ? demoRecentIrrigation
        : actuatorHistory.recentIrrigationWithinMinutes,
    }
  );

  // Sync Decision to Actuators and Event Log
  useEffect(() => {
    // Append to rolling explainability history
    setDecisionHistory((prev) => {
      if (
        prev.length === 0 ||
        prev[0].reasonCode !== currentDecision.reasonCode ||
        prev[0].irrigation !== currentDecision.irrigation
      ) {
        return [currentDecision, ...prev.slice(0, 19)];
      }
      return prev;
    });

    // If decision state changed, dispatch hardware command
    if (currentDecision.targetPumpState !== lastPumpCmdRef.current) {
      lastPumpCmdRef.current = currentDecision.targetPumpState;
      if (!isDemoMode) {
        sendCommand(currentDecision.targetPumpState ? "PUMP:ON" : "PUMP:OFF");
        sendCommand(`COVER:${currentDecision.targetServoAngle}`);
      }
    }
  }, [currentDecision, isDemoMode]);

  // Synchronize profile parameters to Arduino whenever profile changes
  useEffect(() => {
    const cmd = `PROFILE,${activeProfile.crop.toUpperCase()},${activeProfile.stage.toUpperCase()},${activeProfile.environment.moisture.min},${activeProfile.environment.moisture.max},${activeProfile.environment.temperature.min},${activeProfile.environment.temperature.max},${activeProfile.environment.shade.target}`;
    sendCommand(cmd);
  }, [activeProfile]);

  // Preset scenarios for Jury Demonstration
  const handleApplyPresetScenario = (scenarioNum: number) => {
    setIsDemoMode(true);
    if (scenarioNum === 1) {
      // Step 1: Tomato Germination - Optimal State (Moisture 72%)
      setSelectedCrop("tomato");
      setSelectedStage("germination");
      setDemoSensors({
        temperature: 25.0,
        humidity: 76.0,
        moisture1: 72,
        moisture2: 72,
        gasPpm: 38,
        lightLux: 9500,
        isHardwareLive: false,
      });
      setDemoRecentIrrigation(false);
    } else if (scenarioNum === 2) {
      // Step 2: Moisture Deficit -> Pump ON
      setSelectedCrop("tomato");
      setSelectedStage("germination");
      setDemoSensors({
        temperature: 25.0,
        humidity: 68.0,
        moisture1: 52,
        moisture2: 52,
        gasPpm: 38,
        lightLux: 9500,
        isHardwareLive: false,
      });
      setDemoRecentIrrigation(false);
    } else if (scenarioNum === 3) {
      // Step 3: THE SIGNATURE INNOVATION -> Intelligent Refusal (High Humidity + Recent Irrigation)
      setSelectedCrop("tomato");
      setSelectedStage("germination");
      setDemoSensors({
        temperature: 25.0,
        humidity: 92.0, // High atmospheric humidity
        moisture1: 52,   // Low soil moisture
        moisture2: 52,
        gasPpm: 38,
        lightLux: 9500,
        isHardwareLive: false,
      });
      setDemoRecentIrrigation(true); // Tray was recently irrigated
    } else if (scenarioNum === 4) {
      // Step 4: Cold Shock Protection Refusal
      setSelectedCrop("tomato");
      setSelectedStage("germination");
      setDemoSensors({
        temperature: 15.0, // Sub-optimal cold temperature
        humidity: 65.0,
        moisture1: 48,
        moisture2: 48,
        gasPpm: 38,
        lightLux: 8000,
        isHardwareLive: false,
      });
      setDemoRecentIrrigation(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF7]">
      
      {/* Top Navbar */}
      <Navbar
        lang={lang}
        setLang={changeLanguage}
        mode={mode}
        setMode={handleModeChange}
        isLive={Boolean(telemetry.is_hardware_live)}
        onConnectSerial={connectWebSerial}
        serialConnected={serialConnected}
        portName={portName}
        onRefresh={fetchTelemetry}
      />

      {/* Main Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Farm Landing Hero Banner & KPI Deck */}
        <HeroStats
          lang={lang}
          mode={mode}
          soil1={isDemoMode ? demoSensors.moisture1 : telemetry.soil1}
          soil2={isDemoMode ? demoSensors.moisture2 : telemetry.soil2}
          temp={isDemoMode ? demoSensors.temperature : telemetry.temp1}
          hum={isDemoMode ? demoSensors.humidity : telemetry.hum1}
          gas={telemetry.gas}
          alert={telemetry.alert}
          reason={isDemoMode ? currentDecision.summaryBadge : telemetry.reason}
          germinationPct={85.0}
          sproutCount={34}
          totalSeeds={40}
        />

        {/* 1. Core Feature: Crop-Adaptive Biological Nursery Control Engine */}
        <CropAdaptiveControl
          lang={lang}
          activeProfile={activeProfile}
          onSelectCrop={(c) => setSelectedCrop(c)}
          onSelectStage={(s) => setSelectedStage(s)}
          decision={currentDecision}
          cloudStatus={cloudStatus}
          lastSyncTime={lastSyncTime}
          onToggleCloudSim={() => setSimulateCloudOffline(!simulateCloudOffline)}
          isDemoMode={isDemoMode}
          onToggleDemoMode={(val) => setIsDemoMode(val)}
          demoSensors={demoSensors}
          onUpdateDemoSensors={(p) => setDemoSensors((prev) => ({ ...prev, ...p }))}
          demoRecentIrrigation={demoRecentIrrigation}
          onToggleDemoRecentIrrigation={(val) => setDemoRecentIrrigation(val)}
          decisionHistory={decisionHistory}
          onApplyPresetScenario={handleApplyPresetScenario}
        />

        {/* 2. Real-Time Seed & Germination CV Phenotyping Monitor */}
        <SeedMonitor lang={lang} />

        {/* 3. 3D CAD Representation & Mechanical Architecture */}
        <CadViewer lang={lang} />

        {/* 4. 7-Channel Live Hardware Sensory Grid */}
        <SensorGrid
          lang={lang}
          soil1={isDemoMode ? demoSensors.moisture1 : telemetry.soil1}
          soil2={isDemoMode ? demoSensors.moisture2 : telemetry.soil2}
          temp1={isDemoMode ? demoSensors.temperature : telemetry.temp1}
          hum1={isDemoMode ? demoSensors.humidity : telemetry.hum1}
          temp2={telemetry.temp2}
          hum2={telemetry.hum2}
          gas={telemetry.gas}
          alert={telemetry.alert}
          mode={mode}
        />

        {/* 5. Interactive Remote Actuator Controls Deck */}
        <ActuatorControls
          lang={lang}
          pumpState={isDemoMode ? (currentDecision.targetPumpState ? 1 : 0) : telemetry.pump}
          fanState={telemetry.fan}
          onSendCommand={sendCommand}
        />

        {/* 6. Explainable AI Decision Engine (X-CPS) & 16x2 LCD Mirror */}
        <ExplainableAi
          lang={lang}
          mode={mode}
          reason={isDemoMode ? currentDecision.explanation : telemetry.reason}
          soil1={isDemoMode ? demoSensors.moisture1 : telemetry.soil1}
          temp={isDemoMode ? demoSensors.temperature : telemetry.temp1}
          hum={isDemoMode ? demoSensors.humidity : telemetry.hum1}
          gas={telemetry.gas}
          pump={isDemoMode ? (currentDecision.targetPumpState ? 1 : 0) : telemetry.pump}
          fan={telemetry.fan}
          alert={telemetry.alert}
        />

        {/* 7. Continuous Time-Series Sparklines */}
        <TrendCharts lang={lang} />

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#E2E8DC] bg-white/70 backdrop-blur-md py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#52796F]">
          <div className="flex items-center gap-2 font-medium">
            <span className="font-bold text-[#163828]">Chiguru (ಚಿಗುರು) — Crop-Adaptive Nursery System</span>
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
