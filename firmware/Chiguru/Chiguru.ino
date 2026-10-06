/*
 * Chiguru (ಚಿಗುರು) — Complete Multi-Epoch Agri-Lifecycle Firmware
 * Event: YEN NOVA 1.0, Yenepoya Institute of Technology
 * Team: TerraByte (Pavan HP, Hithesh HG, Vikas KH, Karthik V)
 * 
 * Hardware Pin Mapping (Arduino Uno - 100% Pin Allocation):
 *   D2:  DHT22 #1 data (storage zone)
 *   D3:  DHT22 #2 data (germination zone)
 *   D4:  LCD RS
 *   D5:  Servo #1 vent (PWM)
 *   D6:  Servo #2 cover (PWM)
 *   D7:  LCD EN
 *   D8:  LCD D4
 *   D9:  LCD D5
 *   D10: Mode button -> GND (INPUT_PULLUP)
 *   D11: LCD D6
 *   D12: LCD D7
 *   D13: Relay IN (water pump)
 *   A0:  Soil Moisture #1 (Analog)
 *   A1:  Soil Moisture #2 (Analog)
 *   A2:  MQ135 Gas Sensor (Analog)
 *   A3:  Active Buzzer
 *   A4:  Status LED (+ current limiting resistor)
 *   A5:  DC Aeration Fan (via 2N2222 transistor)
 */

#include <DHT.h>
#include <LiquidCrystal.h>
#include <Servo.h>

// ==========================================
// PIN ASSIGNMENTS (FROZEN HARDWARE PINOUT)
// ==========================================
#define DHT1PIN   2    // Storage zone
#define DHT2PIN   3    // Germination zone
#define M1        A0   // Moisture tray 1
#define M2        A1   // Moisture tray 2
#define GAS       A2   // MQ135
#define BUZZ      A3   // Buzzer
#define SLED      A4   // Status LED
#define FAN       A5   // DC Fan via 2N2222
#define BTN       10   // Mode button -> GND
#define RELAY     13   // Pump relay (Active-LOW verified)
#define SERVO1    5    // Vent servo
#define SERVO2    6    // Cover servo

// Set DHT type: DHT11 (Blue Module) or DHT22 (White Module)
#define DHT_TYPE DHT11

DHT dht1(DHT1PIN, DHT_TYPE);
DHT dht2(DHT2PIN, DHT_TYPE);
LiquidCrystal lcd(4, 7, 8, 9, 11, 12);
Servo vent;
Servo cover;

// ==========================================
// CALIBRATION & THRESHOLD CONSTANTS
// ==========================================
int M1_DRY = 800, M1_WET = 300;
int M2_DRY = 800, M2_WET = 300;
int GAS_BASE = 120; // MQ135 clean-air baseline after burn-in

const int SOIL_FAULT_MIN = 50;
const int SOIL_FAULT_MAX = 1000;

const float STORAGE_TEMP_ALERT = 30.0;
const float STORAGE_HUMID_ALERT = 65.0;
const float STORAGE_FAN_HUMID = 60.0;
const float GERM_VENT_TEMP = 32.0;
const float FIELD_FAN_TEMP = 33.0;

const int MOIST_PUMP_ON = 35;
const int MOIST_PUMP_OFF = 60;

const unsigned long MAX_PUMP_RUN_MS = 60000UL;      // 60s max continuous run
const unsigned long PUMP_COOLDOWN_MS = 30000UL;     // 30s forced cooldown
const unsigned long BUZZER_TIMEOUT_MS = 10000UL;    // 10s auto-silence
const unsigned long OVERWATER_LIMIT_MS = 60000UL;   // 60s saturation warning

// Active-LOW relay configuration (toggleable via INV serial command)
bool RELAY_ACTIVE_LOW = true;
bool manual_pump_override = false;
bool manual_vent_override = false;

// ==========================================
// SYSTEM STATE VARIABLES
// ==========================================
uint8_t mode = 0; // 0: STORAGE, 1: GERMINATION, 2: FIELD

