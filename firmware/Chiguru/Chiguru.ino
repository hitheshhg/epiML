/*
 * ==============================================================================
 * epiML / Chiguru (ಚಿಗುರು) — Autonomous Agricultural Precision Firmware
 * Framework: epiML v2.0 Closed-Loop Microclimate & Phenotyping Engine
 * Platform: Arduino Uno (ATmega328P @ 16 MHz, 100% Pin Allocation)
 * Team: TerraByte
 * 
 * REAL-TIME ANALYSIS ENGINE:
 * 1. AQI (Air Quality Index from MQ-135): Gas PPM, microclimate AQI (0-500), hazard categories.
 * 2. Temperature: Multi-zone thermal monitoring (Storage & Germination), thermal stress bands.
 * 3. Humidity & VPD: Relative humidity (RH%), Magnus-Tetens dew point, Vapor Pressure Deficit (kPa).
 * 4. Soil Moisture: Multi-probe capacitive/resistive volumetric index (0-100%), saturation kinetics,
 *    root-rot overwater prevention, and deterministic actuation refusal rules.
 * 
 * HARDWARE PIN MAPPING:
 *   D2:  DHT22 / DHT11 #1 (Storage Zone)
 *   D3:  DHT22 / DHT11 #2 (Germination / Tray Zone)
 *   D4:  LCD RS
 *   D5:  Servo #1 Vent Louvre (PWM)
 *   D6:  Servo #2 Shading Cover (PWM)
 *   D7:  LCD EN
 *   D8:  LCD D4
 *   D9:  LCD D5
 *   D10: Hardware Mode Button -> GND (INPUT_PULLUP)
 *   D11: LCD D6
 *   D12: LCD D7
 *   D13: Relay IN (Irrigation Submersible Pump, Active-LOW)
 *   A0:  Soil Moisture Probe #1 (Analog)
 *   A1:  Soil Moisture Probe #2 (Analog)
 *   A2:  MQ-135 Air Quality / Gas Sensor (Analog)
 *   A3:  Active Acoustic Buzzer
 *   A4:  Status Indicator LED
 *   A5:  DC Aeration & Heat-Alleviation Fan (via 2N2222 NPN Transistor)
 * ==============================================================================
 */

#include <DHT.h>
#include <LiquidCrystal.h>
#include <Servo.h>
#include <math.h>

// ==============================================================================
// 1. PIN ASSIGNMENTS (STRICT FROZEN PINOUT)
// ==============================================================================
#define PIN_DHT1      2    // Storage ambient DHT
#define PIN_DHT2      3    // Germination nursery tray DHT
#define PIN_LCD_RS    4    // LCD RS
#define PIN_SERVO_VENT 5   // Servo #1 Vent louvre (0-90 deg)
#define PIN_SERVO_COV  6   // Servo #2 Canopy shade cover (0-90 deg)
#define PIN_LCD_EN    7    // LCD Enable
#define PIN_LCD_D4    8    // LCD D4
#define PIN_LCD_D5    9    // LCD D5
#define PIN_BTN_MODE  10   // Pushbutton (Cycle modes 0->1->2)
#define PIN_LCD_D6    11   // LCD D6
#define PIN_LCD_D7    12   // LCD D7
#define PIN_RELAY_PUMP 13  // Water pump relay (Active-LOW verified)

#define PIN_SOIL_1    A0   // Soil moisture probe #1
#define PIN_SOIL_2    A1   // Soil moisture probe #2
#define PIN_MQ135     A2   // MQ-135 Gas sensor
#define PIN_BUZZER    A3   // Active acoustic annunciator
#define PIN_LED_STAT  A4   // Diagnostic indicator LED
#define PIN_FAN_AER   A5   // DC Aeration fan via 2N2222 transistor

// Default DHT sensor type: DHT22 (White module) or DHT11 (Blue module)
// Can be changed dynamically via serial command "DHT:11" or "DHT:22"
#define DEFAULT_DHT_TYPE DHT22

DHT dht1(PIN_DHT1, DEFAULT_DHT_TYPE);
DHT dht2(PIN_DHT2, DEFAULT_DHT_TYPE);
LiquidCrystal lcd(PIN_LCD_RS, PIN_LCD_EN, PIN_LCD_D4, PIN_LCD_D5, PIN_LCD_D6, PIN_LCD_D7);
Servo servoVent;
Servo servoCover;

// ==============================================================================
// 2. CALIBRATION CONSTANTS & BIOLOGICAL THRESHOLDS
// ==============================================================================
// Soil Moisture Calibration ADC (Dry Air vs Saturated Substrate)
int M1_DRY = 820, M1_WET = 290;
int M2_DRY = 820, M2_WET = 290;
const int SOIL_FAULT_MIN = 35;
const int SOIL_FAULT_MAX = 1010;

// MQ-135 Baseline (Auto-calibrated clean air baseline)
int GAS_BASE = 115;

// Temperature Thresholds (Celsius)
float FAN_TRIGGER_TEMP = 28.0;   // Digital fan turns ON when T_eff >= 28.0°C
float FAN_HYSTERESIS   = 0.8;    // Digital fan turns OFF when T_eff < 27.2°C
float STORAGE_TEMP_ALERT = 30.0;
float STORAGE_HUMID_ALERT = 65.0;
float STORAGE_FAN_HUMID = 60.0;
float GERM_VENT_TEMP   = 30.0;
float FIELD_FAN_TEMP   = 28.0;

// Soil Irrigation Control Setpoints (%)
int MOIST_PUMP_ON  = 35;         // Pump activates when soil moisture < 35%
int MOIST_PUMP_OFF = 65;         // Pump deactivates when soil moisture >= 65%

// Safety Timing Intervals (Milliseconds)
const unsigned long MAX_PUMP_RUN_MS    = 60000UL;  // 60s max continuous run trip
const unsigned long PUMP_COOLDOWN_MS   = 30000UL;  // 30s forced thermal cooldown
const unsigned long BUZZER_TIMEOUT_MS  = 10000UL;  // 10s auto-silence
const unsigned long OVERWATER_LIMIT_MS = 60000UL;  // 60s saturation root-rot warning
const unsigned long DEBOUNCE_DELAY_MS  = 50UL;

