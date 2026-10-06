"use client";

import React, { useState } from "react";
import {
  X,
  Search,
  Sprout,
  CheckCircle2,
  AlertCircle,
  Thermometer,
  Droplets,
  Cloud,
  Sun,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Loader2
} from "lucide-react";
import { ValidatedPlantProfile } from "@/schemas/plant";

interface PlantSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileSelected: (profile: ValidatedPlantProfile) => void;
}

const EXAMPLE_SEEDS = [
  "Tomato",
  "Rice",
  "Wheat",
  "Maize",
  "Green Gram (Moong)",
  "Chilli",
  "Sunflower",
  "Cabbage",
  "Brinjal",
  "Capsicum",
];

export default function PlantSearchModal({
  isOpen,
  onClose,
  onProfileSelected,
}: PlantSearchModalProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvedProfile, setResolvedProfile] = useState<ValidatedPlantProfile | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (seedQuery: string) => {
    const q = seedQuery.trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    setResolvedProfile(null);

    try {
      const res = await fetch("/api/plant/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });

      if (!res.ok) {
        throw new Error(`Profile identification failed: ${res.status}`);
      }

      const data = await res.json();
      if (data.profile) {
        setResolvedProfile(data.profile);
      } else {
        throw new Error("No profile returned");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError("Unable to retrieve botanical profile. Please check connection.");
      console.error("Search error:", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleStartMonitoring = () => {
    if (resolvedProfile) {
      onProfileSelected(resolvedProfile);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-[#D5E0D0] shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-[#E2E8DC] flex items-center justify-between bg-[#FAFBF9]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2D6A4F] text-white flex items-center justify-center">
              <Sprout className="w-4 h-4 text-[#D8F3DC]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#163828]">
                What seed are you monitoring?
              </h3>
              <p className="text-xs text-[#52796F]">
                Type any agricultural seed or plant species.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-black/5 text-[#52796F] hover:text-[#163828] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Search Box */}
          <div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch(query);
              }}
              className="relative"
            >
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter a seed or plant… (e.g. Tomato, Rice, Maize, Chilli)"
                className="w-full pl-11 pr-24 py-3.5 rounded-xl border-2 border-[#D5E0D0] focus:border-[#2D6A4F] focus:outline-none text-sm font-medium text-[#163828] placeholder-[#84A98C] bg-[#FAFBF9]"
                autoFocus
              />
              <Search className="w-5 h-5 text-[#52796F] absolute left-3.5 top-3.5" />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="absolute right-2 top-2 px-4 py-2 rounded-lg bg-[#2D6A4F] hover:bg-[#1B4332] disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-1.5"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Identify"}
              </button>
            </form>

            {/* Quick Suggestion Pills */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-[#748E84] font-medium mr-1">Try:</span>
              {EXAMPLE_SEEDS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setQuery(s);
                    handleSearch(s);
                  }}
                  className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#F4F6F2] hover:bg-[#EBF2E8] text-[#2D4A3E] border border-[#E2E8DC] transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-xl bg-[#FFF5F3] border border-[#FAD2CA] text-xs text-[#C85038] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Resolved Biological Profile Preview */}
          {resolvedProfile && (
            <div className="rounded-2xl border-2 border-[#B7D1C5] bg-[#FAFBF9] p-5 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* Profile Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-[#E8EFE5]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#2D6A4F]/10 text-[#2D6A4F]">
                      Ready For Monitoring
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E2E8DC] text-[#52796F]">
                      Source: {resolvedProfile.sourceCategory}
                    </span>
                  </div>
                  <h4 className="text-xl font-extrabold text-[#163828] mt-1">
                    {resolvedProfile.commonName}
                  </h4>
                  <p className="text-xs text-[#52796F] italic">
                    {resolvedProfile.scientificName}
                    {resolvedProfile.gbifTaxonKey && (
                      <span className="ml-2 font-mono not-italic text-[10px] text-[#84A98C]">
                        (GBIF Taxon Key: {resolvedProfile.gbifTaxonKey})
                      </span>
                    )}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-[#748E84] block">Germination Window</span>
                  <span className="text-sm font-extrabold text-[#163828]">
                    {resolvedProfile.germinationWindow.minDays}–{resolvedProfile.germinationWindow.maxDays} Days
                  </span>
                </div>
              </div>

              {/* Guidance Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-white border border-[#E2E8DC]">
                  <span className="text-[10px] uppercase font-bold text-[#52796F] block flex items-center gap-1">
                    <Thermometer className="w-3 h-3 text-[#E76F51]" />
                    Temperature
                  </span>
                  <p className="text-base font-extrabold text-[#163828] mt-0.5">
                    {resolvedProfile.temperatureGuidance.min}–{resolvedProfile.temperatureGuidance.max}°C
                  </p>
                  <span className="text-[10px] text-[#748E84]">
                    Opt: {resolvedProfile.temperatureGuidance.optimal}°C
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#E2E8DC]">
                  <span className="text-[10px] uppercase font-bold text-[#52796F] block flex items-center gap-1">
                    <Cloud className="w-3 h-3 text-[#52796F]" />
                    Humidity
                  </span>
                  <p className="text-base font-extrabold text-[#163828] mt-0.5">
                    {resolvedProfile.humidityGuidance.min}–{resolvedProfile.humidityGuidance.max}%
                  </p>
                  <span className="text-[10px] text-[#748E84]">
                    Opt: {resolvedProfile.humidityGuidance.optimal}%
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#E2E8DC]">
                  <span className="text-[10px] uppercase font-bold text-[#52796F] block flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-[#2D6A4F]" />
                    Moisture
                  </span>
                  <p className="text-base font-extrabold text-[#163828] mt-0.5">
                    {resolvedProfile.moistureGuidance.monitoringTarget}
                  </p>
                  <span className="text-[10px] text-[#748E84]">
                    Target: {resolvedProfile.moistureGuidance.optimalIndex}%
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#E2E8DC]">
                  <span className="text-[10px] uppercase font-bold text-[#52796F] block flex items-center gap-1">
                    <Sun className="w-3 h-3 text-[#F4A261]" />
                    Canopy Shade
                  </span>
                  <p className="text-base font-extrabold text-[#163828] mt-0.5">
                    {resolvedProfile.lightGuidance.canopyShadeTarget}% Target
                  </p>
                  <span className="text-[10px] text-[#748E84]">
                    Servo: {Math.round((resolvedProfile.lightGuidance.canopyShadeTarget / 100) * 90)}°
                  </span>
                </div>
              </div>

              {/* Monitoring Notes */}
              <p className="text-xs text-[#52796F] leading-relaxed">
                {resolvedProfile.monitoringNotes}
              </p>

              {/* View More Advanced Details Accordion */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-xs font-bold text-[#2D6A4F] flex items-center gap-1 hover:underline"
                >
                  <span>{showAdvanced ? "Hide Advanced Details" : "View More Details & Sources"}</span>
                  {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showAdvanced && (
                  <div className="mt-3 p-3.5 rounded-xl bg-white border border-[#E2E8DC] text-xs space-y-2 text-[#52796F]">
                    <div>
                      <strong className="text-[#163828]">Photoperiod / Light Regime:</strong>{" "}
                      {resolvedProfile.lightGuidance.regime}
                    </div>
                    <div>
                      <strong className="text-[#163828]">Evidence Level:</strong>{" "}
                      {resolvedProfile.evidenceLevel}
                    </div>
                    <div>
                      <strong className="text-[#163828]">Scientific References:</strong>
                      <ul className="list-disc pl-4 mt-1 space-y-0.5 text-[11px]">
                        {resolvedProfile.referenceSuggestions.map((ref, idx) => (
                          <li key={idx}>{ref}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong className="text-[#163828]">Biological Limitations:</strong>{" "}
                      <span className="italic">{resolvedProfile.limitations}</span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-[#E2E8DC] bg-[#FAFBF9] flex items-center justify-between">
          <span className="text-xs text-[#748E84]">
            {resolvedProfile ? "Profile cached for current session" : "Enter any seed name above"}
          </span>

          <div className="flex gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#52796F] hover:bg-black/5"
            >
              Cancel
            </button>
            <button
              disabled={!resolvedProfile}
              onClick={handleStartMonitoring}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#2D6A4F] hover:bg-[#1B4332] disabled:opacity-40 text-white shadow-sm transition-all flex items-center gap-1.5"
            >
              <Sprout className="w-3.5 h-3.5" />
              <span>Start Monitoring</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
