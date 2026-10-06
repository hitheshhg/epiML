"use client";

import React, { useState, useEffect } from "react";
import {
  fetchNasaPowerContext,
  fetchGbifSpecies,
  CACHED_NASA_POWER_MOODBIDRI,
  SEEDGERM_VIG_BIOIMAGE_STUDY,
  NasaPowerWeatherRecord,
  GbifTaxonomyRecord,
} from "@/lib/externalDataConnectors";
import {
  Database,
  Sun,
  Globe,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  CloudSun,
  Layers,
} from "lucide-react";

export default function PublicDataExplorer() {
  const [nasaData, setNasaData] = useState<NasaPowerWeatherRecord>(CACHED_NASA_POWER_MOODBIDRI);
  const [gbifData, setGbifData] = useState<GbifTaxonomyRecord | null>(null);
  const [searchTaxon, setSearchTaxon] = useState("Solanum lycopersicum");
  const [isLoadingTaxon, setIsLoadingTaxon] = useState(false);

  useEffect(() => {
    fetchNasaPowerContext().then((d) => setNasaData(d));
    fetchGbifSpecies("Solanum lycopersicum").then((g) => setGbifData(g));
  }, []);

  const handleSearchTaxon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTaxon.trim()) return;
    setIsLoadingTaxon(true);
    try {
      const res = await fetchGbifSpecies(searchTaxon);
      setGbifData(res);
    } finally {
      setIsLoadingTaxon(false);
    }
  };

  return (
    <section className="mb-8 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm overflow-hidden">
      
      {/* Header */}
      <div className="bg-[#FAFBF9] border-b border-[#E2E8F0] p-6 sm:p-7">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-lg bg-[#EBF5FB] text-[#0284C7]">
            <Database className="w-4 h-4" />
          </span>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0284C7]">
            External Scientific Data Connectors
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
          Public Scientific Repositories & Macro Context
        </h2>
        <p className="text-xs text-[#64748B] mt-0.5">
          Programmatically querying public scientific APIs (NASA POWER, GBIF Species Backbone, and BioImage Archive).
        </p>
      </div>

      <div className="p-6 sm:p-8 space-y-8 bg-white">
        
        {/* Source 1: NASA POWER External Meteorological Context */}
        <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1D3557] text-white">
                  REAL PUBLIC DATA
                </span>
                <span className="text-xs font-bold text-[#0F172A]">NASA POWER Agroclimatology</span>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                Location: {nasaData.location}
              </p>
            </div>

            <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-[#E8F5E9] text-[#2D6A4F] self-start sm:self-auto">
              Freshness: {nasaData.freshness}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0]">
              <span className="text-[#64748B] block font-medium">Solar Irradiance (All-Sky):</span>
              <span className="text-lg font-mono font-black text-[#EA580C] mt-1 block">
                {nasaData.solarIrradianceMjPerM2} MJ/m²
              </span>
              <span className="text-[11px] text-[#94A3B8]">Surface shortwave flux</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0]">
              <span className="text-[#64748B] block font-medium">Outdoor Air Temperature:</span>
              <span className="text-lg font-mono font-black text-[#0F172A] mt-1 block">
                {nasaData.ambientAirTempC}°C
              </span>
              <span className="text-[11px] text-[#94A3B8]">T2M meteorological 2m</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0]">
              <span className="text-[#64748B] block font-medium">Outdoor Humidity:</span>
              <span className="text-lg font-mono font-black text-[#0284C7] mt-1 block">
                {nasaData.ambientHumidityRH}%
              </span>
              <span className="text-[11px] text-[#94A3B8]">RH2M ambient relative</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0]">
              <span className="text-[#64748B] block font-medium">Precipitation:</span>
              <span className="text-lg font-mono font-black text-[#059669] mt-1 block">
                {nasaData.precipitationMm} mm
              </span>
              <span className="text-[11px] text-[#94A3B8]">Daily corrected rain</span>
            </div>
          </div>

          <p className="text-[11px] text-[#64748B] italic">
            *Used strictly as <strong>Outdoor Ambient Context</strong>. Never conflated or mixed with CHIGURU's internal microclimate sensors.
          </p>
        </div>

        {/* Source 2: GBIF Species Backbone Taxonomy API */}
        <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1D3557] text-white">
                  REAL PUBLIC DATA
                </span>
                <span className="text-xs font-bold text-[#0F172A]">GBIF Species Backbone Taxonomy</span>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                Global Biodiversity Information Facility botanical name resolution
              </p>
            </div>
          </div>

          <form onSubmit={handleSearchTaxon} className="flex gap-2">
            <input
              type="text"
              value={searchTaxon}
              onChange={(e) => setSearchTaxon(e.target.value)}
              placeholder="Search botanical scientific name..."
              className="flex-1 text-xs p-2.5 rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
            />
            <button
              type="submit"
              disabled={isLoadingTaxon}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#1B4332] text-white hover:bg-[#2D6A4F] transition-colors"
            >
              {isLoadingTaxon ? "Resolving..." : "Verify Species"}
            </button>
          </form>

          {gbifData && (
            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[#64748B] block font-medium">Accepted Name:</span>
                <strong className="text-[#0F291E] font-bold block mt-0.5 italic">{gbifData.acceptedName}</strong>
              </div>
              <div>
                <span className="text-[#64748B] block font-medium">Family:</span>
                <span className="text-[#0F172A] font-semibold block mt-0.5">{gbifData.family}</span>
              </div>
              <div>
                <span className="text-[#64748B] block font-medium">Status:</span>
                <span className="text-[#059669] font-mono font-bold block mt-0.5">{gbifData.taxonomicStatus}</span>
              </div>
              <div>
                <span className="text-[#64748B] block font-medium">GBIF Taxon Key:</span>
                <span className="text-[#64748B] font-mono block mt-0.5">{gbifData.gbifTaxonKey}</span>
              </div>
            </div>
          )}
        </div>

        {/* Source 3: BioImage Archive SeedGerm-VIG Study */}
        <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1D3557] text-white">
                  REAL PUBLIC DATA
                </span>
                <span className="text-xs font-bold text-[#0F172A]">{SEEDGERM_VIG_BIOIMAGE_STUDY.studyTitle}</span>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                {SEEDGERM_VIG_BIOIMAGE_STUDY.authors} — <em className="text-[#0F291E]">{SEEDGERM_VIG_BIOIMAGE_STUDY.publication}</em>
              </p>
            </div>

            <a
              href={SEEDGERM_VIG_BIOIMAGE_STUDY.sampleDatasetUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#CBD5E1] text-[#0F291E] hover:bg-[#E2E8F0] flex items-center gap-1.5 shrink-0 self-start transition-colors"
            >
              <span>{SEEDGERM_VIG_BIOIMAGE_STUDY.accessionId}</span>
              <ExternalLink className="w-3 h-3 text-[#64748B]" />
            </a>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] text-xs text-[#475569] leading-relaxed">
            <strong>Relevance to CHIGURU:</strong> {SEEDGERM_VIG_BIOIMAGE_STUDY.relevanceToChiguru}
          </div>
        </div>

      </div>

    </section>
  );
}