// Active Configuration & Overrides
bool RELAY_ACTIVE_LOW    = true;
bool manual_pump_override = false;
bool manual_vent_override = false;
bool manual_fan_override  = false;
char active_crop_name[12] = "TOMATO";

// ==============================================================================
// 3. REAL-TIME TELEMETRY & ANALYTICAL METRICS
// ==============================================================================
uint8_t mode = 1; // 0: STORAGE, 1: GERMINATION (default), 2: FIELD

// Raw & Calibrated Sensor Telemetry
float T1 = 0.0, H1 = 0.0;
float T2 = 0.0, H2 = 0.0;
int M1_raw = 0, M2_raw = 0;
int M1_idx = 0, M2_idx = 0;
int gas_raw = 0;

// Sensor Health Status
bool dht1_ok = false, dht2_ok = false;
bool m1_ok = false, m2_ok = false;
bool mq_ok = false;

// Real-Time Analytical Computations
int   calc_gas_ppm    = 38;      // Estimated gas concentration (PPM)
int   calc_aqi        = 42;      // Microclimate Air Quality Index (0-500)
char  calc_aqi_cat[10] = "GOOD"; // CLEAN, GOOD, STAGNANT, POOR, HAZARD
float calc_t_eff      = 24.5;    // Effective canopy temperature (°C)
float calc_h_eff      = 75.0;    // Effective canopy relative humidity (%)
float calc_vpd_kpa    = 0.85;    // Vapor Pressure Deficit (kPa)
float calc_dew_point  = 19.8;    // Dew point temperature (°C)
float calc_dew_margin = 4.7;     // Margin above dew point (°C)
int   calc_soil_avg   = 70;      // Mean soil moisture index (%)
char  calc_soil_cat[10] = "OPTIMAL"; // DRY, OPTIMAL, MOIST, SATURATED

// Actuator States
bool pump_state  = false;
bool fan_state   = false;
bool alert_state = false;
int vent_angle   = 0;
int cover_angle  = 0;

// Explainable Decision Reason String (Printed on LCD Line 2)
char reason_str[17] = "SYS: OPTIMAL";

// Non-blocking Timing Keepers
unsigned long last_sensor_time    = 0;
unsigned long last_telemetry_time = 0;
unsigned long last_lcd_time       = 0;
unsigned long pump_start_time     = 0;
unsigned long pump_stop_time      = 0;
unsigned long alert_start_time    = 0;
unsigned long saturated_start_time = 0;
bool buzzer_silenced              = false;
bool is_overwatered               = false;

// Button Debounce State
int last_btn_state = HIGH;
unsigned long last_debounce_time = 0;

// ==============================================================================
// 4. EMBEDDED ACTUATOR CONTROLLERS
// ==============================================================================

void setPump(bool state, bool forceManual = false) {
  if (state && !pump_state) {
    if (!forceManual && millis() - pump_stop_time < PUMP_COOLDOWN_MS && pump_stop_time != 0) {
      return; // Cooldown enforced
    }
    pump_start_time = millis();
    pump_state = true;
  } else if (!state && pump_state) {
    pump_stop_time = millis();
    pump_state = false;
  }

  if (RELAY_ACTIVE_LOW) {
    digitalWrite(PIN_RELAY_PUMP, pump_state ? LOW : HIGH);
  } else {
    digitalWrite(PIN_RELAY_PUMP, pump_state ? HIGH : LOW);
  }
}

void setFan(bool state) {
  if (fan_state != state) {
    fan_state = state;
    digitalWrite(PIN_FAN_AER, fan_state ? HIGH : LOW);
  } else {
    digitalWrite(PIN_FAN_AER, fan_state ? HIGH : LOW);
  }
}

void updateVent(int targetAngle) {
  targetAngle = constrain(targetAngle, 0, 90);
  if (targetAngle != vent_angle) {
    vent_angle = targetAngle;
    servoVent.attach(PIN_SERVO_VENT);
    servoVent.write(vent_angle);
    delay(350);
    servoVent.detach(); // Detach to save power and eliminate jitter
  }
}

void updateCover(int targetAngle) {
  targetAngle = constrain(targetAngle, 0, 90);
  if (targetAngle != cover_angle) {
    cover_angle = targetAngle;
    servoCover.attach(PIN_SERVO_COV);
    servoCover.write(cover_angle);
    delay(350);
    servoCover.detach();
  }
}

void soundBeeps(int count, int durationMs) {
  for (int i = 0; i < count; i++) {
    digitalWrite(PIN_BUZZER, HIGH);
    delay(durationMs);
    digitalWrite(PIN_BUZZER, LOW);
    if (i < count - 1) delay(durationMs);
  }
}

// Convert raw ADC reading to 0-100% soil moisture
int rawToPercent(int raw, int dry, int wet, bool &valid) {
  if (raw < SOIL_FAULT_MIN || raw > SOIL_FAULT_MAX) {
    valid = false;
    return 0;
  }
  valid = true;
  if (dry == wet) return 0;
  long val = (long)(raw - dry) * 100 / (wet - dry);
  return constrain((int)val, 0, 100);
}

// ==============================================================================
// 5. REAL-TIME SCIENTIFIC COMPUTATION ENGINES (AQI, TEMP, HUMID, SOIL)
// ==============================================================================

// Compute Dew Point temperature using the Magnus-Tetens approximation
float computeDewPoint(float temp, float hum) {
  if (hum <= 0.0) hum = 1.0;
  if (hum > 100.0) hum = 100.0;
  float a = 17.27, b = 237.7;
  float alpha = ((a * temp) / (b + temp)) + log(hum / 100.0);
  return (b * alpha) / (a - alpha);
}

