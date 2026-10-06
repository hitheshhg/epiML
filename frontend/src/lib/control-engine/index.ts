import { BiologicalEpoch, SensorReading } from "../types";

export interface ActuatorCommand {
  pumpState: 0 | 1; // 0 = OFF, 1 = ON (Pin D13)
  pumpDurationSec: number;
  fanState: 0 | 1; // 0 = OFF, 1 = ON (Pin A5)
  ventAngle: number; // 0 to 90 degrees (Pin D5)
  reason: string;
  isSafetyOverride: boolean;
  serialPayload: string; // Formatted Arduino serial command e.g. "ACT:P1,V45,F1"
}

/**
 * Deterministic Control Engine (TS Port of C++ Firmware Safety Loop)
 * Executes hard safety rules first, then matches active biological epoch boundaries.
 */
export function evaluateDeterministicControl(
  currentEpoch: BiologicalEpoch,
  reading: SensorReading,
  lastPumpRunAgoMinutes: number = 999
): ActuatorCommand {
  // 1. HARD SAFETY OVERRIDES
  // Saturated substrate safety stop (> 88%)
  const avgMoisture = (reading.soilMoisture1 + reading.soilMoisture2) / 2;

  if (avgMoisture >= 85) {
    return {
      pumpState: 0,
      pumpDurationSec: 0,
      fanState: 1, // run fan to reduce damping-off risk
      ventAngle: 75, // open vent
      reason: "SAFETY OVERRIDE: Substrate saturation detected (>85%). Irrigation blocked to prevent Pythium damping-off.",
      isSafetyOverride: true,
      serialPayload: "ACT:P0,V75,F1",
    };
  }

  // Thermal stress override (> max threshold)
  if (reading.temperature > currentEpoch.tempRange.max) {
    return {
      pumpState: 0,
      pumpDurationSec: 0,
      fanState: 1,
      ventAngle: 90,
      reason: `SAFETY OVERRIDE: Thermal limit exceeded (${reading.temperature.toFixed(1)}°C > max ${currentEpoch.tempRange.max}°C). Maximum ventilation active.`,
      isSafetyOverride: true,
      serialPayload: "ACT:P0,V90,F1",
    };
  }

  // 2. BIOLOGICAL EPOCH CLOSED-LOOP CONTROL
  // Moisture deficit trigger
  const moistureOptimalMin = 65;
  let pump: 0 | 1 = 0;
  let pumpDuration = 0;
  let vent = currentEpoch.deterministicActuation.ventAngleDegrees;
  let fan: 0 | 1 = currentEpoch.deterministicActuation.fanDutyCycle > 0 ? 1 : 0;
  let reason = `Epoch ${currentEpoch.epochNumber} (${currentEpoch.name}) nominal conditions maintained.`;

  if (avgMoisture < moistureOptimalMin && lastPumpRunAgoMinutes >= currentEpoch.deterministicActuation.pumpIntervalMinutes) {
    pump = 1;
    pumpDuration = currentEpoch.deterministicActuation.pumpDurationSeconds;
    reason = `Moisture index (${avgMoisture.toFixed(0)}%) below target. Triggering deterministic pulse irrigation (${pumpDuration}s).`;
  } else if (reading.humidity > currentEpoch.humidityRange.max) {
    vent = Math.min(90, vent + 30);
    fan = 1;
    reason = `High relative humidity (${reading.humidity.toFixed(1)}%). Incrementing vent opening to ${vent}° and engaging fan.`;
  }

  return {
    pumpState: pump,
    pumpDurationSec: pumpDuration,
    fanState: fan,
    ventAngle: vent,
    reason,
    isSafetyOverride: false,
    serialPayload: `ACT:P${pump},V${vent},F${fan}`,
  };
}
