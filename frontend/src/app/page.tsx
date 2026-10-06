"use client";

import React from "react";
import Link from "next/link";
import { LandingHeroTray } from "../components/LandingHeroTray";
import { useAuth } from "../context/AuthContext";
import {
  Sprout,
  ArrowRight,
  Eye,
  Activity,
  Database,
  Cpu,
  BookOpen,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  FileSpreadsheet,
  Layers,
  Sparkles,
} from "lucide-react";

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8FAF6] text-[#1E3A2B] selection:bg-[#52B788]/20 selection:text-[#163828]">
      {/* 1. Global Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-[#E2E8DC]/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2D6A4F] text-white shadow-sm">
              <Sprout className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-[#163828]">
                  CHIGURU
                </span>
                <span className="text-xs font-semibold text-[#52796F]">
                  ಚಿಗುರು
                </span>
              </div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-[#4A6B5D]">
                Seed & Seedling Research Platform
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-xs font-semibold text-[#4A6B5D] md:flex">
            <a href="#problem" className="hover:text-[#163828] transition-colors">
              The Problem
            </a>
            <a href="#how-it-works" className="hover:text-[#163828] transition-colors">
              How it Works
            </a>
            <a href="#research" className="hover:text-[#163828] transition-colors">
              Research
            </a>
            <a href="#technology" className="hover:text-[#163828] transition-colors">
              Technology
            </a>
            <Link href="/sources" className="hover:text-[#163828] transition-colors">
              Evidence & Sources
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/monitor/CHG-EXP-2026-001"
                className="flex items-center gap-1.5 rounded-lg border border-[#2D6A4F] bg-[#2D6A4F] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#1B4332] transition-colors"
              >
                <span>Open Active Monitor</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg px-3.5 py-1.5 text-xs font-bold text-[#2D6A4F] hover:bg-[#E8F7EC] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/monitor/new"
                  className="flex items-center gap-1.5 rounded-lg border border-[#2D6A4F] bg-[#2D6A4F] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#1B4332] transition-colors"
                >
                  <span>Start Monitoring</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* Left Headline Column */}
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#52B788]/30 bg-[#E8F7EC] px-3.5 py-1 text-xs font-semibold text-[#1E4D36]">
                <span className="h-2 w-2 rounded-full bg-[#2D6A4F] animate-pulse" />
                YEN NOVA 1.0 • Yenepoya Institute of Technology
              </div>

              <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-[#163828] sm:text-5xl lg:text-6xl">
                See the seed <br />
                <span className="text-[#2D6A4F]">become a seedling.</span>
              </h1>

              <p className="mt-5 text-base leading-relaxed text-[#4A6B5D] sm:text-lg">
                An intelligent seed and seedling monitoring platform that combines
                environmental sensing, computer vision and scientific data to follow plant development from seed to sprout.
              </p>

              {/* Exact Product Statement */}
              <div className="mt-6 rounded-xl border border-[#D8F3DC] bg-[#E8F7EC]/60 p-4">
                <p className="text-xs font-bold text-[#163828] leading-relaxed">
                  “CHIGURU transforms a nursery tray into a living digital record —
                  connecting what a seed experiences with what a camera observes.”
                </p>
                <p className="mt-1 text-[11px] font-medium text-[#2D6A4F]">
                  Select a seed. Start monitoring. Let Chiguru build the story.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/monitor/new"
                  className="flex items-center gap-2 rounded-xl border border-[#2D6A4F] bg-[#2D6A4F] px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-[#1B4332] hover:shadow-lg transition-all"
                >
                  <span>START MONITORING</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <a
                  href="#how-it-works"
                  className="rounded-xl border border-[#D1D5DB] bg-white px-5 py-3.5 text-sm font-bold text-[#163828] hover:bg-[#F3F4F6] transition-colors"
                >
                  EXPLORE CHIGURU
                </a>
              </div>

              {/* Micro Confidence Callout */}
              <div className="mt-8 flex items-center gap-6 text-xs text-[#52796F]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#2D6A4F]" />
                  <span>40-Cell Persistent Identity</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#2D6A4F]" />
                  <span>Zero Fabricated Data</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#2D6A4F]" />
                  <span>Literature-Backed Context</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visualization Column */}
            <div className="lg:col-span-6">
              <LandingHeroTray />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Section: THE PROBLEM */}
      <section id="problem" className="border-t border-[#E2E8DC] bg-white py-16">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2D6A4F]">
            The Problem
          </span>
          <h2 className="mt-2 text-2xl font-bold text-[#163828] sm:text-3xl">
            Most seed monitoring is manual, periodic and disconnected from environmental history.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[#4A6B5D] max-w-3xl mx-auto">
            Traditional nursery evaluations rely on sporadic visual inspection. When an individual seed fails to germinate or shows delayed vigor, researchers cannot answer the central question: <em>What specific microclimate spike or moisture deficit did this exact cell experience in the 72 hours prior to emergence?</em>
          </p>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3 text-left">
            <div className="rounded-xl border border-[#E2E8DC] bg-[#F8FAF6] p-5">
              <div className="text-xs font-mono font-bold text-[#B45309]">01. DISCONNECTED TELEMETRY</div>
              <h3 className="mt-2 text-sm font-bold text-[#163828]">Bulk Chamber Averages</h3>
              <p className="mt-1 text-xs text-[#4A6B5D] leading-relaxed">
                Single ambient sensors miss spatial gradients across the tray, masking moisture skews between edge and center cells.
              </p>
            </div>
            <div className="rounded-xl border border-[#E2E8DC] bg-[#F8FAF6] p-5">
              <div className="text-xs font-mono font-bold text-[#B45309]">02. SUBJECTIVE SAMPLING</div>
              <h3 className="mt-2 text-sm font-bold text-[#163828]">Infrequent Manual Checks</h3>
              <p className="mt-1 text-xs text-[#4A6B5D] leading-relaxed">
                Human counts once a day miss exact emergence hours ($T_{50}$) and fail to capture transient cotyledon expansion kinetics.
              </p>
            </div>
            <div className="rounded-xl border border-[#E2E8DC] bg-[#F8FAF6] p-5">
              <div className="text-xs font-mono font-bold text-[#B45309]">03. UNREPRODUCIBLE DATA</div>
              <h3 className="mt-2 text-sm font-bold text-[#163828]">Lost Experimental Lineage</h3>
              <p className="mt-1 text-xs text-[#4A6B5D] leading-relaxed">
                Actuator events (irrigation pulses, ventilation cycles) are rarely time-synchronized with raw visual time-lapse evidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Section: THE IDEA */}
      <section className="border-t border-[#E2E8DC] bg-[#E8F7EC]/30 py-16">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2D6A4F]">
            The Idea
          </span>
          <h2 className="mt-2 text-2xl font-bold text-[#163828] sm:text-3xl">
            Chiguru connects what the seed experiences with what the camera observes.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[#4A6B5D] max-w-3xl mx-auto">
            By fusing continuous microclimate acquisition with cell-level computer vision, CHIGURU creates an unbroken temporal audit trail for all 40 cells in a standard nursery tray.
          </p>

          <div className="mt-10 rounded-2xl border border-[#D8F3DC] bg-white p-6 shadow-sm">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E8EDE2]">
              <div className="p-3 text-center">
                <div className="text-2xl font-black text-[#2D6A4F]">40</div>
                <div className="text-xs font-semibold text-[#163828] mt-1">Cell Digital Twins</div>
                <div className="text-[11px] text-[#52796F]">Individual C01-C40 lineage</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-2xl font-black text-[#2D6A4F]">Hourly</div>
                <div className="text-xs font-semibold text-[#163828] mt-1">Time-Lapse Phenotyping</div>
                <div className="text-[11px] text-[#52796F]">ExG = 2G − R − B segmentation</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-2xl font-black text-[#2D6A4F]">2-Point</div>
                <div className="text-xs font-semibold text-[#163828] mt-1">Substrate Index (SMI)</div>
                <div className="text-[11px] text-[#52796F]">Calibrated capacitive metrology</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-2xl font-black text-[#2D6A4F]">Zero</div>
                <div className="text-xs font-semibold text-[#163828] mt-1">Fabricated Data</div>
                <div className="text-[11px] text-[#52796F]">Strict scientific provenance</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Section: HOW IT WORKS */}
      <section id="how-it-works" className="border-t border-[#E2E8DC] bg-white py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2D6A4F]">
              Workflow
            </span>
            <h2 className="mt-2 text-2xl font-bold text-[#163828] sm:text-3xl">
              From Seed to Scientific Evidence in 4 Steps
            </h2>
            <div className="mt-4 flex items-center justify-center gap-3 text-xs font-mono font-bold text-[#2D6A4F]">
              <span>SEED</span>
              <span>→</span>
              <span>SENSE</span>
              <span>→</span>
              <span>SEE</span>
              <span>→</span>
              <span>UNDERSTAND</span>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Step 1 */}
            <div className="rounded-2xl border border-[#E2E8DC] bg-[#F8FAF6] p-6 transition-all hover:border-[#74C69D] hover:shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2D6A4F]/10 text-[#2D6A4F] font-bold">
                1
              </div>
              <h3 className="mt-4 text-base font-bold text-[#163828]">Select the Seed</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#4A6B5D]">
                Choose Tomato, Chilli, Capsicum, Brinjal, or Cabbage. CHIGURU instantly loads peer-reviewed biological profiles with germination temperature, RH, and Substrate Moisture Index ranges.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl border border-[#E2E8DC] bg-[#F8FAF6] p-6 transition-all hover:border-[#74C69D] hover:shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2D6A4F]/10 text-[#2D6A4F] font-bold">
                2
              </div>
              <h3 className="mt-4 text-base font-bold text-[#163828]">Continuous Sensing</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#4A6B5D]">
                Dual calibrated soil probes, DHT22 sensors, and MQ135 monitor substrate moisture, vapor pressure deficit, and temperature. Actuators provide micro-pulsed hydration and chamber airflow.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl border border-[#E2E8DC] bg-[#F8FAF6] p-6 transition-all hover:border-[#74C69D] hover:shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2D6A4F]/10 text-[#2D6A4F] font-bold">
                3
              </div>
              <h3 className="mt-4 text-base font-bold text-[#163828]">Computer Vision</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#4A6B5D]">
                Overhead gantry camera executes automated perspective correction, 40-cell grid alignment, and Excess Green ($2G - R - B$) segmentation to extract canopy area and flag emergence.
              </p>
            </div>

            {/* Step 4 */}
            <div className="rounded-2xl border border-[#E2E8DC] bg-[#F8FAF6] p-6 transition-all hover:border-[#74C69D] hover:shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2D6A4F]/10 text-[#2D6A4F] font-bold">
                4
              </div>
              <h3 className="mt-4 text-base font-bold text-[#163828]">AI-Assisted Evidence</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#4A6B5D]">
                Exposure $\leftrightarrow$ Response analytics link environmental fluctuations with growth trajectories. Server-side Gemini provides explainable biological interpretations without black-box claims.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Section: RESEARCH READY */}
      <section id="research" className="border-t border-[#E2E8DC] bg-[#F8FAF6] py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2D6A4F]">
                Research Ready
              </span>
              <h2 className="mt-2 text-2xl font-bold text-[#163828] sm:text-3xl">
                Rigorous seed-science metrology underneath an effortless interface.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[#4A6B5D]">
                CHIGURU implements standard seed-science mathematical formulations, eliminating guesswork while adhering to strict academic integrity standards:
              </p>

              <div className="mt-6 space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-md bg-[#2D6A4F]/10 p-1 text-[#2D6A4F]">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#163828]">Mean Germination Time (MGT)</h4>
                    <p className="text-xs text-[#52796F]">
                      Computed using literature formulation: MGT = Σ(nᵢ × tᵢ) / Σnᵢ.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-md bg-[#2D6A4F]/10 p-1 text-[#2D6A4F]">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#163828]">T₅₀ with Linear Interpolation</h4>
                    <p className="text-xs text-[#52796F]">
                      Interpolates exact midpoint emergence hours rather than relying on discrete observation step rounding.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-md bg-[#2D6A4F]/10 p-1 text-[#2D6A4F]">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#163828]">Randomized Treatment Allocation</h4>
                    <p className="text-xs text-[#52796F]">
                      Balanced replication with spatial clustering bias detection across tray quadrants to eliminate edge effects.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-md bg-[#2D6A4F]/10 p-1 text-[#2D6A4F]">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#163828]">One-Click Research Dataset Export</h4>
                    <p className="text-xs text-[#52796F]">
                      Export complete experimental bundles including CSVs, raw images, calibration JSON, and automated PDF reports.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href="/sources"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2D6A4F] hover:underline"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Explore Literature References (SeedGerm, SeedGerm-VIG, PlantCV)</span>
                </Link>
              </div>
            </div>

            {/* Scientific Evidence Preview Card */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-[#E2E8DC] bg-white p-6 shadow-md">
                <div className="flex items-center justify-between border-b border-[#F0F4EC] pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#52796F]">
                      Active Experiment
                    </span>
                    <h3 className="text-sm font-bold text-[#163828]">
                      CHG-EXP-2026-001 (Tomato Hydration Gradient)
                    </h3>
                  </div>
                  <span className="rounded-full border border-[#2D6A4F]/30 bg-[#E8F7EC] px-2.5 py-0.5 text-[10px] font-bold text-[#2D6A4F]">
                    MEASURED • LIVE HARDWARE
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-[#E2E8DC] bg-[#F8FAF6] p-3 text-center">
                    <div className="text-[10px] text-[#6C757D]">Final Germination</div>
                    <div className="text-lg font-black text-[#2D6A4F]">87.5%</div>
                    <div className="text-[9px] text-[#52796F]">35 / 40 Cells</div>
                  </div>
                  <div className="rounded-xl border border-[#E2E8DC] bg-[#F8FAF6] p-3 text-center">
                    <div className="text-[10px] text-[#6C757D]">MGT (Mean Time)</div>
                    <div className="text-lg font-black text-[#163828]">48.2h</div>
                    <div className="text-[9px] text-[#52796F]">Mean Germ Time</div>
                  </div>
                  <div className="rounded-xl border border-[#E2E8DC] bg-[#F8FAF6] p-3 text-center">
                    <div className="text-[10px] text-[#6C757D]">T₅₀ Interpolated</div>
                    <div className="text-lg font-black text-[#163828]">42.0h</div>
                    <div className="text-[9px] text-[#52796F]">Midpoint Emergence</div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-[#E8EDE2] bg-[#F8FAF6] p-3.5 text-xs">
                  <div className="font-semibold text-[#163828] flex items-center justify-between">
                    <span>Statistical Honesty Policy</span>
                    <span className="font-mono text-[10px] text-[#D97706]">n = 10 / treatment</span>
                  </div>
                  <p className="mt-1 text-[11px] text-[#4A6B5D] leading-relaxed">
                    “Descriptive comparison only — replicate sample size ($n=10$) is appropriate for nursery pilot observation but insufficient for inferential ANOVA significance testing.”
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Section: TECHNOLOGY & HARDWARE INTEGRATION */}
      <section id="technology" className="border-t border-[#E2E8DC] bg-white py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2D6A4F]">
              Hardware Architecture
            </span>
            <h2 className="mt-2 text-2xl font-bold text-[#163828] sm:text-3xl">
              Precision Cyber-Physical Nursery Gantry
            </h2>
            <p className="mt-3 text-sm text-[#4A6B5D]">
              Physical Arduino Uno gantry paired with Web Serial API (115200 baud) and low-latency computer vision.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-[#E2E8DC] bg-[#F8FAF6] p-5">
              <Cpu className="h-6 w-6 text-[#2D6A4F]" />
              <h3 className="mt-3 text-sm font-bold text-[#163828]">Arduino Uno Controller</h3>
              <p className="mt-1 text-xs text-[#52796F] leading-relaxed">
                Deterministic hardware acquisition. D2/D3 DHT22, A0/A1 capacitive probes, A2 MQ135 VOC proxy, A5 fan driver, D13 relay.
              </p>
            </div>
            <div className="rounded-xl border border-[#E2E8DC] bg-[#F8FAF6] p-5">
              <Eye className="h-6 w-6 text-[#2D6A4F]" />
              <h3 className="mt-3 text-sm font-bold text-[#163828]">420mm Overhead RGB</h3>
              <p className="mt-1 text-xs text-[#52796F] leading-relaxed">
                Fixed-focus optical gantry capturing non-destructive cotyledon canopy development without disturbing substrate.
              </p>
            </div>
            <div className="rounded-xl border border-[#E2E8DC] bg-[#F8FAF6] p-5">
              <Activity className="h-6 w-6 text-[#2D6A4F]" />
              <h3 className="mt-3 text-sm font-bold text-[#163828]">CLD8025SH Chamber Fan</h3>
              <p className="mt-1 text-xs text-[#52796F] leading-relaxed">
                Dedicated 12V airflow actuator on pin A5 via MOSFET driver for humidity boundary layer disruption and thermal relief.
              </p>
            </div>
            <div className="rounded-xl border border-[#E2E8DC] bg-[#F8FAF6] p-5">
              <ShieldCheck className="h-6 w-6 text-[#2D6A4F]" />
              <h3 className="mt-3 text-sm font-bold text-[#163828]">Intelligent Refusal Engine</h3>
              <p className="mt-1 text-xs text-[#52796F] leading-relaxed">
                Action withholding under high RH + recent pulse cooldowns to mitigate hypoxia and Pythium damping-off vulnerability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Final CTA Section */}
      <section className="border-t border-[#E2E8DC] bg-[#163828] py-20 text-white">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#74C69D]">
            <Sprout className="h-3.5 w-3.5" />
            Begin Seedling Observation
          </span>

          <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl lg:text-5xl">
            Start observing.
          </h2>

          <p className="mt-4 text-base text-[#D8F3DC]/80 max-w-2xl mx-auto">
            Turn your nursery seedling tray into a programmable, continuously monitored biological experiment.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/monitor/new"
              className="flex items-center gap-2 rounded-xl bg-[#52B788] px-7 py-3.5 text-sm font-bold text-[#0F291E] shadow-lg hover:bg-[#74C69D] transition-all"
            >
              <span>START MONITORING</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/sources"
              className="rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-bold text-white hover:bg-white/10 transition-colors"
            >
              VIEW EVIDENCE & BENCHMARKS
            </Link>
          </div>

          <p className="mt-8 text-xs text-white/50">
            Open-source cyber-physical platform developed by Team TerraByte • Yenepoya Institute of Technology, Moodbidri
          </p>
        </div>
      </section>
    </div>
  );
}