// Compute Vapor Pressure Deficit (VPD in kPa) — Key agronomy plant vigor metric
float computeVPD(float temp, float hum) {
  if (hum <= 0.0) hum = 1.0;
  if (hum > 100.0) hum = 100.0;
  // Saturated vapor pressure (Tetens formulation)
  float vp_sat = 0.61078 * exp((17.27 * temp) / (temp + 237.3));
  // Actual vapor pressure
  float vp_act = vp_sat * (hum / 100.0);
  float vpd = vp_sat - vp_act;
  return max(0.0, vpd);
}

// Real-Time AQI & Gas Analysis from MQ-135
void analyzeAirQuality() {
  if (!mq_ok) {
    calc_gas_ppm = 35;
    calc_aqi = 40;
    strncpy(calc_aqi_cat, "GOOD", sizeof(calc_aqi_cat));
    return;
  }

  // Ratio relative to clean air baseline
  float ratio = (float)gas_raw / (float)max(25, GAS_BASE);
  calc_gas_ppm = constrain((int)(ratio * 38.0), 10, 1000);

  // Agricultural Microclimate AQI Curve (0-500 scale)
  float aqi_val = 32.0 * ratio;
  if (ratio > 1.4) {
    aqi_val = 75.0 + (ratio - 1.4) * 85.0;
  }
  calc_aqi = constrain((int)aqi_val, 10, 500);

  if (calc_aqi <= 50) {
    strncpy(calc_aqi_cat, "CLEAN", sizeof(calc_aqi_cat));
  } else if (calc_aqi <= 100) {
    strncpy(calc_aqi_cat, "GOOD", sizeof(calc_aqi_cat));
  } else if (calc_aqi <= 150) {
    strncpy(calc_aqi_cat, "STAGNANT", sizeof(calc_aqi_cat));
  } else if (calc_aqi <= 200) {
    strncpy(calc_aqi_cat, "POOR", sizeof(calc_aqi_cat));
  } else {
    strncpy(calc_aqi_cat, "HAZARD", sizeof(calc_aqi_cat));
  }
}

// Real-Time Soil Moisture Analysis
void analyzeSoilMoisture() {
  if (m1_ok && m2_ok) {
    calc_soil_avg = (M1_idx + M2_idx) / 2;
  } else if (m1_ok) {
    calc_soil_avg = M1_idx;
  } else if (m2_ok) {
    calc_soil_avg = M2_idx;
  } else {
    calc_soil_avg = 0;
  }

  if (calc_soil_avg < MOIST_PUMP_ON) {
    strncpy(calc_soil_cat, "DRY/WILT", sizeof(calc_soil_cat));
  } else if (calc_soil_avg <= MOIST_PUMP_OFF) {
    strncpy(calc_soil_cat, "OPTIMAL", sizeof(calc_soil_cat));
  } else if (calc_soil_avg < 85) {
    strncpy(calc_soil_cat, "MOIST", sizeof(calc_soil_cat));
  } else {
    strncpy(calc_soil_cat, "SATURATED", sizeof(calc_soil_cat));
  }
}

// Real-Time Temperature, Humidity & Microclimate VPD Analysis
void analyzeAtmosphere() {
  if (dht2_ok && dht1_ok) {
    calc_t_eff = (mode == 0) ? T1 : T2;
    calc_h_eff = (mode == 0) ? H1 : H2;
  } else if (dht2_ok) {
    calc_t_eff = T2;
    calc_h_eff = H2;
  } else if (dht1_ok) {
    calc_t_eff = T1;
    calc_h_eff = H1;
  } else {
    calc_t_eff = 24.5;
    calc_h_eff = 75.0;
  }

  calc_dew_point  = computeDewPoint(calc_t_eff, calc_h_eff);
  calc_dew_margin = calc_t_eff - calc_dew_point;
  calc_vpd_kpa    = computeVPD(calc_t_eff, calc_h_eff);
}

// Check if high temperature condition is active with hysteresis
bool isTemperatureHigh() {
  if (!dht1_ok && !dht2_ok) return false;
  float currT = calc_t_eff;

  if (!fan_state) {
    return (currT >= FAN_TRIGGER_TEMP);
  } else {
    return (currT > (FAN_TRIGGER_TEMP - FAN_HYSTERESIS));
  }
}

// ==============================================================================
// 6. SENSOR ACQUISITION & VALIDATION LOOP
// ==============================================================================
void readAndValidateSensors() {
  // Read Storage DHT
  float t1 = dht1.readTemperature();
  float h1 = dht1.readHumidity();
  if (!isnan(t1) && !isnan(h1)) {
    T1 = t1;
    H1 = h1;
    dht1_ok = true;
  } else {
    dht1_ok = false;
  }

  // Read Germination DHT
  float t2 = dht2.readTemperature();
  float h2 = dht2.readHumidity();
  if (!isnan(t2) && !isnan(h2)) {
    T2 = t2;
    H2 = h2;
    dht2_ok = true;
  } else {
    dht2_ok = false;
  }

  // Read Soil Probes
  M1_raw = analogRead(PIN_SOIL_1);
  M2_raw = analogRead(PIN_SOIL_2);
  M1_idx = rawToPercent(M1_raw, M1_DRY, M1_WET, m1_ok);
  M2_idx = rawToPercent(M2_raw, M2_DRY, M2_WET, m2_ok);

  // Read MQ-135 Gas Sensor
  gas_raw = analogRead(PIN_MQ135);
  mq_ok = (gas_raw > 20);

  // Dynamic baseline calibration during first 20 samples
  static int base_samples = 0;
  static long base_sum = 0;
  if (base_samples < 20) {
    base_sum += gas_raw;
    base_samples++;
    if (base_samples == 20) {
      GAS_BASE = base_sum / 20;
    }
  }

  // Run Real-Time Analysis Engines
  analyzeAtmosphere();
  analyzeAirQuality();
  analyzeSoilMoisture();

  // Root-Rot Overwatering Detection: If soil > 85% continuously for > 60s
  if ((m1_ok && M1_idx > 85) || (m2_ok && M2_idx > 85)) {
    if (saturated_start_time == 0) saturated_start_time = millis();
    else if (millis() - saturated_start_time > OVERWATER_LIMIT_MS) {
      is_overwatered = true;
    }
  } else {
    saturated_start_time = 0;
    is_overwatered = false;
  }
}

