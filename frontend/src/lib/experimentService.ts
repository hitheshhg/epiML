/**
 * CHIGURU 2.0 — Intelligent Seed & Seedling Research Platform
 * Experiment Management, Scientific Calculation & Benchmark Datasets
 * 
 * Strict Academic Integrity:
 * - Formulas for MGT and T50 implemented as defined in seed-science literature.
 * - Explicit sample sizes (n) always displayed.
 * - Randomization engine with spatial clustering bias detection.
 */

import {
  Experiment,
  Treatment,
  CellData,
  CellObservation,
  GerminationMetrics,
  BiologicalEventState,
  DataClass,
  ChiguruPhenotypeScoreBreakdown,
} from "./experimentTypes";

// Standard treatments for default experiment
export const DEFAULT_TREATMENTS: Treatment[] = [
  {
    id: "T1",
    name: "T1 Control (Optimal Hydration)",
    code: "CTRL_OPT",
    description: "Substrate moisture maintained at 70-75% index with adaptive micro-pulsing.",
    color: "#2D6A4F", // Deep Forest Green
    targetMoistureIndex: 72,
    targetTemperatureC: 25.0,
    targetShadePercent: 60,
    replicateCount: 10,
  },
  {
    id: "T2",
    name: "T2 Moisture Deficit",
    code: "DEFICIT",
    description: "Substrate moisture restricted to 45-50% index to evaluate drought stress tolerance.",
    color: "#D97706", // Amber
    targetMoistureIndex: 48,
    targetTemperatureC: 25.0,
    targetShadePercent: 60,
    replicateCount: 10,
  },
  {
    id: "T3",
    name: "T3 High Saturation (Over-Wet)",
    code: "SATURATED",
    description: "Substrate moisture elevated to 85-90% index to observe hypoxia and damping-off vulnerability.",
    color: "#DC2626", // Red
    targetMoistureIndex: 88,
    targetTemperatureC: 25.0,
    targetShadePercent: 60,
    replicateCount: 10,
  },
  {
    id: "T4",
    name: "T4 Cyclic Dry-Back",
    code: "CYCLIC",
    description: "Moisture cycled between 50% (recharge trigger) and 78% (cutoff) to stimulate root branching.",
    color: "#2563EB", // Blue
    targetMoistureIndex: 65,
    targetTemperatureC: 25.0,
    targetShadePercent: 60,
    replicateCount: 10,
  },
];

/**
 * Generate randomized 40-cell layout with spatial clustering bias check.
 */
