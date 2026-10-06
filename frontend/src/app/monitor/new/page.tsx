"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SEED_PROFILES, SeedProfile, searchSeedProfiles } from "../../../lib/seedProfiles";
import {
  Sprout,
  Search,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Camera,
  Sliders,
  ShieldCheck,
  BookOpen,
  Info,
  Thermometer,
  Droplets,
  Clock,
  Sparkles,
} from "lucide-react";

export default function NewMonitoringSessionPage() {
  const router = useRouter();

  // Multi-step onboarding: 1: Search & Select -> 2: Preparing Profile -> 3: Profile Preview -> 4: Camera Setup -> 5: Launch
  const [step, setStep] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<SeedProfile>(SEED_PROFILES[0]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Advanced fields
  const [sessionTitle, setSessionTitle] = useState("Tomato Hydration Gradient Experiment");
  const [seedLotId, setSeedLotId] = useState("LOT-2026-TOM-01");
  const [researcherName, setResearcherName] = useState("Team TerraByte");

  const filteredProfiles = searchSeedProfiles(searchQuery);

  const handleSelectSeed = (p: SeedProfile) => {
    setSelectedProfile(p);
    setSessionTitle(`${p.commonName} Monitoring Run`);
    setSeedLotId(`LOT-2026-${p.crop.toUpperCase().slice(0, 3)}-01`);
    setStep(2); // Show "Preparing your monitoring profile..."
  };

  useEffect(() => {
    if (step === 2) {
      const timer = setTimeout(() => {
        setStep(3); // Transition to profile preview
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleStartMonitoring = () => {
    // Navigate to active session monitor
    router.push("/monitor/CHG-EXP-2026-001");
  };

  return (
    <div className="min-h-screen bg-[#F8FAF6] text-[#1E3A2B]">
      {/* Header */}
      <header className="border-b border-[#E2E8DC] bg-white/90 px-6 py-3.5 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2D6A4F] text-white">
              <Sprout className="h-4 w-4" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-[#163828]">
                CHIGURU
              </span>
              <span className="ml-1 text-xs text-[#52796F]">ಚಿಗುರು</span>
            </div>
          </Link>

          {/* Stepper indicators */}
          <div className="flex items-center gap-2 text-xs font-semibold text-[#52796F]">
            <span className={step >= 1 ? "text-[#2D6A4F] font-bold" : "text-[#9CA3AF]"}>
              1. Select Seed
            </span>
            <span>•</span>
            <span className={step >= 3 ? "text-[#2D6A4F] font-bold" : "text-[#9CA3AF]"}>
              2. Profile
            </span>
            <span>•</span>
            <span className={step >= 4 ? "text-[#2D6A4F] font-bold" : "text-[#9CA3AF]"}>
              3. Setup Tray
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        {/* ======================================================== */}
        {/* STEP 1: WHAT ARE YOU MONITORING? (SEARCH / SELECT) */}
        {/* ======================================================== */}
        {step === 1 && (
          <div>
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2D6A4F]">
                New Monitoring Session
              </span>
              <h1 className="mt-2 text-3xl font-extrabold text-[#163828]">
                What are you monitoring?
              </h1>
              <p className="mt-2 text-sm text-[#4A6B5D] max-w-lg mx-auto">
                Select your plant. CHIGURU will retrieve literature-backed biological targets, optimal germination kinetics, and computer-vision parameters.
              </p>
            </div>

            {/* Search Input */}
            <div className="mt-8 relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-[#9CA3AF]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search seed or botanical name (e.g., Tomato, Chilli, Solanum)..."
                className="w-full rounded-2xl border border-[#D1D5DB] bg-white pl-11 pr-4 py-3 text-sm text-[#163828] placeholder-[#9CA3AF] shadow-sm focus:border-[#2D6A4F] focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
              />
            </div>

            {/* Seed Profile Selection Grid */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProfiles.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleSelectSeed(p)}
                  className="group cursor-pointer rounded-2xl border border-[#E2E8DC] bg-white p-5 shadow-sm transition-all hover:border-[#74C69D] hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#52796F]">
                        {p.family}
                      </span>
                      <h3 className="text-lg font-bold text-[#163828] group-hover:text-[#2D6A4F] transition-colors">
                        {p.commonName}
                      </h3>
                      <p className="text-xs italic text-[#6C757D]">
                        {p.scientificName}
                      </p>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E8F7EC] text-[#2D6A4F] group-hover:bg-[#2D6A4F] group-hover:text-white transition-all">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="mt-4 border-t border-[#F0F4EC] pt-3 text-[11px] text-[#4A6B5D] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[#6C757D]">Opt. Temperature:</span>
                      <span className="font-mono font-semibold text-[#163828]">{p.temperature.optimal}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6C757D]">Substrate Moisture:</span>
                      <span className="font-mono font-semibold text-[#163828]">{p.substrateMoistureIndex.optimal}% SMI</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6C757D]">Emergence Window:</span>
                      <span className="font-mono font-semibold text-[#2D6A4F]">{p.germinationDays.min}–{p.germinationDays.typical} days</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 2: LOADING TRANSITION */}
        {/* ======================================================== */}
        {step === 2 && (
          <div className="py-20 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F7EC] text-[#2D6A4F] animate-bounce">
              <Sprout className="h-7 w-7" />
            </div>
            <h2 className="mt-6 text-xl font-bold text-[#163828]">
              Preparing your monitoring profile...
            </h2>
            <p className="mt-1 text-xs text-[#52796F]">
              Retrieving peer-reviewed ISTA/ICAR physiological standards for {selectedProfile.commonName} ({selectedProfile.scientificName})
            </p>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 3: PROFILE PREVIEW */}
        {/* ======================================================== */}
        {step === 3 && (
          <div>
            <div className="rounded-2xl border border-[#E2E8DC] bg-white p-7 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F0F4EC] pb-5">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2D6A4F]">
                    {selectedProfile.family} • Botanical Profile
                  </span>
                  <h1 className="mt-1 text-3xl font-extrabold text-[#163828]">
                    {selectedProfile.commonName}
                  </h1>
                  <p className="text-sm italic text-[#52796F]">
                    {selectedProfile.scientificName}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStep(1)}
                    className="rounded-xl border border-[#D1D5DB] px-3.5 py-2 text-xs font-bold text-[#4A6B5D] hover:bg-[#F8FAF6]"
                  >
                    Change Seed
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    className="flex items-center gap-1.5 rounded-xl bg-[#2D6A4F] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#1B4332]"
                  >
                    <span>Confirm & Setup Tray</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Core Biological Targets Grid */}
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-[#E2E8DC] bg-[#F8FAF6] p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#163828]">
                    <Thermometer className="h-4 w-4 text-[#D97706]" />
                    <span>Temperature Range</span>
                  </div>
                  <div className="mt-2 text-2xl font-black text-[#163828]">
                    {selectedProfile.temperature.optimal}°C
                  </div>
                  <div className="text-[11px] text-[#52796F] mt-0.5">
                    Permissible: {selectedProfile.temperature.min}°C – {selectedProfile.temperature.max}°C
                  </div>
                </div>

                <div className="rounded-xl border border-[#E2E8DC] bg-[#F8FAF6] p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#163828]">
                    <Droplets className="h-4 w-4 text-[#2D6A4F]" />
                    <span>Substrate Moisture (SMI)</span>
                  </div>
                  <div className="mt-2 text-2xl font-black text-[#2D6A4F]">
                    {selectedProfile.substrateMoistureIndex.optimal}%
                  </div>
                  <div className="text-[11px] text-[#52796F] mt-0.5">
                    Target range: {selectedProfile.substrateMoistureIndex.min}% – {selectedProfile.substrateMoistureIndex.max}% SMI
                  </div>
                </div>

                <div className="rounded-xl border border-[#E2E8DC] bg-[#F8FAF6] p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#163828]">
                    <Clock className="h-4 w-4 text-[#1D3557]" />
                    <span>Germination Window</span>
                  </div>
                  <div className="mt-2 text-2xl font-black text-[#1D3557]">
                    {selectedProfile.germinationDays.typical} Days
                  </div>
                  <div className="text-[11px] text-[#52796F] mt-0.5">
                    Initial emergence: {selectedProfile.germinationDays.min} to {selectedProfile.germinationDays.max} days
                  </div>
                </div>
              </div>

              {/* Additional Context */}
              <div className="mt-5 rounded-xl border border-[#E8EDE2] bg-[#F8FAF6]/60 p-4 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-[#2D6A4F] shrink-0 mt-0.5" />
                  <p className="text-[#4A6B5D] leading-relaxed">
                    <strong className="text-[#163828]">Light & Substrate:</strong> {selectedProfile.lightRequirement}. Calibrated to {selectedProfile.substrateMoistureIndex.substrateType}.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#2D6A4F] shrink-0 mt-0.5" />
                  <p className="text-[#4A6B5D] leading-relaxed">
                    <strong className="text-[#163828]">Cotyledon Morphology:</strong> {selectedProfile.cotyledonMorphology}.
                  </p>
                </div>
              </div>

              {/* Provenance Footer */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#F0F4EC] pt-4 text-[11px] text-[#6C757D]">
                <div>
                  <span className="font-semibold text-[#163828]">Source: </span>
                  {selectedProfile.evidence.primarySource} ({selectedProfile.evidence.doiOrCitation})
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-[#E8F7EC] text-[#2D6A4F] px-2 py-0.5 rounded font-bold">
                    {selectedProfile.evidence.profileVersion}
                  </span>
                  <Link
                    href="/sources"
                    className="text-[#2D6A4F] font-bold hover:underline"
                  >
                    View Scientific Sources
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 4: PLACE TRAY UNDER CAMERA & LAUNCH */}
        {/* ======================================================== */}
        {step === 4 && (
          <div className="rounded-2xl border border-[#E2E8DC] bg-white p-7 shadow-sm">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F7EC] text-[#2D6A4F]">
                <Camera className="h-6 w-6" />
              </div>
              <h1 className="mt-4 text-2xl font-bold text-[#163828]">
                Place the tray under the camera
              </h1>
              <p className="mt-1 text-xs text-[#52796F] max-w-md mx-auto">
                Align the 40-cell (5×8) nursery tray within the overhead 420mm camera field of view.
              </p>
            </div>

            {/* Visual Alignment Box */}
            <div className="mt-8 rounded-xl border border-dashed border-[#52B788] bg-[#F8FAF6] p-6 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#2D6A4F]/30 bg-[#E8F7EC] px-3.5 py-1 text-xs font-bold text-[#2D6A4F]">
                <CheckCircle2 className="h-4 w-4" />
                <span>CAMERA ALIGNED • 40 CELLS REGISTERED</span>
              </div>
              <p className="mt-3 text-xs text-[#4A6B5D]">
                Overhead RGB gantry: 420 mm perpendicular focal distance • Perspective matrix locked • 4 corner markers confirmed.
              </p>
            </div>

            {/* Advanced Research Accordion */}
            <div className="mt-6 border-t border-[#F0F4EC] pt-4">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#52796F] hover:text-[#163828]"
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>{showAdvanced ? "Hide Advanced Research Settings" : "Advanced Research Settings (Optional)"}</span>
              </button>

              {showAdvanced && (
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-xl border border-[#E2E8DC] bg-[#F8FAF6] p-4 text-xs">
                  <div>
                    <label className="font-bold text-[#163828]">Experiment Title</label>
                    <input
                      type="text"
                      value={sessionTitle}
                      onChange={(e) => setSessionTitle(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#163828]">Seed Lot ID</label>
                    <input
                      type="text"
                      value={seedLotId}
                      onChange={(e) => setSeedLotId(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#163828]">Lead Researcher</label>
                    <input
                      type="text"
                      value={researcherName}
                      onChange={(e) => setResearcherName(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#163828]">Treatment Layout</label>
                    <div className="mt-1 font-mono text-[#2D6A4F]">
                      4 Treatments (T1-T4) Randomized • Balanced 10 reps
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Big Launch CTA */}
            <div className="mt-8 flex items-center justify-between border-t border-[#F0F4EC] pt-5">
              <button
                onClick={() => setStep(3)}
                className="rounded-xl border border-[#D1D5DB] px-4 py-2.5 text-xs font-bold text-[#4A6B5D] hover:bg-[#F8FAF6]"
              >
                Back to Profile
              </button>

              <button
                onClick={handleStartMonitoring}
                className="flex items-center gap-2 rounded-xl bg-[#2D6A4F] px-8 py-3.5 text-sm font-bold text-white shadow-md hover:bg-[#1B4332] hover:shadow-lg transition-all"
              >
                <span>START MONITORING</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