// ==============================================================================
// 7. DETERMINISTIC CLOSED-LOOP DECISION ENGINE (X-CPS)
// ==============================================================================

void evaluateStorage() {
  if (!manual_pump_override) setPump(false);
  if (!manual_vent_override) updateVent(0);

  bool temp_alert  = (dht1_ok && T1 > STORAGE_TEMP_ALERT);
  bool humid_alert = (dht1_ok && H1 > STORAGE_HUMID_ALERT);
  bool gas_alert   = (calc_aqi > 150);
  bool dew_alert   = (calc_dew_margin < 2.0);

  if (temp_alert || humid_alert || gas_alert || dew_alert) {
    if (!alert_state) {
      alert_state = true;
      alert_start_time = millis();
      buzzer_silenced = false;
    }
    if (dew_alert) {
      snprintf(reason_str, sizeof(reason_str), "DEW SWEATING");
    } else if (gas_alert) {
      snprintf(reason_str, sizeof(reason_str), "AQI SPIKE: %d", calc_aqi);
    } else if (humid_alert) {
      snprintf(reason_str, sizeof(reason_str), "HUMID HIGH: %d%%", (int)H1);
    } else {
      snprintf(reason_str, sizeof(reason_str), "TEMP HIGH: %dC", (int)T1);
    }
  } else {
    alert_state = false;
    if (dht1_ok && H1 > STORAGE_FAN_HUMID) {
      snprintf(reason_str, sizeof(reason_str), "FAN ON: HUM>60%%");
    } else if (isTemperatureHigh()) {
      snprintf(reason_str, sizeof(reason_str), "FAN ON: HIGH TEMP");
    } else {
      snprintf(reason_str, sizeof(reason_str), "AQI:%d · SEED OK", calc_aqi);
    }
  }

  // Aeration Fan digital control
  if (!manual_fan_override) {
    bool highTemp  = isTemperatureHigh();
    bool highHumid = (dht1_ok && H1 > STORAGE_FAN_HUMID);
    bool highAqi   = (calc_aqi > 120);
    setFan(highTemp || highHumid || highAqi);
  }
}

void evaluateGermination() {
  // Aeration Fan: Turn ON when temperature is high or AQI is elevated
  if (!manual_fan_override) {
    if (isTemperatureHigh()) {
      setFan(true);
      if (!pump_state && !alert_state) {
        snprintf(reason_str, sizeof(reason_str), "FAN ON: T>%dC", (int)FAN_TRIGGER_TEMP);
      }
    } else if (calc_aqi > 130) {
      setFan(true);
      if (!pump_state && !alert_state) {
        snprintf(reason_str, sizeof(reason_str), "FAN ON: AQI %d", calc_aqi);
      }
    } else {
      setFan(false);
    }
  }

  alert_state = false;

  // 1. Critical Sensor Fault Check
  if (!m1_ok && !m2_ok) {
    if (!manual_pump_override) setPump(false);
    alert_state = true;
    snprintf(reason_str, sizeof(reason_str), "SENSOR FAULT");
    return;
  }

  // 2. Overwatering Root-Rot Alert & Lockout
  if (is_overwatered) {
    if (!manual_pump_override) setPump(false);
    snprintf(reason_str, sizeof(reason_str), "OVERWATER: NO PUMP");
    return;
  }

  // 3. Irrigation Automation with Deterministic Refusals
  if (!manual_pump_override) {
    if (calc_soil_avg < MOIST_PUMP_ON) {
      if (millis() - pump_stop_time < PUMP_COOLDOWN_MS && pump_stop_time != 0 && !pump_state) {
        snprintf(reason_str, sizeof(reason_str), "REFUSE: COOLDOWN");
      } else {
        setPump(true);
        snprintf(reason_str, sizeof(reason_str), "PUMP ON: S<%d%%", MOIST_PUMP_ON);
      }
    } else if (calc_soil_avg >= MOIST_PUMP_OFF) {
      setPump(false);
      snprintf(reason_str, sizeof(reason_str), fan_state ? "FAN ON: T HIGH" : "SOIL OPTIMAL");
    } else {
      if (!pump_state) {
        snprintf(reason_str, sizeof(reason_str), fan_state ? "FAN ON: T HIGH" : "VPD:%1.2f S:%d%%", calc_vpd_kpa, calc_soil_avg);
      }
    }

    // 4. Max continuous pump run safety cutoff
    if (pump_state && (millis() - pump_start_time > MAX_PUMP_RUN_MS)) {
      setPump(false);
      alert_state = true;
      snprintf(reason_str, sizeof(reason_str), "SAFETY TRIP: 60S");
    }
  }

  // 5. Vent Proportional Control with "Know When Not To Act"
  if (!manual_vent_override) {
    if (dht2_ok && T2 > GERM_VENT_TEMP) {
      // If outside air is more humid than chamber, opening vent introduces dampness
      if (dht1_ok && H1 > (H2 + 6.0) && H1 > 75.0) {
        updateVent(0);
        snprintf(reason_str, sizeof(reason_str), "VENT REFUSED: DAMP");
      } else {
        float excess = T2 - GERM_VENT_TEMP;
        int targetAngle = constrain((int)(excess * 15.0), 0, 90);
        updateVent(targetAngle);
        if (!pump_state && !alert_state) {
          snprintf(reason_str, sizeof(reason_str), fan_state ? "FAN+VENT: HIGH T" : "VENT ON T>%dC", (int)GERM_VENT_TEMP);
        }
      }
    } else if (calc_aqi > 140) {
      // Vent purge on stagnant chamber air
      updateVent(45);
    } else {
      updateVent(0);
    }
  }
}

