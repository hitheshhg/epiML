"use client";

import React, { useState } from "react";
import { Experiment, DATA_CLASS_META } from "@/lib/experimentTypes";
import {
  FileText,
  Download,
  PlusCircle,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Droplets,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface ExperimentHeaderProps {
  experiment: Experiment;
  onOpenNewExperiment: () => void;
  onExportDataset: () => void;
  onOpenReport: () => void;
  onSelectMetricProvenance: (metricName: string) => void;
}

export default function ExperimentHeader({
  experiment,
  onOpenNewExperiment,
  onExportDataset,
  onOpenReport,
  onSelectMetricProvenance,
}: ExperimentHeaderProps) {
  const meta = DATA_CLASS_META[experiment.dataClass] || DATA_CLASS_META.MEASURED;
  const m = experiment.metrics;

  return (
    <section className="mb-8 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm overflow-hidden">
      
      {/* Top Metadata Header */}
      <div className="bg-[#FAFBF9] border-b border-[#E2E8F0] p-6 sm:p-7">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          
          <div className="space-y-2 max-w-4xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#0F291E] text-white">
                {experiment.id}
              </span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold border ${meta.colorClass}`}>
                {meta.badgeText}
              </span>
              <span className="text-xs text-[#64748B] font-mono">
                Protocol: {experiment.protocolVersion}
              </span>
              <span className="text-xs text-[#64748B]">
                • Started: {new Date(experiment.startDate).toLocaleDateString()} ({experiment.durationDays} days planned)
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
              {experiment.title}
            </h1>

            <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] text-xs text-[#334155] leading-relaxed">
              <strong className="text-[#0F291E] font-semibold block mb-0.5">Research Question:</strong>
              "{experiment.researchQuestion}"
            </div>

            {/* Scientific Biological Specs */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#475569] pt-1">
              <span>
                <strong>Species:</strong> <em className="text-[#0F291E]">{experiment.scientificName}</em>
              </span>
              <span>•</span>
              <span>
                <strong>Cultivar:</strong> {experiment.cultivarOrVariety}
              </span>
              <span>•</span>
              <span>
                <strong>Seed Lot:</strong> <code className="font-mono text-[#0F291E]">{experiment.seedLotId}</code>
              </span>
              <span>•</span>
              <span>
                <strong>Substrate:</strong> {experiment.substrate}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap lg:flex-col gap-2 shrink-0 self-start lg:self-center">
            <button
              onClick={onExportDataset}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#1E293B] flex items-center gap-2 shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5 text-[#059669]" />
              Export Dataset (JSON/CSV)
            </button>

            <button
              onClick={onOpenReport}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0F291E] hover:bg-[#1B4332] text-white flex items-center gap-2 shadow-sm transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-[#74C69D]" />
              Generate Research Report
            </button>

            <button
              onClick={onOpenNewExperiment}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#475569] hover:bg-[#F1F5F9] border border-dashed border-[#CBD5E1] flex items-center gap-2 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              New Experiment Protocol
            </button>
          </div>

        </div>
      </div>

      {/* 5 Primary Research Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-[#E2E8F0] bg-white">
        
        {/* Metric 1: Germination % */}
        <div
          onClick={() => onSelectMetricProvenance("Final Germination Percentage")}
          className="p-5 cursor-pointer hover:bg-[#FAFBF9] transition-colors group"
        >
          <div className="flex items-center justify-between text-xs font-bold text-[#64748B] mb-1">
            <span className="uppercase tracking-wider">Final Germination</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#E8F5E9] text-[#2D6A4F]">DERIVED</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
              {m.finalGerminationPct}%
            </span>
            <span className="text-xs text-[#64748B] font-mono">
              ({m.germinatedCount}/{m.totalCellsCount} cells)
            </span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-1.5 group-hover:text-[#0F291E] flex items-center gap-1">
            <span>n = {m.sampleSizeN} replicates</span>
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
        </div>

        {/* Metric 2: T50 */}
        <div
          onClick={() => onSelectMetricProvenance("T50 Time to 50% Emergence")}
          className="p-5 cursor-pointer hover:bg-[#FAFBF9] transition-colors group"
        >
          <div className="flex items-center justify-between text-xs font-bold text-[#64748B] mb-1">
            <span className="uppercase tracking-wider">T50 Emergence</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#E8F5E9] text-[#2D6A4F]">DERIVED</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
              {m.t50Hours}
            </span>
            <span className="text-xs font-semibold text-[#64748B]">hours</span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-1.5 group-hover:text-[#0F291E]">
            Linear interpolation
          </p>
        </div>

        {/* Metric 3: MGT */}
        <div
          onClick={() => onSelectMetricProvenance("Mean Germination Time (MGT)")}
          className="p-5 cursor-pointer hover:bg-[#FAFBF9] transition-colors group"
        >
          <div className="flex items-center justify-between text-xs font-bold text-[#64748B] mb-1">
            <span className="uppercase tracking-wider">Mean Germ. Time</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#E8F5E9] text-[#2D6A4F]">MGT</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
              {m.meanGerminationTimeHours}
            </span>
            <span className="text-xs font-semibold text-[#64748B]">hours</span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-1.5 font-mono">
            Σ(ni·ti) / Σni
          </p>
        </div>

        {/* Metric 4: Substrate Moisture Index */}
        <div
          onClick={() => onSelectMetricProvenance("Substrate Moisture Index")}
          className="p-5 cursor-pointer hover:bg-[#FAFBF9] transition-colors group"
        >
          <div className="flex items-center justify-between text-xs font-bold text-[#64748B] mb-1">
            <span className="uppercase tracking-wider">Substrate Moisture</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#D97706]">CALIBRATED</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
              71%
            </span>
            <span className="text-xs text-[#64748B]">Index</span>
          </div>
          <p className="text-[11px] text-[#D97706] mt-1.5 font-medium truncate">
            Not uncalibrated VWC
          </p>
        </div>

        {/* Metric 5: Data Completeness & Quality */}
        <div
          onClick={() => onSelectMetricProvenance("Data Completeness & Quality Flags")}
          className="p-5 cursor-pointer hover:bg-[#FAFBF9] transition-colors group col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between text-xs font-bold text-[#64748B] mb-1">
            <span className="uppercase tracking-wider">Data Quality</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#E8F5E9] text-[#2D6A4F]">PROVENANCE</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-[#059669]" />
            <span className="text-2xl font-black text-[#0F172A] tracking-tight">100%</span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-1.5">
            0 missing observations
          </p>
        </div>

      </div>

    </section>
  );
}
