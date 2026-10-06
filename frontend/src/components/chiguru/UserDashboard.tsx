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
  cropName: string;
  scientificName: string;
  emoji: string;
  status: "COMPLETED" | "RUNNING" | "PAUSED";
  startedAt: string;
  completedAt?: string;
  durationDays: number;
  emergenceRatePct: number;
  cellsEmerged: number;
  totalCells: number;
  avgTemp: number;
  avgHumidity: number;
  actuationsTotal: number;
  currentEpochName: string;
}

// Curated default realistic experiment runs for the user
const DEFAULT_HISTORIES: UserExperimentHistory[] = [
  {
    id: "EXP-2026-WHT-011",
    cropName: "Wheat",
    scientificName: "Triticum aestivum",
    emoji: "🌾",
    status: "RUNNING",
    startedAt: "Oct 6, 2026 · 09:30 AM",
    durationDays: 1,
    emergenceRatePct: 45.0,
    cellsEmerged: 18,
    totalCells: 40,
    avgTemp: 22.8,
    avgHumidity: 68.4,
    actuationsTotal: 26,
    currentEpochName: "Epoch 2: Coleoptile Emergence",
  },
  {
    id: "EXP-2026-TOM-042",
    cropName: "Tomato",
    scientificName: "Solanum lycopersicum",
    emoji: "🍅",
    status: "COMPLETED",
    startedAt: "Oct 1, 2026 · 10:00 AM",
    completedAt: "Oct 6, 2026 · 04:00 PM",
    durationDays: 5,
    emergenceRatePct: 95.0,
    cellsEmerged: 38,
    totalCells: 40,
    avgTemp: 24.6,
    avgHumidity: 76.2,
    actuationsTotal: 180,
    currentEpochName: "Epoch 3: True Leaf Unfolding",
  },
  {
    id: "EXP-2026-RIC-019",
    cropName: "Rice",
    scientificName: "Oryza sativa",
    emoji: "🍚",
    status: "COMPLETED",
    startedAt: "Sep 24, 2026 · 08:15 AM",
    completedAt: "Sep 29, 2026 · 06:30 PM",
    durationDays: 5,
    emergenceRatePct: 92.5,
    cellsEmerged: 37,
    totalCells: 40,
    avgTemp: 27.8,
    avgHumidity: 82.0,
    actuationsTotal: 222,
    currentEpochName: "Epoch 3: Radicle Anchor",
  },
  {
    id: "EXP-2026-MAI-007",
    cropName: "Maize",
    scientificName: "Zea mays",
    emoji: "🌽",
    status: "COMPLETED",
    startedAt: "Sep 16, 2026 · 11:45 AM",
    completedAt: "Sep 20, 2026 · 02:00 PM",
    durationDays: 4,
    emergenceRatePct: 97.5,
    cellsEmerged: 39,
    totalCells: 40,
    avgTemp: 25.2,
    avgHumidity: 71.4,
    actuationsTotal: 143,
    currentEpochName: "Epoch 3: Mesocotyl Elongation",
  },
  {
    id: "EXP-2026-MNG-003",
    cropName: "Moong Bean",
    scientificName: "Vigna radiata",
    emoji: "🌱",
    status: "COMPLETED",
    startedAt: "Sep 8, 2026 · 09:00 AM",
    completedAt: "Sep 11, 2026 · 05:00 PM",
    durationDays: 3,
    emergenceRatePct: 100.0,
    cellsEmerged: 40,
    totalCells: 40,
    avgTemp: 26.0,
    avgHumidity: 74.5,
    actuationsTotal: 84,
    currentEpochName: "Epoch 3: Hypocotyl Arch Unfolding",
  },
];

interface UserDashboardProps {
  user: {
    id: string;
    email: string;
    name?: string;
  };
  onStartNewExperiment: () => void;
  onResumeActiveExperiment: () => void;
  onRerunProtocol: (protocol: SeedProtocol) => void;
}

export default function UserDashboard({
  user,
  onStartNewExperiment,
  onResumeActiveExperiment,
  onRerunProtocol,
}: UserDashboardProps) {
  const [filter, setFilter] = useState<"all" | "completed" | "running">("all");
  const [search, setSearch] = useState("");
  // Start accurately at 0 experiments for the user
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
    // 1. Check local storage cache
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("epiml_user_experiments");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setHistories(parsed);
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

      // Experiments query
      supabase
        .from("experiments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            const mapped: UserExperimentHistory[] = data.map((exp: any) => ({
              id: exp.id,
              cropName: exp.crop_name,
              scientificName: exp.scientific_name || "Cultivar",
              emoji: exp.emoji || "🌱",
              status: (exp.status === "COMPLETED" ? "COMPLETED" : "RUNNING") as "COMPLETED" | "RUNNING",
              startedAt: new Date(exp.created_at).toLocaleString("en-US", {
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
              emergenceRatePct: Number(exp.emergence_rate_pct ?? 0),
              cellsEmerged: exp.cells_emerged ?? 0,
              totalCells: exp.total_cells ?? 40,
              avgTemp: Number(exp.avg_temp ?? 24.5),
              avgHumidity: Number(exp.avg_humidity ?? 75.0),
              actuationsTotal: exp.actuations_total ?? 0,
              currentEpochName: exp.current_epoch_name || "Epoch 1: Imbibition & Radicle Anchor",
            }));
            setHistories(mapped);
            localStorage.setItem("epiml_user_experiments", JSON.stringify(mapped));
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

  // Handler to reset all experiments to 0
  const handleResetToZero = () => {
    setHistories([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("epiml_user_experiments");
    }
  };

  // Handler to load benchmark demo data
  const handleLoadBenchmark = () => {
    setHistories(DEFAULT_HISTORIES);
    if (typeof window !== "undefined") {
      localStorage.setItem("epiml_user_experiments", JSON.stringify(DEFAULT_HISTORIES));
    }
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
                onClick={onResumeActiveExperiment}
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
                {histories.length === 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLoadBenchmark}
                    className="rounded-xl text-xs h-9 px-3.5 text-muted-foreground hover:text-foreground"
                  >
                    <span>Load Benchmark Demo (5 Crops)</span>
                  </Button>
                )}
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
                        <span>ID: {exp.id}</span>
                        <span>•</span>
                        <span>{exp.startedAt}</span>
                        <span>•</span>
                        <span>{exp.durationDays} Days</span>
                      </div>

                      <p className="text-xs text-foreground/80 font-medium">
                        {exp.currentEpochName}
                      </p>
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
                  <div className="flex items-center gap-2 pt-2 lg:pt-0 shrink-0">
                    {exp.status === "RUNNING" ? (
                      <Button
                        onClick={onResumeActiveExperiment}
                        size="sm"
                        className="rounded-xl bg-primary text-primary-foreground text-xs h-9 px-4 font-semibold flex items-center gap-1.5 shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Open Cockpit</span>
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
                        className="rounded-xl border-border text-foreground hover:bg-muted text-xs h-9 px-3.5 flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>Rerun Protocol</span>
                      </Button>
                    )}
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