void evaluateField() {
  alert_state = false;

  // Sensor Cross-Validation: Check probe skew
  if (m1_ok && m2_ok && abs(M1_idx - M2_idx) > 50) {
    snprintf(reason_str, sizeof(reason_str), "PROBE SKEW > 50%%");
  }

  if (!m1_ok && !m2_ok) {
    setPump(false);
    alert_state = true;
    snprintf(reason_str, sizeof(reason_str), "SENSOR FAULT");
    return;
  }

  bool needWater = (calc_soil_avg < MOIST_PUMP_ON);
  if (calc_soil_avg >= MOIST_PUMP_OFF) needWater = false;

  if (needWater) {
    if (millis() - pump_stop_time < PUMP_COOLDOWN_MS && pump_stop_time != 0 && !pump_state) {
      snprintf(reason_str, sizeof(reason_str), "REFUSE: COOLDOWN");
    } else {
      setPump(true);
      snprintf(reason_str, sizeof(reason_str), "PUMP ON: FIELD DRY");
    }
  } else {
    setPump(false);
    snprintf(reason_str, sizeof(reason_str), fan_state ? "FAN ON: T HIGH" : "FIELD: MOIST OK");
  }

  if (pump_state && (millis() - pump_start_time > MAX_PUMP_RUN_MS)) {
    setPump(false);
    alert_state = true;
    snprintf(reason_str, sizeof(reason_str), "SAFETY TRIP: 60S");
  }

  // Canopy Heat-Stress Alleviation Fan
  if (!manual_fan_override) {
    if (isTemperatureHigh()) {
      setFan(true);
      if (!pump_state) snprintf(reason_str, sizeof(reason_str), "FAN ON: HEAT STRESS");
    } else {
      setFan(false);
    }
  }

  updateVent(0);
}

// ==============================================================================
// 8. ACOUSTIC & VISUAL ALERT HANDLER
// ==============================================================================
void handleAlerts() {
  if (alert_state) {
    digitalWrite(PIN_LED_STAT, HIGH);
    if (!buzzer_silenced) {
      if (millis() - alert_start_time > BUZZER_TIMEOUT_MS) {
        buzzer_silenced = true;
        digitalWrite(PIN_BUZZER, LOW);
      } else {
        // 250ms pulsed chime
        digitalWrite(PIN_BUZZER, ((millis() / 250) % 2 == 0) ? HIGH : LOW);
      }
    } else {
      digitalWrite(PIN_BUZZER, LOW);
    }
  } else {
    digitalWrite(PIN_LED_STAT, LOW);
    buzzer_silenced = false;

    // Bench Test Moisture Indicator Chirp:
    // When either probe detects high moisture (>= 50%), chirp every 1 second
    static unsigned long last_wet_beep = 0;
    if ((m1_ok && M1_idx >= 50) || (m2_ok && M2_idx >= 50)) {
      if (millis() - last_wet_beep >= 1000) {
        last_wet_beep = millis();
        digitalWrite(PIN_BUZZER, HIGH);
        delay(110);
        digitalWrite(PIN_BUZZER, LOW);
      }
    } else {
      digitalWrite(PIN_BUZZER, LOW);
    }
  }
}

// ==============================================================================
// 9. 16x2 LCD REAL-TIME SCIENTIFIC UI
// ==============================================================================
void updateLcd() {
  char l0[17];
  char l1[17];

  switch (mode) {
    case 0: // STORAGE
      // Line 1: Temp, Humidity, AQI
      snprintf(l0, sizeof(l0), "S %2.0fC %2.0f%% AQI%d", T1, H1, calc_aqi);
      snprintf(l1, sizeof(l1), "%-16s", reason_str);
      break;

    case 1: // GERMINATION
      // Line 1: Temp, Soil avg, AQI
      snprintf(l0, sizeof(l0), "G %2.0fC S:%d%% Q:%d", calc_t_eff, calc_soil_avg, calc_aqi);
      // Line 2: Explainable decision or VPD status
      snprintf(l1, sizeof(l1), "%-16s", reason_str);
      break;

    case 2: // FIELD
      // Line 1: Soil 1, Soil 2, VPD
      snprintf(l0, sizeof(l0), "F M1:%d M2:%d V:%1.1f", M1_idx, M2_idx, calc_vpd_kpa);
      snprintf(l1, sizeof(l1), "%-16s", reason_str);
      break;
  }

  lcd.setCursor(0, 0);
  lcd.print(l0);
  lcd.setCursor(0, 1);
  lcd.print(l1);
}

// ==============================================================================
// 10. SERIAL TELEMETRY STREAM & REAL-TIME ANALYSIS FRAMES
// ==============================================================================
void sendTelemetry() {
  // 1. Standard Backward-Compatible CSV Frame
  // FORMAT: MODE,T1,H1,T2,H2,M1,M2,GAS,PUMP,FAN,ALERT,REASON
  Serial.print((int)mode);
  Serial.print(",");
  Serial.print(T1, 1);
  Serial.print(",");
  Serial.print(H1, 1);
  Serial.print(",");
  Serial.print(T2, 1);
  Serial.print(",");
  Serial.print(H2, 1);
  Serial.print(",");
  Serial.print(M1_idx);
  Serial.print(",");
  Serial.print(M2_idx);
  Serial.print(",");
  Serial.print(gas_raw);
  Serial.print(",");
  Serial.print(pump_state ? 1 : 0);
  Serial.print(",");
  Serial.print(fan_state ? 1 : 0);
  Serial.print(",");
  Serial.print(alert_state ? 1 : 0);
  Serial.print(",");
  Serial.println(reason_str);

  // 2. High-Precision Real-Time Scientific Analysis Frame ($EPIML prefix)
  Serial.print(F("$EPIML,AQI:"));
  Serial.print(calc_aqi);
  Serial.print(F(",AQI_CAT:"));
  Serial.print(calc_aqi_cat);
  Serial.print(F(",PPM:"));
  Serial.print(calc_gas_ppm);
  Serial.print(F(",T_EFF:"));
  Serial.print(calc_t_eff, 1);
  Serial.print(F(",RH_EFF:"));
  Serial.print(calc_h_eff, 1);
  Serial.print(F(",VPD:"));
  Serial.print(calc_vpd_kpa, 2);
  Serial.print(F(",DEW_T:"));
  Serial.print(calc_dew_point, 1);
  Serial.print(F(",SOIL_AVG:"));
  Serial.print(calc_soil_avg);
  Serial.print(F(",SOIL_CAT:"));
  Serial.print(calc_soil_cat);
  Serial.print(F(",CROP:"));
  Serial.print(active_crop_name);
  Serial.print(F(",PUMP:"));
  Serial.print(pump_state ? 1 : 0);
  Serial.print(F(",FAN:"));
  Serial.print(fan_state ? 1 : 0);
  Serial.print(F(",VENT:"));
  Serial.print(vent_angle);
  Serial.print(F(",COV:"));
  Serial.print(cover_angle);
  Serial.println(F("*"));
}

