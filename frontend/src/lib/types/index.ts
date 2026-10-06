export interface BiologicalEpoch {
  epochNumber: 1 | 2 | 3;
  name: string; // e.g. "Epoch 1: Imbibition & Radicle Emergence"
  daysRange: string; // e.g. "Days 0-3"
  tempRange: { min: number; optimal: number; max: number };
  humidityRange: { min: number; optimal: number; max: number };
  moistureTarget: string; // e.g. "70-80% WAP"
  lightRegime: string; // e.g. "Complete darkness" or "12h Photoperiod"
  ventilationSchedule: string; // e.g. "Micro-ventilation 15° every 4 hours"
  deterministicActuation: {
    pumpIntervalMinutes: number;
    pumpDurationSeconds: number;
    fanDutyCycle: number;
    ventAngleDegrees: number;
  };
}

export interface SeedProtocol {
  id: string;
  commonName: string;
  scientificName: string;
  family?: string;
  germinationDays: string; // e.g. "~7 days germination"
  emoji: string;
  description: string;
  epochs: BiologicalEpoch[];
  riskFactors: string[];
  referenceStandard: string; // e.g. "ISTA / FAO Seed Science Standard"
}

export interface SensorReading {
  timestamp: string;
  temperature: number; // °C
  humidity: number; // % RH
  soilMoisture1: number; // %
  soilMoisture2: number; // %
  gasPpm?: number;
  lux?: number;
  isLiveHardware: boolean;
}

export interface Experiment {
  id: string;
  protocolId: string;
  seedName: string;
  scientificName: string;
  startedAt: string;
  currentEpoch: 1 | 2 | 3;
  status: "INITIALIZING" | "RUNNING" | "PAUSED" | "COMPLETED";
  hardwareConnected: boolean;
  telemetryLogs: SensorReading[];
  totalSamples: number;
  trayCellsTotal: number;
  trayCellsEmerged: number;
}

export interface WeatherData {
  ambientTemp: number;
  ambientHumidity: number;
  pressureHpa: number;
  condition: string;
}

export interface AIInsight {
  id: string;
  timestamp: string;
  confidence: number;
  severity: "OPTIMAL" | "ATTENTION" | "CRITICAL";
  title: string;
  observation: string;
  recommendation: string;
  deterministicOverrideApplied?: boolean;
}