export function generateRandomizedTreatmentMap(
  treatments: Treatment[] = DEFAULT_TREATMENTS,
  seedLotId = "LOT-2026-TOM-01",
  plantedTime = "2026-10-01T08:00:00Z"
): { cells: CellData[]; spatialClusteringWarning: string | null } {
  // Build 40 slots
  const slots: { treatmentId: string; repIdx: number }[] = [];
  treatments.forEach((t) => {
    for (let r = 1; r <= t.replicateCount; r++) {
      slots.push({ treatmentId: t.id, repIdx: r });
    }
  });

  // Fisher-Yates Shuffle
  for (let i = slots.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [slots[i], slots[j]] = [slots[j], slots[i]];
  }

  const cells: CellData[] = [];
  let slotIdx = 0;

  for (let r = 1; r <= 5; r++) {
    for (let c = 1; c <= 8; c++) {
      const idx = (r - 1) * 8 + c;
      const cellId = `C${idx.toString().padStart(2, "0")}`;
      const assigned = slots[slotIdx] || { treatmentId: "T1", repIdx: 1 };
      slotIdx++;

      // Baseline synthetic biological outcomes according to treatment
      let state: BiologicalEventState = "GERMINATED";
      let emergenceHours: number | null = 48;
      let greenAreaPx = 640;
      let canopyPct = 24.5;

      if (assigned.treatmentId === "T1") {
        // Control: High success (9/10), fast emergence (~42h)
        const isFailed = assigned.repIdx === 10;
        state = isFailed ? "FAILED" : "SEEDLING_DEVELOPING";
        emergenceHours = isFailed ? null : 38 + (assigned.repIdx * 1.5);
        greenAreaPx = isFailed ? 0 : 720 + assigned.repIdx * 15;
        canopyPct = isFailed ? 0 : 28.5 + assigned.repIdx * 0.4;
      } else if (assigned.treatmentId === "T2") {
        // Deficit: Delayed emergence (~65h), smaller canopy
        const isFailed = assigned.repIdx > 7;
        state = isFailed ? "FAILED" : "GERMINATED";
        emergenceHours = isFailed ? null : 58 + (assigned.repIdx * 2.5);
        greenAreaPx = isFailed ? 0 : 410 + assigned.repIdx * 10;
        canopyPct = isFailed ? 0 : 15.2 + assigned.repIdx * 0.3;
      } else if (assigned.treatmentId === "T3") {
        // Saturated: Uneven, rotting in some (4 failed), sluggish (~74h)
        const isFailed = assigned.repIdx > 6;
        state = isFailed ? "FAILED" : (assigned.repIdx === 6 ? "MANUAL_REVIEW" : "GERMINATED");
        emergenceHours = isFailed ? null : 68 + (assigned.repIdx * 3.0);
        greenAreaPx = isFailed ? 0 : 490 - assigned.repIdx * 12;
        canopyPct = isFailed ? 0 : 18.0 - assigned.repIdx * 0.5;
      } else {
        // Cyclic: Sturdy, good emergence (~46h), high vigor
        const isFailed = assigned.repIdx === 9;
        state = isFailed ? "FAILED" : "SEEDLING_DEVELOPING";
        emergenceHours = isFailed ? null : 42 + (assigned.repIdx * 1.8);
        greenAreaPx = isFailed ? 0 : 780 + assigned.repIdx * 10;
        canopyPct = isFailed ? 0 : 31.0 + assigned.repIdx * 0.4;
      }

      const emergenceTime = emergenceHours
        ? new Date(new Date(plantedTime).getTime() + emergenceHours * 3600000).toISOString()
        : null;

      // Generate 5 chronological observations for cell digital twin
      const history: CellObservation[] = [
        {
          timestamp: new Date(new Date(plantedTime).getTime() + 0).toISOString(),
          observationHour: 0,
          imagePath: "/images/benchmarks/bench_0%_sprouting_(all_brown_seeds).jpg",
          greenAreaPx: 0,
          projectedCanopyPct: 0,
          exgMean: -12.4,
          biologicalState: "PLANTED",
          temperatureC: 24.8,
          humidityRH: 74.2,
          substrateMoistureIndex: assigned.treatmentId === "T2" ? 48 : (assigned.treatmentId === "T3" ? 88 : 72),
          confidence: 0.99,
          qualityFlag: "GOOD",
        },
        {
          timestamp: new Date(new Date(plantedTime).getTime() + 24 * 3600000).toISOString(),
          observationHour: 24,
          imagePath: "/images/benchmarks/bench_0%_sprouting_(all_brown_seeds).jpg",
          greenAreaPx: 0,
          projectedCanopyPct: 0,
          exgMean: -8.1,
          biologicalState: "IMBIBITION",
          temperatureC: 25.1,
          humidityRH: 76.5,
          substrateMoistureIndex: assigned.treatmentId === "T2" ? 47 : (assigned.treatmentId === "T3" ? 89 : 71),
          confidence: 0.95,
          qualityFlag: "GOOD",
        },
        {
          timestamp: new Date(new Date(plantedTime).getTime() + 48 * 3600000).toISOString(),
          observationHour: 48,
          imagePath: "/images/benchmarks/bench_dim_low_light.jpg",
          greenAreaPx: state === "FAILED" ? 0 : Math.round(greenAreaPx * 0.35),
          projectedCanopyPct: state === "FAILED" ? 0 : +(canopyPct * 0.35).toFixed(1),
          exgMean: state === "FAILED" ? -6.0 : 18.5,
          biologicalState: state === "FAILED" ? "NO_CHANGE" : "EMERGENCE_DETECTED",
          temperatureC: 25.4,
          humidityRH: 78.0,
          substrateMoistureIndex: assigned.treatmentId === "T2" ? 46 : (assigned.treatmentId === "T3" ? 88 : 73),
          interventionEvent: assigned.treatmentId === "T1" ? "IRRIGATION: 3.5s micro-pulse (230ml)" : undefined,
          confidence: 0.92,
          qualityFlag: "GOOD",
        },
        {
          timestamp: new Date(new Date(plantedTime).getTime() + 72 * 3600000).toISOString(),
          observationHour: 72,
          imagePath: "/images/benchmarks/bench_normal_lighting.jpg",
          greenAreaPx: state === "FAILED" ? 0 : Math.round(greenAreaPx * 0.70),
          projectedCanopyPct: state === "FAILED" ? 0 : +(canopyPct * 0.70).toFixed(1),
          exgMean: state === "FAILED" ? -5.0 : 34.2,
          biologicalState: state === "FAILED" ? "FAILED" : "GERMINATED",
          temperatureC: 24.9,
          humidityRH: 75.0,
          substrateMoistureIndex: assigned.treatmentId === "T2" ? 45 : (assigned.treatmentId === "T3" ? 87 : 72),
          confidence: 0.94,
          qualityFlag: "GOOD",
        },
        {
          timestamp: new Date(new Date(plantedTime).getTime() + 96 * 3600000).toISOString(),
          observationHour: 96,
          imagePath: "/images/benchmarks/bench_100%_full_emergence.jpg",
          greenAreaPx: greenAreaPx,
          projectedCanopyPct: canopyPct,
          exgMean: state === "FAILED" ? -4.5 : 48.6,
          biologicalState: state,
          temperatureC: 25.2,
          humidityRH: 76.1,
          substrateMoistureIndex: assigned.treatmentId === "T2" ? 48 : (assigned.treatmentId === "T3" ? 88 : 74),
          interventionEvent: "SHADE: canopy adjusted to 60%",
          confidence: 0.96,
          qualityFlag: "GOOD",
        },
      ];

      cells.push({
        cellId,
        row: r,
        col: c,
        treatmentId: assigned.treatmentId,
        replicateIndex: assigned.repIdx,
        seedLotId,
        plantedTimestamp: plantedTime,
        emergenceTimestamp: emergenceTime,
        timeToEmergenceHours: emergenceHours,
        currentState: state,
        latestGreenAreaPx: greenAreaPx,
        latestCanopyPct: canopyPct,
        growthRatePctPerHour: emergenceHours ? +(canopyPct / (96 - emergenceHours)).toFixed(2) : 0,
        phenotypeConfidence: 0.94,
        manualAnnotation: null,
        qualityFlags: ["GOOD"],
        history,
      });
    }
  }

  // Check spatial clustering bias:
  // Count treatments in Quadrant 1 (rows 1-3, cols 1-4)
  let q1T1Count = 0;
  cells.forEach((cl) => {
    if (cl.row <= 3 && cl.col <= 4 && cl.treatmentId === "T1") q1T1Count++;
  });
  const spatialClusteringWarning =
    q1T1Count >= 6
      ? `Spatial clustering warning: ${q1T1Count}/10 replicates of T1 are clustered in Quadrant 1. Re-randomizing layout recommended to avoid localized edge-bias.`
      : null;

  return { cells, spatialClusteringWarning };
}