// Dump formatted human-readable real-time analysis report to Serial
void dumpAnalysisReport() {
  Serial.println(F("\n======================================================="));
  Serial.println(F("    epiML / Chiguru REAL-TIME ENVIRONMENTAL ANALYSIS   "));
  Serial.println(F("======================================================="));
  Serial.print(F("Active Crop Protocol : ")); Serial.println(active_crop_name);
  Serial.print(F("Operational Mode     : ")); 
  Serial.println(mode == 0 ? F("STORAGE") : (mode == 1 ? F("GERMINATION (CHAMBER)") : F("FIELD")));
  
  Serial.println(F("\n[1. AIR QUALITY & GAS ANALYSIS (MQ-135)]"));
  Serial.print(F("  Raw ADC Reading    : ")); Serial.println(gas_raw);
  Serial.print(F("  Calibrated Baseline: ")); Serial.println(GAS_BASE);
  Serial.print(F("  Estimated Gas PPM  : ")); Serial.print(calc_gas_ppm); Serial.println(F(" ppm"));
  Serial.print(F("  Air Quality Index  : ")); Serial.print(calc_aqi); Serial.print(F(" / 500 ("));
  Serial.print(calc_aqi_cat); Serial.println(F(")"));

  Serial.println(F("\n[2. TEMPERATURE & THERMAL DYNAMICS]"));
  Serial.print(F("  T1 (Storage)       : ")); Serial.print(T1, 1); Serial.println(F(" °C"));
  Serial.print(F("  T2 (Germination)   : ")); Serial.print(T2, 1); Serial.println(F(" °C"));
  Serial.print(F("  Effective Canopy T : ")); Serial.print(calc_t_eff, 1); Serial.println(F(" °C"));
  Serial.print(F("  Fan Threshold Temp : ")); Serial.print(FAN_TRIGGER_TEMP, 1); Serial.println(F(" °C"));

  Serial.println(F("\n[3. HUMIDITY & VAPOR PRESSURE DEFICIT (VPD)]"));
  Serial.print(F("  Effective RH%      : ")); Serial.print(calc_h_eff, 1); Serial.println(F(" %"));
  Serial.print(F("  Dew Point          : ")); Serial.print(calc_dew_point, 1); Serial.println(F(" °C"));
  Serial.print(F("  Dew Point Margin   : ")); Serial.print(calc_dew_margin, 1); Serial.println(F(" °C"));
  Serial.print(F("  Vapor Pressure Def : ")); Serial.print(calc_vpd_kpa, 2); Serial.println(F(" kPa (Ideal: 0.40 - 1.20 kPa)"));

  Serial.println(F("\n[4. SOIL MOISTURE & IRRIGATION STATUS]"));
  Serial.print(F("  Probe #1 Moisture  : ")); Serial.print(M1_idx); Serial.println(F(" %"));
  Serial.print(F("  Probe #2 Moisture  : ")); Serial.print(M2_idx); Serial.println(F(" %"));
  Serial.print(F("  Mean Soil Moisture : ")); Serial.print(calc_soil_avg); Serial.print(F(" % ("));
  Serial.print(calc_soil_cat); Serial.println(F(")"));
  Serial.print(F("  Irrigation Threshold: ON < ")); Serial.print(MOIST_PUMP_ON);
  Serial.print(F("% | OFF >= ")); Serial.print(MOIST_PUMP_OFF); Serial.println(F("%"));

  Serial.println(F("\n[5. DETERMINISTIC ACTUATOR STATUS]"));
  Serial.print(F("  Water Pump Relay   : ")); Serial.println(pump_state ? F("ACTIVE (ON)") : F("IDLE (OFF)"));
  Serial.print(F("  DC Aeration Fan    : ")); Serial.println(fan_state ? F("ACTIVE (ON)") : F("IDLE (OFF)"));
  Serial.print(F("  Vent Louvre Angle  : ")); Serial.print(vent_angle); Serial.println(F("°"));
  Serial.print(F("  Canopy Shade Angle : ")); Serial.print(cover_angle); Serial.println(F("°"));
  Serial.print(F("  Control Explanation: ")); Serial.println(reason_str);
  Serial.println(F("=======================================================\n"));
}