// Telemetry values
float T1 = 0.0, H1 = 0.0;
float T2 = 0.0, H2 = 0.0;
int M1_raw = 0, M2_raw = 0;
int M1_idx = 0, M2_idx = 0;
int gas_raw = 0;
bool dht1_ok = false, dht2_ok = false;
bool m1_ok = false, m2_ok = false;
bool mq_ok = false;

// Actuator states
bool pump_state = false;
bool fan_state = false;
bool alert_state = false;
int vent_angle = 0;
int cover_angle = 0;

// Explainable decision reason string (printed on LCD Line 2)
char reason_str[17] = "SYS: OK";

// Timing keepers
unsigned long last_sensor_time = 0;
unsigned long last_telemetry_time = 0;
unsigned long last_lcd_time = 0;
unsigned long pump_start_time = 0;
unsigned long pump_stop_time = 0;
unsigned long alert_start_time = 0;
unsigned long saturated_start_time = 0;
bool buzzer_silenced = false;
bool is_overwatered = false;

// Button debounce
int last_btn_state = HIGH;
unsigned long last_debounce_time = 0;
const unsigned long DEBOUNCE_DELAY_MS = 50;

// ==========================================
// HELPER FUNCTIONS & ACTUATOR DRIVERS
// ==========================================

void setPump(bool state, bool forceManual = false) {
  if (state && !pump_state) {
    if (!forceManual && millis() - pump_stop_time < PUMP_COOLDOWN_MS && pump_stop_time != 0) {
      return; // In cooldown
    }
    pump_start_time = millis();
    pump_state = true;
  } else if (!state && pump_state) {
    pump_stop_time = millis();
    pump_state = false;
  }
  
  if (RELAY_ACTIVE_LOW) {
    digitalWrite(RELAY, pump_state ? LOW : HIGH);
  } else {
    digitalWrite(RELAY, pump_state ? HIGH : LOW);
  }
}

void setFan(bool state) {
  fan_state = state;
  digitalWrite(FAN, fan_state ? HIGH : LOW);
}

void updateVent(int targetAngle) {
  targetAngle = constrain(targetAngle, 0, 90);
  if (targetAngle != vent_angle) {
    vent_angle = targetAngle;
    vent.attach(SERVO1);
    vent.write(vent_angle);
    delay(350);
    vent.detach(); // Detach to save power & avoid jitter
  }
}

void updateCover(int targetAngle) {
  targetAngle = constrain(targetAngle, 0, 90);
  if (targetAngle != cover_angle) {
    cover_angle = targetAngle;
    cover.attach(SERVO2);
    cover.write(cover_angle);
    delay(350);
    cover.detach();
  }
}

// Convert raw moisture to 0-100 index (handles either polarity)
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

// Dew point calculation (Magnus-Tetens formula approximation)
float computeDewPoint(float temp, float hum) {
  float a = 17.27, b = 237.7;
  float alpha = ((a * temp) / (b + temp)) + log(hum / 100.0);
  return (b * alpha) / (a - alpha);
}

void soundBeeps(int count, int durationMs) {
  for (int i = 0; i < count; i++) {
    digitalWrite(BUZZ, HIGH);
    delay(durationMs);
    digitalWrite(BUZZ, LOW);
    if (i < count - 1) delay(durationMs);
  }
}

// ==========================================
// SENSOR ACQUISITION & VALIDATION
// ==========================================
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
  M1_raw = analogRead(M1);
  M2_raw = analogRead(M2);
  M1_idx = rawToPercent(M1_raw, M1_DRY, M1_WET, m1_ok);
  M2_idx = rawToPercent(M2_raw, M2_DRY, M2_WET, m2_ok);

  // Read MQ135 Gas
  gas_raw = analogRead(GAS);
  mq_ok = (gas_raw > 20);

  // Dynamic baseline calibration during first 15 samples if default
  static int base_samples = 0;
  static long base_sum = 0;
  if (base_samples < 15) {
    base_sum += gas_raw;
    base_samples++;
    if (base_samples == 15) {
      GAS_BASE = base_sum / 15;
    }
  }

  // Overwatering detection tracking: if M1 > 85% continuously for > 60s
  if (m1_ok && M1_idx > 85) {
    if (saturated_start_time == 0) saturated_start_time = millis();
    else if (millis() - saturated_start_time > OVERWATER_LIMIT_MS) {
      is_overwatered = true;
    }
  } else {
    saturated_start_time = 0;
    is_overwatered = false;
  }
}

