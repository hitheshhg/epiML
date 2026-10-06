/**
 * Chiguru (ಚಿಗುರು) — Decision Engine (X-CPS)
 * Dedicated, pure functional agronomic rule & causal reasoning service.
 * 
 * "Plant Profile → Environmental Context → Decision → Actuator → Explanation"
 * Chiguru knows when to act — and crucially, when NOT to act.
 */

import {
  PlantProfile,
  SensorState,
  ActuatorHistory,
  DecisionResult,
  DecisionContextCheck,
  IrrigationDecisionType,
  ShadeDecisionType,
} from "./plantProfiles";

export function evaluateDecision(
  profile: PlantProfile,
  sensors: SensorState,
  history: ActuatorHistory
): DecisionResult {
  const timestamp = new Date().toISOString();
  const nowMs = Date.now();

  // Active root-zone moisture (weighted average or primary probe)
  const m1 = sensors.moisture1;
  const m2 = sensors.moisture2;
  const activeMoisture = Math.round((m1 + m2) / 2);

  // Environmental Context Checks
  const isMoistureFault = activeMoisture < 5 || activeMoisture > 98;
  const isMoistureOptimal =
    activeMoisture >= profile.environment.moisture.min &&
    activeMoisture <= profile.environment.moisture.max;
  const isMoistureLow = activeMoisture < profile.environment.moisture.min;
  const isMoistureSaturated = activeMoisture > profile.environment.moisture.max;

  const isHumidityHigh = sensors.humidity > profile.environment.humidity.max;
  const isHumidityOptimal =
    sensors.humidity >= profile.environment.humidity.min &&
    sensors.humidity <= profile.environment.humidity.max;
  const isHumidityLow = sensors.humidity < profile.environment.humidity.min;

  const isColdRisk = sensors.temperature < profile.environment.temperature.min;
  const isHeatStress = sensors.temperature > profile.environment.temperature.max;
  const isTempOptimal = !isColdRisk && !isHeatStress;

  // Anti-cycling & cooldown calculation
  const cooldownMs = profile.control.cooldownMinutes * 60 * 1000;
  const minOffMs = profile.control.minPumpOffSec * 1000;
  const timeSinceLastStop = history.lastPumpStopTime ? nowMs - history.lastPumpStopTime : Infinity;
  const cooldownActive = timeSinceLastStop < cooldownMs || timeSinceLastStop < minOffMs;

  // Recent irrigation detection (within last 12 minutes or explicit flag)
  const recentIrrigationDetected = Boolean(
    history.recentIrrigationWithinMinutes ||
    (history.lastPumpStopTime && nowMs - history.lastPumpStopTime < 12 * 60 * 1000)
  );

  // Approximate Dew Point check
  const a = 17.27, b = 237.7;
  const alpha = ((a * sensors.temperature) / (b + sensors.temperature)) + Math.log(sensors.humidity / 100);
  const dewPoint = (b * alpha) / (a - alpha);
  const dewPointCondensation = (sensors.temperature - dewPoint) < 2.0;

  const context: DecisionContextCheck = {
    moistureStatus: isMoistureFault
      ? "SENSOR_FAULT"
      : isMoistureSaturated
      ? "SATURATED"
      : isMoistureLow
      ? "DEFICIT"
      : "OPTIMAL",
    humidityStatus: isHumidityHigh ? "HIGH" : isHumidityLow ? "LOW" : "OPTIMAL",
    tempStatus: isColdRisk ? "COLD_RISK" : isHeatStress ? "HEAT_STRESS" : "OPTIMAL",
    cooldownActive,
    saturationRisk: isMoistureSaturated || activeMoisture >= 82,
    recentIrrigationDetected,
    dewPointCondensation,
  };

  // ==========================================
  // 1. IRRIGATION CONTEXTUAL REASONING ENGINE
  // ==========================================
  let irrigation: IrrigationDecisionType = "OPTIMAL_STANDBY";
  let targetPumpState = false;
  let reasonCode = "MOISTURE_ALREADY_OPTIMAL";
  let summaryBadge = "✓ NO IRRIGATION";
  let explanation = `Soil moisture (${activeMoisture}%) is inside the optimal range (${profile.environment.moisture.min}–${profile.environment.moisture.max}%) for ${profile.commonName} (${profile.stageName}).`;
  let safetyOverrideTriggered = false;

  // RULE A: Sensor Fault Check
  if (isMoistureFault) {
    irrigation = "REFUSE";
    targetPumpState = false;
    reasonCode = "SENSOR_FAULT_PROTECTION";
    summaryBadge = "⚠ SENSOR FAULT REFUSAL";
    explanation = `Soil moisture probes report anomalous values (${activeMoisture}%). Pump locked in safe-OFF state to prevent catastrophic overflow.`;
    safetyOverrideTriggered = true;
  }
  // RULE B: Saturation / Root Drowning Safeguard
  else if (isMoistureSaturated) {
    irrigation = "REFUSE";
    targetPumpState = false;
    reasonCode = "ROOT_SATURATION_RISK";
    summaryBadge = "⚠ PUMP REFUSED (SATURATED)";
    explanation = `Substrate is saturated at ${activeMoisture}% (crop ceiling: ${profile.environment.moisture.max}%). Irrigation refused to prevent root rot and anaerobic hypoxia.`;
  }
  // RULE C: INTELLIGENT REFUSAL — Moisture Low BUT High Humidity + Recent Irrigation!
  else if (isMoistureLow && recentIrrigationDetected && isHumidityHigh) {
    irrigation = "REFUSE";
    targetPumpState = false;
    reasonCode = "REFUSE_HIGH_HUMIDITY_RECENT_IRRIGATION";
    summaryBadge = "⚠ PUMP REFUSED (HIGH HUMIDITY)";
    explanation = `Moisture (${activeMoisture}%) is below target, but ambient humidity is high (${sensors.humidity}%) and root zone was irrigated recently. Irrigation refused to prevent damping-off fungal pathogen spread.`;
  }
  // RULE D: INTELLIGENT REFUSAL — Rapid Cycling / Anti-Cooldown Lock
  else if (isMoistureLow && cooldownActive && !history.isCurrentlyPumping) {
    irrigation = "REFUSE";
    targetPumpState = false;
    reasonCode = "COOLDOWN_PROTECTION";
    summaryBadge = "⚠ PUMP REFUSED (COOLDOWN)";
    const remainSec = Math.max(1, Math.round((cooldownMs - timeSinceLastStop) / 1000));
    explanation = `Moisture deficit detected (${activeMoisture}%), but safety cooldown is active (${remainSec}s remaining). Allowing water to percolate before re-triggering.`;
  }
  // RULE E: INTELLIGENT REFUSAL — Low Substrate Temperature (Cold Shock Risk)
  else if (isMoistureLow && isColdRisk) {
    irrigation = "REFUSE";
    targetPumpState = false;
    reasonCode = "COLD_SHOCK_PROTECTION";
    summaryBadge = "⚠ PUMP REFUSED (COLD SHOCK)";
    explanation = `Chamber temperature (${sensors.temperature}°C) is below minimum threshold (${profile.environment.temperature.min}°C). Pumping cold water to tender ${profile.commonName} roots risks vascular shock.`;
  }
  // RULE F: VALID IRRIGATION TRIGGER
  else if (isMoistureLow) {
    irrigation = "ACTIVATE";
    targetPumpState = true;
    reasonCode = "MOISTURE_DEFICIT_TRIGGER";
    summaryBadge = "⚡ IRRIGATION ACTIVE";
    explanation = `Soil moisture (${activeMoisture}%) dropped below threshold (${profile.environment.moisture.min}%). All safety checks satisfied; calibrated ${profile.control.minPumpOnSec}s micro-pulse requested.`;
  }
  // RULE G: OPTIMAL MOISTURE REACHED (Stop pump if currently running)
  else if (activeMoisture >= profile.environment.moisture.target) {
    irrigation = "STOP";
    targetPumpState = false;
    reasonCode = "TARGET_MOISTURE_SATISFIED";
    summaryBadge = "✓ TARGET REACHED";
    explanation = `Soil moisture (${activeMoisture}%) reached the target profile (${profile.environment.moisture.target}%). Pump turned OFF to maintain ideal aerobic root porosity.`;
  }

  // ==========================================
  // 2. SHADE / CANOPY ACTUATION REASONING
  // ==========================================
  let shade: ShadeDecisionType = "MAINTAIN";
  let targetShadePercent = profile.environment.shade.target;

  // Adaptive thermal regulation: if ambient temperature exceeds optimal, increase canopy shade
  if (isHeatStress) {
    targetShadePercent = Math.min(90, targetShadePercent + 20);
    shade = "DEPLOY";
  } else if (isColdRisk) {
    targetShadePercent = Math.max(10, targetShadePercent - 20);
    shade = "RETRACT";
  }

  // Convert shade percentage to Servo angle (0° = 0% shade / open, 90° = 100% shade / closed)
  const targetServoAngle = Math.round((targetShadePercent / 100) * 90);

  return {
    timestamp,
    crop: profile.crop,
    cropName: profile.commonName,
    stage: profile.stage,
    irrigation,
    targetPumpState,
    shade,
    targetShadePercent,
    targetServoAngle,
    reasonCode,
    summaryBadge,
    explanation,
    context,
    safetyOverrideTriggered,
  };
}