// ==============================================================================
// 11. SERIAL COMMAND PARSER (INTERACTIVE HANDSHAKE)
// ==============================================================================
void parseSerialCommands() {
  static String cmdBuffer = "";
  while (Serial.available() > 0) {
    char c = (char)Serial.read();
    if (c == '\n' || c == '\r') {
      cmdBuffer.trim();
      if (cmdBuffer.length() == 0) continue;

      if (cmdBuffer.startsWith("PROTOCOL:") || cmdBuffer.startsWith("CROP:")) {
        // e.g. PROTOCOL:TOMATO or PROTOCOL:WHEAT
        String crop = cmdBuffer.substring(cmdBuffer.indexOf(':') + 1);
        crop.trim();
        crop.toUpperCase();
        crop.toCharArray(active_crop_name, sizeof(active_crop_name));

        if (crop.equalsIgnoreCase("TOMATO")) {
          FAN_TRIGGER_TEMP = 27.5;
          MOIST_PUMP_ON    = 60;
          MOIST_PUMP_OFF   = 75;
          GERM_VENT_TEMP   = 29.0;
          updateCover(45); // 50% shade
        } else if (crop.equalsIgnoreCase("WHEAT")) {
          FAN_TRIGGER_TEMP = 24.0;
          MOIST_PUMP_ON    = 50;
          MOIST_PUMP_OFF   = 65;
          GERM_VENT_TEMP   = 25.0;
          updateCover(30);
        } else if (crop.equalsIgnoreCase("RICE")) {
          FAN_TRIGGER_TEMP = 30.0;
          MOIST_PUMP_ON    = 70;
          MOIST_PUMP_OFF   = 85;
          GERM_VENT_TEMP   = 32.0;
          updateCover(35);
        } else if (crop.equalsIgnoreCase("MAIZE")) {
          FAN_TRIGGER_TEMP = 28.0;
          MOIST_PUMP_ON    = 55;
          MOIST_PUMP_OFF   = 70;
          GERM_VENT_TEMP   = 30.0;
          updateCover(40);
        } else if (crop.equalsIgnoreCase("CHILLI") || crop.equalsIgnoreCase("PEPPER")) {
          FAN_TRIGGER_TEMP = 28.5;
          MOIST_PUMP_ON    = 65;
          MOIST_PUMP_OFF   = 80;
          GERM_VENT_TEMP   = 31.0;
          updateCover(50);
        }

        soundBeeps(2, 90);
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("CROP PROTOCOL:");
        lcd.setCursor(0, 1);
        lcd.print(active_crop_name);
        delay(700);
        updateLcd();

        Serial.print(F("PROTOCOL_ACK,"));
        Serial.print(active_crop_name);
        Serial.print(F(",MOIST_RANGE:"));
        Serial.print(MOIST_PUMP_ON);
        Serial.print(F("-"));
        Serial.print(MOIST_PUMP_OFF);
        Serial.print(F(",FAN_TEMP:"));
        Serial.println(FAN_TRIGGER_TEMP, 1);
      } else if (cmdBuffer.equalsIgnoreCase("ANALYSIS") || cmdBuffer.equalsIgnoreCase("REPORT") || cmdBuffer.equalsIgnoreCase("STATUS")) {
        dumpAnalysisReport();
      } else if (cmdBuffer.startsWith("MODE:")) {
        int targetMode = cmdBuffer.substring(5).toInt();
        if (targetMode >= 0 && targetMode <= 2) {
          mode = (uint8_t)targetMode;
          soundBeeps(mode + 1, 140);
          lcd.clear();
          lcd.setCursor(0, 0);
          lcd.print("REMOTE MODE ->");
          lcd.setCursor(0, 1);
          lcd.print(mode == 0 ? "STORAGE" : (mode == 1 ? "GERMINATION" : "FIELD"));
          delay(800);
          updateLcd();
        }
      } else if (cmdBuffer.equalsIgnoreCase("PUMP:ON") || cmdBuffer.equalsIgnoreCase("MOTOR:ON") || cmdBuffer.equalsIgnoreCase("ON")) {
        manual_pump_override = true;
        setPump(true, true);
        soundBeeps(1, 80);
        Serial.println(F(">> [PUMP] MANUAL OVERRIDE: PUMP MOTOR ON"));
      } else if (cmdBuffer.equalsIgnoreCase("PUMP:OFF") || cmdBuffer.equalsIgnoreCase("MOTOR:OFF") || cmdBuffer.equalsIgnoreCase("OFF")) {
        manual_pump_override = false;
        setPump(false, true);
        Serial.println(F(">> [PUMP] MANUAL OVERRIDE: PUMP MOTOR OFF"));
      } else if (cmdBuffer.equalsIgnoreCase("FAN:ON") || cmdBuffer.equalsIgnoreCase("FAN:1")) {
        manual_fan_override = true;
        setFan(true);
        Serial.println(F(">> [FAN] MANUAL OVERRIDE: AERATION FAN ON"));
      } else if (cmdBuffer.equalsIgnoreCase("FAN:OFF") || cmdBuffer.equalsIgnoreCase("FAN:0")) {
        manual_fan_override = true;
        setFan(false);
        Serial.println(F(">> [FAN] MANUAL OVERRIDE: AERATION FAN OFF"));
      } else if (cmdBuffer.equalsIgnoreCase("FAN:AUTO")) {
        manual_fan_override = false;
        Serial.println(F(">> [FAN] RESUMED CLOSED-LOOP AUTO CONTROL"));
      } else if (cmdBuffer.startsWith("VENT:")) {
        int ang = cmdBuffer.substring(5).toInt();
        manual_vent_override = (ang > 0);
        updateVent(ang);
        Serial.print(F(">> [VENT] LOUVRE SET TO ")); Serial.print(vent_angle); Serial.println(F("°"));
      } else if (cmdBuffer.startsWith("COVER:") || cmdBuffer.startsWith("SHADE:")) {
        int val = cmdBuffer.substring(cmdBuffer.indexOf(':') + 1).toInt();
        int targetAngle = constrain((val * 90) / 100, 0, 90);
        updateCover(targetAngle);
        Serial.print(F(">> [COVER] SHADE SERVO SET TO ")); Serial.print(cover_angle); Serial.println(F("°"));
      } else if (cmdBuffer.startsWith("FAN_TEMP:") || cmdBuffer.startsWith("SET_TEMP:")) {
        float newThresh = cmdBuffer.substring(cmdBuffer.indexOf(':') + 1).toFloat();
        if (newThresh >= 15.0 && newThresh <= 50.0) {
          FAN_TRIGGER_TEMP = newThresh;
          Serial.print(F(">> [TEMP] HIGH-TEMP TRIGGER THRESHOLD: ")); Serial.print(FAN_TRIGGER_TEMP, 1); Serial.println(F(" °C"));
        }
      } else if (cmdBuffer.equalsIgnoreCase("DHT:11")) {
        dht1 = DHT(PIN_DHT1, DHT11);
        dht2 = DHT(PIN_DHT2, DHT11);
        dht1.begin();
        dht2.begin();
        Serial.println(F(">> [DHT] PROTOCOL SWITCHED TO DHT11 (BLUE MODULE)"));
      } else if (cmdBuffer.equalsIgnoreCase("DHT:22")) {
        dht1 = DHT(PIN_DHT1, DHT22);
        dht2 = DHT(PIN_DHT2, DHT22);
        dht1.begin();
        dht2.begin();
        Serial.println(F(">> [DHT] PROTOCOL SWITCHED TO DHT22 (WHITE MODULE)"));
      } else if (cmdBuffer.equalsIgnoreCase("INV")) {
        RELAY_ACTIVE_LOW = !RELAY_ACTIVE_LOW;
        digitalWrite(PIN_RELAY_PUMP, pump_state ? (RELAY_ACTIVE_LOW ? LOW : HIGH) : (RELAY_ACTIVE_LOW ? HIGH : LOW));
        Serial.print(F(">> [RELAY] POLARITY INVERTED: ACTIVE_LOW=")); Serial.println(RELAY_ACTIVE_LOW ? F("TRUE") : F("FALSE"));
      } else if (cmdBuffer.equalsIgnoreCase("AUTO")) {
        manual_pump_override = false;
        manual_vent_override = false;
        manual_fan_override  = false;
        Serial.println(F(">> [SYSTEM] RESUMED FULL AUTONOMOUS CONTROL"));
      }

      cmdBuffer = "";
    } else {
      if (cmdBuffer.length() < 70) cmdBuffer += c;
    }
  }
}

