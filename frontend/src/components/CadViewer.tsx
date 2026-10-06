"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Language } from "@/lib/translations";
import {
  Layers,
  Box,
  Compass,
  Cpu,
  Droplets,
  Eye,
  Wind,
  Maximize2,
  X,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Ruler
} from "lucide-react";

interface CadViewerProps {
  lang: Language;
}

interface ComponentItem {
  id: string;
  balloon: string;
  name: string;
  subsystem: string;
  material: string;
  specs: string;
  description: string;
  icon: any;
}

const COMPONENTS: ComponentItem[] = [
  {
    id: "hood",
    balloon: "1a-1e",
    name: "Aerodynamic Exhaust Hood & DC Extraction Fan",
    subsystem: "Climate & Vapor Extraction",
    material: "Thermoformed UV-stabilized ABS (3mm)",
    specs: "80mm Brushless 12V DC Fan, 45 CFM CFM flow",
    description: "Rapidly draws out excess humidity and metabolic volatile gases when Dew Point (Tdew) or MQ135 exceeds thresholds.",
    icon: Wind,
  },
  {
    id: "servos",
    balloon: "2a-2d",
    name: "Dual Micro-Servo Louver & Shade Kinematic Linkage",
    subsystem: "Passive Solar & Airflow Regulation",
    material: "Laser-cut Acetal (POM) & Brass pivot pins",
    specs: "Dual SG90 Metal-Gear Servos (D5, D6), 0°-90° throw",
    description: "Multi-blade ventilation louvers open automatically during heat spikes, while canopy tilts to shield tender sprouts from direct solar scorch.",
    icon: Compass,
  },
  {
    id: "enclosure",
    balloon: "3a-3d",
    name: "IP54 Hermetic Cyber-Physical Electronics Enclosure",
    subsystem: "Embedded Logic & Power Distribution",
    material: "Molded Polycarbonate with Silicone gasket seal",
    specs: "Arduino Uno R3 + Optocoupled 5V Relay + TMB12A12 Buzzer",
    description: "Completely separates high-humidity nursery atmosphere (80%+ RH) from microcontrollers and 5V/12V DC power distribution buses.",
    icon: Cpu,
  },
  {
    id: "sensors",
    balloon: "4a-4b",
    name: "Microclimate Sensor Pod & Soil Insertion Gantry",
    subsystem: "Sensory Acquisition Layer",
    material: "3D Printed PETG bracket & 316 Stainless Probes",
    specs: "DHT22 Digital Probe (D2) + Dual Capacitive Moisture (A0, A1)",
    description: "Suspends DHT22 at canopy height and guides dual moisture probes into root-zone cells for high-accuracy localized data.",
    icon: Layers,
  },
  {
    id: "camera",
    balloon: "5",
    name: "Overhead Phenotyping CV Camera Mount",
    subsystem: "Computer Vision Seedling Inspection",
    material: "6061-T6 Billet Aluminum CNC Gantry Mount",
    specs: "5MP Fixed-focus RGB Sensor, 1080p @ 30fps, 90° FOV",
    description: "Overhead top-down imaging geometry aligned directly perpendicular to nursery tray for pixel-accurate Excess Green Index (ExG) segmentation.",
    icon: Eye,
  },
  {
    id: "tray",
    balloon: "6-6a",
    name: "5x8 Precision Nursery Germination Matrix",
    subsystem: "Biomass Growth Medium",
    material: "Food-grade thermoformed PETG (FDA 21 CFR 177.1630)",
    specs: "40 Individual cells (35mm x 35mm x 45mm depth)",
    description: "Precision drainage lattice prevents waterlogging while ensuring uniform capillary moisture distribution across all 40 seedling plugs.",
    icon: Box,
  },
  {
    id: "reservoir",
    balloon: "7-7d",
    name: "Submersible DC Pump & Hydro-Irrigation Manifold",
    subsystem: "Micro-Irrigation Delivery",
    material: "Food-grade Polypropylene tank & Silicone food tubing",
    specs: "Submersible 12V/5V DC Pump (3W, 240 L/h) + Micro-misters",
    description: "Delivers precision micro-pulses of water directly to dry cells triggered automatically by root moisture deficit algorithms.",
    icon: Droplets,
  },
  {
    id: "chassis",
    balloon: "8",
    name: "2020 T-Slot Anodized Aluminum Rigid Spaceframe",
    subsystem: "Structural Chassis & Protective Glazing",
    material: "6063-T5 Anodized Aluminum & 4mm Cast Clear Acrylic",
    specs: "Footprint: 800mm (L) x 520mm (W) x 980mm (H)",
    description: "High torsional rigidity frame with slide-in crystal acrylic side walls offering 92% optical clarity and quick tool-less door access.",
    icon: Ruler,
  },
];

