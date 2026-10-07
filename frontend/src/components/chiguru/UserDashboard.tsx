"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User as UserIcon,
  FlaskConical,
  Sprout,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Search,
  Play,
  Layers,
  Activity,
  Award,
  ShieldCheck,
  Droplets,
  Thermometer,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Download,
  Trash2,
  Database,
  Cpu,
  Lock,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SeedProtocol } from "@/lib/types";
import { DEFAULT_SEED_PROTOCOLS } from "@/lib/protocols";
import { supabase } from "@/lib/supabase/client";

export interface UserExperimentHistory {
  id: string;
  experimentCode?: string;
  cropName: string;
  scientificName: string;
  emoji: string;
  status: "COMPLETED" | "RUNNING" | "PAUSED";
  startedAt: string;
  completedAt?: string;
  durationDays: number;
  durationSeconds?: number;
  emergenceRatePct: number;
  cellsEmerged: number;
  totalCells: number;
  avgTemp: number;
  avgHumidity: number;
  avgSoilMoisture?: number;
  avgGasPpm?: number;
  actuationsTotal: number;
  currentEpochName: string;
  sownPins?: any[];
  trayImageUrl?: string;
  telemetryHistory?: any[];
  phenotypeHistory?: any[];
  protocolSnapshot?: any;
}

interface UserDashboardProps {
  user: {
    id: string;
    email: string;
    name?: string;
  };
  onStartNewExperiment: () => void;
  onResumeActiveExperiment: (exp?: UserExperimentHistory) => void;
  onRerunProtocol: (protocol: SeedProtocol) => void;
  onOpenMLCenter?: () => void;
  isAdmin?: boolean;
  onOpenAdminLogin?: () => void;
}

