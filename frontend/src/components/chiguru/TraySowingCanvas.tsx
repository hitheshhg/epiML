"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  Grid,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  RefreshCw,
  Info,
  Maximize2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SeedProtocol } from "@/lib/types";

export interface SownSeedPin {
  id: string;
  cellId: string;
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  state: "SOWN" | "EMERGING" | "GROWING";
  heightMm?: number;
  confidence?: number;
}

interface TraySowingCanvasProps {
  selectedProtocol: SeedProtocol;
  initialPins?: SownSeedPin[];
  initialImage?: string;
  onConfirmMapping: (pins: SownSeedPin[], trayImageUrl: string) => void;
  onBack: () => void;
}

const DEFAULT_SOIL_TRAY_IMAGE = "/images/nursery_soil_tray.jpg";

export default function TraySowingCanvas({
  selectedProtocol,
  initialPins = [],
  initialImage = DEFAULT_SOIL_TRAY_IMAGE,
  onConfirmMapping,
  onBack,
}: TraySowingCanvasProps) {
  const [trayImage, setTrayImage] = useState<string>(initialImage);
  const [activeTab, setActiveTab] = useState<"preset" | "upload" | "webcam">("preset");
  const [pins, setPins] = useState<SownSeedPin[]>(() => {
    if (initialPins.length > 0) return initialPins;
    // Default: 40 seeds pre-distributed in 5x8 nursery tray
    return generateDefaultGridPins();
  });
  const [showGridOverlay, setShowGridOverlay] = useState(true);
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null);

  // Webcam stream management
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Helper to generate regular 5x8 grid pins (40 cells)
  function generateDefaultGridPins(): SownSeedPin[] {
    const list: SownSeedPin[] = [];
    const cols = 8;
    const rows = 5;
    const xStart = 11;
    const xEnd = 89;
    const yStart = 15;
    const yEnd = 85;
    const xStep = (xEnd - xStart) / (cols - 1);
    const yStep = (yEnd - yStart) / (rows - 1);

    let idx = 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        list.push({
          id: `pin-${idx}`,
          cellId: `C${String(idx).padStart(2, "0")}`,
          x: Number((xStart + c * xStep).toFixed(1)),
          y: Number((yStart + r * yStep).toFixed(1)),
          state: "SOWN",
        });
        idx++;
      }
    }
    return list;
  }

  // Handle clicking on the soil tray canvas to drop or remove a seed
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Number((((e.clientX - rect.left) / rect.width) * 100).toFixed(1));
    const y = Number((((e.clientY - rect.top) / rect.height) * 100).toFixed(1));

    // Guard bounds (must be inside tray mud area)
    if (x < 3 || x > 97 || y < 3 || y > 97) return;

    // Check if clicked close to an existing pin (within 3.5% radius) to remove it
    const existingIndex = pins.findIndex(
      (p) => Math.hypot(p.x - x, p.y - y) < 4.0
    );

    if (existingIndex >= 0) {
      // Remove pin
      setPins((prev) => prev.filter((_, i) => i !== existingIndex));
    } else {
      if (pins.length >= 40) return; // Max 40 seeds
      const newCellId = `C${String(pins.length + 1).padStart(2, "0")}`;
      const newPin: SownSeedPin = {
        id: `pin-${Date.now()}-${pins.length}`,
        cellId: newCellId,
        x,
        y,
        state: "SOWN",
      };
      setPins((prev) => [...prev, newPin]);
    }
  };

  // Upload custom photo from file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setTrayImage(event.target.result as string);
          setActiveTab("upload");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Start webcam
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setIsCameraActive(true);
      } else {
        setCameraError("Camera device access not supported in this browser.");
      }
    } catch (err: any) {
      setCameraError(err.message || "Failed to access chamber camera.");
      setIsCameraActive(false);
    }
  };

  // Stop webcam stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Capture frame from webcam
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setTrayImage(dataUrl);
      stopCamera();
      setActiveTab("preset");
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header & Breadcrumbs */}
      <div className="flex items-center justify-between pb-3 border-b border-border text-xs">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground font-medium transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Seed Selection</span>
        </button>
        <div className="flex items-center gap-2 font-mono text-muted-foreground">
          <span>Experiment Section</span>
          <span>•</span>
          <span className="text-primary font-semibold">Nursery Tray Sowing & Mud Sampling</span>
        </div>
      </div>

      {/* Step Title Header */}
      <div className="text-center space-y-2">
        <Badge className="bg-primary/10 border-primary/20 text-primary px-3 py-1 text-xs rounded-full">
          Photographic 2D Cell Calibration
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-foreground">
          Map Sown Seeds on Nursery Mud
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Provide a top-down view of your tray, then <strong>tap directly onto the soil cells</strong> wherever you have sown your{" "}
          <strong className="text-foreground">{selectedProtocol.commonName}</strong> ({selectedProtocol.scientificName}) seeds.
        </p>
      </div>

      {/* Tray Source Selection Tabs */}
      <Card className="border border-border bg-card p-2 rounded-2xl shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 px-2 py-1">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setActiveTab("preset");
                setTrayImage(DEFAULT_SOIL_TRAY_IMAGE);
                stopCamera();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
                activeTab === "preset"
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Default Mud Tray Preset</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("upload");
                stopCamera();
                fileInputRef.current?.click();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
                activeTab === "upload"
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Tray Photo</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("webcam");
                startCamera();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
                activeTab === "webcam"
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Webcam / Chamber Camera</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* Quick Tools */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowGridOverlay(!showGridOverlay)}
              className={`h-8 px-2.5 rounded-xl text-xs gap-1.5 ${showGridOverlay ? "border-primary/40 text-primary bg-primary/5" : ""}`}
              title="Toggle 5x8 Grid Boundary Guide"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Grid Guide</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setPins(generateDefaultGridPins())}
              className="h-8 px-2.5 rounded-xl text-xs gap-1.5"
              title="Auto-fill 40 cells in 5x8 matrix"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Auto-Fill 40 Cells</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setPins([])}
              className="h-8 px-2.5 rounded-xl text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              title="Clear all sown markers"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Camera Live Stream View (if active) */}
      {activeTab === "webcam" && isCameraActive && (
        <Card className="border border-border bg-card p-4 rounded-2xl shadow-sm text-center space-y-3">
          <div className="relative aspect-[16/10] max-h-96 mx-auto rounded-xl overflow-hidden bg-black flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>LIVE CHAMBER CAM</span>
            </div>
          </div>
          <div className="flex justify-center gap-3">
            <Button
              onClick={capturePhoto}
              className="rounded-xl bg-primary text-primary-foreground font-semibold text-xs px-5 h-9 flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Capture Tray Photo & Map Mud</span>
            </Button>
            <Button
              variant="outline"
              onClick={stopCamera}
              className="rounded-xl text-xs h-9"
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {cameraError && (
        <div className="p-3 text-xs bg-amber-500/10 border border-amber-500/20 text-amber-800 rounded-xl">
          {cameraError}
        </div>
      )}

      {/* Main Interactive 2D Soil / Mud Canvas */}
      <Card className="border border-border bg-card p-4 sm:p-6 rounded-3xl shadow-sm overflow-hidden">
        
        {/* Canvas Header & Sowing Counter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-xl shrink-0">
              {selectedProtocol.emoji}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span>{selectedProtocol.commonName} Nursery Tray Mud Map</span>
                <span className="text-[11px] font-mono text-muted-foreground font-normal">
                  (Tap to Sow / Tap to Remove)
                </span>
              </h3>
              <p className="text-xs text-muted-foreground">
                High-resolution overhead computer vision plane • 420mm focal height
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="bg-primary text-primary-foreground font-mono text-xs px-3 py-1 rounded-full">
              🌱 {pins.length} / 40 Seeds Sown
            </Badge>
            <Badge variant="outline" className="font-mono text-xs px-2.5 py-1">
              {pins.length > 0 ? "Ready to Germinate" : "Tap Soil to Add Seeds"}
            </Badge>
          </div>
        </div>

        {/* Visual Mud Interactive Surface */}
        <div
          ref={containerRef}
          onClick={handleCanvasClick}
          className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-border shadow-inner cursor-crosshair select-none bg-[#241A14]"
        >
          {/* Real Potting Soil / Mud Background Image */}
          <img
            src={trayImage}
            alt="Nursery Tray Mud"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            onError={() => {
              // Fallback if image fails to load
              setTrayImage(DEFAULT_SOIL_TRAY_IMAGE);
            }}
          />

          {/* Natural Vignette and Mud Depth Gradients */}
          <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/40 pointer-events-none" />

          {/* Optional 5x8 Matrix Overlay Guide */}
          {showGridOverlay && (
            <div className="absolute inset-0 grid grid-cols-8 grid-rows-5 pointer-events-none p-3 gap-1 opacity-40">
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={`cell-border-${i}`}
                  className="border border-white/30 rounded-xl flex items-start justify-start p-1"
                >
                  <span className="text-[9px] font-mono text-white/70 font-semibold drop-shadow-sm">
                    C{String(i + 1).padStart(2, "0")}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Sown Seed Markers / Pins */}
          {pins.map((pin, i) => {
            const isHovered = hoveredPinId === pin.id;
            return (
              <motion.div
                key={pin.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 450, damping: 25 }}
                onMouseEnter={() => setHoveredPinId(pin.id)}
                onMouseLeave={() => setHoveredPinId(null)}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer"
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                title={`Cell ${pin.cellId} (${pin.x}%, ${pin.y}%) - Click to remove`}
              >
                {/* Seed Pin Target Circle */}
                <div className="relative flex items-center justify-center">
                  
                  {/* Subtle Pulse Halo on Mud */}
                  <span className="absolute w-8 h-8 rounded-full bg-emerald-500/25 animate-ping opacity-75" />
                  
                  {/* Pin Body */}
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-600 text-white border-2 border-white shadow-md flex items-center justify-center text-xs group-hover:bg-rose-600 transition-colors">
                    {isHovered ? (
                      <span className="text-[10px] font-bold">✕</span>
                    ) : (
                      <span className="text-[10px] select-none">🌱</span>
                    )}
                  </div>

                  {/* Cell Label Tag */}
                  <div className="absolute -bottom-4 whitespace-nowrap px-1.5 py-0.2 bg-black/75 backdrop-blur-xs text-[9px] font-mono text-white rounded-md border border-white/20 shadow-xs pointer-events-none">
                    {pin.cellId}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Bottom Mud Canvas HUD bar */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md text-[10px] sm:text-xs text-white/90 border border-white/10 pointer-events-none">
            <span className="font-mono">
              Overhead Phenotyping Plane: 420mm • ExG Hybrid
            </span>
            <span className="text-emerald-400 font-semibold font-mono">
              ● {pins.length} active coordinate seeds
            </span>
          </div>
        </div>

        {/* Tip helper */}
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 p-3 rounded-xl border border-border">
          <Info className="w-4 h-4 text-primary shrink-0" />
          <span>
            <strong>Pro Tip:</strong> Click any mud cell to place a seed pin. Tap an existing pin to remove it. You can also click <em>"Auto-Fill 40 Cells"</em> for immediate standard 5×8 nursery placement.
          </span>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={onBack}
            className="w-full sm:w-auto rounded-xl text-xs sm:text-sm h-11"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span>Back to Seeds</span>
          </Button>

          <Button
            onClick={() => {
              if (pins.length === 0) {
                // If user didn't drop any pins, default to 40 grid
                onConfirmMapping(generateDefaultGridPins(), trayImage);
              } else {
                onConfirmMapping(pins, trayImage);
              }
            }}
            className="w-full sm:w-auto rounded-xl bg-primary text-primary-foreground font-semibold text-xs sm:text-sm h-11 px-8 flex items-center justify-center gap-2 shadow-xs hover:opacity-90 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm Tray Mapping & Generate Protocol</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

      </Card>

    </div>
  );
}
