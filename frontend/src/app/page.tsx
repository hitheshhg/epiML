"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Cpu,
  Shield,
  ArrowRight,
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  Usb,
  RotateCcw,
  Sliders,
  Play,
  Square,
  Download,
  Layers,
  Thermometer,
  Droplets,
  Wind,
  LogOut,
  ChevronRight,
  ExternalLink,
  ChevronLeft,
  X,
  Loader2,
  FlaskConical,
  User as UserIcon,
  LayoutDashboard,
  Lock,
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SeedProtocol, SensorReading } from "@/lib/types";
import { DEFAULT_SEED_PROTOCOLS, generateCustomProtocol } from "@/lib/protocols";
import { evaluateDeterministicControl } from "@/lib/control-engine";
import { supabase } from "@/lib/supabase/client";
import LoginModal from "@/components/chiguru/LoginModal";
import AdminLoginModal from "@/components/chiguru/AdminLoginModal";
import UserDashboard from "@/components/chiguru/UserDashboard";
import TraySowingCanvas, { SownSeedPin } from "@/components/chiguru/TraySowingCanvas";
import AdminMLCenter from "@/components/chiguru/AdminMLCenter";
import PredictionDeck from "@/components/chiguru/PredictionDeck";

// Clean GitHub Octocat SVG
function GitHubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export default function HomePage() {
  // Navigation State
  // "landing" = Main Landing Page
  // "dashboard" = User Profile & Experiment Histories
  // "step-1" = What are you experimenting with? (Seed selection)
  // "step-tray" = 2D Mud Nursery Tray Sowing & Mud Sampling
  // "step-2" = AI Protocol Generation
  // "step-3" = Deterministic Hardware Link
  // "admin-ml" = Admin ML Training & Model Management Center
  // "step-4" = Live Laboratory Chamber Cockpit
  const [viewState, setViewState] = useState<"landing" | "dashboard" | "admin-ml" | "step-1" | "step-tray" | "step-2" | "step-3" | "step-4">("landing");

  // Authentication State
  const [user, setUser] = useState<{ id: string; email: string; name?: string } | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Admin-Exclusive Security State (Model Training & Management exclusive to admin)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState<boolean>(false);

  // Selected seed protocol
  const [selectedProtocol, setSelectedProtocol] = useState<SeedProtocol>(DEFAULT_SEED_PROTOCOLS[3]); // Default Tomato
  const [searchQuery, setSearchQuery] = useState("");
  const [customSeedName, setCustomSeedName] = useState("");
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  // 2D Mud Nursery Tray Sowing State
  const [sownPins, setSownPins] = useState<SownSeedPin[]>([]);
  const [trayImageUrl, setTrayImageUrl] = useState<string>("/images/nursery_soil_tray.jpg");
  const [activeExperiment, setActiveExperiment] = useState<any>(null);
  const [actuationsCounter, setActuationsCounter] = useState<number>(0);
  const [cockpitTrayTab, setCockpitTrayTab] = useState<"mud" | "matrix">("mud");

  // Live Hardware / Telemetry State
  const [telemetry, setTelemetry] = useState<SensorReading>({
    timestamp: new Date().toISOString(),
    temperature: 24.8,
    humidity: 76.5,
    soilMoisture1: 72,
    soilMoisture2: 70,
    gasPpm: 38,
    lux: 450,
    isLiveHardware: false,
  });

  const [actuators, setActuators] = useState({
    pump: 0,
    ventAngle: 30,
    fan: 0,
    lastCommandReason: "Nominal conditions maintained.",
  });

  const [serialConnected, setSerialConnected] = useState(false);
  const serialPortRef = useRef<any>(null);
  const serialWriterRef = useRef<any>(null);
  const telemetrySamplesRef = useRef<any[]>([]);
  const experimentStartTimeRef = useRef<number>(Date.now());

  // 40-cell tray simulation
  const [cells, setCells] = useState<Array<{ id: string; state: "SOWN" | "EMERGING" | "GROWING" }>>(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: `C${String(i + 1).padStart(2, "0")}`,
      state: "SOWN",
    }))
  );

  // Synchronize authenticated session reliably on mount and on auth change
  useEffect(() => {
    if (typeof window !== "undefined") {
      // 1. Instant check from local cache
      const stored = localStorage.getItem("chiguru_auth_user");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {}
      }

      // Check admin clearance session
      const adminStored = localStorage.getItem("epiml_admin_auth") || sessionStorage.getItem("epiml_admin_auth");
      if (adminStored) {
        try {
          const parsed = JSON.parse(adminStored);
          if (parsed && (parsed.role === "admin" || parsed.username === "admin")) {
            setIsAdminAuthenticated(true);
          }
        } catch {}
      }

      // 2. Sync with Supabase session
      if (supabase) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            const authedUser = {
              id: session.user.id,
              email: session.user.email || "",
              name:
                (session.user.user_metadata?.full_name as string) ||
                (session.user.user_metadata?.name as string) ||
                session.user.email?.split("@")[0] ||
                "Researcher",
            };
            setUser(authedUser);
            localStorage.setItem("chiguru_auth_user", JSON.stringify(authedUser));
          }
        });

        // 3. Listen to live auth changes (login, logout, refresh across tabs)
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
          if (session?.user) {
            const authedUser = {
              id: session.user.id,
              email: session.user.email || "",
              name:
                (session.user.user_metadata?.full_name as string) ||
                (session.user.user_metadata?.name as string) ||
                session.user.email?.split("@")[0] ||
                "Researcher",
            };
            setUser(authedUser);
            localStorage.setItem("chiguru_auth_user", JSON.stringify(authedUser));
          } else if (event === "SIGNED_OUT") {
            setUser(null);
            localStorage.removeItem("chiguru_auth_user");
            localStorage.removeItem("epiml_active_experiment");
            setActiveExperiment(null);
            setViewState("landing");
          }
        });

        // Scrub any legacy mock experiment IDs from cache
        const storedExps = localStorage.getItem("epiml_user_experiments");
        if (storedExps) {
          try {
            const parsed = JSON.parse(storedExps);
            if (Array.isArray(parsed)) {
              const scrubbed = parsed.filter(
                (item: any) =>
                  item &&
                  item.id &&
                  !item.id.includes("EXP-2026-WHT-011") &&
                  !item.id.includes("EXP-2026-TOM-042") &&
                  !item.id.includes("EXP-2026-RIC-019") &&
                  !item.id.includes("EXP-2026-MAI-007") &&
                  !item.id.includes("EXP-2026-MNG-003")
              );
              localStorage.setItem("epiml_user_experiments", JSON.stringify(scrubbed));
            }
          } catch {}
        }

        // Restore active running experiment if present
        const activeStored = localStorage.getItem("epiml_active_experiment");
        if (activeStored) {
          try {
            const parsed = JSON.parse(activeStored);
            if (
              parsed &&
              parsed.status === "RUNNING" &&
              !parsed.id?.includes("EXP-2026-WHT-011") &&
              !parsed.id?.includes("EXP-2026-TOM-042")
            ) {
              setActiveExperiment(parsed);
              if (parsed.sownPins && parsed.sownPins.length > 0) setSownPins(parsed.sownPins);
              if (parsed.trayImageUrl) setTrayImageUrl(parsed.trayImageUrl);
              if (parsed.telemetryHistory && parsed.telemetryHistory.length > 0) {
                telemetrySamplesRef.current = parsed.telemetryHistory;
              }
            } else {
              localStorage.removeItem("epiml_active_experiment");
            }
          } catch {}
        }

        return () => {
          authListener?.subscription?.unsubscribe();
        };
      }
    }
  }, []);

  // Handle URL deep-link parameters (e.g. `/?view=dashboard` or `/?step=1`)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const cached = localStorage.getItem("chiguru_auth_user");
      if (urlParams.get("view") === "dashboard") {
        if (user || cached) {
          setViewState("dashboard");
        } else {
          setIsAuthModalOpen(true);
        }
      } else if (urlParams.get("step") === "1") {
        if (user || cached) {
          setViewState("step-1");
        } else {
          setIsAuthModalOpen(true);
        }
      } else if (urlParams.get("view") === "admin" || urlParams.get("view") === "admin-ml") {
        setViewState("admin-ml");
      }
    }
  }, [user]);

  // Auth Guard: Never allow viewing dashboard or experiment steps 1-4 without an authenticated session
  useEffect(() => {
    if (viewState !== "landing" && viewState !== "admin-ml" && !user) {
      const cached = typeof window !== "undefined" ? localStorage.getItem("chiguru_auth_user") : null;
      if (!cached) {
        setViewState("landing");
        setIsAuthModalOpen(true);
      }
    }
  }, [viewState, user]);

  // Enforced handler: Require login before starting experiment
  const handleStartExperiment = () => {
    const cached = typeof window !== "undefined" ? localStorage.getItem("chiguru_auth_user") : null;
    if (!user && !cached) {
      setIsAuthModalOpen(true);
      return;
    }
    setViewState("step-1");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenDashboard = () => {
    const cached = typeof window !== "undefined" ? localStorage.getItem("chiguru_auth_user") : null;
    if (!user && !cached) {
      setIsAuthModalOpen(true);
      return;
    }
    setViewState("dashboard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Poll /api/telemetry continuously every 1.5s in step-4
  useEffect(() => {
    if (viewState !== "step-4") return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/telemetry");
        if (res.ok) {
          const data = await res.json();
          const reading: SensorReading = {
            timestamp: new Date().toISOString(),
            temperature: data.temp1 ?? 24.8,
            humidity: data.hum1 ?? 76.5,
            soilMoisture1: data.soil1 ?? 72,
            soilMoisture2: data.soil2 ?? 70,
            gasPpm: data.gas ?? 38,
            lux: 450,
            isLiveHardware: serialConnected || Boolean(data.is_hardware_live),
          };
          setTelemetry(reading);

          // Evaluate deterministic closed-loop control against active epoch
          const activeEpoch = selectedProtocol.epochs[0];
          const control = evaluateDeterministicControl(activeEpoch, reading);
          setActuators({
            pump: control.pumpState,
            ventAngle: control.ventAngle,
            fan: control.fanState,
            lastCommandReason: control.reason,
          });

          if (control.pumpState === 1 || control.fanState === 1) {
            setActuationsCounter((prev) => prev + 1);
          }

          // Accumulate telemetry samples for ML training dataset
          telemetrySamplesRef.current.push({
            sample_index: telemetrySamplesRef.current.length + 1,
            timestamp: reading.timestamp,
            temperature_c: reading.temperature,
            humidity_rh_pct: reading.humidity,
            soil_moisture_1: reading.soilMoisture1,
            soil_moisture_2: reading.soilMoisture2,
            soil_moisture_avg: Number(((reading.soilMoisture1 + reading.soilMoisture2) / 2).toFixed(1)),
            gas_ppm: reading.gasPpm,
            lux: reading.lux,
            pump_state: control.pumpState,
            vent_angle_deg: control.ventAngle,
            fan_state: control.fanState,
            control_action_reason: control.reason,
            hardware_linked: reading.isLiveHardware,
          });
        }
      } catch {}
    }, 1500);

    return () => clearInterval(interval);
  }, [viewState, selectedProtocol, serialConnected]);

  // Serial hardware communication
  const handleConnectHardware = async () => {
    if (typeof navigator === "undefined" || !("serial" in navigator)) {
      alert("Web Serial API is supported in Google Chrome, Microsoft Edge, and Opera.");
      return;
    }

    try {
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 115200 });
      serialPortRef.current = port;

      const encoder = new TextEncoderStream();
      encoder.readable.pipeTo(port.writable);
      serialWriterRef.current = encoder.writable.getWriter();
      setSerialConnected(true);

      // Send initial protocol handshake
      await serialWriterRef.current.write(`PROTOCOL:${selectedProtocol.commonName.toUpperCase()}\n`);
    } catch (err) {
      console.warn("Serial connection canceled or failed:", err);
    }
  };

  const sendSerialCommand = async (cmd: string) => {
    if (serialWriterRef.current) {
      try {
        await serialWriterRef.current.write(`${cmd}\n`);
      } catch {}
    }
  };

  // Filter seeds based on search query
  const filteredProtocols = DEFAULT_SEED_PROTOCOLS.filter(
    (p) =>
      p.commonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.scientificName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectSeed = (proto: SeedProtocol) => {
    setSelectedProtocol(proto);
    setViewState("step-tray");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCustomSeedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSeedName.trim()) return;
    const customProto = generateCustomProtocol(customSeedName.trim());
    setSelectedProtocol(customProto);
    setIsCustomModalOpen(false);
    setCustomSeedName("");
    setViewState("step-tray");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleConfirmTrayMapping = (pins: SownSeedPin[], trayImg: string) => {
    setSownPins(pins);
    setTrayImageUrl(trayImg);
    // Synchronize cells matrix state
    const mappedCells = pins.map((p) => ({
      id: p.cellId,
      state: p.state,
    }));
    setCells(
      mappedCells.length > 0
        ? mappedCells
        : Array.from({ length: 40 }, (_, i) => ({
            id: `C${String(i + 1).padStart(2, "0")}`,
            state: "SOWN" as const,
          }))
    );
    setViewState("step-2");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLaunchExperiment = async () => {
    // Generate valid RFC4122 UUID for Postgres PRIMARY KEY
    const expUuid =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          });

    const expCode = `EXP-${new Date().getFullYear()}-${selectedProtocol.commonName.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const nowIso = new Date().toISOString();
    const formattedStartTime = new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    experimentStartTimeRef.current = Date.now();

    // Initial telemetry sample
    const initialSample = {
      sample_index: 1,
      timestamp: nowIso,
      temperature_c: telemetry.temperature,
      humidity_rh_pct: telemetry.humidity,
      soil_moisture_1: telemetry.soilMoisture1,
      soil_moisture_2: telemetry.soilMoisture2,
      soil_moisture_avg: Number(((telemetry.soilMoisture1 + telemetry.soilMoisture2) / 2).toFixed(1)),
      gas_ppm: telemetry.gasPpm,
      lux: telemetry.lux,
      pump_state: actuators.pump,
      vent_angle_deg: actuators.ventAngle,
      fan_state: actuators.fan,
      control_action_reason: actuators.lastCommandReason,
      hardware_linked: telemetry.isLiveHardware,
    };
    telemetrySamplesRef.current = [initialSample];

    const initialPhenotype = [
      {
        timestamp: nowIso,
        emerged_count: 0,
        total_count: sownPins.length > 0 ? sownPins.length : 40,
        emergence_pct: 0.0,
        cell_states: cells,
        sown_pins: sownPins,
      },
    ];

    const newExp = {
      id: expUuid,
      experimentCode: expCode,
      cropName: selectedProtocol.commonName,
      scientificName: selectedProtocol.scientificName,
      emoji: selectedProtocol.emoji,
      status: "RUNNING" as const,
      startedAt: formattedStartTime,
      durationDays: 1,
      durationSeconds: 0,
      emergenceRatePct: 0.0,
      cellsEmerged: 0,
      totalCells: sownPins.length > 0 ? sownPins.length : 40,
      avgTemp: telemetry.temperature || selectedProtocol.epochs[0]?.tempRange.optimal || 24.5,
      avgHumidity: telemetry.humidity || selectedProtocol.epochs[0]?.humidityRange.optimal || 75.0,
      avgSoilMoisture: Number(((telemetry.soilMoisture1 + telemetry.soilMoisture2) / 2).toFixed(1)),
      avgGasPpm: telemetry.gasPpm || 38.0,
      actuationsTotal: 0,
      currentEpochName: selectedProtocol.epochs[0]?.name || "Epoch 1: Imbibition & Radicle Anchor",
      sownPins: sownPins,
      trayImageUrl: trayImageUrl,
      telemetryHistory: telemetrySamplesRef.current,
      phenotypeHistory: initialPhenotype,
      protocolSnapshot: selectedProtocol,
    };

    setActiveExperiment(newExp);
    setActuationsCounter(0);

    // 1. Immediately store in localStorage so it appears in the dashboard & active cache
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("epiml_active_experiment", JSON.stringify(newExp));
        const stored = localStorage.getItem("epiml_user_experiments");
        const list = stored ? JSON.parse(stored) : [];
        localStorage.setItem(
          "epiml_user_experiments",
          JSON.stringify([newExp, ...list.filter((x: any) => x.id !== expUuid)])
        );
      } catch {}
    }

    // 2. Persist in Supabase public.experiments table under user_id
    if (supabase && user?.id) {
      try {
        await supabase.from("experiments").insert([
          {
            id: expUuid,
            user_id: user.id,
            experiment_code: expCode,
            crop_name: newExp.cropName,
            scientific_name: newExp.scientificName,
            emoji: newExp.emoji,
            status: "ACTIVE",
            current_epoch_name: newExp.currentEpochName,
            current_day: 1,
            duration_days: 1,
            duration_seconds: 0,
            target_temp: newExp.avgTemp,
            target_humidity: newExp.avgHumidity,
            avg_temp: newExp.avgTemp,
            avg_humidity: newExp.avgHumidity,
            avg_soil_moisture: newExp.avgSoilMoisture,
            avg_gas_ppm: newExp.avgGasPpm,
            emergence_rate_pct: 0.0,
            cells_emerged: 0,
            total_cells: newExp.totalCells,
            actuations_total: 0,
            sown_pins: sownPins,
            tray_image_url: trayImageUrl,
            telemetry_history: telemetrySamplesRef.current,
            phenotype_history: initialPhenotype,
            protocol_snapshot: selectedProtocol,
            started_at: nowIso,
          },
        ]);
      } catch (err) {
        console.warn("Supabase experiment save note:", err);
      }
    }

    setViewState("step-4");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCompleteExperiment = async () => {
    const emergedCount = cells.filter((c) => c.state === "GROWING" || c.state === "EMERGING").length;
    const totalCount = cells.length > 0 ? cells.length : 40;
    const emergencePct = Number(((emergedCount / totalCount) * 100).toFixed(1));
    const targetId = activeExperiment?.id;
    const samples = telemetrySamplesRef.current;
    const durationSec = Math.max(1, Math.round((Date.now() - experimentStartTimeRef.current) / 1000));
    const completedIso = new Date().toISOString();
    const completedFormatted = new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Compute aggregate averages from all collected telemetry samples for ML training accuracy
    const avgTemp =
      samples.length > 0
        ? Number((samples.reduce((acc, s) => acc + (s.temperature_c ?? 24.5), 0) / samples.length).toFixed(1))
        : activeExperiment?.avgTemp || 24.5;
    const avgHum =
      samples.length > 0
        ? Number((samples.reduce((acc, s) => acc + (s.humidity_rh_pct ?? 75.0), 0) / samples.length).toFixed(1))
        : activeExperiment?.avgHumidity || 75.0;
    const avgSoil =
      samples.length > 0
        ? Number((samples.reduce((acc, s) => acc + (s.soil_moisture_avg ?? 70.0), 0) / samples.length).toFixed(1))
        : 70.0;
    const avgGas =
      samples.length > 0
        ? Number((samples.reduce((acc, s) => acc + (s.gas_ppm ?? 38.0), 0) / samples.length).toFixed(1))
        : 38.0;

    const finalPhenotypeSnapshot = [
      ...(activeExperiment?.phenotypeHistory || []),
      {
        timestamp: completedIso,
        emerged_count: emergedCount,
        total_count: totalCount,
        emergence_pct: emergencePct,
        cell_states: cells,
        sown_pins: sownPins,
      },
    ];

    // 1. Update localStorage
    if (typeof window !== "undefined" && targetId) {
      try {
        localStorage.removeItem("epiml_active_experiment");
        const stored = localStorage.getItem("epiml_user_experiments");
        const list = stored ? JSON.parse(stored) : [];
        const updated = list.map((item: any) => {
          if (item.id === targetId) {
            return {
              ...item,
              status: "COMPLETED",
              completedAt: completedFormatted,
              durationSeconds: durationSec,
              emergenceRatePct: emergencePct,
              cellsEmerged: emergedCount,
              avgTemp: avgTemp,
              avgHumidity: avgHum,
              avgSoilMoisture: avgSoil,
              avgGasPpm: avgGas,
              actuationsTotal: actuationsCounter,
              telemetryHistory: samples,
              phenotypeHistory: finalPhenotypeSnapshot,
            };
          }
          return item;
        });
        localStorage.setItem("epiml_user_experiments", JSON.stringify(updated));
      } catch {}
    }

    // 2. Update Supabase
    if (supabase && user?.id && targetId) {
      try {
        await supabase
          .from("experiments")
          .update({
            status: "COMPLETED",
            emergence_rate_pct: emergencePct,
            cells_emerged: emergedCount,
            avg_temp: avgTemp,
            avg_humidity: avgHum,
            avg_soil_moisture: avgSoil,
            avg_gas_ppm: avgGas,
            actuations_total: actuationsCounter,
            duration_seconds: durationSec,
            telemetry_history: samples,
            phenotype_history: finalPhenotypeSnapshot,
            completed_at: completedIso,
            updated_at: completedIso,
          })
          .eq("id", targetId);
      } catch (err) {
        console.warn("Supabase experiment update note:", err);
      }
    }

    setActiveExperiment(null);
    setViewState("dashboard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTogglePinState = (pinId: string) => {
    setSownPins((prev) =>
      prev.map((pin) => {
        if (pin.id === pinId) {
          const nextState =
            pin.state === "SOWN"
              ? "EMERGING"
              : pin.state === "EMERGING"
              ? "GROWING"
              : "SOWN";
          return { ...pin, state: nextState };
        }
        return pin;
      })
    );

    // Also sync cells
    setCells((prev) =>
      prev.map((c) => {
        const matchingPin = sownPins.find((p) => p.id === pinId);
        if (matchingPin && c.id === matchingPin.cellId) {
          const nextState =
            c.state === "SOWN"
              ? "EMERGING"
              : c.state === "EMERGING"
              ? "GROWING"
              : "SOWN";
          return { ...c, state: nextState };
        }
        return c;
      })
    );
  };

  const handleSignOut = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("chiguru_auth_user");
      localStorage.removeItem("epiml_admin_auth");
      sessionStorage.removeItem("epiml_admin_auth");
    }
    setUser(null);
    setIsAdminAuthenticated(false);
  };

  const handleExitAdminMode = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("epiml_admin_auth");
      sessionStorage.removeItem("epiml_admin_auth");
    }
    setIsAdminAuthenticated(false);
    setViewState(user ? "dashboard" : "landing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      
      {/* ========================================================================= */}
      {/* GLOBAL HEADER */}
      {/* ========================================================================= */}
      <header className="w-full border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <button
            onClick={() => {
              if (user) {
                setViewState("dashboard");
              } else {
                setViewState("landing");
              }
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-2 hover:opacity-85 transition-opacity"
          >
            <span className="text-xl">🌱</span>
            <span className="font-mono text-xl font-light tracking-tight text-foreground">
              epiML
            </span>
          </button>

          {/* Right Header Navigation */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                {/* 1. Dashboard Navigation Tab */}
                <Button
                  variant={viewState === "dashboard" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setViewState("dashboard");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`rounded-xl text-xs sm:text-sm h-9 px-3 font-medium transition-all ${
                    viewState === "dashboard"
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 mr-1.5" />
                  <span>Dashboard</span>
                </Button>

                {/* 2. Experiment Section Navigation Tab */}
                <Button
                  variant={viewState.startsWith("step-") ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setViewState("step-1");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`rounded-xl text-xs sm:text-sm h-9 px-3 font-medium transition-all ${
                    viewState.startsWith("step-")
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <FlaskConical className="w-3.5 h-3.5 mr-1.5" />
                  <span>Experiment Lab</span>
                  {viewState.startsWith("step-") && (
                    <span className="ml-1.5 text-[10px] font-mono opacity-80">
                      ({viewState === "step-tray" ? "Tray" : `${viewState.replace("step-", "")}/4`})
                    </span>
                  )}
                </Button>

                {/* 3. Admin ML Training & Model Management Tab (Exclusive to Authenticated Admin) */}
                {isAdminAuthenticated ? (
                  <Button
                    variant={viewState === "admin-ml" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setViewState("admin-ml");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`rounded-xl text-xs sm:text-sm h-9 px-3 font-medium transition-all ${
                      viewState === "admin-ml"
                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                        : "border-primary/40 text-primary hover:bg-primary/10"
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                    <span>Admin ML Center</span>
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAdminAuthModalOpen(true)}
                    className="rounded-xl text-xs sm:text-sm h-9 px-2.5 text-muted-foreground hover:text-foreground"
                    title="Administrator Model Management Portal"
                  >
                    <Lock className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                    <span>Admin Portal</span>
                  </Button>
                )}

                <div className="h-4 w-px bg-border mx-0.5 hidden sm:block" />

                {/* Profile Pill */}
                <div
                  onClick={() => {
                    setViewState("dashboard");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-muted/60 border border-border/80 text-xs cursor-pointer hover:bg-muted transition-colors"
                  title="View Profile on Dashboard"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-mono text-foreground font-medium max-w-[120px] truncate">
                    {user.name || user.email.split("@")[0]}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-xs text-muted-foreground hover:text-foreground h-9 px-2 rounded-xl"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAdminAuthModalOpen(true)}
                  className="rounded-xl text-xs sm:text-sm h-9 px-2.5 text-muted-foreground hover:text-foreground"
                  title="Admin Security Portal"
                >
                  <Lock className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                  <span>Admin</span>
                </Button>
                <Link
                  href="/auth/login"
                  className="text-xs sm:text-sm text-foreground hover:text-primary transition-colors px-3 py-1.5 font-medium"
                >
                  Sign In
                </Link>
                <Button
                  onClick={handleStartExperiment}
                  size="sm"
                  className="rounded-xl bg-primary text-primary-foreground font-medium text-xs sm:text-sm h-9 px-4 hover:opacity-90 transition-all"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN CONTAINER */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col justify-start">
        <AnimatePresence mode="wait">
          
          {/* ===================================================================== */}
          {/* VIEW 1: LANDING PAGE (EXACT REPLICA OF IMAGE 1) */}
          {/* ===================================================================== */}
          {viewState === "landing" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-16 sm:py-24 max-w-5xl mx-auto w-full text-center"
            >
              
              {/* Top Pill Badge */}
              <div className="mb-8">
                <Badge className="px-4 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-full text-xs sm:text-sm font-medium">
                  Hackathon Prototype · Open Source
                </Badge>
              </div>

              {/* Hero Title */}
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-light tracking-tight text-foreground max-w-4xl leading-[1.1]">
                AI Crop Experiment Lab
              </h1>

              {/* Tagline */}
              <p className="mt-6 text-base sm:text-lg md:text-xl text-muted-foreground font-normal max-w-2xl mx-auto leading-relaxed">
                One Arduino. Three biological epochs. AI-designed protocols. Deterministic control. Scientist-grade evidence.
              </p>

              {/* CTA Row */}
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
                <Button
                  onClick={handleStartExperiment}
                  size="lg"
                  className="w-full sm:w-auto h-12 px-8 rounded-xl bg-primary text-primary-foreground font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  <FlaskConical className="w-4 h-4" />
                  <span>Start Experiment</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>

                {user && (
                  <Button
                    onClick={handleOpenDashboard}
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto h-12 px-6 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-medium text-sm sm:text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                  >
                    <LayoutDashboard className="w-4 h-4 text-primary" />
                    <span>View Dashboard</span>
                  </Button>
                )}

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto h-12 px-6 rounded-xl border border-border bg-background hover:bg-muted text-foreground font-medium text-sm sm:text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                >
                  <a
                    href="https://github.com/hitheshhg/epiML"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <GitHubIcon className="w-4 h-4" />
                    <span>View Source</span>
                  </a>
                </Button>
              </div>

              {/* 3 Feature Cards */}
              <div className="mt-20 w-full grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                
                {/* Feature 1 */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="rounded-2xl border border-border bg-card p-6 h-full hover:border-primary/40 transition-all shadow-xs">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-base text-foreground mb-2">
                      AI Protocol Generation
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Gemini 1.5 Flash creates biologically-grounded protocols synthesized from seed science literature.
                    </p>
                  </Card>
                </motion.div>

                {/* Feature 2 */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="rounded-2xl border border-border bg-card p-6 h-full hover:border-primary/40 transition-all shadow-xs">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                      <Cpu className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-base text-foreground mb-2">
                      Deterministic Control Engine
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      C++ firmware runs safety-first closed-loop actuation without cloud latency or hallucinations.
                    </p>
                  </Card>
                </motion.div>

                {/* Feature 3 */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card className="rounded-2xl border border-border bg-card p-6 h-full hover:border-primary/40 transition-all shadow-xs">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-base text-foreground mb-2">
                      Full Traceability
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Every sensor reading, control decision, and anomaly logged with scientist-grade evidence.
                    </p>
                  </Card>
                </motion.div>

              </div>

              {/* Hardware Spec Line & Version Badge */}
              <div className="mt-20 pt-8 border-t border-border w-full flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground font-mono gap-3">
                <div>
                  ATmega328P · DHT22 · Capacitive Soil Moisture · Servo Vent · 5V Relay Pump
                </div>
                <div>
                  epiML v2.0 · Open Source Agronomy Lab
                </div>
              </div>

            </motion.div>
          )}

          {/* ===================================================================== */}
          {/* VIEW: RESEARCHER DASHBOARD & EXPERIMENT HISTORIES */}
          {/* ===================================================================== */}
          {viewState === "dashboard" && user && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex-1 flex flex-col items-center justify-start w-full"
            >
              <UserDashboard
                user={user}
                onStartNewExperiment={() => {
                  setViewState("step-1");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onResumeActiveExperiment={(runningExp) => {
                  if (runningExp) {
                    setActiveExperiment(runningExp);
                    if (runningExp.sownPins && runningExp.sownPins.length > 0) {
                      setSownPins(runningExp.sownPins);
                    }
                    if (runningExp.trayImageUrl) setTrayImageUrl(runningExp.trayImageUrl);
                    if (runningExp.telemetryHistory && runningExp.telemetryHistory.length > 0) {
                      telemetrySamplesRef.current = runningExp.telemetryHistory;
                    }
                    const matchedProto = DEFAULT_SEED_PROTOCOLS.find(
                      (p) => p.commonName.toLowerCase() === runningExp.cropName.toLowerCase()
                    );
                    if (matchedProto) setSelectedProtocol(matchedProto);
                  }
                  setViewState("step-4");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onRerunProtocol={(proto) => {
                  setSelectedProtocol(proto);
                  setViewState("step-2");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onOpenMLCenter={() => {
                  if (isAdminAuthenticated) {
                    setViewState("admin-ml");
                  } else {
                    setIsAdminAuthModalOpen(true);
                  }
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                isAdmin={isAdminAuthenticated}
                onOpenAdminLogin={() => setIsAdminAuthModalOpen(true)}
              />
            </motion.div>
          )}

          {/* ===================================================================== */}
          {/* VIEW: ADMIN ML TRAINING & MODEL MANAGEMENT CENTER (ADMIN-EXCLUSIVE) */}
          {/* ===================================================================== */}
          {viewState === "admin-ml" && (
            <motion.div
              key="admin-ml"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex-1 flex flex-col items-center justify-start w-full px-4 sm:px-6 py-8"
            >
              {!isAdminAuthenticated ? (
                <div className="w-full max-w-md mx-auto py-8">
                  <Card className="p-8 rounded-2xl border border-border bg-card shadow-xl space-y-6">
                    <div className="flex items-center gap-3 border-b border-border pb-4">
                      <div className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
                        <Lock className="w-5 h-5 text-destructive" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-foreground tracking-tight">
                          Admin Clearance Gate
                        </h2>
                        <Badge variant="outline" className="text-[10px] font-mono border-destructive/30 text-destructive">
                          ML Center Restricted
                        </Badge>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Model training, multi-user experimental telemetry aggregation, and production model deployment are <strong>exclusive to the Administrator Dashboard</strong>. Please enter the admin credentials below to unlock.
                    </p>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const target = e.currentTarget;
                        const u = (target.elements.namedItem("gate_user") as HTMLInputElement)?.value.trim().toLowerCase();
                        const p = (target.elements.namedItem("gate_pass") as HTMLInputElement)?.value.trim();
                        if ((u === "admin" || u === "admin@epiml.ai" || u === "administrator") && p === "admin") {
                          const sess = { username: u, role: "admin", authenticatedAt: new Date().toISOString() };
                          localStorage.setItem("epiml_admin_auth", JSON.stringify(sess));
                          sessionStorage.setItem("epiml_admin_auth", JSON.stringify(sess));
                          setIsAdminAuthenticated(true);
                        } else {
                          alert("Invalid credentials! Access requires admin username and admin password.");
                        }
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">
                          Admin Username
                        </label>
                        <Input
                          name="gate_user"
                          type="text"
                          defaultValue="admin"
                          className="rounded-xl h-10 text-xs font-mono"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">
                          Admin Password
                        </label>
                        <Input
                          name="gate_pass"
                          type="password"
                          placeholder="•••••"
                          className="rounded-xl h-10 text-xs font-mono"
                          required
                        />
                      </div>
                      <div className="pt-2 flex items-center justify-between gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setViewState(user ? "dashboard" : "landing")}
                          className="w-1/2 rounded-xl text-xs h-10"
                        >
                          Return to App
                        </Button>
                        <Button
                          type="submit"
                          className="w-1/2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs h-10"
                        >
                          Unlock ML Center
                        </Button>
                      </div>
                    </form>
                  </Card>
                </div>
              ) : (
                <div className="w-full space-y-4">
                  {/* Active Admin Session Status Bar */}
                  <div className="max-w-6xl mx-auto w-full px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-semibold">Administrator Session Active:</span>
                      <span className="font-mono">admin</span>
                      <span className="hidden sm:inline opacity-70">• Model Training & Deployment Controls Unlocked</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExitAdminMode}
                      className="h-7 px-2.5 rounded-lg text-[11px] border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10"
                    >
                      <LogOut className="w-3 h-3 mr-1" />
                      Exit Admin Mode
                    </Button>
                  </div>

                  <AdminMLCenter
                    currentUser={{
                      id: "admin-master",
                      email: "admin@epiml.ai",
                      name: "System Administrator",
                      role: "admin",
                    }}
                    onBackToDashboard={() => {
                      setViewState(user ? "dashboard" : "landing");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  />
                </div>
              )}
            </motion.div>
          )}

          {/* ===================================================================== */}
          {/* VIEW: STEP 1 OF 4 — SEED SELECTION (EXPERIMENT SECTION) */}
          {/* ===================================================================== */}
          {viewState === "step-1" && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex-1 flex flex-col items-center justify-start px-4 sm:px-6 py-12 max-w-4xl mx-auto w-full"
            >
              
              {/* Breadcrumb Navigation: Return to Dashboard */}
              <div className="w-full max-w-2xl flex items-center justify-between mb-6 pb-3 border-b border-border text-xs">
                <button
                  onClick={() => {
                    setViewState("dashboard");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground font-medium transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Dashboard</span>
                </button>
                <div className="flex items-center gap-2 font-mono text-muted-foreground">
                  <span>Experiment Section</span>
                  <span>•</span>
                  <span className="text-primary font-semibold">Step 1 of 4</span>
                </div>
              </div>
              
              {/* Title Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-foreground">
                  What are you experimenting with?
                </h1>
                <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                  Select a common seed or enter a custom one
                </p>
              </div>

              {/* Search Bar */}
              <div className="w-full max-w-2xl mb-8">
                <Input
                  type="text"
                  placeholder="Search seeds..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4 text-muted-foreground" />}
                  className="rounded-xl border border-border bg-background h-12"
                />
              </div>

              {/* Grid of Seeds (2 rows x 3 columns on desktop) */}
              <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {filteredProtocols.map((protocol, i) => (
                  <motion.div
                    key={protocol.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Card
                      onClick={() => handleSelectSeed(protocol)}
                      className="cursor-pointer border border-border bg-card p-5 rounded-2xl hover:border-primary hover:shadow-xs transition-all h-full flex flex-col justify-between"
                    >
                      <div>
                        {/* Seed Emoji */}
                        <div className="text-3xl mb-3">{protocol.emoji}</div>
                        {/* Common Name */}
                        <h3 className="font-semibold text-base text-foreground">
                          {protocol.commonName}
                        </h3>
                        {/* Scientific Name */}
                        <p className="text-xs text-muted-foreground italic mt-0.5">
                          {protocol.scientificName}
                        </p>
                      </div>
                      {/* Germination Duration */}
                      <div className="mt-4 text-xs text-primary font-medium">
                        {protocol.germinationDays}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Bottom Custom Seed Button */}
              <div className="w-full max-w-2xl">
                <Button
                  onClick={() => setIsCustomModalOpen(true)}
                  variant="outline"
                  className="w-full h-12 rounded-xl border border-border bg-muted/40 hover:bg-muted text-foreground font-medium text-sm flex items-center justify-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Custom Seed</span>
                </Button>
              </div>

            </motion.div>
          )}

          {/* ===================================================================== */}
          {/* VIEW: NURSERY TRAY SOWING & 2D MUD MAPPING */}
          {/* ===================================================================== */}
          {viewState === "step-tray" && (
            <motion.div
              key="step-tray"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex-1 flex flex-col items-center justify-start w-full"
            >
              <TraySowingCanvas
                selectedProtocol={selectedProtocol}
                initialPins={sownPins}
                initialImage={trayImageUrl}
                onConfirmMapping={handleConfirmTrayMapping}
                onBack={() => {
                  setViewState("step-1");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </motion.div>
          )}

          {/* ===================================================================== */}
          {/* VIEW 3: STEP 2 OF 4 — AI PROTOCOL GENERATION */}
          {/* ===================================================================== */}
          {viewState === "step-2" && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex-1 flex flex-col items-center justify-start px-4 sm:px-6 py-12 max-w-4xl mx-auto w-full"
            >
              
              {/* Breadcrumb Navigation: Return to Dashboard, Step 1, or Mud Tray */}
              <div className="w-full flex items-center justify-between mb-6 pb-3 border-b border-border text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setViewState("dashboard");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground font-medium transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Dashboard</span>
                  </button>
                  <span className="text-border">/</span>
                  <button
                    onClick={() => {
                      setViewState("step-1");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="text-muted-foreground hover:text-foreground font-medium transition-colors"
                  >
                    Seeds
                  </button>
                  <span className="text-border">/</span>
                  <button
                    onClick={() => {
                      setViewState("step-tray");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="text-muted-foreground hover:text-foreground font-medium transition-colors"
                  >
                    Mud Tray
                  </button>
                </div>
                <div className="flex items-center gap-2 font-mono text-muted-foreground">
                  <span>Experiment Section</span>
                  <span>•</span>
                  <span className="text-primary font-semibold">Step 2 of 4</span>
                </div>
              </div>
              
              <div className="text-center mb-8">
                <Badge className="mb-3 px-3 py-1 bg-primary/10 border border-primary/20 text-primary rounded-full text-xs font-medium">
                  Protocol Synthesized via Gemini 1.5 Flash
                </Badge>
                <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-foreground flex items-center justify-center gap-2">
                  <span>{selectedProtocol.emoji}</span>
                  <span>{selectedProtocol.commonName}</span>
                </h1>
                <p className="mt-1 text-sm text-muted-foreground italic">
                  {selectedProtocol.scientificName} • {selectedProtocol.germinationDays}
                </p>
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
                  {selectedProtocol.description}
                </p>
              </div>

              {/* 3 Biological Epochs */}
              <div className="w-full space-y-4 mb-8">
                {selectedProtocol.epochs.map((epoch, idx) => (
                  <Card key={epoch.epochNumber} className="border border-border bg-card p-6 rounded-2xl shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3 mb-4">
                      <div>
                        <span className="text-xs font-mono font-bold text-primary uppercase">
                          Epoch 0{epoch.epochNumber}
                        </span>
                        <h3 className="text-base font-semibold text-foreground mt-0.5">
                          {epoch.name}
                        </h3>
                      </div>
                      <Badge variant="outline" className="self-start sm:self-auto font-mono text-xs">
                        {epoch.daysRange}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-muted/40 border border-border">
                        <span className="text-muted-foreground uppercase text-[10px] block font-medium">
                          Temperature
                        </span>
                        <span className="font-semibold text-sm text-foreground">
                          {epoch.tempRange.optimal}°C
                        </span>
                        <span className="text-[10px] text-muted-foreground block">
                          ({epoch.tempRange.min}–{epoch.tempRange.max}°C)
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-muted/40 border border-border">
                        <span className="text-muted-foreground uppercase text-[10px] block font-medium">
                          Humidity Target
                        </span>
                        <span className="font-semibold text-sm text-foreground">
                          {epoch.humidityRange.optimal}% RH
                        </span>
                        <span className="text-[10px] text-muted-foreground block">
                          ({epoch.humidityRange.min}–{epoch.humidityRange.max}%)
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-muted/40 border border-border">
                        <span className="text-muted-foreground uppercase text-[10px] block font-medium">
                          Substrate Moisture
                        </span>
                        <span className="font-semibold text-sm text-foreground">
                          {epoch.moistureTarget}
                        </span>
                        <span className="text-[10px] text-muted-foreground block">
                          Capacitive Index
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-muted/40 border border-border">
                        <span className="text-muted-foreground uppercase text-[10px] block font-medium">
                          Actuation Profile
                        </span>
                        <span className="font-semibold text-sm text-foreground">
                          Pulse: {epoch.deterministicActuation.pumpDurationSeconds}s
                        </span>
                        <span className="text-[10px] text-muted-foreground block">
                          Vent: {epoch.deterministicActuation.ventAngleDegrees}°
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="w-full flex items-center justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={() => setViewState("step-tray")}
                  className="rounded-xl flex items-center gap-1.5 text-xs sm:text-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Mud Tray</span>
                </Button>

                <Button
                  onClick={() => {
                    setViewState("step-3");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="rounded-xl bg-primary text-primary-foreground font-semibold text-xs sm:text-sm flex items-center gap-1.5 px-6"
                >
                  <span>Proceed to Hardware Link</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

            </motion.div>
          )}

          {/* ===================================================================== */}
          {/* VIEW 4: STEP 3 OF 4 — DETERMINISTIC HARDWARE LINK */}
          {/* ===================================================================== */}
          {viewState === "step-3" && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex-1 flex flex-col items-center justify-start px-4 sm:px-6 py-12 max-w-4xl mx-auto w-full"
            >
              
              {/* Breadcrumb Navigation: Return to Dashboard */}
              <div className="w-full flex items-center justify-between mb-6 pb-3 border-b border-border text-xs">
                <button
                  onClick={() => {
                    setViewState("dashboard");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground font-medium transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Dashboard</span>
                </button>
                <div className="flex items-center gap-2 font-mono text-muted-foreground">
                  <span>Experiment Section</span>
                  <span>•</span>
                  <span className="text-primary font-semibold">Step 3 of 4</span>
                </div>
              </div>
              
              <div className="text-center mb-8">
                <Badge className="mb-3 px-3 py-1 bg-primary/10 border border-primary/20 text-primary rounded-full text-xs font-medium">
                  Deterministic Control Interface
                </Badge>
                <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-foreground">
                  Hardware Link & Actuation Engine
                </h1>
                <p className="mt-2 text-sm text-muted-foreground max-w-lg mx-auto">
                  Connect your physical Arduino Uno microcontroller via Web Serial (115200 baud) or operate in calibrated laboratory simulation mode.
                </p>
              </div>

              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                
                {/* Physical Link Card */}
                <Card className="border border-border bg-card p-6 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Usb className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-base text-foreground">
                          Physical Microcontroller
                        </h3>
                      </div>
                      <Badge
                        variant={serialConnected ? "default" : "outline"}
                        className="font-mono text-xs"
                      >
                        {serialConnected ? "Live Connected" : "Not Linked"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                      Direct serial streaming over USB with ATmega328P. Communicates telemetry frames and receives deterministic actuation commands at 115200 baud.
                    </p>
                  </div>

                  <Button
                    onClick={handleConnectHardware}
                    variant={serialConnected ? "secondary" : "default"}
                    className="w-full rounded-xl text-sm font-semibold h-11 flex items-center justify-center gap-2"
                  >
                    <Usb className="w-4 h-4" />
                    <span>{serialConnected ? "Re-pair USB Serial" : "Connect Arduino Uno"}</span>
                  </Button>
                </Card>

                {/* Verified Pinout Architecture */}
                <Card className="border border-border bg-card p-6 rounded-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Cpu className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-base text-foreground">
                      Pinout Specification
                    </h3>
                  </div>
                  <div className="space-y-2 text-xs font-mono text-muted-foreground">
                    <div className="flex justify-between py-1 border-b border-border">
                      <span>Pin D13</span>
                      <span className="text-foreground font-semibold">5V Relay Submersible Pump</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border">
                      <span>Pin D5</span>
                      <span className="text-foreground font-semibold">Micro-Servo Roof Vent (0°-90°)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border">
                      <span>Pin A5</span>
                      <span className="text-foreground font-semibold">Aeration Circulation Fan</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border">
                      <span>Pins A0 / A1</span>
                      <span className="text-foreground font-semibold">Dual Capacitive Moisture</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Pin D2</span>
                      <span className="text-foreground font-semibold">DHT22 Ambient Temp/RH</span>
                    </div>
                  </div>
                </Card>

              </div>

              {/* Navigation Buttons */}
              <div className="w-full flex items-center justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={() => setViewState("step-2")}
                  className="rounded-xl flex items-center gap-1.5 text-xs sm:text-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Protocol</span>
                </Button>

                <Button
                  onClick={handleLaunchExperiment}
                  className="rounded-xl bg-primary text-primary-foreground font-semibold text-xs sm:text-sm flex items-center gap-1.5 px-6 shadow-xs hover:opacity-90"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Launch Active Experiment</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

            </motion.div>
          )}

          {/* ===================================================================== */}
          {/* VIEW 5: STEP 4 OF 4 — ACTIVE EXPERIMENT COCKPIT */}
          {/* ===================================================================== */}
          {viewState === "step-4" && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex-1 flex flex-col items-center justify-start px-4 sm:px-6 py-8 max-w-5xl mx-auto w-full space-y-6"
            >
              
              {/* Breadcrumb Navigation: Return to Dashboard */}
              <div className="w-full flex items-center justify-between pb-2 text-xs">
                <button
                  onClick={() => {
                    setViewState("dashboard");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground font-medium transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Dashboard</span>
                </button>
                <div className="flex items-center gap-2 font-mono text-muted-foreground">
                  <span>Experiment Section</span>
                  <span>•</span>
                  <span className="text-primary font-semibold">Step 4 of 4 · Live Cockpit</span>
                </div>
              </div>

              {/* Cockpit Status Header */}
              <Card className="w-full border border-border bg-card p-6 rounded-2xl shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="text-3xl">{selectedProtocol.emoji}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-xl font-semibold text-foreground tracking-tight">
                          {selectedProtocol.commonName} Experiment
                        </h1>
                        <Badge className="bg-primary/10 border-primary/20 text-primary text-xs font-mono">
                          EPOCH 01 ACTIVE
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {selectedProtocol.scientificName} • Standard: {selectedProtocol.referenceStandard}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      onClick={handleCompleteExperiment}
                      className="rounded-xl bg-primary text-primary-foreground font-semibold text-xs h-9 px-4 flex items-center gap-1.5 shadow-xs hover:opacity-90"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Complete & Record</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const csv = "Timestamp,Temp,Humidity,Soil1,Soil2,Gas,Pump,VentAngle\n" +
                          `${telemetry.timestamp},${telemetry.temperature},${telemetry.humidity},${telemetry.soilMoisture1},${telemetry.soilMoisture2},${telemetry.gasPpm},${actuators.pump},${actuators.ventAngle}\n`;
                        const blob = new Blob([csv], { type: "text/csv" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `epiml_${selectedProtocol.id}_log.csv`;
                        a.click();
                      }}
                      className="rounded-xl text-xs h-9 flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewState("step-1")}
                      className="rounded-xl text-xs h-9"
                    >
                      New Experiment
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Real-time Environmental Telemetry Deck */}
              <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-4">
                
                {/* Temperature */}
                <Card className="p-5 border border-border bg-card rounded-2xl">
                  <div className="flex items-center justify-between text-muted-foreground mb-2">
                    <span className="text-xs font-medium uppercase tracking-wider">Temperature</span>
                    <Thermometer className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-2xl font-light font-mono text-foreground">
                    {telemetry.temperature.toFixed(1)}°C
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    Optimal: {selectedProtocol.epochs[0].tempRange.optimal}°C
                  </div>
                </Card>

                {/* Humidity */}
                <Card className="p-5 border border-border bg-card rounded-2xl">
                  <div className="flex items-center justify-between text-muted-foreground mb-2">
                    <span className="text-xs font-medium uppercase tracking-wider">Humidity</span>
                    <Droplets className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-2xl font-light font-mono text-foreground">
                    {telemetry.humidity.toFixed(1)}%
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    Target: {selectedProtocol.epochs[0].humidityRange.optimal}% RH
                  </div>
                </Card>

                {/* Soil Moisture */}
                <Card className="p-5 border border-border bg-card rounded-2xl">
                  <div className="flex items-center justify-between text-muted-foreground mb-2">
                    <span className="text-xs font-medium uppercase tracking-wider">Moisture WAP</span>
                    <Layers className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-2xl font-light font-mono text-foreground">
                    {((telemetry.soilMoisture1 + telemetry.soilMoisture2) / 2).toFixed(0)}%
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    Sensor 1: {telemetry.soilMoisture1}% · 2: {telemetry.soilMoisture2}%
                  </div>
                </Card>

                {/* Actuator Loop */}
                <Card className="p-5 border border-border bg-card rounded-2xl">
                  <div className="flex items-center justify-between text-muted-foreground mb-2">
                    <span className="text-xs font-medium uppercase tracking-wider">Control Engine</span>
                    <Cpu className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-2xl font-light font-mono text-foreground flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span>DETERMINISTIC</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1 truncate" title={actuators.lastCommandReason}>
                    {actuators.lastCommandReason}
                  </div>
                </Card>

              </div>

              {/* Real-time Environmental Trajectory Predictor (+15m, +30m, +60m, +6h, +24h ML Model) */}
              <PredictionDeck
                currentTemp={telemetry.temperature ?? 24.5}
                currentHum={telemetry.humidity ?? 75.0}
                currentSoil={Number((((telemetry.soilMoisture1 ?? 70) + (telemetry.soilMoisture2 ?? 70)) / 2).toFixed(1))}
                currentGas={telemetry.gasPpm ?? 38}
                cropName={selectedProtocol.commonName}
                isLiveHardware={Boolean(telemetry.isLiveHardware)}
              />

              {/* Actuator Trigger Deck & Safety Loop */}
              <Card className="w-full border border-border bg-card p-6 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                  <div>
                    <h3 className="font-semibold text-base text-foreground">
                      Deterministic Actuators (Pinout Control)
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Safety-first firmware overrides execute locally on the physical microcontroller.
                    </p>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs">
                    {serialConnected ? "Live Serial Sync Active" : "Simulated Local Loop"}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  {/* Pump */}
                  <div className="p-4 rounded-xl border border-border bg-muted/30 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium text-foreground block">
                        Relay Pump (D13)
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {actuators.pump ? "PUMPING (ACTIVE)" : "STANDBY (OFF)"}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant={actuators.pump ? "default" : "outline"}
                      onClick={() => {
                        const next = actuators.pump ? 0 : 1;
                        setActuators((p) => ({ ...p, pump: next }));
                        sendSerialCommand(`PUMP:${next}`);
                      }}
                      className="rounded-xl text-xs h-8"
                    >
                      {actuators.pump ? "Stop" : "Pulse 2s"}
                    </Button>
                  </div>

                  {/* Vent */}
                  <div className="p-4 rounded-xl border border-border bg-muted/30 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium text-foreground block">
                        Roof Vent (D5)
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        Angle: {actuators.ventAngle}°
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const next = actuators.ventAngle >= 75 ? 15 : actuators.ventAngle + 30;
                        setActuators((p) => ({ ...p, ventAngle: next }));
                        sendSerialCommand(`VENT:${next}`);
                      }}
                      className="rounded-xl text-xs h-8"
                    >
                      Step 30°
                    </Button>
                  </div>

                  {/* Fan */}
                  <div className="p-4 rounded-xl border border-border bg-muted/30 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium text-foreground block">
                        Aeration Fan (A5)
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {actuators.fan ? "CIRCULATING" : "RESTING"}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant={actuators.fan ? "default" : "outline"}
                      onClick={() => {
                        const next = actuators.fan ? 0 : 1;
                        setActuators((p) => ({ ...p, fan: next }));
                        sendSerialCommand(`FAN:${next}`);
                      }}
                      className="rounded-xl text-xs h-8"
                    >
                      Toggle
                    </Button>
                  </div>

                </div>
              </Card>

              {/* Dual-Mode Tray Visualizer: 2D Mud Sampling Map + Matrix */}
              <Card className="w-full border border-border bg-card p-4 sm:p-6 rounded-3xl shadow-xs overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <h3 className="font-semibold text-base text-foreground">
                        {cockpitTrayTab === "mud"
                          ? "2D Mud Sampling & Emergence Map"
                          : "40-Cell Nursery Tray Emergence Matrix"}
                      </h3>
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-mono">
                        420mm Fixed Gantry
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {cockpitTrayTab === "mud"
                        ? "Interactive computer vision plane on nursery mud. Click any sown seed pin to annotate emergence kinetics."
                        : "Fixed 420mm overhead computer vision geometry tracks individual cell emergence kinetics."}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* View Mode Toggle */}
                    <div className="flex items-center p-1 bg-muted rounded-xl text-xs font-medium">
                      <button
                        onClick={() => setCockpitTrayTab("mud")}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          cockpitTrayTab === "mud"
                            ? "bg-background text-foreground shadow-xs font-semibold"
                            : "text-muted-foreground"
                        }`}
                      >
                        2D Mud Map
                      </button>
                      <button
                        onClick={() => setCockpitTrayTab("matrix")}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          cockpitTrayTab === "matrix"
                            ? "bg-background text-foreground shadow-xs font-semibold"
                            : "text-muted-foreground"
                        }`}
                      >
                        Matrix Grid
                      </button>
                    </div>

                    <div className="text-xs font-mono text-primary font-semibold px-2 py-1 bg-primary/10 rounded-lg">
                      {cells.filter((c) => c.state === "GROWING" || c.state === "EMERGING").length}/{cells.length} Emerged (
                      {Math.round(
                        (cells.filter((c) => c.state === "GROWING" || c.state === "EMERGING").length /
                          Math.max(1, cells.length)) *
                          100
                      )}
                      %)
                    </div>
                  </div>
                </div>

                {cockpitTrayTab === "mud" ? (
                  /* Photographic 2D Mud Sampling Surface */
                  <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-border shadow-inner bg-[#241A14] select-none">
                    <img
                      src={trayImageUrl || "/images/nursery_soil_tray.jpg"}
                      alt="Mud Tray Observation"
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/30 pointer-events-none" />

                    {/* Sown Pins Overlay on Mud */}
                    {(sownPins.length > 0 ? sownPins : (
                      // Fallback 40 pins if none were explicitly sown
                      Array.from({ length: 40 }, (_, i) => {
                        const col = i % 8;
                        const row = Math.floor(i / 8);
                        return {
                          id: `auto-${i + 1}`,
                          cellId: `C${String(i + 1).padStart(2, "0")}`,
                          x: Number((11 + col * 11.1).toFixed(1)),
                          y: Number((15 + row * 17.5).toFixed(1)),
                          state: cells[i]?.state || "SOWN",
                        };
                      })
                    )).map((pin) => {
                      const matchingCell = cells.find((c) => c.id === pin.cellId);
                      const state = matchingCell?.state || pin.state;
                      return (
                        <div
                          key={pin.id}
                          onClick={() => handleTogglePinState(pin.id)}
                          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                          style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                          title={`Cell ${pin.cellId}: ${state} (Click to toggle emergence state)`}
                        >
                          <div className="relative flex items-center justify-center">
                            {state !== "SOWN" && (
                              <span className="absolute w-8 h-8 rounded-full bg-emerald-500/30 animate-ping opacity-60" />
                            )}
                            <div
                              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-white shadow-md flex items-center justify-center text-xs transition-transform group-hover:scale-110 ${
                                state === "GROWING"
                                  ? "bg-emerald-600 text-white"
                                  : state === "EMERGING"
                                  ? "bg-amber-500 text-white"
                                  : "bg-black/60 text-white/90"
                              }`}
                            >
                              <span className="text-[11px] select-none">
                                {state === "GROWING" ? "🍀" : state === "EMERGING" ? "🌿" : "🌱"}
                              </span>
                            </div>

                            <div className="absolute -bottom-4 whitespace-nowrap px-1.5 py-0.2 bg-black/80 backdrop-blur-xs text-[9px] font-mono text-white rounded-md border border-white/20 shadow-xs pointer-events-none">
                              {pin.cellId} · {state === "GROWING" ? "18mm" : state === "EMERGING" ? "6mm" : "Sown"}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Bottom HUD */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md text-[10px] sm:text-xs text-white/90 border border-white/10 pointer-events-none">
                      <span className="font-mono">
                        Overhead CV Plane: 420mm • ExG Hybrid Segmentation
                      </span>
                      <span className="text-emerald-400 font-semibold font-mono">
                        ● Click pin to toggle emergence ground truth
                      </span>
                    </div>
                  </div>
                ) : (
                  /* 40 cells grid (8 cols x 5 rows) */
                  <div className="grid grid-cols-8 gap-2 p-3 rounded-xl bg-muted/40 border border-border">
                    {cells.map((cell) => (
                      <div
                        key={cell.id}
                        onClick={() => {
                          const nextState =
                            cell.state === "SOWN"
                              ? "EMERGING"
                              : cell.state === "EMERGING"
                              ? "GROWING"
                              : "SOWN";
                          setCells((prev) =>
                            prev.map((c) => (c.id === cell.id ? { ...c, state: nextState } : c))
                          );
                        }}
                        className={`h-11 rounded-xl border flex flex-col items-center justify-center text-[10px] font-mono transition-all cursor-pointer hover:border-primary ${
                          cell.state === "GROWING"
                            ? "bg-primary/20 border-primary text-primary font-bold shadow-xs"
                            : cell.state === "EMERGING"
                            ? "bg-amber-500/15 border-amber-500/40 text-amber-700 font-medium"
                            : "bg-background border-border text-muted-foreground"
                        }`}
                        title="Click to toggle emergence state"
                      >
                        <span>{cell.id}</span>
                        <span className="text-[9px]">
                          {cell.state === "GROWING" ? "92%" : cell.state === "EMERGING" ? "45%" : "SOWN"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ========================================================================= */}
      {/* CUSTOM SEED MODAL */}
      {/* ========================================================================= */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Enter Custom Seed
              </h3>
              <button
                onClick={() => setIsCustomModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground mb-4">
              Enter any agronomy cultivar (e.g. Mustard, Bell Pepper, Soybean, Basil). Gemini 1.5 Flash will synthesize a 3-epoch physiological protocol.
            </p>

            <form onSubmit={handleCustomSeedSubmit} className="space-y-4">
              <Input
                type="text"
                placeholder="e.g. Black Mustard (Brassica nigra)"
                value={customSeedName}
                onChange={(e) => setCustomSeedName(e.target.value)}
                autoFocus
                required
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
                >
                  Generate Protocol
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Authentication Guard Modal (Required Before Starting Experiment) */}
      <LoginModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(authedUser) => {
          setUser(authedUser);
          setIsAuthModalOpen(false);
          setViewState("dashboard");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      {/* Admin Clearance Gate Modal (Exclusive to Model Training & Management) */}
      <AdminLoginModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        onSuccess={() => {
          setIsAdminAuthenticated(true);
          setIsAdminAuthModalOpen(false);
          setViewState("admin-ml");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

    </div>
  );
}
