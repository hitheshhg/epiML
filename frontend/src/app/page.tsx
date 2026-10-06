"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import HeaderNav, { ActiveTab } from "@/components/chiguru/HeaderNav";
import LandingHero from "@/components/chiguru/LandingHero";
import LandingStory from "@/components/chiguru/LandingStory";
import PlantSearchModal from "@/components/chiguru/PlantSearchModal";
import TrayMatrix from "@/components/chiguru/TrayMatrix";
import CellDetailInspector from "@/components/chiguru/CellDetailInspector";
import EnvGrowthTimeline from "@/components/chiguru/EnvGrowthTimeline";
import LiveSensorDeck from "@/components/chiguru/LiveSensorDeck";
import ChiguruInsightCard from "@/components/chiguru/ChiguruInsightCard";
import ResearchDashboard from "@/components/chiguru/ResearchDashboard";
import TechnologyView from "@/components/chiguru/TechnologyView";
import ReferencesDrawer from "@/components/chiguru/ReferencesDrawer";
import AuthModal from "@/components/chiguru/AuthModal";
import HardwareModal from "@/components/chiguru/HardwareModal";
import ActuatorControls from "@/components/ActuatorControls";

import {
  generate40Cells,
  generateTimelineData,
  saveVerifiedExample,
} from "@/lib/monitoringStore";
import {
  CellRecord,
  HumanReviewLabel,
  SynchronizedTimelinePoint,
  MonitoringSession,
} from "@/lib/types/monitoring";
import { ValidatedPlantProfile } from "@/schemas/plant";
import {
  getLocalUser,
  setLocalUser,
  getCurrentUser,
  signOutUser,
  supabase,
  ChiguruUser,
} from "@/lib/supabaseClient";
import { Language } from "@/lib/translations";
import {
  Sprout,
  Activity,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Play,
  Usb
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const [lang, setLang] = useState<Language>("en");
  const [user, setUser] = useState<ChiguruUser | null>(null);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPlantSearchOpen, setIsPlantSearchOpen] = useState(false);
  const [isHardwareModalOpen, setIsHardwareModalOpen] = useState(false);

  // Current Plant & Profile
  const [activeProfile, setActiveProfile] = useState<ValidatedPlantProfile>({
    commonName: "Tomato",
    scientificName: "Solanum lycopersicum",
    scientificNameConfidence: 0.98,
    growthStage: "germination",
    germinationWindow: { minDays: 5, typicalDays: 7, maxDays: 12 },
    temperatureGuidance: { min: 20, optimal: 25, max: 30, unit: "C" },
    humidityGuidance: { min: 65, optimal: 78, max: 88, unit: "%" },
    moistureGuidance: {
      monitoringTarget: "65-75% Index",
      minIndex: 60,
      optimalIndex: 72,
      maxIndex: 82,
    },
    lightGuidance: {
      regime: "Initial darkness accelerates hypocotyl emergence; transition to diffuse canopy light at 50% shade.",
      canopyShadeTarget: 50,
    },
    monitoringNotes: "Solanaceous dicot. Highly sensitive to Pythium damping-off fungal pathogen if ambient humidity exceeds 88% alongside saturated substrate.",
    evidenceLevel: "LITERATURE",
    referenceSuggestions: [
      "ISTA (International Seed Testing Association) Rules for Seed Testing, 2021",
      "FAO Plant Production and Protection Paper 168: Tomato production",
    ],
    limitations: "Calibration baseline. Micro-variety variations may alter optimal emergence thermal sums.",
    gbifTaxonKey: 2930137,
    gbifMatchConfidence: "98% (EXACT)",
    sourceCategory: "LITERATURE",
    retrievalTimestamp: new Date().toISOString(),
  });

  // Monitoring State
  const [cells, setCells] = useState<CellRecord[]>(() => generate40Cells("Tomato"));
  const [selectedCellId, setSelectedCellId] = useState<string>("C17");
  const [timeline, setTimeline] = useState<SynchronizedTimelinePoint[]>(() => generateTimelineData());
  const [sessionId, setSessionId] = useState<string>("SES-2026-TRAY-01");

  // Hardware Telemetry
  const [telemetry, setTelemetry] = useState({
    temp1: 25.4,
    hum1: 78.2,
    soil1: 72,
    soil2: 70,
    gas: 38,
    pump: 0,
    fan: 0,
    vent_angle: 45,
    mode: 1,
    is_hardware_live: false,
  });

  const [serialConnected, setSerialConnected] = useState(false);
  const serialPortRef = useRef<any>(null);
  const serialWriterRef = useRef<any>(null);

  // Initialize auth user from Supabase or local storage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      getCurrentUser().then((u) => {
        if (u) setUser(u);
      });

      const savedLang = localStorage.getItem("chiguru_lang") as Language;
      if (savedLang && ["en", "kn", "tu", "hi"].includes(savedLang)) {
        setLang(savedLang);
      }

      if (supabase) {
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            const u = session.user;
            const mapped: ChiguruUser = {
              id: u.id,
              email: u.email || "",
              name:
                (u.user_metadata?.full_name as string) ||
                (u.user_metadata?.name as string) ||
                u.email?.split("@")[0],
              role: "researcher",
            };
            setLocalUser(mapped);
            setUser(mapped);
          } else if (event === "SIGNED_OUT") {
            setUser(null);
            setLocalUser(null);
          }
        });
        return () => {
          subscription.unsubscribe();
        };
      }
    }
  }, []);

  // Poll /api/telemetry continuously every 1.2s if not connected via direct serial
  const fetchTelemetry = useCallback(async () => {
    try {
      const res = await fetch("/api/telemetry");
      if (res.ok) {
        const data = await res.json();
        setTelemetry({
          temp1: data.temp1 ?? 25.4,
          hum1: data.hum1 ?? 78.2,
          soil1: data.soil1 ?? 72,
          soil2: data.soil2 ?? 70,
          gas: data.gas ?? 38,
          pump: data.pump ?? 0,
          fan: data.fan ?? 0,
          vent_angle: data.vent_angle ?? 45,
          mode: data.mode ?? 1,
          is_hardware_live: Boolean(data.is_hardware_live),
        });
      }
    } catch {}
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
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const msg = event?.reason?.message || String(event?.reason || "");
      if (
        msg.includes("device has been lost") ||
        msg.includes("NetworkError") ||
        event?.reason?.name === "NetworkError"
      ) {
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

  const [isConnectingSerial, setIsConnectingSerial] = useState(false);

  // Direct Web Serial connection (Chrome / Edge / Opera) at 115200 baud
  const connectSerial = async (): Promise<boolean> => {
    if (typeof window === "undefined" || !("serial" in navigator)) {
      alert("Web Serial API is not supported in this browser. Please use Chrome or Edge.");
      return false;
    }
    setIsConnectingSerial(true);
    try {
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 115200 });
      serialPortRef.current = port;
      setSerialConnected(true);

      // Start text decoder stream
      const textDecoder = new TextDecoderStream();
      port.readable.pipeTo(textDecoder.writable).catch(() => {});
      const reader = textDecoder.readable.getReader();

      // Start text encoder stream for outgoing commands
      const textEncoder = new TextEncoderStream();
      textEncoder.readable.pipeTo(port.writable).catch(() => {});
      serialWriterRef.current = textEncoder.writable.getWriter();

      // Non-blocking read loop
      (async () => {
        let buffer = "";
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += value;
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";
            for (const line of lines) {
              const clean = line.trim();
              if (!clean) continue;
              // CSV Format: MODE,T1,H1,T2,H2,M1,M2,GAS,PUMP,FAN,ALERT,REASON
              const parts = clean.split(",");
              if (parts.length >= 10) {
                const modeVal = parseInt(parts[0], 10);
                const t1 = parseFloat(parts[1]);
                const h1 = parseFloat(parts[2]);
                const m1 = parseInt(parts[5], 10);
                const m2 = parseInt(parts[6], 10);
                const gas = parseInt(parts[7], 10);
                const pump = parseInt(parts[8], 10);
                const fan = parseInt(parts[9], 10);
                if (!isNaN(t1) && !isNaN(h1)) {
                  setTelemetry(prev => ({
                    ...prev,
                    temp1: t1,
                    hum1: h1,
                    soil1: isNaN(m1) ? prev.soil1 : m1,
                    soil2: isNaN(m2) ? prev.soil2 : m2,
                    gas: isNaN(gas) ? prev.gas : gas,
                    pump: isNaN(pump) ? prev.pump : pump,
                    fan: isNaN(fan) ? prev.fan : fan,
                    mode: isNaN(modeVal) ? prev.mode : modeVal,
                    is_hardware_live: true,
                  }));
                }
              }
            }
          }
        } catch (readErr) {
          console.warn("Serial reader ended:", readErr);
        } finally {
          try { reader.releaseLock(); } catch {}
          setSerialConnected(false);
          serialPortRef.current = null;
          serialWriterRef.current = null;
        }
      })();

      return true;
    } catch (err: unknown) {
      console.warn("Serial port connection canceled or failed:", err);
      return false;
    } finally {
      setIsConnectingSerial(false);
    }
  };

  const disconnectSerial = async () => {
    try {
      if (serialWriterRef.current) {
        await serialWriterRef.current.close().catch(() => {});
        serialWriterRef.current = null;
      }
      if (serialPortRef.current) {
        await serialPortRef.current.close().catch(() => {});
        serialPortRef.current = null;
      }
    } catch (err) {
      console.warn("Disconnect error:", err);
    } finally {
      setSerialConnected(false);
    }
  };

  // Send hardware command via Web Serial or API
  const sendCommand = async (cmd: string): Promise<boolean> => {
    if (serialWriterRef.current) {
      try {
        await serialWriterRef.current.write(cmd + "\n");
      } catch {}
    }
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

  // Human-in-the-Loop review label verification (Section 25)
  const handleVerifyLabel = (cellId: string, label: HumanReviewLabel) => {
    setCells((prev) =>
      prev.map((c) => {
        if (c.cellId === cellId) {
          const updatedState = label === "YES" ? "GROWING" : (label === "NO" ? "SEEDED" : c.state);
          return {
            ...c,
            state: updatedState,
            currentObservation: {
              ...c.currentObservation,
              state: updatedState,
              humanVerification: {
                label,
                verifiedBy: user?.name || "Dr. Evaluator",
                verifiedAt: new Date().toISOString(),
              },
            },
          };
        }
        return c;
      })
    );

    // Save to verified research dataset
    saveVerifiedExample({
      id: `VE-${Date.now().toString().slice(-4)}`,
      cellId,
      sessionId,
      plant: `${activeProfile.commonName} (${activeProfile.scientificName})`,
      timestamp: new Date().toISOString(),
      modelPrediction: "REVIEW",
      modelConfidence: 0.58,
      humanVerifiedLabel: label,
      sensorContextSummary: `${telemetry.temp1}°C / ${telemetry.hum1}% RH / ${telemetry.soil1}% Moisture / Micro-vent`,
      imageUrl: `/images/cells/${cellId.toLowerCase()}.jpg`,
      datasetVersion: "CHIGURU DATASET v1.0",
    });
  };

  // Start new monitoring session when profile selected
  const handleProfileSelected = (prof: ValidatedPlantProfile) => {
    setActiveProfile(prof);
    setCells(generate40Cells(prof.commonName));
    setSelectedCellId("C17");
    setSessionId(`SES-${Date.now().toString().slice(-6)}`);
    setActiveTab("monitor");

    // Sync profile to Arduino
    sendCommand(
      `PROFILE,${prof.commonName.toUpperCase()},GERMINATION,${prof.moistureGuidance.minIndex},${prof.moistureGuidance.maxIndex},${prof.temperatureGuidance.min},${prof.temperatureGuidance.max},${prof.lightGuidance.canopyShadeTarget}`
    );
  };

  // 2-Minute Jury Tour Flow (Section 64)
  const handleTriggerJuryDemo = () => {
    // 1. Ensure user is logged in
    setUser({
      id: "evaluator-session-01",
      email: "evaluator@yenepoya.edu.in",
      name: "Dr. Evaluator (YEN NOVA)",
      role: "evaluator",
      isGuest: true,
    });
    // 2. Switch to monitor tab
    setActiveTab("monitor");
    // 3. Highlight signature cell C17
    setSelectedCellId("C17");
    // 4. Scrub timeline to Hour 48 (C17 emergence)
    const pt = timeline.find((p) => p.elapsedHours === 48);
    // 5. Send acoustic confirmation
    sendCommand("BUZZ:1");
  };

  const selectedCell = cells.find((c) => c.cellId === selectedCellId) || cells[16];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFBF9] text-[#163828]">
      
      {/* 1. Header Navigation */}
      <HeaderNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={async () => {
          await signOutUser();
          setUser(null);
        }}
        isHardwareLive={telemetry.is_hardware_live}
        serialConnected={serialConnected}
        onOpenHardwareModal={() => setIsHardwareModalOpen(true)}
        onOpenPlantSearch={() => setIsPlantSearchOpen(true)}
        onTriggerJuryDemo={handleTriggerJuryDemo}
        lang={lang}
        onLangChange={(l) => setLang(l)}
        activeCropName={activeProfile.commonName}
      />

      {/* 2. Main Page Views based on Active Tab */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* VIEW A: LANDING / OVERVIEW */}
        {activeTab === "home" && (
          <div className="space-y-12 animate-in fade-in duration-200">
            <LandingHero
              onStartMonitoring={() => setIsPlantSearchOpen(true)}
              onLearnMore={() => {
                const el = document.getElementById("how-it-works");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              onOpenJuryFlow={handleTriggerJuryDemo}
              onOpenHardwareModal={() => setIsHardwareModalOpen(true)}
            />

            <LandingStory
              onStartMonitoring={() => setIsPlantSearchOpen(true)}
            />
          </div>
        )}

        {/* VIEW B: MAIN MONITORING SCREEN (The Core Product) */}
        {activeTab === "monitor" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* Session Status Top Bar */}
            <div className="p-4 rounded-2xl bg-white border border-[#D5E0D0] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#2D6A4F] text-white flex items-center justify-center">
                  <Sprout className="w-5 h-5 text-[#D8F3DC]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-[#163828]">
                      {activeProfile.commonName}
                    </h2>
                    <span className="text-xs text-[#52796F] italic">
                      ({activeProfile.scientificName})
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EBF2E8] text-[#2D6A4F] font-bold">
                      Session: {sessionId}
                    </span>
                  </div>
                  <p className="text-xs text-[#748E84]">
                    Optimal: {activeProfile.temperatureGuidance.optimal}°C • Moisture Target: {activeProfile.moistureGuidance.monitoringTarget}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsHardwareModalOpen(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    telemetry.is_hardware_live || serialConnected
                      ? "bg-[#EBF2E8] text-[#2D6A4F] border-[#B7D1C5] hover:bg-[#DDF0DC]"
                      : "bg-[#FFF9F5] text-[#C85038] border-[#F2C4B8] hover:bg-[#FDECE8]"
                  }`}
                  title="Connect physical Arduino Uno (COM port)"
                >
                  <Usb className="w-3.5 h-3.5" />
                  <span>
                    {telemetry.is_hardware_live || serialConnected
                      ? "Hardware Connected"
                      : "Connect Hardware"}
                  </span>
                </button>
                <button
                  onClick={() => setIsPlantSearchOpen(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#2D6A4F] hover:bg-[#EBF2E8] border border-[#D5E0D0] transition-all"
                >
                  Change Seed
                </button>
                <button
                  onClick={handleTriggerJuryDemo}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#E76F51]/10 text-[#C85038] hover:bg-[#E76F51]/20 border border-[#E76F51]/30 transition-all flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 text-[#E76F51]" />
                  <span>Jury Tour</span>
                </button>
              </div>
            </div>

            {/* Central Two-Column Layout: 40-Cell Tray (Left) + Selected Cell Inspector (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column (7 Cols): 40-Cell Tray Matrix */}
              <div className="lg:col-span-7">
                <TrayMatrix
                  cells={cells}
                  selectedCellId={selectedCellId}
                  onSelectCell={(id) => setSelectedCellId(id)}
                  plantName={activeProfile.commonName}
                  scientificName={activeProfile.scientificName}
                />
              </div>

              {/* Right Column (5 Cols): Selected Cell Inspector & Growth Story */}
              <div className="lg:col-span-5 space-y-6">
                <CellDetailInspector
                  cell={selectedCell}
                  plantName={activeProfile.commonName}
                  onVerifyLabel={handleVerifyLabel}
                />

                <ChiguruInsightCard
                  selectedCellId={selectedCellId}
                  plantName={activeProfile.commonName}
                  scientificName={activeProfile.scientificName}
                  currentEmergenceCount={cells.filter((c) => c.state === "GROWING" || c.state === "EMERGING").length}
                />
              </div>

            </div>

            {/* Environment -> Growth Synchronized Interactive Timeline */}
            <EnvGrowthTimeline timeline={timeline} />

            {/* Live Sensor & Actuator Channels */}
            <LiveSensorDeck
              temperature={telemetry.temp1}
              humidity={telemetry.hum1}
              moistureIndex1={telemetry.soil1}
              moistureIndex2={telemetry.soil2}
              gasRaw={telemetry.gas}
              pumpState={telemetry.pump}
              fanState={telemetry.fan}
              ventAngle={telemetry.vent_angle}
              isHardwareLive={telemetry.is_hardware_live}
              modeLabel={telemetry.mode === 0 ? "STORAGE" : telemetry.mode === 1 ? "GERMINATION" : "FIELD"}
              onOpenHardwareModal={() => setIsHardwareModalOpen(true)}
            />

            {/* Remote Actuator Control Deck */}
            <ActuatorControls
              lang={lang}
              pumpState={telemetry.pump}
              fanState={telemetry.fan}
              onSendCommand={sendCommand}
            />

          </div>
        )}

        {/* VIEW C: RESEARCH & DATASET LEARNING */}
        {activeTab === "research" && (
          <ResearchDashboard
            cells={cells}
            plantName={activeProfile.commonName}
            scientificName={activeProfile.scientificName}
          />
        )}

        {/* VIEW D: TECHNOLOGY & HARDWARE ARCHITECTURE */}
        {activeTab === "technology" && (
          <TechnologyView lang={lang} />
        )}

        {/* VIEW E: SCIENTIFIC REFERENCES */}
        {activeTab === "references" && (
          <ReferencesDrawer />
        )}

      </main>

      {/* 3. Global Modals */}
      <PlantSearchModal
        isOpen={isPlantSearchOpen}
        onClose={() => setIsPlantSearchOpen(false)}
        onProfileSelected={handleProfileSelected}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthenticated={(u) => setUser(u)}
      />

      <HardwareModal
        isOpen={isHardwareModalOpen}
        onClose={() => setIsHardwareModalOpen(false)}
        serialConnected={serialConnected}
        isConnecting={isConnectingSerial}
        onConnectSerial={connectSerial}
        onDisconnectSerial={disconnectSerial}
        telemetry={telemetry}
        onSendCommand={sendCommand}
      />

      {/* 4. Footer */}
      <footer className="w-full border-t border-[#E2E8DC] bg-white/80 py-6 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#52796F]">
          <div className="flex items-center gap-2 font-medium">
            <span className="font-bold text-[#163828]">CHIGURU (ಚಿಗುರು)</span>
            <span>·</span>
            <span>TerraByte</span>
            <span>·</span>
            <span>YEN NOVA 1.0</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Yenepoya Institute of Technology, Moodbidri</span>
            <span>·</span>
            <span className="text-[#2D6A4F] font-bold">“Tell Chiguru the seed. We record the story.”</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
