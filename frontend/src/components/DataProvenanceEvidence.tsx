"use client";

import React, { useState } from "react";
import { SCIENTIFIC_REFERENCES, ResearchReference } from "@/lib/researchReferences";
import {
  BookOpen,
  ExternalLink,
  Award,
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileCode,
  ShieldCheck,
  Search,
  Filter,
} from "lucide-react";

export default function DataProvenanceEvidence() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRefs = SCIENTIFIC_REFERENCES.filter((ref) => {
    const matchesCat = selectedCategory === "ALL" || ref.category === selectedCategory;
    const matchesSearch =
      ref.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ref.authors.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ref.chiguruFeatureSupported.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <section className="mb-8 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm overflow-hidden">
      
      {/* Header */}
      <div className="bg-[#FAFBF9] border-b border-[#E2E8F0] p-6 sm:p-7">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-[#E8F5E9] text-[#2D6A4F]">
                <BookOpen className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2D6A4F]">
                Academic Integrity & Evidence Base
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
              Scientific References, Prior Art & Provenance Mapping
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              CHIGURU explicitly acknowledges published plant-science and phenotyping literature. Every platform feature is tied directly to foundational research.
            </p>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-white border border-[#CBD5E1] text-xs font-mono text-[#0F291E] shadow-sm self-start md:self-center">
            <strong>7 Peer-Reviewed Works</strong> Referenced
          </div>
        </div>
      </div>

      {/* Differentiation & Novelty Panel */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-[#F8FAFC] to-[#F1F5F9] border-b border-[#E2E8F0]">
        <div className="max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#1B4332] text-white">
            <Award className="w-3.5 h-3.5 text-[#74C69D]" />
            What is Genuinely New in CHIGURU?
          </div>

          <h3 className="text-lg font-black text-[#0F172A]">
            The Innovation is the Integrated Cyber-Physical Research Loop
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#334155]">
            <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0]">
              <strong className="text-[#DC2626] block mb-1">What We Do NOT Claim:</strong>
              <ul className="list-disc list-inside space-y-1 text-[#64748B]">
                <li>Not the first seed imaging platform (SeedGerm demonstrated this in 2020).</li>
                <li>Not claiming patentability on optical germination detection.</li>
                <li>Not claiming generic soil moisture sensing is new.</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#A7F3D0] bg-[#F0FDF4]/50">
              <strong className="text-[#059669] block mb-1">CHIGURU's Unique Technical Contribution:</strong>
              <ul className="list-disc list-inside space-y-1 text-[#065F46]">
                <li><strong>40-Cell Persistent Identity:</strong> Tracking individual seeds from sowing to emergence.</li>
                <li><strong>Synchronized Data Fusion:</strong> Aligning environmental history + actuator events directly to image observations.</li>
                <li><strong>Explainable Refusal Engine:</strong> Context-aware action withholding to prevent micro-nursery overwatering.</li>
                <li><strong>Local-First / Free Operation:</strong> Operates 100% offline at low hardware cost.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-6 border-b border-[#E2E8F0] bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          {["ALL", "SEED_GERMINATION", "PLANT_PHENOTYPING", "COMPUTER_VISION", "OPEN_DATA", "ENVIRONMENTAL_DATA"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedCategory === cat
                  ? "bg-[#1B4332] text-white shadow-sm"
                  : "bg-[#F8FAFC] text-[#475569] hover:bg-[#E2E8F0]"
              }`}
            >
              {cat.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#94A3B8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search authors or DOIs..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] focus:bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
          />
        </div>

      </div>

      {/* References Grid */}
      <div className="p-6 sm:p-8 bg-[#FAFBF9] space-y-4">
        {filteredRefs.map((ref) => (
          <div
            key={ref.id}
            className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-3 hover:border-[#A7D7B5] transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F1F5F9] text-[#475569]">
                    {ref.category}
                  </span>
                  <span className="text-xs font-mono font-semibold text-[#64748B]">
                    {ref.year}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#0F172A] leading-snug">
                  {ref.title}
                </h4>
                <p className="text-xs text-[#475569]">
                  {ref.authors.join(", ")} — <em className="text-[#0F291E]">{ref.journalOrRepository}</em>
                </p>
              </div>

              <a
                href={ref.url}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F8FAFC] hover:bg-[#E2E8F0] text-[#0F291E] border border-[#CBD5E1] flex items-center gap-1.5 shrink-0 self-start transition-colors"
              >
                <span>DOI / Accession</span>
                <ExternalLink className="w-3 h-3 text-[#64748B]" />
              </a>
            </div>

            {/* Feature Supported Callout Box */}
            <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-start gap-2 text-xs">
              <ShieldCheck className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#065F46] block">CHIGURU Feature Influenced:</strong>
                <span className="text-[#047857]">{ref.chiguruFeatureSupported}</span>
                <p className="text-[11px] text-[#475569] mt-1 italic">
                  {ref.relevanceRationale}
                </p>
              </div>
            </div>

          </div>
        ))}
      </div>

    </section>
  );
}