// ==========================================
// EXPLAINABLE STATE MACHINE (X-CPS)
// ==========================================

void evaluateStorage() {
  if (!manual_pump_override) {
    setPump(false);
  }
  if (!manual_vent_override) {
    updateVent(0);
  }

  bool temp_alert = (dht1_ok && T1 > STORAGE_TEMP_ALERT);
  bool humid_alert = (dht1_ok && H1 > STORAGE_HUMID_ALERT);
  bool gas_alert = (mq_ok && gas_raw > (int)(1.5 * GAS_BASE));

  // Dew point condensation detection (grain sweating warning)
  float dewPoint = computeDewPoint(T1, H1);
  bool condensation_risk = (dht1_ok && (T1 - dewPoint) < 2.0);

  if (temp_alert || humid_alert || gas_alert || condensation_risk) {
    if (!alert_state) {
      alert_state = true;
      alert_start_time = millis();
      buzzer_silenced = false;
    }
    if (condensation_risk) {
      snprintf(reason_str, sizeof(reason_str), "DEW CONDENSATION");
    } else if (gas_alert) {
      snprintf(reason_str, sizeof(reason_str), "ALRT: GAS > 1.5X");
    } else if (humid_alert) {
      snprintf(reason_str, sizeof(reason_str), "ALRT: HUMID>65%%");
    } else {
      snprintf(reason_str, sizeof(reason_str), "ALRT: TEMP>30C");
    }
  } else {
    alert_state = false;
    if (dht1_ok && H1 > STORAGE_FAN_HUMID) {
      snprintf(reason_str, sizeof(reason_str), "FAN ON: HUM>60%%");
    } else {
      snprintf(reason_str, sizeof(reason_str), "GAS OK / VENT:OF");
    }
  }

  // Aeration Fan control
  if (dht1_ok && H1 > STORAGE_FAN_HUMID) {
    setFan(true);
  } else {
    setFan(false);
  }
}

void evaluateGermination() {
  setFan(false);
  alert_state = false;

  // 1. Critical Sensor Fault Check
  if (!m1_ok && !m2_ok) {
    if (!manual_pump_override) setPump(false);
    alert_state = true;
    snprintf(reason_str, sizeof(reason_str), "SENSOR FAULT ACT OF");
    return;
  }

  // 2. Overwatering Root-Rot Alert
  if (is_overwatered) {
    if (!manual_pump_override) setPump(false);
    snprintf(reason_str, sizeof(reason_str), "OVERWATER: NO PUMP");
    return;
  }

  // 3. Irrigation Automation with Refusals (only if not manually overridden)
  if (!manual_pump_override) {
    int activeM = m1_ok ? M1_idx : M2_idx;
    if (activeM < MOIST_PUMP_ON) {
      if (millis() - pump_stop_time < PUMP_COOLDOWN_MS && pump_stop_time != 0 && !pump_state) {
        snprintf(reason_str, sizeof(reason_str), "PUMP REFUSE: CDWN");
      } else {
        setPump(true);
        snprintf(reason_str, sizeof(reason_str), "PUMP ON WHY M1<35");
      }
    } else if (activeM >= MOIST_PUMP_OFF) {
      setPump(false);
      snprintf(reason_str, sizeof(reason_str), "PUMP OFF: M OK");
    } else {
      if (!pump_state) {
        snprintf(reason_str, sizeof(reason_str), "PUMP OFF: M OK");
      }
    }

    // 4. Max continuous pump run safety cutoff
    if (pump_state && (millis() - pump_start_time > MAX_PUMP_RUN_MS)) {
      setPump(false);
      alert_state = true;
      snprintf(reason_str, sizeof(reason_str), "SAFETY TRIP: 60S");
    }
  }

  // 5. Vent Proportional Control with "Know When Not To Act" Refusal
  if (!manual_vent_override) {
    if (dht2_ok && T2 > GERM_VENT_TEMP) {
      // If outside is damper than tray, opening vent introduces dampness!
      if (dht1_ok && H1 > (H2 + 6.0) && H1 > 75.0) {
        updateVent(0);
        snprintf(reason_str, sizeof(reason_str), "VENT BLOCKED:OUTSIDE DAMP");
      } else {
        float excess = T2 - GERM_VENT_TEMP;
        int targetA = constrain((int)(excess * 15.0), 0, 90);
        updateVent(targetA);
        if (!pump_state && !alert_state) {
          snprintf(reason_str, sizeof(reason_str), "VENT ON T2>32C");
        }
      }
    } else {
      updateVent(0);
    }
  }
}

