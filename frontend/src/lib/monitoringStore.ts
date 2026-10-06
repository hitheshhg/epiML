import {
  CellRecord,
  CellState,
  SynchronizedTimelinePoint,
  ChiguruModelVersion,
  VerifiedTrainingExample,
  MonitoringSession,
} from "./types/monitoring";
import { ValidatedPlantProfile } from "@/schemas/plant";

export function generate40Cells(plantName: string): CellRecord[] {
  const cells: CellRecord[] = [];
  const baseTime = Date.now() - 96 * 3600 * 1000; // 4 days ago

  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 8; c++) {
      const idx = r * 8 + c + 1;
      const cellId = `C${idx.toString().padStart(2, "0")}`;

      let state: CellState = "SEEDED";
      let growthChange = 0;
      let exg = 0.08;
      let greenArea = 0;
      let conf = 0.95;

      // Realistic spatial germination clustering
      if (idx === 17) {
        // C17 is the signature showcase seedling
        state = "GROWING";
        growthChange = 68;
        exg = 0.84;
        greenArea = 142;
        conf = 0.98;
      } else if (idx === 19 || idx === 26) {
        // Cells flagged for Human-in-the-Loop review
        state = "REVIEW";
        growthChange = 22;
        exg = 0.46;
        greenArea = 38;
        conf = 0.58; // Low confidence -> triggers review
      } else if ([1, 2, 3, 5, 7, 8, 10, 11, 14, 15, 18, 21, 22, 25, 29, 30, 31, 33, 34, 37, 38, 40].includes(idx)) {
        state = "GROWING";
        growthChange = 45 + ((idx * 7) % 35);
        exg = 0.72 + ((idx * 3) % 18) / 100;
        greenArea = 90 + ((idx * 11) % 60);
        conf = 0.92;
      } else if ([6, 12, 13, 20, 24, 28, 32, 36, 39].includes(idx)) {
        state = "EMERGING";
        growthChange = 18 + ((idx * 5) % 15);
        exg = 0.38 + ((idx * 2) % 12) / 100;
        greenArea = 32 + ((idx * 4) % 25);
        conf = 0.88;
      } else if ([4, 9, 16, 23, 27, 35].includes(idx)) {
        state = "SEEDED";
        growthChange = 0;
        exg = 0.08;
        greenArea = 0;
        conf = 0.94;
      }

      const emergenceHoursAgo = state === "GROWING" ? 48 + (idx % 12) : (state === "EMERGING" ? 18 + (idx % 6) : undefined);
      const emergenceTime = emergenceHoursAgo
        ? new Date(Date.now() - emergenceHoursAgo * 3600 * 1000).toISOString()
        : undefined;

      cells.push({
        cellId,
        row: r,
        col: c,
        state,
        seededAt: new Date(baseTime).toISOString(),
        emergenceTime,
        growthChangePct: growthChange,
        currentObservation: {
          timestamp: new Date().toISOString(),
          state,
          greenAreaMm2: greenArea,
          exgScore: exg,
          confidence: conf,
          imageUrl: `/images/cells/${cellId.toLowerCase()}.jpg`,
          environmentalContext: {
            temperature: 25.4,
            humidity: 78.2,
            moistureIndex: 71,
            dewPoint: 21.3,
            ventState: "MICRO VENT",
            fanState: "OFF",
            pumpState: "OFF",
          },
        },
        history: [
          {
            timestamp: new Date(baseTime).toISOString(),
            state: "SEEDED",
            greenAreaMm2: 0,
            exgScore: 0.05,
            confidence: 0.99,
            environmentalContext: {
              temperature: 24.8,
              humidity: 74.0,
              moistureIndex: 75,
              dewPoint: 19.8,
              ventState: "CLOSED",
              fanState: "OFF",
              pumpState: "OFF",
            },
          },
          ...(emergenceTime ? [{
            timestamp: emergenceTime,
            state: "EMERGING" as CellState,
            greenAreaMm2: Math.round(greenArea * 0.35),
            exgScore: 0.42,
            confidence: 0.89,
            environmentalContext: {
              temperature: 26.2,
              humidity: 79.5,
              moistureIndex: 72,
              dewPoint: 22.4,
              ventState: "MICRO VENT" as const,
              fanState: "OFF" as const,
              pumpState: "OFF" as const,
            },
          }] : []),
          {
            timestamp: new Date().toISOString(),
            state,
            greenAreaMm2: greenArea,
            exgScore: exg,
            confidence: conf,
            environmentalContext: {
              temperature: 25.4,
              humidity: 78.2,
              moistureIndex: 71,
              dewPoint: 21.3,
              ventState: "MICRO VENT",
              fanState: "OFF",
              pumpState: "OFF",
            },
          },
        ],
      });
    }
  }

  return cells;
}

