"use client";

import React from "react";
import Link from "next/link";
import { SCIENTIFIC_REFERENCES } from "../../lib/researchReferences";
import {
  Sprout,
  BookOpen,
  ExternalLink,
  ArrowLeft,
  Layers,
  Database,
  ShieldCheck,
  CheckCircle2,
  FileText,
} from "lucide-react";

export default function SourcesPage() {
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

          <Link
            href="/monitor/new"
            className="rounded-xl border border-[#2D6A4F] bg-[#2D6A4F] px-4 py-2 text-xs font-bold text-white hover:bg-[#1B4332]"
          >
            Start Monitoring
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10 space-y-10">
        {/* Title */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#2D6A4F]">
            Data Provenance & Scientific Grounding
          </span>
          <h1 className="mt-2 text-3xl font-extrabold text-[#163828]">
            Scientific Sources & Prior Art
          </h1>
          <p className="mt-2 text-sm text-[#4A6B5D] max-w-2xl">
            CHIGURU adheres to strict academic integrity. We explicitly acknowledge foundational prior art in automated seed phenotyping and map each citation directly to the platform component it informs.
          </p>
        </div>

        {/* Section: What is Different About Chiguru? */}
        <div className="rounded-2xl border border-[#D8F3DC] bg-[#E8F7EC]/50 p-6 shadow-sm">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#2D6A4F]">
            Product Novelty Statement
          </span>
          <h2 className="mt-1 text-xl font-bold text-[#163828]">
            What is genuinely different about CHIGURU?
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs text-[#4A6B5D] leading-relaxed">
            <div className="rounded-xl border border-[#E2E8DC] bg-white p-4">
              <h3 className="font-bold text-[#163828]">Existing Field Practice</h3>
              <p className="mt-1">
                Automated seed imaging platforms (such as SeedGerm), smart irrigation controllers, and weather stations exist independently. However, nursery observations remain disconnected from microclimate and intervention histories.
              </p>
            </div>
            <div className="rounded-xl border border-[#A7D7B5] bg-white p-4">
              <h3 className="font-bold text-[#2D6A4F]">The CHIGURU Integration</h3>
              <p className="mt-1">
                CHIGURU unifies seed selection, peer-reviewed biological profiles, persistent 40-cell digital twins, time-synchronized environmental sensing, and cell-level computer vision into a single accessible, low-cost research loop.
              </p>
            </div>
          </div>
        </div>

        {/* Scientific References List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#163828]">
            Foundational Literature & Public Datasets ({SCIENTIFIC_REFERENCES.length})
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {SCIENTIFIC_REFERENCES.map((ref) => (
              <div
                key={ref.id}
                className="rounded-2xl border border-[#E2E8DC] bg-white p-5 shadow-xs transition-all hover:border-[#74C69D]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-md bg-[#F0F4EC] px-2 py-0.5 text-[10px] font-mono font-bold text-[#2D6A4F]">
                    {ref.category}
                  </span>
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] font-bold text-[#2D6A4F] hover:underline"
                  >
                    <span>{ref.doiOrAccession}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <h3 className="mt-2 text-sm font-bold text-[#163828]">
                  {ref.title}
                </h3>
                <p className="mt-0.5 text-xs text-[#52796F]">
                  {ref.authors.join(", ")} ({ref.year}) • <em>{ref.journalOrRepository}</em>
                </p>

                <div className="mt-3 rounded-xl border border-[#F0F4EC] bg-[#F8FAF6] p-3 text-xs space-y-1">
                  <div>
                    <strong className="text-[#163828]">CHIGURU Feature Informed: </strong>
                    <span className="text-[#2D6A4F] font-semibold">{ref.chiguruFeatureSupported}</span>
                  </div>
                  <p className="text-[11px] text-[#4A6B5D] leading-relaxed">
                    {ref.relevanceRationale}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
