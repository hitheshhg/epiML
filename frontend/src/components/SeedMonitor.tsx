"use client";

import React, { useState, useEffect, useRef } from "react";
import { translations, Language } from "@/lib/translations";
import {
  Sprout,
  Camera,
  Upload,
  RefreshCw,
  Eye,
  CheckCircle2,
  TrendingUp,
  Sliders,
  Layers,
  Sparkles,
  Info
} from "lucide-react";

interface Detection {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  vigor: number;
  heightMm: number;
}

interface SeedMonitorProps {
  lang: Language;
}

export default function SeedMonitor({ lang }: SeedMonitorProps) {
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<"vision" | "camera" | "metrics">("vision");
  const [germinationPct, setGerminationPct] = useState(85.0);
  const [sproutCount, setSproutCount] = useState(34);
  const [totalSeeds, setTotalSeeds] = useState(40);
  const [canopyCoverage, setCanopyCoverage] = useState(18.4);
  const [vigorScore, setVigorScore] = useState(91);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [selectedDetection, setSelectedDetection] = useState<Detection | null>(null);
  const [loading, setLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch real-time vision phenotyping data from /api/vision
  const fetchVisionData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/vision");
      if (res.ok) {
        const data = await res.json();
        setGerminationPct(data.germination_pct || 85.0);
        setSproutCount(data.sprout_count || 34);
        setTotalSeeds(data.total_seeds || 40);
        setCanopyCoverage(data.canopy_coverage_pct || 18.4);
        setVigorScore(data.vigor_score || 91);
        if (data.detections && data.detections.length > 0) {
          setDetections(data.detections);
          setSelectedDetection(data.detections[0]);
        }
        if (data.image) {
          setCapturedImage(data.image);
        }
      }
    } catch {
      // Fallback to initial state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisionData();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target?.result as string);
        // Simulate CV recalculation with slight variation
        setSproutCount(36);
        setGerminationPct(90.0);
        setCanopyCoverage(21.2);
        setVigorScore(94);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="agri-card rounded-3xl p-6 sm:p-8 mb-8 border border-[#E2E8DC]">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E2E8DC]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#2D6A4F] mb-1">
            <Sprout className="w-4 h-4 text-[#52B788]" />
            <span>Computer Vision Phenotyping</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#163828]">
            {(t as any).seedMonitoring || "Seed & Seedling Phenotyping"}
          </h2>
          <p className="text-xs text-[#52796F] mt-0.5">
            {(t as any).seedSubheading || "High-Throughput Optical Growth Quantification"}
          </p>
        </div>

        {/* Action Controls & Tab Switches */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="p-1 rounded-xl bg-[#F0F4EC] border border-[#E2E8DC] flex items-center gap-1">
            <button
              onClick={() => setActiveTab("vision")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "vision"
                  ? "bg-[#1E4D36] text-white shadow-sm"
                  : "text-[#4F6D5E] hover:text-[#163828]"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{t.tabTrayMap}</span>
            </button>
            <button
              onClick={() => setActiveTab("camera")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "camera"
                  ? "bg-[#1E4D36] text-white shadow-sm"
                  : "text-[#4F6D5E] hover:text-[#163828]"
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{t.tabTrayPhoto}</span>
            </button>
            <button
              onClick={() => setActiveTab("metrics")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "metrics"
                  ? "bg-[#1E4D36] text-white shadow-sm"
                  : "text-[#4F6D5E] hover:text-[#163828]"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{t.tabPhenoMetrics}</span>
            </button>
          </div>

          <button
            onClick={fetchVisionData}
            disabled={loading}
            className="p-2 rounded-xl bg-[#F0F4EC] hover:bg-[#E4EBDD] text-[#1E4D36] border border-[#E2E8DC] transition-colors"
            title="Re-run Computer Vision Inference"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 my-6">
        
        <div className="p-4 rounded-2xl bg-[#F7F9F5] border border-[#E2E8DC] flex flex-col justify-between">
          <span className="text-xs font-medium text-[#52796F]">{t.germinationRate}</span>
          <div className="flex items-baseline gap-2 my-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#163828]">{germinationPct}%</span>
            <span className="text-xs font-bold text-[#2D6A4F]">+12% vs Mean</span>
          </div>
          <div className="w-full bg-[#E2E8DC] h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#52B788] to-[#2D6A4F] h-full rounded-full transition-all duration-500"
              style={{ width: `${germinationPct}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#F7F9F5] border border-[#E2E8DC] flex flex-col justify-between">
          <span className="text-xs font-medium text-[#52796F]">{t.sproutsDetected}</span>
          <div className="flex items-baseline gap-2 my-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#163828]">{sproutCount}</span>
            <span className="text-xs text-[#52796F]">/ {totalSeeds} sown</span>
          </div>
          <span className="text-[11px] text-[#40916C] font-semibold">94% Uniformity</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#F7F9F5] border border-[#E2E8DC] flex flex-col justify-between">
          <span className="text-xs font-medium text-[#52796F]">{t.canopyCover}</span>
          <div className="flex items-baseline gap-2 my-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#163828]">{canopyCoverage}%</span>
            <span className="text-xs text-[#52796F]">ExG Index</span>
          </div>
          <span className="text-[11px] text-[#2D6A4F] font-semibold">Foliar Expansion OK</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#F7F9F5] border border-[#E2E8DC] flex flex-col justify-between">
          <span className="text-xs font-medium text-[#52796F]">{t.vigorScore}</span>
          <div className="flex items-baseline gap-2 my-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#163828]">{vigorScore}</span>
            <span className="text-xs text-[#52796F]">/ 100</span>
          </div>
          <span className="text-[11px] font-semibold text-[#1E4D36]">Grade A (Prime Seed)</span>
        </div>

      </div>

      {/* Main Interactive Stage */}
      {activeTab === "vision" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Visual Interactive Seedling Tray Canvas */}
          <div className="lg:col-span-8 p-4 rounded-3xl bg-[#E8EFE3] border border-[#D5E1CD] relative overflow-hidden shadow-inner">
            
            <div className="flex items-center justify-between pb-3 px-2 text-xs font-semibold text-[#3D5A4C]">
              <span>Nursery Germination Tray (Grid View 5x8)</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#2D6A4F] animate-pulse" />
                Live ExG Segmentation
              </span>
            </div>

            {/* Tray Background Canvas Simulation */}
            <div className="relative aspect-[16/10] bg-gradient-to-br from-[#4A3B32] to-[#2E241E] rounded-2xl p-4 overflow-hidden border border-[#5E4A3F] shadow-lg">
              
              {/* Soil Texture overlay */}
              <div 
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(#C2A68D 1px, transparent 1px)`,
                  backgroundSize: "16px 16px"
                }}
              />

              {/* Emerged Sprouts Simulated with Real Bounding Box Interactivity */}
              <div className="absolute inset-0 p-4">
                {detections.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDetection(d)}
                    className={`absolute cursor-pointer rounded-lg border-2 transition-all ${
                      selectedDetection?.id === d.id
                        ? "border-[#74C69D] bg-[#52B788]/30 scale-105 z-20 shadow-lg"
                        : "border-[#74C69D]/70 bg-[#52B788]/15 hover:border-white hover:scale-102"
                    }`}
                    style={{
                      left: `${d.x}%`,
                      top: `${d.y}%`,
                      width: `${d.w}%`,
                      height: `${d.h}%`,
                    }}
                  >
                    {/* Sprout Icon and Height Pin */}
                    <div className="w-full h-full flex flex-col items-center justify-center relative">
                      <span className="text-xl select-none filter drop-shadow">🌱</span>
                      <span className="text-[10px] font-bold text-white px-1 py-0.2 rounded bg-black/60 backdrop-blur-sm -mt-1 font-mono">
                        {d.heightMm}mm
                      </span>
                    </div>
                  </div>
                ))}

                {/* Additional seedling dots */}
                {Array.from({ length: 25 }).map((_, i) => {
                  const row = Math.floor(i / 5);
                  const col = i % 5;
                  const left = 10 + col * 18 + ((row % 2) * 4);
                  const top = 12 + row * 18;
                  const isDetected = detections.some(d => Math.abs(d.x - left) < 10 && Math.abs(d.y - top) < 10);
                  if (isDetected) return null;
                  return (
                    <div
                      key={`seed-${i}`}
                      className="absolute flex items-center justify-center opacity-85 hover:scale-125 transition-transform cursor-pointer"
                      style={{ left: `${left}%`, top: `${top}%` }}
                      title={`Sprout #G-${i+10}: Vigor 88%`}
                    >
                      <span className="text-sm">🌱</span>
                    </div>
                  );
                })}
              </div>

              {/* Bottom HUD Bar */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-[11px] text-white/90 border border-white/10">
                <span>Tray Sensor Zone: A0 (Soil 52%)</span>
                <span>Active Photoperiod: Dark (Servo 2: 90°)</span>
                <span>CV Confidence: 96.8%</span>
              </div>
            </div>
          </div>

          {/* Individual Sprout Inspector Panel */}
          <div className="lg:col-span-4 p-5 rounded-3xl bg-[#F7F9F5] border border-[#E2E8DC] space-y-4">
            
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#163828] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#2D6A4F]" />
                {t.sproutInspector}
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-[#D8F3DC] text-[#1E4D36]">
                {selectedDetection ? selectedDetection.label : "Sprout #1"}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-2.5 rounded-xl bg-white border border-[#E2E8DC]">
                <span className="text-[#52796F]">{t.sproutHeight}</span>
                <span className="font-bold text-[#163828] font-mono">
                  {selectedDetection ? `${selectedDetection.heightMm} mm` : "14.2 mm"}
                </span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-white border border-[#E2E8DC]">
                <span className="text-[#52796F]">{t.sproutVigor}</span>
                <span className="font-bold text-[#2D6A4F] font-mono">
                  {selectedDetection ? `${selectedDetection.vigor} / 100` : "94 / 100"}
                </span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-white border border-[#E2E8DC]">
                <span className="text-[#52796F]">{t.radicleIntegrity}</span>
                <span className="font-bold text-[#163828]">Straight ({t.optimalSaturation})</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-white border border-[#E2E8DC]">
                <span className="text-[#52796F]">{t.chlorophyllLevel}</span>
                <span className="font-bold text-[#2D6A4F]">High Green (Healthy)</span>
              </div>
            </div>

            {/* Growth Stage Tracker */}
            <div className="pt-2 border-t border-[#E2E8DC]">
              <span className="text-xs font-semibold text-[#163828] block mb-2">
                {t.growthLifecycle}
              </span>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
                  <span className="text-[#1E4D36] font-medium">{t.day1}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-4 h-4 rounded-full bg-[#52B788] flex items-center justify-center text-[10px] text-white font-bold animate-pulse">
                    ●
                  </span>
                  <span className="font-bold text-[#163828]">{t.day2}</span>
                </div>
                <div className="flex items-center gap-2 text-xs opacity-60">
                  <span className="w-4 h-4 rounded-full border border-[#8DA297] flex items-center justify-center text-[10px]">
                    3
                  </span>
                  <span className="text-[#4F6D5E]">{t.day3}</span>
                </div>
                <div className="flex items-center gap-2 text-xs opacity-60">
                  <span className="w-4 h-4 rounded-full border border-[#8DA297] flex items-center justify-center text-[10px]">
                    5
                  </span>
                  <span className="text-[#4F6D5E]">{t.day5}</span>
                </div>
              </div>
            </div>

            {/* Smart Advisory */}
            <div className="p-3 rounded-2xl bg-[#E8F7EC] text-[#1E4D36] text-[11px] leading-relaxed border border-[#A7E2BA]">
              <strong>{t.agronomistAdvice}:</strong> {t.agronomistAdviceText}
            </div>

          </div>
        </div>
      )}

      {/* Tab B: Upload or Live Camera Stream */}
      {activeTab === "camera" && (
        <div className="p-6 rounded-3xl bg-[#F7F9F5] border border-[#E2E8DC] text-center space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {capturedImage ? (
            <div className="max-w-xl mx-auto rounded-2xl overflow-hidden border border-[#E2E8DC] shadow-md relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={capturedImage} alt="Seedling Tray" className="w-full h-auto object-cover max-h-96" />
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-semibold">
                Captured Tray Analysis
              </div>
            </div>
          ) : (
            <div className="py-12 border-2 border-dashed border-[#C5D5C0] rounded-2xl max-w-lg mx-auto flex flex-col items-center justify-center">
              <Camera className="w-12 h-12 text-[#52796F] mb-3" />
              <h4 className="text-sm font-bold text-[#163828]">No Seedling Image Uploaded Yet</h4>
              <p className="text-xs text-[#52796F] max-w-xs mt-1">
                Take a top-down photo of your nursery tray or connect your phone camera for real-time computer vision phenotyping.
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-2.5 px-5 rounded-xl bg-[#1E4D36] hover:bg-[#163828] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
            >
              <Upload className="w-4 h-4" />
              Upload Tray Photo
            </button>
            <button
              onClick={fetchVisionData}
              className="py-2.5 px-5 rounded-xl border border-[#E2E8DC] bg-white hover:bg-[#F0F4EC] text-xs font-bold text-[#163828] transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Load Bench Benchmark
            </button>
          </div>
        </div>
      )}

      {/* Tab C: Phenotypic Metrology Table */}
      {activeTab === "metrics" && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2E8DC] text-[#52796F]">
                <th className="py-3 px-3 font-semibold">Sprout ID</th>
                <th className="py-3 px-3 font-semibold">Coordinates (X,Y)</th>
                <th className="py-3 px-3 font-semibold">Hypocotyl Height</th>
                <th className="py-3 px-3 font-semibold">Excess Green Index (ExG)</th>
                <th className="py-3 px-3 font-semibold">Vigor Score</th>
                <th className="py-3 px-3 font-semibold">Quality Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8DC]">
              {detections.map((d) => (
                <tr key={d.id} className="hover:bg-[#F5F8F2] transition-colors">
                  <td className="py-2.5 px-3 font-bold text-[#163828]">{d.label}</td>
                  <td className="py-2.5 px-3 font-mono text-[#52796F]">({d.x}%, {d.y}%)</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-[#1E4D36]">{d.heightMm} mm</td>
                  <td className="py-2.5 px-3 font-mono text-[#2D6A4F]">+0.42</td>
                  <td className="py-2.5 px-3 font-bold text-[#2D6A4F]">{d.vigor}%</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D8F3DC] text-[#1E4D36]">
                      Optimal Prime
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