void evaluateField() {
  alert_state = false;

  // Sensor Cross-Validation: If both sensors are valid but disagree by > 50%
  if (m1_ok && m2_ok && abs(M1_idx - M2_idx) > 55) {
    snprintf(reason_str, sizeof(reason_str), "ZONE SKEW > 55%%");
  }

  if (!m1_ok && !m2_ok) {
    setPump(false);
    alert_state = true;
    snprintf(reason_str, sizeof(reason_str), "SENSOR FAULT ACT OF");
    return;
  }

  bool needWater = (m1_ok && M1_idx < MOIST_PUMP_ON) || (m2_ok && M2_idx < MOIST_PUMP_ON);
  if (m1_ok && M1_idx >= MOIST_PUMP_OFF && m2_ok && M2_idx >= MOIST_PUMP_OFF) {
    needWater = false;
  }

  if (needWater) {
    if (millis() - pump_stop_time < PUMP_COOLDOWN_MS && pump_stop_time != 0 && !pump_state) {
      snprintf(reason_str, sizeof(reason_str), "PUMP REFUSE: CDWN");
    } else {
      setPump(true);
      snprintf(reason_str, sizeof(reason_str), "PUMP ON: FIELD DRY");
    }
  } else {
    setPump(false);
    snprintf(reason_str, sizeof(reason_str), "PUMP: OFF (SAT)");
  }

  if (pump_state && (millis() - pump_start_time > MAX_PUMP_RUN_MS)) {
    setPump(false);
    alert_state = true;
    snprintf(reason_str, sizeof(reason_str), "SAFETY TRIP: 60S");
  }

  // Canopy Heat-Stress Alleviation Fan
  if (dht2_ok && T2 > FIELD_FAN_TEMP) {
    setFan(true);
    if (!pump_state) snprintf(reason_str, sizeof(reason_str), "FAN ON: T2>33C");
  } else {
    setFan(false);
  }

  updateVent(0);
}

// ==========================================
// ALERT ANNUNCIATOR
// ==========================================
void handleAlerts() {
  if (alert_state) {
    digitalWrite(SLED, HIGH);
    if (!buzzer_silenced) {
      if (millis() - alert_start_time > BUZZER_TIMEOUT_MS) {
        buzzer_silenced = true;
        digitalWrite(BUZZ, LOW);
      } else {
        // 250ms pulsed chime
        digitalWrite(BUZZ, ((millis() / 250) % 2 == 0) ? HIGH : LOW);
      }
    } else {
      digitalWrite(BUZZ, LOW);
    }
  } else {
    digitalWrite(SLED, LOW);
    buzzer_silenced = false;

    // Bench Test / Moisture Indicator Beep:
    // When either probe detects high moisture (>= 50%), chirp every 1 second
    static unsigned long last_wet_beep = 0;
    if ((m1_ok && M1_idx >= 50) || (m2_ok && M2_idx >= 50)) {
      if (millis() - last_wet_beep >= 1000) {
        last_wet_beep = millis();
        digitalWrite(BUZZ, HIGH);
        delay(130);
        digitalWrite(BUZZ, LOW);
        Serial.print(F(">> [MOISTURE HIGH] M1="));
        Serial.print(M1_idx);
        Serial.print(F("% M2="));
        Serial.print(M2_idx);
        Serial.println(F("% -> WET DETECTED! (BEEP!)"));
      }
    } else {
      digitalWrite(BUZZ, LOW);
    }
  }
}