export function generateTimelineData(): SynchronizedTimelinePoint[] {
  const points: SynchronizedTimelinePoint[] = [];
  const startMs = Date.now() - 96 * 3600 * 1000;

  for (let hour = 0; hour <= 96; hour += 4) {
    const pointTime = new Date(startMs + hour * 3600 * 1000);
    const rad = (hour / 24) * 2 * Math.PI;

    // Realistic day/night thermal fluctuation
    const temp = +(24.2 + 2.8 * Math.sin(rad - 1.5) + (hour / 96) * 0.8).toFixed(1);
    const humidity = +(76.0 - 6.5 * Math.sin(rad - 1.5) + (hour === 60 ? 12 : 0)).toFixed(1);
    
    // Soil moisture starts high, declines slowly, recharges at irrigation event (Hour 36)
    let moisture = Math.round(76 - (hour % 36) * 0.42);
    if (hour >= 36 && hour <= 44) moisture = 78;

    // Dew point
    const a = 17.27, b = 237.7;
    const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
    const dewPoint = +((b * alpha) / (a - alpha)).toFixed(1);
    const condensationRisk = (temp - dewPoint) < 2.2;

    // Actuators
    const pumpEvent = hour === 36;
    const ventState = condensationRisk || temp > 27.5 ? "OPEN" : (temp > 25.0 ? "MICRO VENT" : "CLOSED");
    const fanState = condensationRisk ? "ON" : "OFF";

    // Phenotype growth curve (Sigmoidal germination progression)
    const germProgress = 1 / (1 + Math.exp(-0.09 * (hour - 46)));
    const germCount = Math.round(germProgress * 32);
    const greenExg = +(0.06 + germProgress * 0.72).toFixed(2);

    let keyEvent: string | undefined = undefined;
    if (hour === 0) keyEvent = "TRAY SOWN & PROFILED";
    else if (hour === 36) keyEvent = "PULSE IRRIGATION (M < 62%)";
    else if (hour === 48) keyEvent = "FIRST EMERGENCE: C17";
    else if (hour === 60) keyEvent = "VENT OPEN (CONDENSATION RISK)";
    else if (hour === 96) keyEvent = "CURRENT LIVE OBSERVATION";

    points.push({
      timestamp: pointTime.toISOString(),
      timeLabel: `Hour ${hour} (${pointTime.toLocaleDateString("en-US", { weekday: "short" })} ${pointTime.getHours()}:00)`,
      elapsedHours: hour,
      temperature: temp,
      humidity,
      moistureIndex: moisture,
      dewPoint,
      condensationRisk,
      fanState,
      ventState,
      pumpEvent,
      greenFractionExg: greenExg,
      germinatedCount: germCount,
      keyEvent,
    });
  }

  return points;
}

export const CHIGURU_MODELS: ChiguruModelVersion[] = [
  {
    versionId: "v0_baseline",
    name: "Chiguru Baseline ExG + Grid",
    architecture: "Classical Agronomic Color Index (ExG = 2G - R - B) + Calibrated 5x8 Matrix",
    trainingDatasetVersion: "Zero-Shot Deterministic Geometry",
    trainingDate: "2026-09-15",
    verifiedLabelsCount: 0,
    validationMetrics: {
      precision: 0.89,
      recall: 0.86,
      f1Score: 0.87,
      iou: 0.76,
    },
    status: "ACTIVE",
    notes: "Production baseline. Fast, 100% offline edge execution, zero GPU requirement.",
  },
  {
    versionId: "v1_transfer",
    name: "Chiguru MobileNetV3-UNet",
    architecture: "Transfer Learning on MobileNetV3-Large Encoder with Light Weight Segmentation Head",
    trainingDatasetVersion: "CHIGURU DATASET v0.8 (Pretrained Seedling)",
    trainingDate: "2026-10-02",
    verifiedLabelsCount: 140,
    validationMetrics: {
      precision: 0.94,
      recall: 0.91,
      f1Score: 0.92,
      iou: 0.84,
    },
    status: "TEST",
    notes: "Candidate model undergoing shadow testing against classical ExG pipeline.",
  },
  {
    versionId: "v2_verified_active",
    name: "Chiguru Multi-Modal Phenotype Net",
    architecture: "Dual-Stream Vision + Environmental Context Bi-LSTM",
    trainingDatasetVersion: "Awaiting 500+ Verified Observations",
    trainingDate: "Scheduled Post-Trial",
    verifiedLabelsCount: 0,
    validationMetrics: {
      precision: 0,
      recall: 0,
      f1Score: 0,
      iou: 0,
    },
    status: "ARCHIVED",
    notes: "Will be trained strictly from researcher-verified observations once dataset target is met.",
  },
];

export function getVerifiedExamples(): VerifiedTrainingExample[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("chiguru_verified_dataset");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }
  return [
    {
      id: "VE-001",
      cellId: "C17",
      sessionId: "SES-2026-TRAY-01",
      plant: "Tomato (Solanum lycopersicum)",
      timestamp: "2026-10-06T14:22:00Z",
      modelPrediction: "GROWING",
      modelConfidence: 0.98,
      humanVerifiedLabel: "YES",
      sensorContextSummary: "25.4°C / 78% RH / 71% Moisture / Micro-vent",
      imageUrl: "/images/cells/c17.jpg",
      datasetVersion: "CHIGURU DATASET v1.0",
    },
    {
      id: "VE-002",
      cellId: "C19",
      sessionId: "SES-2026-TRAY-01",
      plant: "Tomato (Solanum lycopersicum)",
      timestamp: "2026-10-06T14:23:15Z",
      modelPrediction: "REVIEW",
      modelConfidence: 0.58,
      humanVerifiedLabel: "YES",
      sensorContextSummary: "25.4°C / 78% RH / 71% Moisture / Micro-vent",
      imageUrl: "/images/cells/c19.jpg",
      datasetVersion: "CHIGURU DATASET v1.0",
    },
  ];
}

export function saveVerifiedExample(example: VerifiedTrainingExample): void {
  if (typeof window === "undefined") return;
  const current = getVerifiedExamples();
  const existingIdx = current.findIndex((e) => e.cellId === example.cellId && e.sessionId === example.sessionId);
  if (existingIdx >= 0) {
    current[existingIdx] = example;
  } else {
    current.unshift(example);
  }
  localStorage.setItem("chiguru_verified_dataset", JSON.stringify(current));
}