export default function CadViewer({ lang }: CadViewerProps) {
  const [activeTab, setActiveTab] = useState<"render" | "exploded">("render");
  const [selectedPart, setSelectedPart] = useState<ComponentItem>(COMPONENTS[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="mb-10 rounded-2xl bg-white border border-[#E2E8DC] shadow-sm overflow-hidden">
      
      {/* Top Header */}
      <div className="border-b border-[#E2E8DC] bg-gradient-to-r from-[#F4F7F2] to-white p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#2D6A4F]/10 text-[#2D6A4F] border border-[#2D6A4F]/20">
                <Box className="w-3.5 h-3.5 text-[#2D6A4F]" />
                Mechanical Engineering & CAD Architecture
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E76F51]/10 text-[#E76F51]">
                Scale 1:10 Blueprint
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#163828] tracking-tight">
              Chiguru Agri-CPS Industrial CAD Representation
            </h2>
            <p className="text-sm text-[#52796F] mt-1 max-w-3xl">
              Precision 3D mechanical enclosure, hermetic electronics isolation bay, dual-servo micro-louver kinematics, and top-down computer vision phenotyping gantry designed for harsh nursery environments.
            </p>
          </div>

          {/* View Mode Toggle Buttons */}
          <div className="flex items-center bg-[#EBF2E8] p-1.5 rounded-xl border border-[#D5E3D0] self-start md:self-center">
            <button
              onClick={() => setActiveTab("render")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "render"
                  ? "bg-[#2D6A4F] text-white shadow-md shadow-[#2D6A4F]/20"
                  : "text-[#2D6A4F] hover:bg-[#DCE7D7]"
              }`}
            >
              <Box className="w-4 h-4" />
              Assembled 3D CAD
            </button>
            <button
              onClick={() => setActiveTab("exploded")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "exploded"
                  ? "bg-[#2D6A4F] text-white shadow-md shadow-[#2D6A4F]/20"
                  : "text-[#2D6A4F] hover:bg-[#DCE7D7]"
              }`}
            >
              <Layers className="w-4 h-4" />
              Exploded Assembly View
            </button>
          </div>
        </div>
      </div>

      {/* Main CAD Display Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-b border-[#E2E8DC]">
        
        {/* Left Visualizer Canvas (8 Cols) */}
        <div className="lg:col-span-8 p-6 sm:p-8 bg-[#0F1E17] flex flex-col items-center justify-center relative min-h-[460px] sm:min-h-[540px]">
          
          {/* Status HUD Overlays */}
          <div className="absolute top-6 left-6 flex items-center gap-2 z-10">
            <span className="bg-black/60 backdrop-blur-md text-[#74C69D] border border-[#74C69D]/30 px-3 py-1 rounded-md text-[11px] font-mono tracking-wider uppercase">
              {activeTab === "render" ? "Isometric Studio CAD [Render]" : "Technical Drafting [1:10 Blueprint]"}
            </span>
            <span className="bg-black/60 backdrop-blur-md text-white/80 border border-white/10 px-2.5 py-1 rounded-md text-[11px] font-mono">
              Dims: 800 x 520 x 980 mm
            </span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="absolute top-6 right-6 p-2 rounded-lg bg-black/50 hover:bg-black/80 text-white/80 hover:text-white border border-white/20 transition-all z-10 group"
            title="Expand Fullscreen CAD"
          >
            <Maximize2 className="w-4 h-4 transition-transform group-hover:scale-110" />
          </button>

          {/* Active Image Display */}
          <div className="relative w-full h-[400px] sm:h-[480px] rounded-xl overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center bg-black/40">
            {activeTab === "render" ? (
              <img
                src="/cad_render.jpg"
                alt="Chiguru 3D CAD Assembled Model"
                className="w-full h-full object-contain cursor-zoom-in transition-transform duration-300 hover:scale-[1.02]"
                onClick={() => setIsModalOpen(true)}
              />
            ) : (
              <img
                src="/cad_exploded.jpg"
                alt="Chiguru Exploded Assembly CAD Blueprint"
                className="w-full h-full object-contain cursor-zoom-in transition-transform duration-300 hover:scale-[1.02]"
                onClick={() => setIsModalOpen(true)}
              />
            )}
          </div>

          {/* Bottom HUD Callouts */}
          <div className="mt-4 w-full flex items-center justify-between text-[11px] text-[#A3B899] font-mono border-t border-white/10 pt-3">
            <div className="flex items-center gap-3">
              <span>Projection: Third-Angle Isometric</span>
              <span>•</span>
              <span>Tolerance: ±0.2 mm</span>
            </div>
            <span className="text-[#D8F3DC]">Click image to inspect high-res blueprint</span>
          </div>
        </div>

        {/* Right Interactive Component Explorer (4 Cols) */}
        <div className="lg:col-span-4 bg-[#F8FAF7] p-6 sm:p-7 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-[#E2E8DC]">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-[#163828] uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#2D6A4F]" />
                Bill of Materials (BOM)
              </h3>
              <span className="text-[11px] text-[#52796F] font-semibold">8 Subsystems</span>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {COMPONENTS.map((comp) => {
                const Icon = comp.icon;
                const isSelected = selectedPart.id === comp.id;
                return (
                  <button
                    key={comp.id}
                    onClick={() => setSelectedPart(comp)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-3 ${
                      isSelected
                        ? "bg-[#2D6A4F] text-white border-[#2D6A4F] shadow-sm"
                        : "bg-white text-[#2D4A3E] border-[#E2E8DC] hover:border-[#B7D1C5] hover:bg-[#F2F7F0]"
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                        isSelected ? "bg-white/20 text-white" : "bg-[#EBF2E8] text-[#2D6A4F]"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs font-bold truncate ${isSelected ? "text-white" : "text-[#163828]"}`}>
                          {comp.name}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                            isSelected ? "bg-white/30 text-white" : "bg-[#D5E3D0] text-[#163828]"
                          }`}
                        >
                          #{comp.balloon}
                        </span>
                      </div>
                      <p className={`text-[11px] mt-0.5 truncate ${isSelected ? "text-white/80" : "text-[#52796F]"}`}>
                        {comp.subsystem}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Part Detail Card */}
          <div className="mt-4 p-4 rounded-xl bg-white border border-[#D5E3D0] shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono font-bold text-[#2D6A4F] uppercase tracking-wider">
                Specification Card #{selectedPart.balloon}
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
            </div>
            <h4 className="text-xs font-extrabold text-[#163828]">{selectedPart.name}</h4>
            <p className="text-[11px] text-[#52796F] mt-1 line-clamp-2">{selectedPart.description}</p>
            
            <div className="mt-2.5 pt-2 border-t border-[#E8EFE5] grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <span className="text-[#84A98C] font-semibold block">Material:</span>
                <span className="text-[#163828] font-medium truncate block">{selectedPart.material}</span>
              </div>
              <div>
                <span className="text-[#84A98C] font-semibold block">Electrical/Specs:</span>
                <span className="text-[#163828] font-medium truncate block">{selectedPart.specs}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Engineering Specs & Design Standards Footer Deck */}
      <div className="p-6 sm:p-8 bg-[#F4F7F2] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs text-[#2D4A3E]">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[#2D6A4F]/10 text-[#2D6A4F] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-bold text-[#163828] text-sm mb-1">Hermetic IP54 Sealing</h5>
            <p className="text-[#52796F] text-[11px] leading-relaxed">
              Closed electronics compartment protected against 95% condensing nursery humidity, preventing corrosion on Arduino Uno & relay contacts.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[#2D6A4F]/10 text-[#2D6A4F] shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-bold text-[#163828] text-sm mb-1">Dual-Servo Louver Kinematics</h5>
            <p className="text-[#52796F] text-[11px] leading-relaxed">
              Servo 1 operates exhaust louvers (0°-90°) for passive thermodynamic convection; Servo 2 tilts the canopy for direct solar regulation.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[#2D6A4F]/10 text-[#2D6A4F] shrink-0">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-bold text-[#163828] text-sm mb-1">Micro-Irrigation Manifold</h5>
            <p className="text-[#52796F] text-[11px] leading-relaxed">
              Dedicated 3W submersible pump with anti-siphon valve and fine atomizing nozzles delivers 45ml calibrated bursts to dry soil cells.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[#2D6A4F]/10 text-[#2D6A4F] shrink-0">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-bold text-[#163828] text-sm mb-1">Overhead CV Phenotyping</h5>
            <p className="text-[#52796F] text-[11px] leading-relaxed">
              Rigid top camera gantry maintains fixed focal distance (420mm) across the 5x8 tray for sub-millimeter cotyledon sprout tracking.
            </p>
          </div>
        </div>
      </div>

      {/* Fullscreen High-Res CAD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col p-4 sm:p-8 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-white pb-4 border-b border-white/20">
            <div>
              <h3 className="text-lg font-bold">
                {activeTab === "render"
                  ? "Chiguru Assembled 3D CAD Visualization"
                  : "Exploded View Technical Blueprint (Scale 1:10)"}
              </h3>
              <p className="text-xs text-[#A3B899]">
                Team TerraByte • YEN NOVA 1.0 Agri-CPS Mechanical Architecture
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
            <img
              src={activeTab === "render" ? "/cad_render.jpg" : "/cad_exploded.jpg"}
              alt="High Resolution CAD"
              className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl"
            />
          </div>

          <div className="pt-3 border-t border-white/20 flex items-center justify-between text-xs text-white/70">
            <span>Dimensions: 800mm (L) x 520mm (W) x 980mm (H) • Material: 6063 Aluminum & Cast Acrylic</span>
            <div className="flex gap-3">
              <button
                onClick={() => setActiveTab(activeTab === "render" ? "exploded" : "render")}
                className="px-3 py-1.5 rounded-md bg-[#2D6A4F] text-white hover:bg-[#23533E] font-medium"
              >
                Switch to {activeTab === "render" ? "Exploded Blueprint" : "Assembled 3D CAD"}
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1.5 rounded-md bg-white/20 text-white hover:bg-white/30"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
