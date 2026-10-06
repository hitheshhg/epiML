import { z } from "zod";

export const BiologicalEpochSchema = z.object({
  epochNumber: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  name: z.string(),
  daysRange: z.string(),
  tempRange: z.object({
    min: z.number(),
    optimal: z.number(),
    max: z.number(),
  }),
  humidityRange: z.object({
    min: z.number(),
    optimal: z.number(),
    max: z.number(),
  }),
  moistureTarget: z.string(),
  lightRegime: z.string(),
  ventilationSchedule: z.string(),
  deterministicActuation: z.object({
    pumpIntervalMinutes: z.number(),
    pumpDurationSeconds: z.number(),
    fanDutyCycle: z.number(),
    ventAngleDegrees: z.number(),
  }),
});

export const SeedProtocolSchema = z.object({
  id: z.string(),
  commonName: z.string(),
  scientificName: z.string(),
  family: z.string().optional(),
  germinationDays: z.string(),
  emoji: z.string(),
  description: z.string(),
  epochs: z.array(BiologicalEpochSchema).min(3).max(3),
  riskFactors: z.array(z.string()),
  referenceStandard: z.string(),
});

export type SeedProtocolType = z.infer<typeof SeedProtocolSchema>;
