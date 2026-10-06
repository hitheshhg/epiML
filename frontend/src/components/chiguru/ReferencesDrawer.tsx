"use client";

import React from "react";
import { BookOpen, ExternalLink, Layers, Award, ShieldCheck } from "lucide-react";

export default function ReferencesDrawer() {
  const references = [
    {
      title: "SeedGerm: a cost-effective phenotyping platform for automated seed imaging and machine-learning based phenotypic analysis",
      authors: "Colmer, J., O'Neill, C. M., Wells, R., Bostrom, A., Reynolds, D., & Penfield, S.",
      journal: "New Phytologist (2020)",
      doi: "10.1111/nph.16736",
      summary: "Foundational benchmark for flatbed and overhead camera seed imaging. Established baseline color segmentation and automated time-series germination curves.",
    },
    {
      title: "SeedGerm-VIG: An integrated platform for automated seed vigor phenotyping in crops",
      authors: "Dai, L., Wen, Z., & Zhou, J.",
      journal: "GigaScience (2025)",
      doi: "10.1093/gigascience/giaf129",
      summary: "Extended computer vision phenotyping to seedling vigor, hypocotyl elongation tracking, and radicle curvature analysis in multi-well arrays.",
    },
    {
      title: "PlantCV: An open-source image analysis software package for plant phenotyping",
      authors: "Gehan, M. A., Fahlgren, N., Abbasi, A., Berry, J. C., et al.",
      journal: "PeerJ (2017)",
      doi: "10.7717/peerj.4088",
      summary: "Standardized open-source computer vision routines for color channel extraction, Excess Green Index (ExG), and morphological contour tracking.",
    },
    {
      title: "GBIF Backbone Taxonomy",
      authors: "GBIF Secretariat",
      journal: "Global Biodiversity Information Facility (2026)",
      doi: "10.15468/39omei",
      summary: "Authoritative global taxonomic dataset used by Chiguru to validate accepted botanical scientific names, families, and accepted taxon usage keys.",
    },
    {
      title: "International Rules for Seed Testing (ISTA)",
      authors: "International Seed Testing Association",
      journal: "ISTA Secretariat, Bassersdorf, Switzerland (2021)",
      doi: "N/A (Industry Standard)",
      summary: "Official rules defining standard germination test protocols, substratum moisture indices, and normal vs. abnormal seedling evaluation standards.",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#D5E0D0] p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="pb-5 border-b border-[#E8EFE5]">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#2D6A4F]/10 text-[#2D6A4F] border border-[#2D6A4F]/20 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#2D6A4F]" />
            Scientific Provenance & Prior Work
          </span>
          <span className="text-xs text-[#52796F] font-mono">
            Peer-Reviewed Foundation
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#163828] tracking-tight">
          Scientific Literature & Foundational Citations
        </h2>
        <p className="text-xs sm:text-sm text-[#52796F] mt-2 max-w-3xl leading-relaxed">
          Chiguru does not falsely claim to have invented automated seed imaging. Instead, <strong>Chiguru builds on established seed phenotyping research and combines it with a simple seed-first monitoring workflow and persistent environmental history.</strong>
        </p>
      </div>

      {/* Citations List */}
      <div className="space-y-4">
        {references.map((ref, idx) => (
          <div
            key={idx}
            className="p-5 rounded-xl border border-[#E2E8DC] bg-[#FAFBF9] hover:bg-white hover:border-[#B7D1C5] transition-all space-y-2"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-sm font-extrabold text-[#163828] leading-snug">
                {ref.title}
              </h3>
              {ref.doi !== "N/A (Industry Standard)" && (
                <a
                  href={`https://doi.org/${ref.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-xs font-mono font-bold text-[#2D6A4F] hover:underline flex items-center gap-1"
                >
                  <span>DOI</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <p className="text-xs text-[#2D4A3E] font-medium">
              {ref.authors} • <em className="text-[#52796F]">{ref.journal}</em>
            </p>

            <p className="text-xs text-[#52796F] leading-relaxed pt-1 border-t border-[#E8EFE5]">
              {ref.summary}
            </p>
          </div>
        ))}
      </div>

      {/* Footer Statement */}
      <div className="p-4 rounded-xl bg-[#F4F7F2] border border-[#E2E8DC] text-xs text-[#2D4A3E] flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#2D6A4F] shrink-0 mt-0.5" />
        <div>
          <strong className="block text-[#163828] mb-0.5">Scientific Transparency & Integrity</strong>
          <span>
            Every biological recommendation in Chiguru is attributed to its source category: <em>LITERATURE</em>, <em>PUBLIC DATA</em>, <em>RESEARCHER DEFINED</em>, or <em>AI ASSISTED</em>. Synthetic assumptions are never presented as established fact.
          </span>
        </div>
      </div>

    </div>
  );
}