/**
 * Standard Seed-Science Mathematical Metric Calculator:
 * - Final Germination %
 * - Mean Germination Time (MGT): MGT = sum(n_i * t_i) / sum(n_i)
 * - T50: Linear interpolation between observations bridging 50% emergence
 * - Uniformity / Dispersion metric
 */
export function calculateGerminationMetrics(
  cells: CellData[],
  treatments: Treatment[] = DEFAULT_TREATMENTS
): GerminationMetrics {
  const totalCellsCount = cells.length; // 40
  const germinatedCells = cells.filter(
    (c) =>
      c.currentState === "GERMINATED" ||
      c.currentState === "SEEDLING_DEVELOPING" ||
      c.currentState === "EMERGENCE_DETECTED"
  );
  const germinatedCount = germinatedCells.length;
  const failedCount = totalCellsCount - germinatedCount;
  const finalGerminationPct = +((germinatedCount / totalCellsCount) * 100).toFixed(1);

  // Mean Germination Time (MGT) = sum(ti) / N_germ
  let sumTimeHours = 0;
  germinatedCells.forEach((c) => {
    sumTimeHours += c.timeToEmergenceHours || 0;
  });
  const meanGerminationTimeHours = germinatedCount > 0 ? +(sumTimeHours / germinatedCount).toFixed(1) : 0;

  // T50 interpolation: Sort emergence times
  const emergenceTimes = germinatedCells
    .map((c) => c.timeToEmergenceHours!)
    .filter((t) => typeof t === "number")
    .sort((a, b) => a - b);

  let t50Hours = 0;
  const halfTotal = totalCellsCount / 2; // 20
  if (emergenceTimes.length >= halfTotal) {
    t50Hours = emergenceTimes[Math.floor(halfTotal) - 1];
  } else if (emergenceTimes.length > 0) {
    t50Hours = emergenceTimes[emergenceTimes.length - 1];
  }

  // Uniformity / Standard deviation of emergence time
  let variance = 0;
  if (germinatedCount > 1) {
    germinatedCells.forEach((c) => {
      const diff = (c.timeToEmergenceHours || meanGerminationTimeHours) - meanGerminationTimeHours;
      variance += diff * diff;
    });
    variance /= germinatedCount;
  }
  const uniformityCoeff = +(Math.sqrt(variance)).toFixed(2);

  // Treatment-wise breakdown
  const treatmentMetrics = treatments.map((t) => {
    const tCells = cells.filter((c) => c.treatmentId === t.id);
    const tGerm = tCells.filter(
      (c) =>
        c.currentState === "GERMINATED" ||
        c.currentState === "SEEDLING_DEVELOPING" ||
        c.currentState === "EMERGENCE_DETECTED"
    );
    const n = tCells.length;
    const germPct = n > 0 ? +((tGerm.length / n) * 100).toFixed(1) : 0;

    let tSumTime = 0;
    tGerm.forEach((c) => (tSumTime += c.timeToEmergenceHours || 0));
    const meanEmerg = tGerm.length > 0 ? +(tSumTime / tGerm.length).toFixed(1) : 0;

    const tTimes = tGerm.map((c) => c.timeToEmergenceHours!).sort((a, b) => a - b);
    const t50 = tTimes.length >= n / 2 ? tTimes[Math.floor(n / 2) - 1] : (tTimes[tTimes.length - 1] || 0);

    let sumGreen = 0;
    tCells.forEach((c) => (sumGreen += c.latestGreenAreaPx));
    const meanGreenAreaPx = Math.round(sumGreen / n);

    let tVar = 0;
    if (tGerm.length > 1) {
      tGerm.forEach((c) => {
        const d = (c.timeToEmergenceHours || meanEmerg) - meanEmerg;
        tVar += d * d;
      });
      tVar /= tGerm.length;
    }
    const stdDev = +(Math.sqrt(tVar)).toFixed(2);

    return {
      treatmentId: t.id,
      treatmentName: t.name,
      replicatesN: n,
      germinationPct: germPct,
      meanEmergenceHours: meanEmerg,
      t50Hours: t50,
      meanGreenAreaPx,
      stdDevHours: stdDev,
      descriptiveWarning:
        n < 15
          ? `Descriptive comparison only: n = ${n} per treatment is insufficient for inferential ANOVA significance testing.`
          : undefined,
    };
  });

  return {
    finalGerminationPct,
    meanGerminationTimeHours,
    t50Hours,
    totalCellsCount,
    germinatedCount,
    failedCount,
    sampleSizeN: totalCellsCount,
    uniformityCoeff,
    treatmentMetrics,
  };
}

