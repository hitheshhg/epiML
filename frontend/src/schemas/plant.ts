import { z } from "zod";

/**
 * Zod Schema for Dynamic Plant Identification and Biological Guidance
 * Validates Gemini and Local Knowledge Base responses
 */
export const PlantProfileSchema = z.object({
  commonName: z.string().min(1),
  scientificName: z.string().min(1),
  scientificNameConfidence: z.number().min(0).max(1),
  growthStage: z.string().default("germination"),
  germinationWindow: z.object({
    minDays: z.number(),
    typicalDays: z.number(),
    maxDays: z.number(),
  }),
  temperatureGuidance: z.object({
    min: z.number(),
    optimal: z.number(),
    max: z.number(),
    unit: z.literal("C").default("C"),
  }),
  humidityGuidance: z.object({
    min: z.number(),
    optimal: z.number(),
    max: z.number(),
    unit: z.literal("%").default("%"),
  }),
  moistureGuidance: z.object({
    monitoringTarget: z.string(), // descriptive guidance e.g. "65-75% index"
    minIndex: z.number(),
    optimalIndex: z.number(),
    maxIndex: z.number(),
  }),
  lightGuidance: z.object({
    regime: z.string(), // e.g., "Darkness preferred for initial radicle emergence, diffuse light post-emergence"
    photoperiodHours: z.number().optional(),
    canopyShadeTarget: z.number().default(50), // %
  }),
  monitoringNotes: z.string(),
  evidenceLevel: z.enum([
    "LITERATURE",
    "PUBLIC DATA",
    "RESEARCHER DEFINED",
    "AI ASSISTED",
    "UNVERIFIED",
  ]),
  referenceSuggestions: z.array(z.string()).default([]),
  limitations: z.string(),
  gbifTaxonKey: z.number().nullable().optional(),
  gbifMatchConfidence: z.string().optional(),
  sourceCategory: z.enum([
    "LITERATURE",
    "PUBLIC DATA",
    "RESEARCHER DEFINED",
    "AI ASSISTED",
    "UNVERIFIED",
  ]).default("AI ASSISTED"),
  retrievalTimestamp: z.string().default(() => new Date().toISOString()),
});

export type ValidatedPlantProfile = z.infer<typeof PlantProfileSchema>;
