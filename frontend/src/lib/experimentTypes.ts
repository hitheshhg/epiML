/**
 * CHIGURU 2.0 — Intelligent Seed & Seedling Research Platform
 * Core Research Data Models, Experiment Schemas & Provenance Types
 * 
 * "What happened to each seedling, under what experimental conditions,
 *  and can we trace its biological response to its environmental and treatment history?"
 */

export type DataClass =
  | "MEASURED"          // Live hardware telemetry from attached sensors
  | "REAL_PUBLIC_DATA"  // Public scientific repository (SeedGerm, BioImage Archive, NASA POWER)
  | "IMPORTED"          // External researcher dataset uploaded
  | "DERIVED"           // Mathematically calculated from measured records (MGT, T50, ExG)
  | "REPLAY"            // Historical CHIGURU recorded trial replay
  | "SIMULATED";        // Demo / calibrated sandbox scenario

export interface DataClassBadgeMeta {
  code: DataClass;
  label: string;
  badgeText: string;
  colorClass: string;
  description: string;
}

export const DATA_CLASS_META: Record<DataClass, DataClassBadgeMeta> = {
  MEASURED: {
    code: "MEASURED",
    label: "Measured (Live)",
    badgeText: "LIVE HARDWARE",
    colorClass: "bg-[#2D6A4F] text-white border-[#1B4332]",
    description: "Acquired in real-time from physical ADC channels and DHT digital probes.",
  },
  REAL_PUBLIC_DATA: {
    code: "REAL_PUBLIC_DATA",
    label: "Real Public Data",
    badgeText: "EXTERNAL DATA",
    colorClass: "bg-[#1D3557] text-white border-[#14213D]",
    description: "Retrieved from documented scientific repositories (BioImage Archive, NASA, GBIF).",
  },
  IMPORTED: {
    code: "IMPORTED",
    label: "Imported Dataset",
    badgeText: "IMPORTED",
    colorClass: "bg-[#4A5568] text-white border-[#2D3748]",
    description: "Uploaded by researcher in standardized CSV/JSON format.",
  },
  DERIVED: {
    code: "DERIVED",
    label: "Derived Calculation",
    badgeText: "DERIVED FROM MEASUREMENTS",
    colorClass: "bg-[#52796F] text-white border-[#354F52]",
    description: "Scientifically derived via standard mathematical formulas (MGT, T50, ExG area).",
  },
  REPLAY: {
    code: "REPLAY",
    label: "Recorded Session Replay",
    badgeText: "REPLAY",
    colorClass: "bg-[#D97706] text-white border-[#B45309]",
    description: "Chronological playback of a prior physical CHIGURU experiment recording.",
  },
  SIMULATED: {
    code: "SIMULATED",
    label: "Simulated Sandbox",
    badgeText: "DEMO / SIMULATED",
    colorClass: "bg-[#E76F51] text-white border-[#D65A31]",
    description: "Synthetic test state applied in interactive sandbox mode for scenario verification.",
  },
};

export type BiologicalEventState =
  | "PLANTED"
  | "IMBIBITION"
  | "EMERGENCE_DETECTED"
  | "GERMINATED"
  | "SEEDLING_DEVELOPING"
  | "NO_CHANGE"
  | "FAILED"
  | "MANUAL_REVIEW";

export type DataQualityFlag =
  | "GOOD"
  | "MISSING"
  | "OUTLIER"
  | "STALE"
  | "CALIBRATION_REQUIRED"
  | "CAMERA_ALIGNMENT_ERROR"
  | "LOW_IMAGE_QUALITY"
  | "SENSOR_DISCONNECTED"
  | "CLOCK_DESYNC"
  | "MANUAL_OVERRIDE";

export interface Treatment {
  id: string; // e.g. "T1", "T2", "T3", "T4"
  name: string; // e.g. "T1 Control", "T2 Moisture Deficit"
  code: string; // e.g. "CTRL", "DEFICIT", "SATURATED", "CYCLIC"
  description: string;
  color: string; // Hex color for spatial matrix visualization
  targetMoistureIndex: number; // Substrate Moisture Index (0-100%)
  targetTemperatureC: number;
  targetShadePercent: number;
  replicateCount: number; // e.g. 10 cells
}