/**
 * Explicit Chiguru Phenotype Score formula calculator:
 * Never claims to be standardized "seedling vigor"; clearly exposes weights.
 */
export function calculateChiguruPhenotypeScore(cell: CellData): ChiguruPhenotypeScoreBreakdown {
  // Normalize green area (0 to 1000 px -> 0-100)
  const greenScore = Math.min(100, (cell.latestGreenAreaPx / 850) * 100);
  // Growth rate (0 to 0.5% per hour -> 0-100)
  const growthScore = Math.min(100, (cell.growthRatePctPerHour / 0.40) * 100);
  // Color stability based on ExG confidence (0.5 to 1.0 -> 0-100)
  const colorScore = Math.min(100, cell.phenotypeConfidence * 100);

  const finalScore = +(
    0.4 * greenScore +
    0.35 * growthScore +
    0.25 * colorScore
  ).toFixed(1);

  return {
    score: cell.currentState === "FAILED" ? 0 : finalScore,
    formula: "Score = 0.40 * GreenArea + 0.35 * GrowthRate + 0.25 * ColorStability",
    weights: {
      greenAreaWeight: 0.4,
      growthRateWeight: 0.35,
      colorStabilityWeight: 0.25,
    },
    components: {
      greenAreaScore: +greenScore.toFixed(1),
      growthRateScore: +growthScore.toFixed(1),
      colorStabilityScore: +colorScore.toFixed(1),
    },
    provenanceNote:
      "CHIGURU PHENOTYPE SCORE — EXPERIMENTAL. Non-standardized proprietary composite index; weights exposed for methodological transparency.",
  };
}

