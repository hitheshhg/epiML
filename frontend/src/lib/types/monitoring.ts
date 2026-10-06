import { ValidatedPlantProfile } from "@/schemas/plant";

export type CellState =
  | "SEEDED"
  | "EMERGING"
  | "GERMINATED"
  | "GROWING"
  | "REVIEW"
  | "NO OBSERVATION";

export type HumanReviewLabel = "YES" | "NO" | "UNCERTAIN" | "PENDING";

export interface CellObservation {
  timestamp: string;
  state: CellState;
  greenAreaMm2: number;
  exgScore: number;
  confidence: number; // 0.0 - 1.0
  imageUrl?: string;
  environmentalContext: {
    temperature: number;
    humidity: number;
    moistureIndex: number;
    dewPoint: number;
    ventState: "CLOSED" | "MICRO VENT" | "OPEN";
    fanState: "OFF" | "ON";
    pumpState: "OFF" | "ON";
  };
  humanVerification?: {
    label: HumanReviewLabel;
    verifiedBy: string;
    verifiedAt: string;
    notes?: string;
  };
}

export interface CellRecord {
  cellId: string; // e.g. "C01" to "C40"
  row: number;    // 0 to 4 (5 rows)
  col: number;    // 0 to 7 (8 columns)
  state: CellState;
  seededAt: string;
  emergenceTime?: string;
  growthChangePct: number;
  currentObservation: CellObservation;
  history: CellObservation[];
}

export interface SynchronizedTimelinePoint {
  timestamp: string;
  timeLabel: string;
  elapsedHours: number;
  temperature: number;
  humidity: number;
  moistureIndex: number;
  dewPoint: number;
  condensationRisk: boolean;
  fanState: "OFF" | "ON";
  ventState: "CLOSED" | "MICRO VENT" | "OPEN";
  pumpEvent: boolean;
  greenFractionExg: number;
  germinatedCount: number;
  keyEvent?: string; // e.g., "EMERGENCE C17", "IRRIGATION EVENT", "VENT OPEN"
}

export interface MonitoringSession {
  sessionId: string;
  userId: string;
  plantName: string;
  scientificName: string;
  seedLot?: string;
  profileSnapshot: ValidatedPlantProfile;
  profileSource: string;
  profileVersion: string;
  startTime: string;
  status: "ACTIVE" | "COMPLETED" | "PAUSED";
  sensorConfig: {
    dhtProbe: "DHT22 (Canopy)";
    moistureProbes: "Dual Capacitive (Index A0, A1)";
    gasProbe: "MQ135 (VOC Proxy)";
    fan: "CLD8025SH 12V via Transistor Driver";
    servoVent: "SG90 Micro-Louver";
    pump: "3W Submersible DC";
  };
  cameraConfig: {
    type: "Fixed Overhead Optical Gantry";
    focalDistanceMm: 420;
    geometry: "Perpendicular 5x8 Matrix";
    resolution: "1920x1080 Native";
  };
  algorithmVersion: "Chiguru CV Pipeline v2.0 (ExG + Grid Calibration)";
  softwareVersion: "Chiguru 2.0.0-prod";
}

export interface ChiguruModelVersion {
  versionId: string;
  name: string;
  architecture: string;
  trainingDatasetVersion: string;
  trainingDate: string;
  verifiedLabelsCount: number;
  validationMetrics: {
    precision: number;
    recall: number;
    f1Score: number;
    iou: number;
  };
  status: "ACTIVE" | "TEST" | "ARCHIVED";
  notes: string;
}

export interface VerifiedTrainingExample {
  id: string;
  cellId: string;
  sessionId: string;
  plant: string;
  timestamp: string;
  modelPrediction: CellState;
  modelConfidence: number;
  humanVerifiedLabel: HumanReviewLabel;
  sensorContextSummary: string;
  imageUrl: string;
  datasetVersion: string;
}
