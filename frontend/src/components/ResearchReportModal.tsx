"use client";

import React from "react";
import { Experiment } from "@/lib/experimentTypes";
import { SCIENTIFIC_REFERENCES } from "@/lib/researchReferences";
import {
  X,
  Printer,
  Download,
  FileText,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Award,
} from "lucide-react";

interface ResearchReportModalProps {
  experiment: Experiment;
  isOpen: boolean;
  onClose: () => void;
}

export default function ResearchReportModal({
  experiment,
  isOpen,
  onClose,
}: ResearchReportModalProps) {
  if (!isOpen) return null;

  const m = experiment.metrics;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(experiment, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${experiment.id}_reproducible_dataset.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-[#E2E8F0] bg-[#FAFBF9] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#0F291E] text-white">
              <FileText className="w-4 h-4 text-[#74C69D]" />
            </span>
            <div>
              <h3 className="text-sm font-extrabold text-[#0F172A]">
                CHIGURU Automated Research Report
              </h3>
              <p className="text-[11px] text-[#64748B]">
                ID: {experiment.id} • Protocol: {experiment.protocolVersion}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#F8FAFC] hover:bg-[#E2E8F0] border border-[#CBD5E1] text-[#0F172A] flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={handleDownloadJson}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0F291E] hover:bg-[#1B4332] text-white flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#74C69D]" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#E2E8F0] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-xs text-[#334155]">
          
          {/* Document Header */}
          <div className="border-b border-[#E2E8F0] pb-5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#64748B]">
              <span>CHIGURU CYBER-PHYSICAL RESEARCH INSTRUMENT</span>
              <span>GEN: {new Date().toISOString()}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A]">
              {experiment.title}
            </h1>
            <p className="text-xs text-[#475569]">
              <strong>Principal Investigators:</strong> {experiment.researcherName} • <em>{experiment.institution}</em>
            </p>
          </div>

          {/* Section 1: Abstract & Question */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F291E]">1. Research Question & Hypothesis</h4>
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
              <p><strong>Research Question:</strong> "{experiment.researchQuestion}"</p>
              {experiment.hypothesis && (
                <p><strong>Hypothesis:</strong> "{experiment.hypothesis}"</p>
              )}
            </div>
          </div>

          {/* Section 2: Materials & Methods */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F291E]">2. Experimental Specifications</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
              <div className="p-2.5 rounded-lg border border-[#E2E8F0] bg-white">
                <span className="text-[#64748B] block">Species:</span>
                <strong>{experiment.scientificName}</strong>
              </div>
              <div className="p-2.5 rounded-lg border border-[#E2E8F0] bg-white">
                <span className="text-[#64748B] block">Cultivar:</span>
                <strong>{experiment.cultivarOrVariety}</strong>
              </div>
              <div className="p-2.5 rounded-lg border border-[#E2E8F0] bg-white">
                <span className="text-[#64748B] block">Seed Lot:</span>
                <strong>{experiment.seedLotId}</strong>
              </div>
              <div className="p-2.5 rounded-lg border border-[#E2E8F0] bg-white">
                <span className="text-[#64748B] block">Substrate:</span>
                <strong>{experiment.substrate}</strong>
              </div>
            </div>
          </div>

          {/* Section 3: Summary Results */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F291E]">3. Germination Performance Metrics</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-[#FAFBF9] border border-[#E2E8F0] text-center">
                <span className="text-[#64748B] block">Final Germination</span>
                <span className="text-xl font-black text-[#0F172A] mt-1 block">{m.finalGerminationPct}%</span>
                <span className="text-[10px] text-[#64748B]">({m.germinatedCount}/{m.totalCellsCount} cells)</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAFBF9] border border-[#E2E8F0] text-center">
                <span className="text-[#64748B] block">T50 (Emergence)</span>
                <span className="text-xl font-black text-[#0F172A] mt-1 block">{m.t50Hours} h</span>
                <span className="text-[10px] text-[#64748B]">Linear Interpolation</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAFBF9] border border-[#E2E8F0] text-center">
                <span className="text-[#64748B] block">Mean Germ. Time (MGT)</span>
                <span className="text-xl font-black text-[#0F172A] mt-1 block">{m.meanGerminationTimeHours} h</span>
                <span className="text-[10px] text-[#64748B]">Σ(ni·ti)/Σni</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAFBF9] border border-[#E2E8F0] text-center">
                <span className="text-[#64748B] block">Uniformity Coeff.</span>
                <span className="text-xl font-black text-[#0F172A] mt-1 block">±{m.uniformityCoeff} h</span>
                <span className="text-[10px] text-[#64748B]">Std. Dev of Emergence</span>
              </div>
            </div>
          </div>

          {/* Section 4: Treatment Matrix */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F291E]">4. Treatment Comparative Analysis</h4>
            <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] font-mono text-[11px] text-[#64748B]">
                  <tr>
                    <th className="p-2.5">Treatment</th>
                    <th className="p-2.5">Sample (n)</th>
                    <th className="p-2.5">Germination %</th>
                    <th className="p-2.5">Mean Emergence</th>
                    <th className="p-2.5">T50</th>
                    <th className="p-2.5">Canopy Area</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {m.treatmentMetrics.map((tm) => (
                    <tr key={tm.treatmentId}>
                      <td className="p-2.5 font-bold text-[#0F172A]">{tm.treatmentName}</td>
                      <td className="p-2.5 font-mono text-[#64748B]">n = {tm.replicatesN}</td>
                      <td className="p-2.5 font-mono font-bold text-[#0F291E]">{tm.germinationPct}%</td>
                      <td className="p-2.5 font-mono">{tm.meanEmergenceHours}h</td>
                      <td className="p-2.5 font-mono">{tm.t50Hours}h</td>
                      <td className="p-2.5 font-mono">{tm.meanGreenAreaPx} px</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 5: Methodological Limitations & Integrity */}
          <div className="p-3.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] space-y-1 text-[#92400E]">
            <strong className="block font-bold">5. Methodological Rigor & Limitations</strong>
            <p className="leading-relaxed">
              Results represent an exploratory screening in a 40-cell microclimate chamber. Due to prototype sample sizes (n = 10 per treatment group), reported comparisons are descriptive. Replicated block designs across multiple physical trays are required before drawing causal agronomic conclusions.
            </p>
          </div>

          {/* Section 6: Literature References */}
          <div className="space-y-1.5 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F291E]">6. Scientific References</h4>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-[#64748B]">
              <li>Colmer et al. (2020). <em>SeedGerm</em>. New Phytologist. DOI: 10.1111/nph.16736.</li>
              <li>Dai et al. (2025). <em>SeedGerm-VIG</em>. GigaScience. DOI: 10.1093/gigascience/giaf129.</li>
              <li>Fahlgren et al. (2020). <em>PlantCV</em>. PeerJ. DOI: 10.7717/peerj.8905.</li>
              <li>Cho & Yang (2023). <em>High-Throughput Plant Phenotyping</em>. Agriculture. DOI: 10.3390/agriculture13101874.</li>
            </ol>
          </div>

        </div>

      </div>
    </div>
  );
}
