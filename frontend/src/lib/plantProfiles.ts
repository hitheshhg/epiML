/**
 * Chiguru (ಚಿಗುರು) — Crop-Adaptive Nursery Control System
 * Plant Profile Data Models & Type Definitions
 * 
 * "Chiguru separates agricultural knowledge from hardware."
 * One Hardware Platform + Multiple Plant Profiles = Adaptive Nursery System
 */

export type CropType = "tomato" | "chilli" | "capsicum" | "brinjal" | "cabbage";
export type GrowthStage = "germination" | "nursery";

export interface EnvironmentTarget {
  temperature: {
    min: number;     // °C
    optimal: number; // °C
    max: number;     // °C
  };
  humidity: {
    min: number;     // % RH
    optimal: number; // % RH
    max: number;     // % RH
  };
  moisture: {
    min: number;     // % Volumetric soil moisture
    target: number;  // % Desired post-irrigation moisture
    max: number;     // % Saturation / root drowning threshold
  };
  shade: {
    target: number;  // % Target shade canopy deployment (0-100%)
    maxLight?: number; // Lux threshold for heat scorch protection
  };
}

export interface ControlStrategy {
  pumpMode: "adaptive" | "manual";
  shadeMode: "adaptive" | "manual";
  minPumpOnSec: number;        // Minimum pulse duration (e.g. 4s)
  minPumpOffSec: number;       // Minimum rest duration before retry (e.g. 30s)
  cooldownMinutes: number;     // Anti-cycling recovery cooldown (e.g. 5m)
  maxPumpRunSec: number;       // Safety cutoff (e.g. 45s)
  hysteresisBand: number;      // % Moisture hysteresis to prevent rapid cycling
}

export interface PlantProfile {
  id: string;
  crop: CropType;
  commonName: string;
  scientificName: string;
  stage: GrowthStage;
  stageName: string;
  stageDurationDays: number;
  environment: EnvironmentTarget;
  control: ControlStrategy;
  agronomicNotes: string;
  calibrationNote: string;
  version: string;
  updatedAt: string;
}

export interface SensorState {
  temperature: number; // °C (ambient / chamber)
  humidity: number;    // % RH
  moisture1: number;   // % Root zone probe 1
  moisture2: number;   // % Root zone probe 2
  gasPpm?: number;     // MQ135 baseline
  lightLux?: number;   // Ambient illuminance
  isHardwareLive: boolean;
}

export interface ActuatorHistory {
  lastPumpStartTime?: number;  // epoch ms
  lastPumpStopTime?: number;   // epoch ms
  lastIrrigationVolumeMl?: number;
  isCurrentlyPumping: boolean;
  pumpCycleCountToday: number;
  recentIrrigationWithinMinutes?: boolean;
}

export type IrrigationDecisionType = "ACTIVATE" | "STOP" | "REFUSE" | "OPTIMAL_STANDBY";
export type ShadeDecisionType = "DEPLOY" | "RETRACT" | "MAINTAIN";

export interface DecisionContextCheck {
  moistureStatus: "CRITICAL_LOW" | "DEFICIT" | "OPTIMAL" | "SATURATED" | "SENSOR_FAULT";
  humidityStatus: "LOW" | "OPTIMAL" | "HIGH";
  tempStatus: "COLD_RISK" | "OPTIMAL" | "HEAT_STRESS";
  cooldownActive: boolean;
  saturationRisk: boolean;
  recentIrrigationDetected: boolean;
  dewPointCondensation: boolean;
}

export interface DecisionResult {
  timestamp: string;
  crop: CropType;
  cropName: string;
  stage: GrowthStage;
  irrigation: IrrigationDecisionType;
  targetPumpState: boolean;
  shade: ShadeDecisionType;
  targetShadePercent: number; // 0-100%
  targetServoAngle: number;    // 0°-90° mechanical throw
  reasonCode: string;
  summaryBadge: string;
  explanation: string;
  context: DecisionContextCheck;
  safetyOverrideTriggered?: boolean;
}