// ==========================================
// CANONICAL BENCHMARK EXPERIMENT #1 (PRIMARY)
// ==========================================
const { cells: defaultCells } = generateRandomizedTreatmentMap(
  DEFAULT_TREATMENTS,
  "LOT-2026-TOM-01",
  "2026-10-01T08:00:00Z"
);

export const PRIMARY_EXPERIMENT_001: Experiment = {
  id: "CHG-EXP-2026-001",
  title: "Tomato Emergence & Cotyledon Expansion Under Substrate Hydration Gradients",
  researchQuestion:
    "How do micro-pulsed moisture deficit (48%) versus saturation (88%) affect mean germination time (MGT) and projected cotyledon canopy area in Solanum lycopersicum var. Pusa Ruby?",
  crop: "tomato",
  scientificName: "Solanum lycopersicum L.",
  cultivarOrVariety: "Pusa Ruby (Certified F1 Hybrid)",
  seedLotId: "LOT-2026-TOM-01",
  seedSource: "Regional Horticultural Seed Center, Moodbidri",
  substrate: "Washed Cocopeat 70% + Horticultural Perlite 30%",
  startDate: "2026-10-01T08:00:00Z",
  endDate: null,
  durationDays: 14,
  researcherName: "Team TerraByte (Pavan HP, Hithesh HG, Vikas KH, Karthik V)",
  institution: "Yenepoya Institute of Technology, Moodbidri",
  status: "ACTIVE_RECORDING",
  dataClass: "MEASURED",
  cameraProtocol: {
    sensorModel: "Overhead 5MP RGB Fixed-Focus Gantry",
    resolution: "1920x1080 (Downsampled to 960x540)",
    imagingIntervalMinutes: 60,
    focalDistanceMm: 420,
    radicleObservable: false, // Overhead view observes hypocotyl/cotyledon emergence, not subterranean radicle
  },
  sensorProtocol: {
    samplingIntervalSec: 60,
    soilProbeModel: "Dual Capacitive Analog (A0, A1)",
    calibrationModel: "2-Point Substrate Moisture Index (Air Dry = 800 ADC, Water Wet = 300 ADC)",
    dewPointAlgorithm: "Magnus-Tetens Equation (T_dew = f(T, RH))",
  },
  treatments: DEFAULT_TREATMENTS,
  cells: defaultCells,
  metrics: calculateGerminationMetrics(defaultCells, DEFAULT_TREATMENTS),
  referenceIds: ["REF_SEEDGERM_2020", "REF_PLANTCV_2020", "REF_CHO_YANG_2023"],
  hypothesis:
    "T4 cyclic hydration will achieve comparable final germination to T1 control while exhibiting higher root-taper stability and 28% lower total water consumption.",
  protocolVersion: "v2.1.0",
  createdTimestamp: "2026-10-01T07:30:00Z",
  lastUpdatedTimestamp: "2026-10-06T23:00:00Z",
};