export interface CellObservation {
  timestamp: string; // ISO 8601 UTC
  observationHour: number; // e.g. 0, 12, 24, 36, 48, 72, 96, 120
  imagePath: string;
  greenAreaPx: number;
  projectedCanopyPct: number; // % cell surface covered by photosynthetic cotyledon
  exgMean: number; // Excess Green Index mean (2G - R - B)
  biologicalState: BiologicalEventState;
  temperatureC: number;
  humidityRH: number;
  substrateMoistureIndex: number;
  interventionEvent?: string; // e.g. "IRRIGATION: 4s pulse (230ml)", "SHADE: deployed 54°"
  confidence: number; // 0.0 - 1.0
  qualityFlag: DataQualityFlag;
}

export interface CellData {
  cellId: string; // "C01" to "C40"
  row: number; // 1 to 5
  col: number; // 1 to 8
  treatmentId: string; // "T1", "T2", "T3", "T4"
  replicateIndex: number; // 1 to N
  seedLotId: string;
  plantedTimestamp: string;
  emergenceTimestamp: string | null;
  timeToEmergenceHours: number | null; // e.g. 42.5 hours (null if not emerged)
  currentState: BiologicalEventState;
  latestGreenAreaPx: number;
  latestCanopyPct: number;
  growthRatePctPerHour: number;
  phenotypeConfidence: number;
  manualAnnotation: BiologicalEventState | null;
  annotationNotes?: string;
  qualityFlags: DataQualityFlag[];
  history: CellObservation[];
}

export interface GerminationMetrics {
  finalGerminationPct: number; // e.g. 85.0%
  meanGerminationTimeHours: number; // MGT = sum(ni * ti) / sum(ni)
  t50Hours: number; // Time to 50% germination via linear interpolation
  totalCellsCount: number; // 40
  germinatedCount: number; // e.g. 34
  failedCount: number; // e.g. 6
  sampleSizeN: number; // n = 40
  uniformityCoeff: number; // Dispersion metric (lower = more uniform emergence)
  treatmentMetrics: {
    treatmentId: string;
    treatmentName: string;
    replicatesN: number;
    germinationPct: number;
    meanEmergenceHours: number;
    t50Hours: number;
    meanGreenAreaPx: number;
    stdDevHours: number;
    descriptiveWarning?: string;
  }[];
}

export interface ChiguruPhenotypeScoreBreakdown {
  score: number; // 0 - 100 index
  formula: string; // "Score = 0.40 * GreenArea + 0.35 * GrowthRate + 0.25 * ColorStability"
  weights: {
    greenAreaWeight: number; // 0.40
    growthRateWeight: number; // 0.35
    colorStabilityWeight: number; // 0.25
  };
  components: {
    greenAreaScore: number;
    growthRateScore: number;
    colorStabilityScore: number;
  };
  provenanceNote: string;
}

export interface Experiment {
  id: string; // e.g. "CHG-EXP-2026-001"
  title: string;
  researchQuestion: string;
  crop: string;
  scientificName: string;
  cultivarOrVariety: string;
  seedLotId: string;
  seedSource: string;
  substrate: string; // e.g. "Washed Cocopeat 70% + Perlite 30%"
  startDate: string;
  endDate: string | null;
  durationDays: number;
  researcherName: string;
  institution: string;
  status: "ACTIVE_RECORDING" | "COMPLETED" | "BENCHMARK_REPLAY";
  dataClass: DataClass;
  cameraProtocol: {
    sensorModel: string;
    resolution: string;
    imagingIntervalMinutes: number;
    focalDistanceMm: number;
    radicleObservable: boolean; // false for standard overhead top-view RGB
  };
  sensorProtocol: {
    samplingIntervalSec: number;
    soilProbeModel: string;
    calibrationModel: string;
    dewPointAlgorithm: string;
  };
  treatments: Treatment[];
  cells: CellData[];
  metrics: GerminationMetrics;
  referenceIds: string[];
  hypothesis?: string;
  protocolVersion: string;
  createdTimestamp: string;
  lastUpdatedTimestamp: string;
}
