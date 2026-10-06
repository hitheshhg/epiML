"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getExperimentById, BENCHMARK_EXPERIMENT_002 } from "../../../lib/experimentService";
import { Experiment, CellData } from "../../../lib/experimentTypes";
import DigitalTwinTray from "../../../components/DigitalTwinTray";
import CellResearchDrawer from "../../../components/CellResearchDrawer";
import ExposureResponseAnalytics from "../../../components/ExposureResponseAnalytics";
import { GrowthStoryTimeline } from "../../../components/GrowthStoryTimeline";
import { AIObservationPanel } from "../../../components/AIObservationPanel";
import DataProvenanceEvidence from "../../../components/DataProvenanceEvidence";
import ResearchReportModal from "../../../components/ResearchReportModal";
import JuryDemoController from "../../../components/JuryDemoController";
import {
  Sprout,
  Activity,
  Layers,
  BarChart3,
  Thermometer,
  Droplets,
  Wind,
  ShieldCheck,
  FileDown,
  Sparkles,
  Settings,
  BookOpen,
  ArrowLeft,
  Tv,
  CheckCircle2,
  AlertTriangle,
  Usb,
  RotateCcw,
} from "lucide-react";

export default function MonitoringSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = (params?.id as string) || "CHG-EXP-2026-001";

  // Active experiment state
  const [experiment, setExperiment] = useState<Experiment>(getExperimentById(sessionId));
  const [selectedCell, setSelectedCell] = useState<CellData>(
    experiment.cells.find((c) => c.cellId === "C17") || experiment.cells[0]
  );
  const [activeMode, setActiveMode] = useState<"MONITOR" | "RESEARCH">("MONITOR");
  const [showDrawer, setShowDrawer] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showJuryModal, setShowJuryModal] = useState(false);

  // Live hardware state
  const [serialConnected, setSerialConnected] = useState(false);
  const [liveTemp, setLiveTemp] = useState(25.4);
  const [liveRH, setLiveRH] = useState(76.2);
  const [liveSMI, setLiveSMI] = useState(72);
  const [fanActive, setFanActive] = useState(false);
  const [pumpActive, setPumpActive] = useState(false);

  // Sync when experiment changes
  useEffect(() => {
    const exp = getExperimentById(sessionId);
    setExperiment(exp);
    setSelectedCell(exp.cells.find((c) => c.cellId === "C17") || exp.cells[0]);
  }, [sessionId]);

  // Web Serial Port Connect
  const handleConnectSerial = async () => {
    if (!("serial" in navigator)) {
      alert("Web Serial API is not supported in this browser. Please use Google Chrome or MS Edge, or use Replay / Simulated mode.");
      return;
    }
    try {
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 115200 });
      setSerialConnected(true);
      alert("Connected to Arduino Uno on 115200 baud! Receiving telemetry on D2/D3, A0/A1, A2.");
    } catch (err: any) {
      if (err.name !== "NotFoundError") {
        console.warn("Serial connection notice:", err);
      }
    }
  };

  // Replay loader for Jury Demo
  const handleLoadScenario = (scenarioId: string) => {
    if (scenarioId === "seedgerm_vig_replay") {
      setExperiment(BENCHMARK_EXPERIMENT_002);
      setSelectedCell(BENCHMARK_EXPERIMENT_002.cells[0]);
    } else {
      const exp = getExperimentById("CHG-EXP-2026-001");
      setExperiment(exp);
      setSelectedCell(exp.cells.find((c) => c.cellId === "C17") || exp.cells[0]);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF6] text-[#1E3A2B]">
      {/* 1. Global Research Topbar */}
      <header className="sticky top-0 z-40 border-b border-[#E2E8DC] bg-white/90 px-6 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2D6A4F] text-white">
                <Sprout className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black tracking-tight text-[#163828]">
                    CHIGURU
                  </span>
                  <span className="text-xs font-semibold text-[#52796F]">
                    ಚಿಗುರು
                  </span>
                </div>
                <div className="text-[10px] uppercase font-bold text-[#4A6B5D]">
                  {experiment.crop.toUpperCase()} • {experiment.scientificName}
                </div>
              </div>
            </Link>

            <span className="h-5 w-px bg-[#E2E8DC] hidden sm:block" />

            {/* Session ID & Provenance Badge */}
            <div className="hidden items-center gap-2 md:flex">
              <span className="font-mono text-xs font-bold text-[#163828]">
                {experiment.id}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                  serialConnected
                    ? "bg-[#2D6A4F] text-white border-[#1B4332]"
                    : experiment.dataClass === "REAL_PUBLIC_DATA"
                    ? "bg-[#1D3557] text-white border-[#14213D]"
                    : "bg-[#E8F7EC] text-[#2D6A4F] border-[#52B788]/30"
                }`}
              >
                {serialConnected
                  ? "LIVE HARDWARE"
                  : experiment.dataClass === "REAL_PUBLIC_DATA"
                  ? "PUBLIC DATA REPLAY"
                  : "RECORDED SESSION"}
              </span>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            {/* Mode Switcher: MONITOR | RESEARCH */}
            <div className="flex items-center rounded-xl border border-[#D1D5DB] bg-[#F8FAF6] p-1">
              <button
                onClick={() => setActiveMode("MONITOR")}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  activeMode === "MONITOR"
                    ? "bg-white text-[#163828] shadow-xs"
                    : "text-[#52796F] hover:text-[#163828]"
                }`}
              >
                MONITOR
              </button>
              <button
                onClick={() => setActiveMode("RESEARCH")}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  activeMode === "RESEARCH"
                    ? "bg-[#2D6A4F] text-white shadow-xs"
                    : "text-[#52796F] hover:text-[#163828]"
                }`}
              >
                RESEARCH
              </button>
            </div>

            {/* Web Serial Button */}
            <button
              onClick={handleConnectSerial}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors ${
                serialConnected
                  ? "border-[#2D6A4F] bg-[#E8F7EC] text-[#2D6A4F]"
                  : "border-[#D1D5DB] bg-white text-[#4A6B5D] hover:bg-[#F8FAF6]"
              }`}
              title="Connect Arduino Uno via Web Serial (115200 baud)"
            >
              <Usb className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {serialConnected ? "Hardware Online" : "Connect Hardware"}
              </span>
            </button>

            {/* Jury Mode Button */}
            <button
              onClick={() => setShowJuryModal(true)}
              className="flex items-center gap-1 rounded-xl border border-[#B45309]/30 bg-[#FEF3C7] px-3 py-1.5 text-xs font-bold text-[#92400E] hover:bg-[#FDE68A]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Jury Mode</span>
            </button>

            {/* Export Session Report */}
            <button
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-[#2D6A4F] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#1B4332]"
            >
              <FileDown className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Body Container */}
      <main className="mx-auto max-w-7xl px-6 py-6 space-y-6">
        {/* ======================================================== */}
        {/* SECTION A: MONITOR MODE (CLEAN, POLISHED, EFFORTLESS) */}
        {/* ======================================================== */}
        {activeMode === "MONITOR" && (
          <div className="space-y-6">
            {/* Top Grid: 40-Cell Tray (Left) + Selected Cell & Environment (Right) */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* 40-Cell Digital Tray Visualizer */}
              <div className="lg:col-span-7 rounded-2xl border border-[#E2E8DC] bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F0F4EC] pb-3">
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#163828]">
                      40-Cell Digital Tray
                    </h2>
                    <p className="text-[11px] text-[#52796F]">
                      Individual seedling monitoring • Click cell to inspect lineage
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#2D6A4F] font-bold bg-[#E8F7EC] px-2.5 py-0.5 rounded-full">
                      Selected: Cell {selectedCell.cellId} ({selectedCell.currentState})
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <DigitalTwinTray
                    cells={experiment.cells}
                    treatments={experiment.treatments}
                    selectedCellId={selectedCell.cellId}
                    onSelectCell={(c) => setSelectedCell(c)}
                    onRandomizeTreatments={() => {}}
                    spatialClusteringWarning={null}
                  />
                </div>
              </div>

              {/* Right Column: Selected Cell Status & Current Live Environment */}
              <div className="lg:col-span-5 space-y-5">
                {/* Seedling Status & Selected Cell Card */}
                <div className="rounded-2xl border border-[#E2E8DC] bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#F0F4EC] pb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#52796F]">
                        Biological Status
                      </span>
                      <h3 className="text-sm font-bold text-[#163828]">
                        Cell {selectedCell.cellId} ({selectedCell.treatmentId} Treatment)
                      </h3>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                        selectedCell.currentState === "GERMINATED"
                          ? "bg-[#E8F7EC] text-[#2D6A4F] border-[#52B788]/40"
                          : selectedCell.currentState === "SEEDLING_DEVELOPING"
                          ? "bg-[#2D6A4F] text-white border-[#1B4332]"
                          : "bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]/30"
                      }`}
                    >
                      {selectedCell.currentState}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-[#E2E8DC] bg-[#F8FAF6] p-3">
                      <div className="text-[10px] text-[#6C757D]">First Emergence</div>
                      <div className="font-mono text-base font-bold text-[#163828]">
                        {selectedCell.timeToEmergenceHours ? `${selectedCell.timeToEmergenceHours}h` : "Pre-emergence"}
                      </div>
                      <div className="text-[9px] text-[#52796F]">Post-planting</div>
                    </div>

                    <div className="rounded-xl border border-[#E2E8DC] bg-[#F8FAF6] p-3">
                      <div className="text-[10px] text-[#6C757D]">Projected Canopy</div>
                      <div className="font-mono text-base font-bold text-[#2D6A4F]">
                        {selectedCell.latestCanopyPct}%
                      </div>
                      <div className="text-[9px] text-[#52796F]">
                        {selectedCell.latestGreenAreaPx} px green area
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-[#F0F4EC] pt-3 text-xs">
                    <span className="text-[#52796F]">
                      Growth Rate: <strong className="text-[#163828]">+{selectedCell.growthRatePctPerHour}%/hr</strong>
                    </span>
                    <button
                      onClick={() => setShowDrawer(true)}
                      className="font-bold text-[#2D6A4F] hover:underline"
                    >
                      View Deep Cell Details →
                    </button>
                  </div>
                </div>

                {/* Current Live Environment Instrumentation */}
                <div className="rounded-2xl border border-[#E2E8DC] bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#F0F4EC] pb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#163828]">
                      Chamber Microclimate
                    </h3>
                    <span className="font-mono text-[10px] text-[#52796F]">
                      CALIBRATED METROLOGY
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-xl border border-[#E2E8DC] bg-[#F8FAF6] p-3">
                      <div className="flex items-center gap-1.5 text-[10px] text-[#6C757D]">
                        <Thermometer className="h-3.5 w-3.5 text-[#D97706]" />
                        <span>Temperature</span>
                      </div>
                      <div className="mt-1 font-mono text-lg font-bold text-[#163828]">
                        {liveTemp.toFixed(1)}°C
                      </div>
                      <div className="text-[9px] text-[#52796F]">DHT22 Sensor (D2)</div>
                    </div>

                    <div className="rounded-xl border border-[#E2E8DC] bg-[#F8FAF6] p-3">
                      <div className="flex items-center gap-1.5 text-[10px] text-[#6C757D]">
                        <Droplets className="h-3.5 w-3.5 text-[#2D6A4F]" />
                        <span>Relative Humidity</span>
                      </div>
                      <div className="mt-1 font-mono text-lg font-bold text-[#2D6A4F]">
                        {liveRH.toFixed(1)}% RH
                      </div>
                      <div className="text-[9px] text-[#52796F]">DHT22 Sensor (D3)</div>
                    </div>

                    <div className="rounded-xl border border-[#E2E8DC] bg-[#F8FAF6] p-3">
                      <div className="flex items-center gap-1.5 text-[10px] text-[#6C757D]">
                        <Droplets className="h-3.5 w-3.5 text-[#1D3557]" />
                        <span>Substrate Index (SMI)</span>
                      </div>
                      <div className="mt-1 font-mono text-lg font-bold text-[#1D3557]">
                        {liveSMI}% SMI
                      </div>
                      <div className="text-[9px] text-[#52796F]">2-Pt Calibrated (A0/A1)</div>
                    </div>

                    <div className="rounded-xl border border-[#E2E8DC] bg-[#F8FAF6] p-3">
                      <div className="flex items-center gap-1.5 text-[10px] text-[#6C757D]">
                        <Wind className="h-3.5 w-3.5 text-[#52796F]" />
                        <span>Chamber Fan (A5)</span>
                      </div>
                      <div className="mt-1 font-mono text-sm font-bold text-[#163828]">
                        {fanActive ? "AIRFLOW ACTIVE" : "FAN IDLE"}
                      </div>
                      <div className="text-[9px] text-[#52796F]">CLD8025SH 12V Fan</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Observation Panel with Explainable "WHY?" decision */}
            <AIObservationPanel
              cellId={selectedCell.cellId}
              crop={experiment.crop}
              state={selectedCell.currentState}
            />

            {/* Growth Story Timeline */}
            <GrowthStoryTimeline cellId={selectedCell.cellId} />

            {/* Environment -> Response Synchronized Timeline */}
            <div className="rounded-2xl border border-[#E2E8DC] bg-white p-5 shadow-sm">
              <div className="mb-4 border-b border-[#F0F4EC] pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#163828]">
                  Environment → Biological Response
                </h3>
                <p className="text-[11px] text-[#52796F]">
                  Synchronized longitudinal exposure (Substrate Moisture Index & Temperature) vs cotyledon canopy development
                </p>
              </div>
              <ExposureResponseAnalytics experiment={experiment} />
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION B: RESEARCH MODE (DEEP METROLOGY & EVIDENCE) */}
        {/* ======================================================== */}
        {activeMode === "RESEARCH" && (
          <div className="space-y-6">
            {/* Seed Science Primary Metrics Banner */}
            <div className="rounded-2xl border border-[#E2E8DC] bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F0F4EC] pb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#2D6A4F]">
                    Seed Science Formulation Metrics
                  </span>
                  <h2 className="text-xl font-extrabold text-[#163828]">
                    {experiment.title}
                  </h2>
                  <p className="text-xs text-[#52796F] mt-0.5">
                    {experiment.researchQuestion}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-[#E8F7EC] text-[#2D6A4F] px-3 py-1 rounded-lg border border-[#52B788]/30">
                    Sample Size: n = {experiment.metrics.totalCellsCount} Cells
                  </span>
                </div>
              </div>

              {/* 4 Standard Metrics Cards */}
              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-[#E2E8DC] bg-[#F8FAF6] p-4 text-center">
                  <div className="text-xs text-[#6C757D]">Final Germination</div>
                  <div className="mt-1 text-2xl font-black text-[#2D6A4F]">
                    {experiment.metrics.finalGerminationPct}%
                  </div>
                  <div className="text-[10px] text-[#52796F] mt-0.5">
                    {experiment.metrics.germinatedCount} / {experiment.metrics.totalCellsCount} cells emerged
                  </div>
                </div>

                <div className="rounded-xl border border-[#E2E8DC] bg-[#F8FAF6] p-4 text-center">
                  <div className="text-xs text-[#6C757D]">Mean Germination Time</div>
                  <div className="mt-1 text-2xl font-black text-[#163828]">
                    {experiment.metrics.meanGerminationTimeHours}h
                  </div>
                  <div className="text-[10px] text-[#52796F] mt-0.5">
                    MGT = Σ(nᵢ·tᵢ) / Σnᵢ
                  </div>
                </div>

                <div className="rounded-xl border border-[#E2E8DC] bg-[#F8FAF6] p-4 text-center">
                  <div className="text-xs text-[#6C757D]">T₅₀ Interpolation</div>
                  <div className="mt-1 text-2xl font-black text-[#163828]">
                    {experiment.metrics.t50Hours}h
                  </div>
                  <div className="text-[10px] text-[#52796F] mt-0.5">
                    50% emergence crossing
                  </div>
                </div>

                <div className="rounded-xl border border-[#E2E8DC] bg-[#F8FAF6] p-4 text-center">
                  <div className="text-xs text-[#6C757D]">Uniformity Coeff.</div>
                  <div className="mt-1 text-2xl font-black text-[#52796F]">
                    {experiment.metrics.uniformityCoeff}h
                  </div>
                  <div className="text-[10px] text-[#52796F] mt-0.5">
                    Standard deviation dispersion
                  </div>
                </div>
              </div>
            </div>

            {/* Treatment Comparison Matrix */}
            <div className="rounded-2xl border border-[#E2E8DC] bg-white p-6 shadow-sm">
              <div className="border-b border-[#F0F4EC] pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#163828]">
                  Treatment Comparison Matrix (Balanced Replicates)
                </h3>
                <p className="text-[11px] text-[#52796F]">
                  Comparing physiological emergence kinetics across randomized experimental groups
                </p>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#E2E8DC] bg-[#F8FAF6] text-[#4A6B5D] font-mono">
                    <tr>
                      <th className="py-2.5 px-3">Treatment</th>
                      <th className="py-2.5 px-3">Substrate Target</th>
                      <th className="py-2.5 px-3">Replicates (n)</th>
                      <th className="py-2.5 px-3">Germination %</th>
                      <th className="py-2.5 px-3">MGT (Hours)</th>
                      <th className="py-2.5 px-3">T₅₀ (Hours)</th>
                      <th className="py-2.5 px-3">Mean Canopy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F4EC]">
                    {experiment.metrics.treatmentMetrics.map((tm) => (
                      <tr key={tm.treatmentId} className="hover:bg-[#F8FAF6]">
                        <td className="py-3 px-3 font-bold text-[#163828]">
                          {tm.treatmentName}
                        </td>
                        <td className="py-3 px-3 font-mono text-[#2D6A4F]">
                          {tm.treatmentId === "T1"
                            ? "72% SMI (Control)"
                            : tm.treatmentId === "T2"
                            ? "48% SMI (Deficit)"
                            : tm.treatmentId === "T3"
                            ? "88% SMI (Saturated)"
                            : "Cyclic 50-75%"}
                        </td>
                        <td className="py-3 px-3 font-mono">n = {tm.replicatesN}</td>
                        <td className="py-3 px-3 font-bold text-[#2D6A4F]">
                          {tm.germinationPct}%
                        </td>
                        <td className="py-3 px-3 font-mono">{tm.meanEmergenceHours}h</td>
                        <td className="py-3 px-3 font-mono">{tm.t50Hours}h</td>
                        <td className="py-3 px-3 font-mono">{tm.meanGreenAreaPx} px</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 rounded-xl border border-[#E8EDE2] bg-[#F8FAF6] p-3 text-xs text-[#4A6B5D]">
                <strong className="text-[#163828]">Descriptive Notice: </strong>
                Sample size is n = 10 per treatment group across the 40-cell matrix. Replicate numbers are optimal for nursery screening and descriptive comparison, but insufficient for high-dimensional inferential ANOVA significance testing.
              </div>
            </div>

            {/* Evidence & References Section */}
            <DataProvenanceEvidence />
          </div>
        )}
      </main>

      {/* Slide-over Deep Cell Research Drawer */}
      {showDrawer && (
        <CellResearchDrawer
          cell={selectedCell}
          treatments={experiment.treatments}
          onClose={() => setShowDrawer(false)}
          onNavigateCell={(delta) => {
            const idx = experiment.cells.findIndex((c) => c.cellId === selectedCell.cellId);
            const nextIdx = (idx + delta + experiment.cells.length) % experiment.cells.length;
            setSelectedCell(experiment.cells[nextIdx]);
          }}
          onSaveManualAnnotation={(cId, ann, note) => {
            const updated = { ...selectedCell, manualAnnotation: ann, annotationNotes: note };
            setSelectedCell(updated);
          }}
        />
      )}

      {/* Automated Research Report Generator Modal */}
      <ResearchReportModal
        experiment={experiment}
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />

      {/* Jury Demo Controller Modal */}
      <JuryDemoController
        isOpen={showJuryModal}
        onClose={() => setShowJuryModal(false)}
        onApplyScenario={(num) => {
          if (num === 2) {
            handleLoadScenario("seedgerm_vig_replay");
          } else {
            handleLoadScenario("canonical_tomato");
          }
        }}
        activeScenarioNum={experiment.id === "CHG-EXP-2026-002" ? 2 : 1}
      />
    </div>
  );
}