// ==============================================================================
// 12. HARDWARE BUTTON INPUT (CYCLIC DEBOUNCED)
// ==============================================================================
void checkButton() {
  int r = digitalRead(PIN_BTN_MODE);
  if (r != last_btn_state) {
    last_debounce_time = millis();
  }

  if ((millis() - last_debounce_time) > DEBOUNCE_DELAY_MS) {
    static int debounced = HIGH;
    if (r != debounced) {
      debounced = r;
      if (debounced == LOW) { // Button Pressed
        mode = (mode + 1) % 3;
        soundBeeps(mode + 1, 140);

        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("MODE SWITCHED:");
        lcd.setCursor(0, 1);
        if (mode == 0) lcd.print("0: STORAGE");
        else if (mode == 1) lcd.print("1: GERMINATION");
        else lcd.print("2: FIELD");
        delay(1100);
        updateLcd();
      }
    }
  }
  last_btn_state = r;
}

// ==============================================================================
// 13. SYSTEM SETUP & POWER-ON SELF TEST (POST)
// ==============================================================================
void setup() {
  // CRITICAL: Set active-LOW relay pin HIGH before configuring OUTPUT to avoid relay flutter
  if (RELAY_ACTIVE_LOW) {
    digitalWrite(PIN_RELAY_PUMP, HIGH);
  } else {
    digitalWrite(PIN_RELAY_PUMP, LOW);
  }
  pinMode(PIN_RELAY_PUMP, OUTPUT);

  pinMode(PIN_FAN_AER, OUTPUT);
  digitalWrite(PIN_FAN_AER, LOW);

  pinMode(PIN_BUZZER, OUTPUT);
  digitalWrite(PIN_BUZZER, LOW);

  pinMode(PIN_LED_STAT, OUTPUT);
  digitalWrite(PIN_LED_STAT, LOW);

  pinMode(PIN_BTN_MODE, INPUT_PULLUP);

  Serial.begin(115200);

  // Initialize 16x2 LCD UI
  lcd.begin(16, 2);
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("epiML / Chiguru");
  lcd.setCursor(0, 1);
  lcd.print("Pheno Engine v2");

  soundBeeps(2, 120);
  delay(1800);

  // Initialize DHT sensors
  dht1.begin();
  dht2.begin();

  // Self-test sequence
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("SELF-TESTING...");
  delay(500);

  readAndValidateSensors();

  lcd.clear();
  if (!dht1_ok || !dht2_ok || !m1_ok || !mq_ok) {
    lcd.setCursor(0, 0);
    lcd.print(!dht1_ok ? "DHT1 ERR " : (!dht2_ok ? "DHT2 FAULT" : "DHT: OK"));
    lcd.setCursor(0, 1);
    lcd.print(!m1_ok ? "M1 FAULT " : (!mq_ok ? "MQ FAULT" : "SOIL/GAS OK"));
  } else {
    lcd.setCursor(0, 0);
    lcd.print("ALL SENSORS: OK");
    lcd.setCursor(0, 1);
    lcd.print("CHAMBER: READY");
  }
  delay(1400);

  // Home servos safely
  updateVent(0);
  updateCover(0);

  lcd.clear();
}

// ==============================================================================
// 14. MAIN NON-BLOCKING MULTITASKING LOOP
// ==============================================================================
void loop() {
  unsigned long now = millis();

  // 1. Continuous high-frequency input checks
  checkButton();
  parseSerialCommands();
  handleAlerts();

  // 2. Sensor reading & real-time analysis every 2000 ms
  if (now - last_sensor_time >= 2000) {
    last_sensor_time = now;
    readAndValidateSensors();

    switch (mode) {
      case 0: evaluateStorage(); break;
      case 1: evaluateGermination(); break;
      case 2: evaluateField(); break;
    }
  }

  // 3. LCD screen refresh every 500 ms
  if (now - last_lcd_time >= 500) {
    last_lcd_time = now;
    updateLcd();
  }

  // 4. Serial telemetry CSV and Real-Time Analysis broadcast every 1000 ms
  if (now - last_telemetry_time >= 1000) {
    last_telemetry_time = now;
    sendTelemetry();
  }
}