export default function UserDashboard({
  user,
  onStartNewExperiment,
  onResumeActiveExperiment,
  onRerunProtocol,
  onOpenMLCenter,
  isAdmin = false,
  onOpenAdminLogin,
}: UserDashboardProps) {
  const [filter, setFilter] = useState<"all" | "completed" | "running">("all");
  const [search, setSearch] = useState("");
  // Start accurately at 0 experiments for the user — completely clean
  const [histories, setHistories] = useState<UserExperimentHistory[]>([]);
  const [profileDetails, setProfileDetails] = useState<{
    role: string;
    preferredCrop: string;
  }>({
    role: "Lead Research Scientist",
    preferredCrop: "Tomato (Solanum lycopersicum)",
  });

  // Load user profile details and experiments from Supabase / localStorage
  useEffect(() => {
    // 1. Check local storage cache and PURGE any legacy fake experiment records
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("epiml_user_experiments");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            // Actively filter out all fake mock IDs
            const realOnly = parsed.filter(
              (item: any) =>
                item &&
                item.id &&
                !item.id.includes("EXP-2026-WHT-011") &&
                !item.id.includes("EXP-2026-TOM-042") &&
                !item.id.includes("EXP-2026-RIC-019") &&
                !item.id.includes("EXP-2026-MAI-007") &&
                !item.id.includes("EXP-2026-MNG-003")
            );
            setHistories(realOnly);
            localStorage.setItem("epiml_user_experiments", JSON.stringify(realOnly));
          }
        } catch {}
      }
    }

    // 2. Query Supabase profiles & experiments tables
    if (supabase && user?.id) {
      // Profile query
      supabase
        .from("profiles")
        .select("role, preferred_crop")
        .eq("id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setProfileDetails({
              role: data.role === "researcher" ? "Lead Agronomist & Researcher" : data.role || "Lead Research Scientist",
              preferredCrop: data.preferred_crop || "Tomato (Solanum lycopersicum)",
            });
          }
        });

      // Real user experiments query
      supabase
        .from("experiments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data, error }) => {
          if (!error && data) {
            const mapped: UserExperimentHistory[] = data.map((exp: any) => ({
              id: exp.id,
              experimentCode: exp.experiment_code || exp.id,
              cropName: exp.crop_name,
              scientificName: exp.scientific_name || "Cultivar",
              emoji: exp.emoji || "🌱",
              status: (exp.status === "COMPLETED" ? "COMPLETED" : "RUNNING") as "COMPLETED" | "RUNNING",
              startedAt: exp.started_at
                ? new Date(exp.started_at).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : new Date(exp.created_at).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
              completedAt: exp.completed_at
                ? new Date(exp.completed_at).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : undefined,
              durationDays: exp.duration_days || 1,
              durationSeconds: exp.duration_seconds || 0,
              emergenceRatePct: Number(exp.emergence_rate_pct ?? 0),
              cellsEmerged: exp.cells_emerged ?? 0,
              totalCells: exp.total_cells ?? 40,
              avgTemp: Number(exp.avg_temp ?? 24.5),
              avgHumidity: Number(exp.avg_humidity ?? 75.0),
              avgSoilMoisture: Number(exp.avg_soil_moisture ?? 70.0),
              avgGasPpm: Number(exp.avg_gas_ppm ?? 38.0),
              actuationsTotal: exp.actuations_total ?? 0,
              currentEpochName: exp.current_epoch_name || "Epoch 1: Imbibition & Radicle Anchor",
              sownPins: exp.sown_pins || [],
              trayImageUrl: exp.tray_image_url,
              telemetryHistory: exp.telemetry_history || [],
              phenotypeHistory: exp.phenotype_history || [],
              protocolSnapshot: exp.protocol_snapshot || {},
            }));
            setHistories(mapped);
            if (typeof window !== "undefined") {
              localStorage.setItem("epiml_user_experiments", JSON.stringify(mapped));
            }
          }
        });
    }
  }, [user]);

  // Accurately computed real metrics (starts at 0)
  const totalExperiments = histories.length;
  const completedExperiments = histories.filter((h) => h.status === "COMPLETED").length;
  const runningExperiments = histories.filter((h) => h.status === "RUNNING").length;
  const avgEmergenceRate =
    histories.length > 0
      ? (
          histories.reduce((acc, h) => acc + h.emergenceRatePct, 0) /
          histories.length
        ).toFixed(1)
      : "0.0";
  const totalClosedLoopCycles = histories.reduce(
    (acc, h) => acc + (h.actuationsTotal || 0),
    0
  );
  const uniqueSpeciesCount = new Set(histories.map((h) => h.cropName)).size;

  // Handler to delete an experiment completely from Supabase and local cache
  const handleDeleteExperiment = async (id: string) => {
    const next = histories.filter((h) => h.id !== id);
    setHistories(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("epiml_user_experiments", JSON.stringify(next));
    }
    if (supabase && user?.id) {
      try {
        await supabase.from("experiments").delete().eq("id", id);
      } catch (err) {
        console.warn("Error deleting experiment from Supabase:", err);
      }
    }
  };

  // Handler to reset all experiments to 0
  const handleResetToZero = async () => {
    setHistories([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("epiml_user_experiments");
      localStorage.removeItem("epiml_active_experiment");
    }
    if (supabase && user?.id) {
      try {
        await supabase.from("experiments").delete().eq("user_id", user.id);
      } catch (err) {
        console.warn("Error resetting Supabase experiments:", err);
      }
    }
  };

  // Handler to export structured ML training dataset (JSON)
  const handleExportMLJson = (exp: UserExperimentHistory) => {
    const mlDataset = {
      dataset_metadata: {
        framework: "epiML v2.0 Plant Phenotyping & Closed-Loop Chamber Dataset",
        exported_at: new Date().toISOString(),
        user_id: user.id,
        user_email: user.email,
        experiment_id: exp.id,
        experiment_code: exp.experimentCode || exp.id,
        crop_variety: exp.cropName,
        scientific_name: exp.scientificName,
        status: exp.status,
        started_at: exp.startedAt,
        completed_at: exp.completedAt,
        duration_days: exp.durationDays,
        duration_seconds: exp.durationSeconds,
      },
      biological_setpoints: exp.protocolSnapshot || {},
      sown_spatial_ground_truth: {
        total_seeds_sown: exp.totalCells,
        seeds_emerged: exp.cellsEmerged,
        emergence_rate_pct: exp.emergenceRatePct,
        coordinates_on_mud_tray: exp.sownPins || [],
        phenotype_observations_timeseries: exp.phenotypeHistory || [],
      },
      environmental_telemetry_timeseries:
        exp.telemetryHistory && exp.telemetryHistory.length > 0
          ? exp.telemetryHistory
          : [
              {
                sample_index: 0,
                timestamp: exp.startedAt,
                temperature_c: exp.avgTemp,
                humidity_rh_pct: exp.avgHumidity,
                soil_moisture_index: exp.avgSoilMoisture || 70.0,
                gas_ppm: exp.avgGasPpm || 38.0,
                actuations_closed_loop: exp.actuationsTotal,
              },
            ],
    };

    const blob = new Blob([JSON.stringify(mlDataset, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `epiml_ml_dataset_${exp.cropName.toLowerCase()}_${exp.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handler to export tabular CSV for ML analysis (Pandas / Scikit-learn)
  const handleExportTabularCsv = (exp: UserExperimentHistory) => {
    const headers =
      "timestamp,experiment_id,crop_name,temperature_c,humidity_rh,soil_moisture,gas_ppm,actuations,cells_emerged,emergence_pct\n";
    let rows = "";
    if (exp.telemetryHistory && exp.telemetryHistory.length > 0) {
      rows = exp.telemetryHistory
        .map(
          (s: any) =>
            `${s.timestamp || exp.startedAt},${exp.id},${exp.cropName},${s.temp ?? s.temperature ?? exp.avgTemp},${s.humidity ?? exp.avgHumidity},${s.soil1 ?? s.soil_moisture ?? exp.avgSoilMoisture ?? 70},${s.gas_ppm ?? exp.avgGasPpm ?? 38},${s.pump_state ?? 0},${exp.cellsEmerged},${exp.emergenceRatePct}`
        )
        .join("\n");
    } else {
      rows = `${exp.startedAt},${exp.id},${exp.cropName},${exp.avgTemp},${exp.avgHumidity},${exp.avgSoilMoisture || 70},${exp.avgGasPpm || 38},${exp.actuationsTotal},${exp.cellsEmerged},${exp.emergenceRatePct}`;
    }
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `epiml_telemetry_${exp.cropName.toLowerCase()}_${exp.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered experiments
  const filteredHistories = histories.filter((item) => {
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "completed"
        ? item.status === "COMPLETED"
        : item.status === "RUNNING";
    const matchesSearch =
      item.cropName.toLowerCase().includes(search.toLowerCase()) ||
      item.scientificName.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.slice(0, 2).toUpperCase();
    }
    if (email) return email.slice(0, 2).toUpperCase();
    return "SC";
  };

  const displayName = user.name || user.email.split("@")[0];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 animate-in fade-in duration-300">
      
      {/* ========================================================================= */}
      {/* 1. RESEARCHER PROFILE HEADER CARD */}
      {/* ========================================================================= */}
      <Card className="border border-border bg-card/90 backdrop-blur-sm rounded-2xl shadow-xs overflow-hidden">
        <div className="p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Avatar Badge */}
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-mono text-xl sm:text-2xl font-semibold shadow-xs">
                {getInitials(user.name, user.email)}
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </span>
            </div>

            {/* Profile Meta */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-foreground">
                  {displayName}
                </h1>
                <Badge className="bg-primary/10 text-primary border border-primary/20 text-[11px] font-medium py-0.5 px-2 rounded-full">
                  Verified Scientist
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <span>{user.email}</span>
                <span className="text-border">•</span>
                <span className="text-foreground/80 font-medium">{profileDetails.role}</span>
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 bg-muted px-2.5 py-1 rounded-lg">
                  <Sprout className="w-3.5 h-3.5 text-primary" />
                  <span>Specialty: {profileDetails.preferredCrop}</span>
                </span>
                <span className="inline-flex items-center gap-1 bg-muted px-2.5 py-1 rounded-lg font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  <span>Supabase ID: {user.id.slice(0, 8)}...</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick CTA to launch or resume experiment */}
          <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
            {runningExperiments > 0 && (
              <Button
                onClick={() => {
                  const runningOne = histories.find((h) => h.status === "RUNNING");
                  onResumeActiveExperiment(runningOne);
                }}
                variant="outline"
                className="h-11 px-5 rounded-xl border border-primary/30 text-primary hover:bg-primary/10 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium"
              >
                <Activity className="w-4 h-4 text-primary animate-pulse" />
                <span>Resume Live Cockpit</span>
              </Button>
            )}

            <Button
              onClick={onStartNewExperiment}
              className="h-11 px-6 rounded-xl bg-primary text-primary-foreground hover:opacity-90 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold shadow-xs"
            >
              <FlaskConical className="w-4 h-4" />
              <span>Start New Experiment</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            {isAdmin ? (
              onOpenMLCenter && (
                <Button
                  onClick={onOpenMLCenter}
                  variant="outline"
                  className="h-11 px-4 rounded-xl border border-primary/40 bg-card hover:bg-muted text-primary flex items-center justify-center gap-2 text-xs sm:text-sm font-medium"
                >
                  <Cpu className="w-4 h-4 text-emerald-500" />
                  <span>Admin ML Center</span>
                </Button>
              )
            ) : (
              onOpenAdminLogin && (
                <Button
                  onClick={onOpenAdminLogin}
                  variant="ghost"
                  className="h-11 px-3 rounded-xl text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 text-xs font-medium"
                  title="Admin-only Model Management"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Admin Portal</span>
                </Button>
              )
            )}
          </div>

        </div>
      </Card>

      {/* ========================================================================= */}
      {/* 2. RESEARCHER KPI METRIC CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Total Experiments Done */}
        <Card className="p-5 border border-border bg-card rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-medium tracking-wider text-muted-foreground">
              Total Experiments
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <FlaskConical className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-light tracking-tight text-foreground font-mono">
            {totalExperiments}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {completedExperiments} completed · {runningExperiments} running
          </p>
        </Card>

        {/* KPI 2: Avg Emergence Success */}
        <Card className="p-5 border border-border bg-card rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-medium tracking-wider text-muted-foreground">
              Avg Emergence Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-light tracking-tight text-foreground font-mono">
            {avgEmergenceRate}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Overhead CV edge phenotyping
          </p>
        </Card>

        {/* KPI 3: Autonomous Actuations */}
        <Card className="p-5 border border-border bg-card rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-medium tracking-wider text-muted-foreground">
              Closed-Loop Cycles
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-light tracking-tight text-foreground font-mono">
            {totalClosedLoopCycles}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Irrigation pulses & vent sweeps
          </p>
        </Card>

        {/* KPI 4: Active Species Coverage */}
        <Card className="p-5 border border-border bg-card rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-medium tracking-wider text-muted-foreground">
              Species Tested
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Sprout className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-light tracking-tight text-foreground font-mono">
            {uniqueSpeciesCount} {uniqueSpeciesCount === 1 ? "Crop" : "Crops"}
          </div>
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {uniqueSpeciesCount > 0
              ? Array.from(new Set(histories.map((h) => h.cropName))).slice(0, 3).join(", ")
              : "Awaiting first phenotyping trial"}
          </p>
        </Card>

      </div>

      {/* ========================================================================= */}
      {/* 3. EXPERIMENT HISTORIES ARCHIVE TABLE */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        
        {/* Header + Filter Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-light tracking-tight text-foreground">
                Experiment History & Records
              </h2>
              {histories.length > 0 && (
                <button
                  onClick={handleResetToZero}
                  className="text-[11px] font-mono text-muted-foreground hover:text-rose-600 underline ml-2 transition-colors"
                  title="Clear all records and reset dashboard to zero"
                >
                  Reset to 0
                </button>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              All crop phenotyping trials, biological epochs, and deterministic telemetry logged under your account.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
              <Input
                type="text"
                placeholder="Search crop or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center p-1 bg-muted rounded-xl text-xs font-medium">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filter === "all" ? "bg-background text-foreground shadow-xs font-semibold" : "text-muted-foreground"
                }`}
              >
                All ({histories.length})
              </button>
              <button
                onClick={() => setFilter("completed")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filter === "completed" ? "bg-background text-foreground shadow-xs font-semibold" : "text-muted-foreground"
                }`}
              >
                Done ({completedExperiments})
              </button>
              <button
                onClick={() => setFilter("running")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filter === "running" ? "bg-background text-foreground shadow-xs font-semibold" : "text-muted-foreground"
                }`}
              >
                Live ({runningExperiments})
              </button>
            </div>
          </div>
        </div>

        {/* Experiment Records List */}
        <div className="grid grid-cols-1 gap-3.5">
          {filteredHistories.length === 0 ? (
            <Card className="p-10 text-center text-muted-foreground rounded-2xl border-dashed bg-card/60">
              <FlaskConical className="w-10 h-10 mx-auto mb-3 text-primary/40" />
              <h3 className="text-sm font-semibold text-foreground mb-1">
                {histories.length === 0 ? "No Experiment Records Yet" : "No matching experiments"}
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-5 leading-relaxed">
                {histories.length === 0
                  ? "Telemetry, closed-loop actuations, and photographic tray phenotyping data will dynamically populate here when you run experiments."
                  : `No experiments found matching "${search}".`}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button
                  onClick={onStartNewExperiment}
                  size="sm"
                  className="rounded-xl bg-primary text-primary-foreground text-xs h-9 px-5 font-semibold"
                >
                  <FlaskConical className="w-3.5 h-3.5 mr-1.5" />
                  <span>Start First Experiment</span>
                </Button>
              </div>
            </Card>
          ) : (
            filteredHistories.map((exp) => (
              <Card
                key={exp.id}
                className="p-5 border border-border bg-card rounded-2xl hover:border-primary/40 transition-all shadow-xs"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left: Crop metadata */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl shrink-0">
                      {exp.emoji}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-base text-foreground">
                          {exp.cropName}
                        </span>
                        <span className="text-xs text-muted-foreground italic">
                          ({exp.scientificName})
                        </span>
                        <Badge
                          className={`text-[10px] font-mono py-0.5 px-2 rounded-full font-medium ${
                            exp.status === "RUNNING"
                              ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                              : "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
                          }`}
                        >
                          {exp.status === "RUNNING" ? "● IN PROGRESS" : "✓ COMPLETED"}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-mono">
                        <span>ID: {exp.experimentCode || exp.id.slice(0, 16)}</span>
                        <span>•</span>
                        <span>{exp.startedAt}</span>
                        <span>•</span>
                        <span>{exp.durationDays} Days</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        <span className="text-xs text-foreground/80 font-medium">
                          {exp.currentEpochName}
                        </span>
                        <span className="text-muted-foreground text-xs">•</span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          <Database className="w-3 h-3" />
                          <span>ML Ready ({exp.telemetryHistory?.length || 1} telemetry pts)</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Performance & Chamber averages */}
                  <div className="grid grid-cols-3 gap-4 lg:gap-6 border-t lg:border-t-0 lg:border-l border-border pt-3 lg:pt-0 lg:pl-6 text-left">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground block">
                        Emergence
                      </span>
                      <span className="text-sm font-semibold text-primary font-mono">
                        {exp.emergenceRatePct}%
                      </span>
                      <span className="text-[10px] text-muted-foreground block">
                        {exp.cellsEmerged}/{exp.totalCells} cells
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground block">
                        Avg Climate
                      </span>
                      <span className="text-xs font-mono text-foreground font-medium block">
                        {exp.avgTemp}°C · {exp.avgHumidity}%
                      </span>
                      <span className="text-[10px] text-muted-foreground block">
                        Closed-loop
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground block">
                        Actuations
                      </span>
                      <span className="text-xs font-mono text-foreground font-medium block">
                        {exp.actuationsTotal} commands
                      </span>
                      <span className="text-[10px] text-muted-foreground block">
                        Pump + Vent
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 shrink-0">
                    {/* ML Dataset Download Button */}
                    <Button
                      onClick={() => handleExportMLJson(exp)}
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-border text-foreground hover:bg-muted text-xs h-9 px-2.5 flex items-center gap-1.5"
                      title="Export structured ML training dataset (JSON)"
                    >
                      <Database className="w-3.5 h-3.5 text-primary" />
                      <span className="hidden sm:inline">ML JSON</span>
                    </Button>

                    {/* Telemetry CSV Button */}
                    <Button
                      onClick={() => handleExportTabularCsv(exp)}
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-border text-foreground hover:bg-muted text-xs h-9 px-2 flex items-center gap-1"
                      title="Export tabular telemetry CSV for Pandas"
                    >
                      <Download className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="hidden sm:inline">CSV</span>
                    </Button>

                    {exp.status === "RUNNING" ? (
                      <Button
                        onClick={() => onResumeActiveExperiment(exp)}
                        size="sm"
                        className="rounded-xl bg-primary text-primary-foreground text-xs h-9 px-3.5 font-semibold flex items-center gap-1.5 shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Cockpit</span>
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          const proto =
                            DEFAULT_SEED_PROTOCOLS.find(
                              (p) => p.commonName.toLowerCase() === exp.cropName.toLowerCase()
                            ) || DEFAULT_SEED_PROTOCOLS[3];
                          onRerunProtocol(proto);
                        }}
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-border text-foreground hover:bg-muted text-xs h-9 px-3 flex items-center gap-1.5"
                        title="Rerun biological protocol"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>Rerun</span>
                      </Button>
                    )}

                    {/* Delete button */}
                    <Button
                      onClick={() => handleDeleteExperiment(exp.id)}
                      variant="ghost"
                      size="sm"
                      className="rounded-xl text-xs h-9 px-2 text-muted-foreground hover:text-rose-600 hover:bg-rose-50"
                      title="Delete experiment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                </div>
              </Card>
            ))
          )}
        </div>

      </div>

    </div>
  );
}