// ==========================================
// 16x2 LCD UI (EXPLAINABLE)
// ==========================================
void updateLcd() {
  char l0[17];
  char l1[17];

  switch (mode) {
    case 0: // STORAGE
      snprintf(l0, sizeof(l0), "STG %2.0fC %2.0f%% G:%d", T1, H1, gas_raw);
      snprintf(l1, sizeof(l1), "%-16s", reason_str);
      break;
    case 1: // GERMINATION
      snprintf(l0, sizeof(l0), "GERM %2.0fC M1:%2d%%", T2, M1_idx);
      snprintf(l1, sizeof(l1), "%-16s", reason_str);
      break;
    case 2: // FIELD
      snprintf(l0, sizeof(l0), "FLD M1:%2d M2:%2d", M1_idx, M2_idx);
      snprintf(l1, sizeof(l1), "%-16s", reason_str);
      break;
  }

  lcd.setCursor(0, 0);
  lcd.print(l0);
  lcd.setCursor(0, 1);
  lcd.print(l1);
}

// ==========================================
// SERIAL TELEMETRY & REMOTE COMMAND PARSER
// ==========================================
void sendTelemetry() {
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
}

void parseSerialCommands() {
  static String cmdBuffer = "";
  while (Serial.available() > 0) {
    char c = (char)Serial.read();
    if (c == '\n' || c == '\r') {
      cmdBuffer.trim();
      if (cmdBuffer.startsWith("MODE:")) {
        int targetMode = cmdBuffer.substring(5).toInt();
        if (targetMode >= 0 && targetMode <= 2) {
          mode = (uint8_t)targetMode;
          soundBeeps(mode + 1, 140);
          lcd.clear();
          lcd.setCursor(0, 0);
          lcd.print("REMOTE COMMAND:");
          lcd.setCursor(0, 1);
          lcd.print(mode == 0 ? "-> STORAGE" : (mode == 1 ? "-> GERMINATION" : "-> FIELD"));
          delay(800);
          updateLcd();
        }
      } else if (cmdBuffer.equalsIgnoreCase("PUMP:ON") || cmdBuffer.equalsIgnoreCase("ON") || cmdBuffer.equals("1")) {
        manual_pump_override = true;
        setPump(true, true);
        Serial.println(F(">> [RELAY] PUMP FORCED ON (CLICK!)"));
      } else if (cmdBuffer.equalsIgnoreCase("PUMP:OFF") || cmdBuffer.equalsIgnoreCase("OFF") || cmdBuffer.equals("0")) {
        manual_pump_override = false;
        setPump(false, true);
        Serial.println(F(">> [RELAY] PUMP FORCED OFF (CLICK!)"));
      } else if (cmdBuffer.equalsIgnoreCase("INV")) {
        RELAY_ACTIVE_LOW = !RELAY_ACTIVE_LOW;
        digitalWrite(RELAY, pump_state ? (RELAY_ACTIVE_LOW ? LOW : HIGH) : (RELAY_ACTIVE_LOW ? HIGH : LOW));
        Serial.print(F(">> [RELAY] POLARITY INVERTED! ACTIVE_LOW="));
        Serial.println(RELAY_ACTIVE_LOW ? F("TRUE") : F("FALSE"));
      } else if (cmdBuffer.startsWith("VENT:")) {
        int ang = cmdBuffer.substring(5).toInt();
        manual_vent_override = (ang > 0);
        updateVent(ang);
        Serial.print(F(">> [SERVO 1] VENT ANGLE SET TO "));
        Serial.println(vent_angle);
      } else if (cmdBuffer.startsWith("COVER:")) {
        int ang = cmdBuffer.substring(6).toInt();
        updateCover(ang);
        Serial.print(F(">> [SERVO 2] COVER ANGLE SET TO "));
        Serial.println(cover_angle);
      } else if (cmdBuffer.equalsIgnoreCase("AUTO")) {
        manual_pump_override = false;
        manual_vent_override = false;
        Serial.println(F(">> [SYSTEM] RESUMED FULL AUTONOMOUS CONTROL"));
      }
      cmdBuffer = "";
    } else {
      if (cmdBuffer.length() < 30) {
        cmdBuffer += c;
      }
    }
  }
}