// Initial 5 crops x 2 stages (DEMO / CALIBRATION VALUES)
export const PLANT_PROFILES: PlantProfile[] = [
  // 1. TOMATO (Solanum lycopersicum)
  {
    id: "tomato_germination",
    crop: "tomato",
    commonName: "Tomato",
    scientificName: "Solanum lycopersicum",
    stage: "germination",
    stageName: "Germination (Radicle Emergence)",
    stageDurationDays: 6,
    environment: {
      temperature: { min: 20, optimal: 25, max: 30 },
      humidity: { min: 65, optimal: 78, max: 90 },
      moisture: { min: 65, target: 75, max: 85 },
      shade: { target: 60, maxLight: 10000 },
    },
    control: {
      pumpMode: "adaptive",
      shadeMode: "adaptive",
      minPumpOnSec: 4,
      minPumpOffSec: 30,
      cooldownMinutes: 5,
      maxPumpRunSec: 40,
      hysteresisBand: 4,
    },
    agronomicNotes: "Tomato seeds require warm, moist substrate to break seed coat dormancy. Sensitive to damping-off fungus if humidity > 88% combined with soggy soil.",
    calibrationNote: "DEMO / CALIBRATION VALUES — Prototype agricultural baseline",
    version: "1.0.0",
    updatedAt: "2026-10-06T12:00:00Z",
  },
  {
    id: "tomato_nursery",
    crop: "tomato",
    commonName: "Tomato",
    scientificName: "Solanum lycopersicum",
    stage: "nursery",
    stageName: "Seedling Nursery (Cotyledon to 2-Leaf)",
    stageDurationDays: 21,
    environment: {
      temperature: { min: 18, optimal: 24, max: 32 },
      humidity: { min: 55, optimal: 68, max: 80 },
      moisture: { min: 50, target: 65, max: 78 },
      shade: { target: 35, maxLight: 25000 },
    },
    control: {
      pumpMode: "adaptive",
      shadeMode: "adaptive",
      minPumpOnSec: 5,
      minPumpOffSec: 35,
      cooldownMinutes: 6,
      maxPumpRunSec: 45,
      hysteresisBand: 5,
    },
    agronomicNotes: "Requires higher light penetration to prevent stem etiolation (spindly growth). Moderate moisture cycling promotes vigorous root taper.",
    calibrationNote: "DEMO / CALIBRATION VALUES — Prototype agricultural baseline",
    version: "1.0.0",
    updatedAt: "2026-10-06T12:00:00Z",
  },

  // 2. CHILLI (Capsicum annuum)
  {
    id: "chilli_germination",
    crop: "chilli",
    commonName: "Chilli",
    scientificName: "Capsicum annuum",
    stage: "germination",
    stageName: "Germination (Seed Crack to Hook)",
    stageDurationDays: 10,
    environment: {
      temperature: { min: 22, optimal: 28, max: 34 },
      humidity: { min: 70, optimal: 80, max: 92 },
      moisture: { min: 60, target: 70, max: 80 },
      shade: { target: 70, maxLight: 8000 },
    },
    control: {
      pumpMode: "adaptive",
      shadeMode: "adaptive",
      minPumpOnSec: 3,
      minPumpOffSec: 30,
      cooldownMinutes: 7,
      maxPumpRunSec: 35,
      hysteresisBand: 4,
    },
    agronomicNotes: "Chilli seeds have thick waxes and require elevated soil temperature (26-29°C) and consistent humidity. Highly intolerant of cold water shock.",
    calibrationNote: "DEMO / CALIBRATION VALUES — Prototype agricultural baseline",
    version: "1.0.0",
    updatedAt: "2026-10-06T12:00:00Z",
  },
  {
    id: "chilli_nursery",
    crop: "chilli",
    commonName: "Chilli",
    scientificName: "Capsicum annuum",
    stage: "nursery",
    stageName: "Seedling Nursery (Vegetative Plug)",
    stageDurationDays: 28,
    environment: {
      temperature: { min: 20, optimal: 26, max: 35 },
      humidity: { min: 50, optimal: 65, max: 75 },
      moisture: { min: 45, target: 60, max: 72 },
      shade: { target: 40, maxLight: 30000 },
    },
    control: {
      pumpMode: "adaptive",
      shadeMode: "adaptive",
      minPumpOnSec: 4,
      minPumpOffSec: 40,
      cooldownMinutes: 8,
      maxPumpRunSec: 40,
      hysteresisBand: 5,
    },
    agronomicNotes: "Root system is prone to Pythium root rot if overwatered. Requires well-drained substrate cycles with dry-back periods.",
    calibrationNote: "DEMO / CALIBRATION VALUES — Prototype agricultural baseline",
    version: "1.0.0",
    updatedAt: "2026-10-06T12:00:00Z",
  },

  // 3. CAPSICUM / BELL PEPPER (Capsicum annuum var. grossum)
  {
    id: "capsicum_germination",
    crop: "capsicum",
    commonName: "Capsicum (Bell Pepper)",
    scientificName: "Capsicum annuum var. grossum",
    stage: "germination",
    stageName: "Germination (Sprout Induction)",
    stageDurationDays: 9,
    environment: {
      temperature: { min: 21, optimal: 27, max: 32 },
      humidity: { min: 68, optimal: 80, max: 90 },
      moisture: { min: 62, target: 72, max: 82 },
      shade: { target: 65, maxLight: 9000 },
    },
    control: {
      pumpMode: "adaptive",
      shadeMode: "adaptive",
      minPumpOnSec: 4,
      minPumpOffSec: 30,
      cooldownMinutes: 6,
      maxPumpRunSec: 35,
      hysteresisBand: 4,
    },
    agronomicNotes: "Bell pepper hybrids demand tight thermal stability (24-27°C). Excessive substrate wetness causes hypocotyl constriction.",
    calibrationNote: "DEMO / CALIBRATION VALUES — Prototype agricultural baseline",
    version: "1.0.0",
    updatedAt: "2026-10-06T12:00:00Z",
  },
  {
    id: "capsicum_nursery",
    crop: "capsicum",
    commonName: "Capsicum (Bell Pepper)",
    scientificName: "Capsicum annuum var. grossum",
    stage: "nursery",
    stageName: "Seedling Nursery (4-Leaf Vigorous)",
    stageDurationDays: 25,
    environment: {
      temperature: { min: 19, optimal: 25, max: 32 },
      humidity: { min: 55, optimal: 65, max: 78 },
      moisture: { min: 48, target: 62, max: 75 },
      shade: { target: 45, maxLight: 28000 },
    },
    control: {
      pumpMode: "adaptive",
      shadeMode: "adaptive",
      minPumpOnSec: 4,
      minPumpOffSec: 35,
      cooldownMinutes: 6,
      maxPumpRunSec: 40,
      hysteresisBand: 5,
    },
    agronomicNotes: "Demands uniform canopy ventilation. Sudden temperature spikes (>32°C) trigger permanent leaf curling.",
    calibrationNote: "DEMO / CALIBRATION VALUES — Prototype agricultural baseline",
    version: "1.0.0",
    updatedAt: "2026-10-06T12:00:00Z",
  },

  // 4. BRINJAL / EGGPLANT (Solanum melongena)
  {
    id: "brinjal_germination",
    crop: "brinjal",
    commonName: "Brinjal (Eggplant)",
    scientificName: "Solanum melongena",
    stage: "germination",
    stageName: "Germination (Seed Embryo Activation)",
    stageDurationDays: 8,
    environment: {
      temperature: { min: 22, optimal: 29, max: 35 },
      humidity: { min: 65, optimal: 75, max: 88 },
      moisture: { min: 58, target: 68, max: 78 },
      shade: { target: 55, maxLight: 12000 },
    },
    control: {
      pumpMode: "adaptive",
      shadeMode: "adaptive",
      minPumpOnSec: 4,
      minPumpOffSec: 30,
      cooldownMinutes: 5,
      maxPumpRunSec: 40,
      hysteresisBand: 4,
    },
    agronomicNotes: "Tropical nightshade with high heat tolerance. Thrives under warm microclimates; seeds stunt below 20°C.",
    calibrationNote: "DEMO / CALIBRATION VALUES — Prototype agricultural baseline",
    version: "1.0.0",
    updatedAt: "2026-10-06T12:00:00Z",
  },
  {
    id: "brinjal_nursery",
    crop: "brinjal",
    commonName: "Brinjal (Eggplant)",
    scientificName: "Solanum melongena",
    stage: "nursery",
    stageName: "Seedling Nursery (Broadleaf Vigorous)",
    stageDurationDays: 30,
    environment: {
      temperature: { min: 20, optimal: 28, max: 36 },
      humidity: { min: 50, optimal: 65, max: 80 },
      moisture: { min: 52, target: 66, max: 78 },
      shade: { target: 30, maxLight: 35000 },
    },
    control: {
      pumpMode: "adaptive",
      shadeMode: "adaptive",
      minPumpOnSec: 5,
      minPumpOffSec: 30,
      cooldownMinutes: 5,
      maxPumpRunSec: 45,
      hysteresisBand: 4,
    },
    agronomicNotes: "Rapid foliar expansion creates high transpiration demand. Needs steady morning hydration.",
    calibrationNote: "DEMO / CALIBRATION VALUES — Prototype agricultural baseline",
    version: "1.0.0",
    updatedAt: "2026-10-06T12:00:00Z",
  },

  // 5. CABBAGE (Brassica oleracea var. capitata)
  {
    id: "cabbage_germination",
    crop: "cabbage",
    commonName: "Cabbage",
    scientificName: "Brassica oleracea var. capitata",
    stage: "germination",
    stageName: "Germination (Cool-Climate Radicle)",
    stageDurationDays: 5,
    environment: {
      temperature: { min: 14, optimal: 20, max: 26 },
      humidity: { min: 60, optimal: 72, max: 85 },
      moisture: { min: 55, target: 65, max: 75 },
      shade: { target: 50, maxLight: 14000 },
    },
    control: {
      pumpMode: "adaptive",
      shadeMode: "adaptive",
      minPumpOnSec: 3,
      minPumpOffSec: 35,
      cooldownMinutes: 6,
      maxPumpRunSec: 35,
      hysteresisBand: 4,
    },
    agronomicNotes: "Cool-season brassica with fast germination (3-5 days). Vulnerable to heat stress above 27°C; needs low temperature and moderate moisture.",
    calibrationNote: "DEMO / CALIBRATION VALUES — Prototype agricultural baseline",
    version: "1.0.0",
    updatedAt: "2026-10-06T12:00:00Z",
  },
  {
    id: "cabbage_nursery",
    crop: "cabbage",
    commonName: "Cabbage",
    scientificName: "Brassica oleracea var. capitata",
    stage: "nursery",
    stageName: "Seedling Nursery (Hardening Plug)",
    stageDurationDays: 24,
    environment: {
      temperature: { min: 12, optimal: 18, max: 25 },
      humidity: { min: 50, optimal: 62, max: 75 },
      moisture: { min: 45, target: 58, max: 70 },
      shade: { target: 25, maxLight: 40000 },
    },
    control: {
      pumpMode: "adaptive",
      shadeMode: "adaptive",
      minPumpOnSec: 4,
      minPumpOffSec: 40,
      cooldownMinutes: 7,
      maxPumpRunSec: 35,
      hysteresisBand: 5,
    },
    agronomicNotes: "Prefers full ambient light and cooler temperatures to encourage compact, sturdy hypocotyls without legginess.",
    calibrationNote: "DEMO / CALIBRATION VALUES — Prototype agricultural baseline",
    version: "1.0.0",
    updatedAt: "2026-10-06T12:00:00Z",
  },
];

export const CROPS_CATALOG: { type: CropType; name: string; scientific: string }[] = [
  { type: "tomato", name: "Tomato", scientific: "Solanum lycopersicum" },
  { type: "chilli", name: "Chilli", scientific: "Capsicum annuum" },
  { type: "capsicum", name: "Capsicum", scientific: "Capsicum annuum var. grossum" },
  { type: "brinjal", name: "Brinjal (Eggplant)", scientific: "Solanum melongena" },
  { type: "cabbage", name: "Cabbage", scientific: "Brassica oleracea" },
];

export function getProfile(crop: CropType, stage: GrowthStage): PlantProfile {
  const found = PLANT_PROFILES.find((p) => p.crop === crop && p.stage === stage);
  if (found) return found;
  return PLANT_PROFILES[0];
}