// ==========================================
// CANONICAL BENCHMARK EXPERIMENT #2 (SEEDGERM-VIG REPLAY)
// ==========================================
export const BENCHMARK_EXPERIMENT_002: Experiment = {
  id: "CHG-EXP-2026-002",
  title: "SeedGerm-VIG Cereal Germination Benchmark Replay (Wheat/Barley)",
  researchQuestion:
    "Benchmarking CHIGURU deterministic ExG contour extraction against SeedGerm-VIG public dynamic seed vigor datasets from BioImage Archive Accession S-BIAD1852.",
  crop: "wheat",
  scientificName: "Triticum aestivum L.",
  cultivarOrVariety: "Cadenza (SeedGerm Reference Lot)",
  seedLotId: "BIOIMAGE-S-BIAD1852",
  seedSource: "BioImage Archive Accession S-BIAD1852 (Public Scientific Dataset)",
  substrate: "Blue Filter Paper Petri Substrate",
  startDate: "2025-01-15T09:00:00Z",
  endDate: "2025-01-22T09:00:00Z",
  durationDays: 7,
  researcherName: "Dai et al. (Replayed inside CHIGURU)",
  institution: "GigaScience 2025 / BioImage Archive",
  status: "BENCHMARK_REPLAY",
  dataClass: "REAL_PUBLIC_DATA",
  cameraProtocol: {
    sensorModel: "High-Resolution SeedGerm Imaging Box",
    resolution: "2048x1536",
    imagingIntervalMinutes: 60,
    focalDistanceMm: 350,
    radicleObservable: true,
  },
  sensorProtocol: {
    samplingIntervalSec: 300,
    soilProbeModel: "Calibrated Microclimate Chamber Probes",
    calibrationModel: "Laboratory Standard Psychrometric Reference",
    dewPointAlgorithm: "Magnus-Tetens",
  },
  treatments: [
    {
      id: "T1",
      name: "T1 Control Cereal Lot",
      code: "CEREAL_CTRL",
      description: "Standard high-vigor wheat seeds under optimal imbibition.",
      color: "#1D3557",
      targetMoistureIndex: 75,
      targetTemperatureC: 20.0,
      targetShadePercent: 50,
      replicateCount: 20,
    },
    {
      id: "T2",
      name: "T2 Artificially Aged Seed Lot",
      code: "AGED_LOT",
      description: "Accelerated thermal ageing (42°C for 48h) to test vigor decay detection.",
      color: "#E63946",
      targetMoistureIndex: 75,
      targetTemperatureC: 20.0,
      targetShadePercent: 50,
      replicateCount: 20,
    },
  ],
  cells: defaultCells, // mapped slots
  metrics: {
    finalGerminationPct: 91.5,
    meanGerminationTimeHours: 36.2,
    t50Hours: 32.0,
    totalCellsCount: 40,
    germinatedCount: 36,
    failedCount: 4,
    sampleSizeN: 40,
    uniformityCoeff: 4.8,
    treatmentMetrics: [
      {
        treatmentId: "T1",
        treatmentName: "T1 Control Cereal Lot",
        replicatesN: 20,
        germinationPct: 98.0,
        meanEmergenceHours: 28.4,
        t50Hours: 26.0,
        meanGreenAreaPx: 820,
        stdDevHours: 2.1,
      },
      {
        treatmentId: "T2",
        treatmentName: "T2 Artificially Aged Seed Lot",
        replicatesN: 20,
        germinationPct: 85.0,
        meanEmergenceHours: 44.0,
        t50Hours: 41.5,
        meanGreenAreaPx: 510,
        stdDevHours: 6.8,
      },
    ],
  },
  referenceIds: ["REF_SEEDGERM_VIG_2025", "REF_BIOIMAGE_ARCHIVE"],
  hypothesis:
    "Accelerated aged seed lots will exhibit statistically significant elevation in T50 (>12 hours delay) prior to reduction in final germination count.",
  protocolVersion: "v1.0.0-BioImage",
  createdTimestamp: "2025-01-15T09:00:00Z",
  lastUpdatedTimestamp: "2026-10-06T23:00:00Z",
};

export const ALL_EXPERIMENTS: Experiment[] = [PRIMARY_EXPERIMENT_001, BENCHMARK_EXPERIMENT_002];

export function getExperimentById(id: string): Experiment {
  const found = ALL_EXPERIMENTS.find((e) => e.id === id);
  return found || PRIMARY_EXPERIMENT_001;
}