// ==========================================
// BUTTON INPUT (DEBOUNCED CYCLIC)
// ==========================================
void checkButton() {
  int r = digitalRead(BTN);
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

        // Show mode splash for 1.5s as per manual
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("MODE SWITCHED:");
        lcd.setCursor(0, 1);
        if (mode == 0) lcd.print("0: STORAGE");
        else if (mode == 1) lcd.print("1: GERMINATION");
        else lcd.print("2: FIELD");
        delay(1200);
        updateLcd();
      }
    }
  }
  last_btn_state = r;
}

// ==========================================
// SETUP & POWER-ON SELF-TEST
// ==========================================
void setup() {
  // CRITICAL: Set active-LOW relay pin HIGH before configuring OUTPUT
  if (RELAY_ACTIVE_LOW) {
    digitalWrite(RELAY, HIGH);
  } else {
    digitalWrite(RELAY, LOW);
  }
  pinMode(RELAY, OUTPUT);

  pinMode(FAN, OUTPUT);
  digitalWrite(FAN, LOW);

  pinMode(BUZZ, OUTPUT);
  digitalWrite(BUZZ, LOW);

  pinMode(SLED, OUTPUT);
  digitalWrite(SLED, LOW);

  pinMode(BTN, INPUT_PULLUP);

  Serial.begin(115200);

  // LCD Splash: "Chiguru / TerraByte" 2s
  lcd.begin(16, 2);
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Chiguru / YEN");
  lcd.setCursor(0, 1);
  lcd.print("TerraByte v1.0");

  soundBeeps(2, 140);
  delay(1800);

  // Initialize sensors
  dht1.begin();
  dht2.begin();

  // Self-test sequence: read every sensor once
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("SELF-TESTING...");
  delay(600);

  readAndValidateSensors();

  lcd.clear();
  if (!dht1_ok || !dht2_ok || !m1_ok || !mq_ok) {
    lcd.setCursor(0, 0);
    lcd.print(!dht1_ok ? "DHT1 ERR " : (!dht2_ok ? "DHT2 FAULT" : "DHT OK"));
    lcd.setCursor(0, 1);
    lcd.print(!m1_ok ? "M1 FAULT " : (!mq_ok ? "MQ FAULT" : "M/GAS OK"));
  } else {
    lcd.setCursor(0, 0);
    lcd.print("ALL SENSORS: OK");
    lcd.setCursor(0, 1);
    lcd.print("ACTUATORS: READY");
  }
  delay(1400);

  // Move servos to safe starting angles
  updateVent(0);
  updateCover(0);

  lcd.clear();
}

// ==========================================
// MAIN MULTITASKING LOOP (NON-BLOCKING)
// ==========================================
void loop() {
  unsigned long now = millis();

  // 1. Continuous inputs
  checkButton();
  parseSerialCommands();
  handleAlerts();

  // 2. Sensor reading & state machine evaluation every 2s
  if (now - last_sensor_time >= 2000) {
    last_sensor_time = now;
    readAndValidateSensors();

    switch (mode) {
      case 0: evaluateStorage(); break;
      case 1: evaluateGermination(); break;
      case 2: evaluateField(); break;
    }
  }

  // 3. LCD refresh every 500ms
  if (now - last_lcd_time >= 500) {
    last_lcd_time = now;
    updateLcd();
  }

  // 4. Telemetry CSV broadcast every 1s
  if (now - last_telemetry_time >= 1000) {
    last_telemetry_time = now;
    sendTelemetry();
  }
}
