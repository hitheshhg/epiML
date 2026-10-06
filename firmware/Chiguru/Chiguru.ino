/*
 * Chiguru (ಚಿಗುರು) — Full Lifecycle Agri-Monitoring System Firmware
 * Event: YEN NOVA 1.0, Yenepoya Institute of Technology
 * Team: TerraByte (Pavan HP, Hithesh HG, Vikas KH, Karthik V)
 * 
 * Hardware Mapping (Arduino Uno):
 *   D2:  DHT22 #1 (Storage)
 *   D3:  DHT22 #2 (Germination / Field)
 *   D4:  LCD RS
 *   D5:  Vent Servo (PWM)
 *   D6:  Cover Servo (PWM)
 *   D7:  LCD EN
 *   D8:  LCD D4
 *   D9:  LCD D5
 *   D10: Mode Button (INPUT_PULLUP, debounced)
 *   D11: LCD D6
 *   D12: LCD D7
 *   D13: Relay -> Water Pump (Onboard LED mirrors state)
 *   A0:  Soil Moisture Sensor #1 (Analog)
 *   A1:  Soil Moisture Sensor #2 (Analog)
 *   A2:  MQ-135 Gas Sensor (Analog)
 *   A3:  Piezo Buzzer
 *   A4:  Status Alert LED
 *   A5:  DC Aeration Fan (Transistor 2N2222 base)
 */

#include <LiquidCrystal.h>
#include <Servo.h>
#include <DHT.h>

// ==========================================
// PIN DEFINITIONS
// ==========================================
#define PIN_DHT_STORAGE     2
#define PIN_DHT_GERM        3
#define PIN_LCD_RS          4
#define PIN_SERVO_VENT      5
#define PIN_SERVO_COVER     6
#define PIN_LCD_EN          7
#define PIN_LCD_D4          8
#define PIN_LCD_D5          9
#define PIN_BUTTON_MODE     10
#define PIN_LCD_D6          11
#define PIN_LCD_D7          12
#define PIN_RELAY_PUMP      13

#define PIN_SOIL_1          A0
#define PIN_SOIL_2          A1
#define PIN_MQ135           A2
#define PIN_BUZZER          A3
#define PIN_STATUS_LED      A4
#define PIN_FAN             A5

// ==========================================
// CALIBRATION & TUNING CONSTANTS
// ==========================================
// Soil Moisture ADC Raw Bounds (Tune during calibration)
const int SOIL_RAW_DRY = 820;    // Open-air dry probe reading
const int SOIL_RAW_WET = 290;    // Water-saturated probe reading
const int SOIL_DISCONNECT_MIN = 50;   // Raw ADC below this = short/error
const int SOIL_DISCONNECT_MAX = 1000; // Raw ADC above this = disconnected

// Thresholds
const float STORAGE_TEMP_ALERT = 30.0;     // deg C
const float STORAGE_HUMID_ALERT = 65.0;    // % RH
const float STORAGE_FAN_HUMID = 60.0;      // % RH to trigger aeration fan
const float GERM_TEMP_VENT = 32.0;         // deg C threshold to begin opening vent
const float FIELD_TEMP_FAN = 33.0;         // deg C canopy threshold for cooling fan

const int MOISTURE_PUMP_ON_THRESH = 35;    // % moisture to start irrigation
const int MOISTURE_PUMP_OFF_THRESH = 60;   // % moisture to stop irrigation

// Safety Timers (in milliseconds)
const unsigned long MAX_PUMP_RUN_MS = 60000UL;      // 60 seconds max continuous pump run
const unsigned long PUMP_COOLDOWN_MS = 30000UL;     // 30 seconds forced cooldown
const unsigned long BUZZER_SILENCE_TIMEOUT_MS = 10000UL; // Buzzer mutes after 10s of alarm

// Hardware Configuration Flags
const bool RELAY_ACTIVE_LOW = true;        // Standard 5V relay modules are Active LOW

// ==========================================
// INSTANTIATIONS
// ==========================================
LiquidCrystal lcd(PIN_LCD_RS, PIN_LCD_EN, PIN_LCD_D4, PIN_LCD_D5, PIN_LCD_D6, PIN_LCD_D7);
DHT dhtStorage(PIN_DHT_STORAGE, DHT22);
DHT dhtGerm(PIN_DHT_GERM, DHT22);
Servo servoVent;
Servo servoCover;

// ==========================================
// STATE VARIABLES
// ==========================================
enum SystemMode {
  MODE_STORAGE = 0,
  MODE_GERMINATION = 1,
  MODE_FIELD = 2
};

volatile SystemMode currentMode = MODE_STORAGE;

// Telemetry Variables
float temp1 = 0.0, hum1 = 0.0; // Storage DHT
float temp2 = 0.0, hum2 = 0.0; // Germination/Field DHT
int soilRaw1 = 0, soilRaw2 = 0;
int soilPct1 = 0, soilPct2 = 0;
bool soil1Valid = false, soil2Valid = false;
int gasRaw = 0;
float gasBaseline = 120.0;
bool gasBaselineReady = false;

// Actuator States
bool pumpState = false;
bool fanState = false;
bool alertState = false;
int ventAngle = 0;
int coverAngle = 0;

// Timing Keepers (millis)
unsigned long lastSensorReadTime = 0;
unsigned long lastSerialTelemetryTime = 0;
unsigned long lastLcdUpdateTime = 0;
unsigned long lastButtonCheckTime = 0;
unsigned long pumpStartTime = 0;
unsigned long pumpStopTime = 0;
unsigned long alertStartTime = 0;
unsigned long buzzerPulseTimer = 0;
bool buzzerSilenced = false;
bool servoVentAttached = false;

// Button Debounce
int lastButtonState = HIGH;
unsigned long lastDebounceTime = 0;
const unsigned long DEBOUNCE_DELAY_MS = 50;

// ==========================================
// HELPER FUNCTIONS
// ==========================================

void setPump(bool state) {
  if (state && !pumpState) {
    // Check safety cooldown
    if (millis() - pumpStopTime < PUMP_COOLDOWN_MS && pumpStopTime != 0) {
      return; // Still cooling down, refuse to start
    }
    pumpStartTime = millis();
    pumpState = true;
  } else if (!state && pumpState) {
    pumpStopTime = millis();
    pumpState = false;
  }
  
  // Apply hardware state
  if (RELAY_ACTIVE_LOW) {
    digitalWrite(PIN_RELAY_PUMP, pumpState ? LOW : HIGH);
  } else {
    digitalWrite(PIN_RELAY_PUMP, pumpState ? HIGH : LOW);
  }
}

void setFan(bool state) {
  fanState = state;
  digitalWrite(PIN_FAN, fanState ? HIGH : LOW);
}

void updateVentServo(int targetAngle) {
  targetAngle = constrain(targetAngle, 0, 90);
  if (targetAngle != ventAngle) {
    ventAngle = targetAngle;
    if (!servoVentAttached) {
      servoVent.attach(PIN_SERVO_VENT);
      servoVentAttached = true;
    }
    servoVent.write(ventAngle);
  }
}

void updateCoverServo(int targetAngle) {
  targetAngle = constrain(targetAngle, 0, 90);
  if (targetAngle != coverAngle) {
    coverAngle = targetAngle;
    servoCover.attach(PIN_SERVO_COVER);
    servoCover.write(coverAngle);
    delay(150);
    servoCover.detach(); // Detach to save power and eliminate jitter
  }
}

int rawToMoisturePercent(int rawVal, bool &isValid) {
  if (rawVal < SOIL_DISCONNECT_MIN || rawVal > SOIL_DISCONNECT_MAX) {
    isValid = false;
    return 0;
  }
  isValid = true;
  long pct = map(rawVal, SOIL_RAW_DRY, SOIL_RAW_WET, 0, 100);
  return constrain((int)pct, 0, 100);
}

void soundBeep(int count, int durationMs) {
  for (int i = 0; i < count; i++) {
    digitalWrite(PIN_BUZZER, HIGH);
    delay(durationMs);
    digitalWrite(PIN_BUZZER, LOW);
    if (i < count - 1) delay(durationMs);
  }
}

// ==========================================
// SENSOR ACQUISITION
// ==========================================
void readAllSensors() {
  // Read DHT22 #1 (Storage)
  float t1 = dhtStorage.readTemperature();
  float h1 = dhtStorage.readHumidity();
  if (!isnan(t1)) temp1 = t1;
  if (!isnan(h1)) hum1 = h1;

  // Read DHT22 #2 (Germination / Field)
  float t2 = dhtGerm.readTemperature();
  float h2 = dhtGerm.readHumidity();
  if (!isnan(t2)) temp2 = t2;
  if (!isnan(h2)) hum2 = h2;

  // Read Soil Moisture
  soilRaw1 = analogRead(PIN_SOIL_1);
  soilRaw2 = analogRead(PIN_SOIL_2);
  soilPct1 = rawToMoisturePercent(soilRaw1, soil1Valid);
  soilPct2 = rawToMoisturePercent(soilRaw2, soil2Valid);

  // Read MQ-135 Gas
  gasRaw = analogRead(PIN_MQ135);

  // Dynamic baseline update during initial startup (rolling filter)
  if (!gasBaselineReady) {
    static int sampleCount = 0;
    static long sumGas = 0;
    sumGas += gasRaw;
    sampleCount++;
    if (sampleCount >= 20) {
      gasBaseline = (float)sumGas / sampleCount;
      gasBaselineReady = true;
    }
  }
}

// ==========================================
// MODE LOGIC & SAFETY CONTROLLERS
// ==========================================
void evaluateStorageMode() {
  // Turn off irrelevant actuators
  setPump(false);
  updateVentServo(0);
  updateCoverServo(0);

  bool tempOver = (temp1 > STORAGE_TEMP_ALERT);
  bool humOver = (hum1 > STORAGE_HUMID_ALERT);
  bool gasOver = (gasBaselineReady && (gasRaw > (gasBaseline * 1.5)));

  if (tempOver || humOver || gasOver) {
    if (!alertState) {
      alertState = true;
      alertStartTime = millis();
      buzzerSilenced = false;
    }
  } else {
    alertState = false;
    buzzerSilenced = false;
  }

  // Aeration Fan control
  if (hum1 > STORAGE_FAN_HUMID) {
    setFan(true);
  } else {
    setFan(false);
  }
}

void evaluateGerminationMode() {
  // Reset storage alerts
  setFan(false);
  alertState = false;

  // Pump control logic based on moisture
  int activeMoisture = (soil1Valid) ? soilPct1 : ((soil2Valid) ? soilPct2 : 0);

  // Fail-safe: If sensors are invalid / disconnected, never turn pump on
  if (!soil1Valid && !soil2Valid) {
    setPump(false);
    alertState = true; // Flag sensor disconnect alert
  } else {
    if (activeMoisture < MOISTURE_PUMP_ON_THRESH) {
      setPump(true);
    } else if (activeMoisture >= MOISTURE_PUMP_OFF_THRESH) {
      setPump(false);
    }
  }

  // Enforce Max Pump Run-Time Safety Trip
  if (pumpState && (millis() - pumpStartTime > MAX_PUMP_RUN_MS)) {
    setPump(false); // Force emergency pump cutoff
    alertState = true;
  }

  // Microclimate Vent Servo: proportional above 32C
  if (temp2 > GERM_TEMP_VENT) {
    // Map 32.0C to 38.0C -> 0 deg to 90 deg
    float excess = temp2 - GERM_TEMP_VENT;
    int targetA = constrain((int)(excess * 15.0), 0, 90);
    updateVentServo(targetA);
  } else {
    updateVentServo(0);
  }
}

void evaluateFieldMode() {
  alertState = false;

  // Dual-zone irrigation logic:
  // If either zone drops below threshold, irrigate (safety clamped)
  bool needWater = false;
  if (soil1Valid && soilPct1 < MOISTURE_PUMP_ON_THRESH) needWater = true;
  if (soil2Valid && soilPct2 < MOISTURE_PUMP_ON_THRESH) needWater = true;

  if (soil1Valid && soilPct1 >= MOISTURE_PUMP_OFF_THRESH && 
      soil2Valid && soilPct2 >= MOISTURE_PUMP_OFF_THRESH) {
    needWater = false;
  }

  // Safety checks
  if (!soil1Valid && !soil2Valid) {
    setPump(false);
    alertState = true;
  } else if (needWater) {
    setPump(true);
  } else {
    setPump(false);
  }

  if (pumpState && (millis() - pumpStartTime > MAX_PUMP_RUN_MS)) {
    setPump(false);
    alertState = true;
  }

  // High Temperature Heat-Stress Fan Cooling
  if (temp2 > FIELD_TEMP_FAN) {
    setFan(true);
  } else {
    setFan(false);
  }

  updateVentServo(0);
}

// ==========================================
// ALERT ANNUNCIATION
// ==========================================
void handleAlertAnnunciation() {
  if (alertState) {
    digitalWrite(PIN_STATUS_LED, HIGH); // Latched LED

    // Buzzer logic: pulses for up to 10s, then silences
    if (!buzzerSilenced) {
      if (millis() - alertStartTime > BUZZER_SILENCE_TIMEOUT_MS) {
        buzzerSilenced = true;
        digitalWrite(PIN_BUZZER, LOW);
      } else {
        // Pulse pattern every 500ms
        if ((millis() / 250) % 2 == 0) {
          digitalWrite(PIN_BUZZER, HIGH);
        } else {
          digitalWrite(PIN_BUZZER, LOW);
        }
      }
    } else {
      digitalWrite(PIN_BUZZER, LOW);
    }
  } else {
    digitalWrite(PIN_STATUS_LED, LOW);
    digitalWrite(PIN_BUZZER, LOW);
    buzzerSilenced = false;
  }
}

// ==========================================
// USER INTERFACE (16x2 4-BIT LCD)
// ==========================================
void updateLcdDisplay() {
  char line0[17];
  char line1[17];

  switch (currentMode) {
    case MODE_STORAGE: {
      // Line 0: [STG] T:28C H:58%
      snprintf(line0, sizeof(line0), "[STG] T:%2dC H:%2d%%", (int)temp1, (int)hum1);
      // Line 1: G:115  [OK] or [ALRT]
      if (alertState) {
        snprintf(line1, sizeof(line1), "G:%-4d [ALRT:GAS]", gasRaw);
      } else {
        snprintf(line1, sizeof(line1), "G:%-4d [SYS: OK]", gasRaw);
      }
      break;
    }
    case MODE_GERMINATION: {
      // Line 0: [GER] M1:42% M2:39%
      snprintf(line0, sizeof(line0), "[GER] M1:%2d%% M2:%2d%%", soilPct1, soilPct2);
      // Line 1: T:31C P:ON* V:45
      char pChar = pumpState ? '*' : ' ';
      snprintf(line1, sizeof(line1), "T:%2dC P:%s%c V:%-2d", 
               (int)temp2, pumpState ? "ON" : "OF", pChar, ventAngle);
      break;
    }
    case MODE_FIELD: {
      // Line 0: [FLD] ZA:32% ZB:48%
      snprintf(line0, sizeof(line0), "[FLD] ZA:%2d%% ZB:%2d%%", soilPct1, soilPct2);
      // Line 1: T:34C P:ON  F:ON
      snprintf(line1, sizeof(line1), "T:%2dC P:%-2s F:%-2s",
               (int)temp2, pumpState ? "ON" : "--", fanState ? "ON" : "--");
      break;
    }
  }

  lcd.setCursor(0, 0);
  lcd.print(line0);
  lcd.setCursor(0, 1);
  lcd.print(line1);
}

// ==========================================
// SERIAL TELEMETRY & COMMAND HANDLER
// ==========================================
void sendSerialTelemetry() {
  // FORMAT: MODE,T1,H1,T2,H2,M1,M2,GAS,PUMP,FAN,ALERT
  Serial.print((int)currentMode);
  Serial.print(",");
  Serial.print(temp1, 1);
  Serial.print(",");
  Serial.print(hum1, 1);
  Serial.print(",");
  Serial.print(temp2, 1);
  Serial.print(",");
  Serial.print(hum2, 1);
  Serial.print(",");
  Serial.print(soilPct1);
  Serial.print(",");
  Serial.print(soilPct2);
  Serial.print(",");
  Serial.print(gasRaw);
  Serial.print(",");
  Serial.print(pumpState ? 1 : 0);
  Serial.print(",");
  Serial.print(fanState ? 1 : 0);
  Serial.print(",");
  Serial.println(alertState ? 1 : 0);
}

void checkIncomingCommands() {
  while (Serial.available() > 0) {
    char cmd = Serial.read();
    if (cmd == 'M' || cmd == 'm') {
      delay(5);
      if (Serial.available() > 0) {
        char modeChar = Serial.read();
        if (modeChar >= '0' && modeChar <= '2') {
          currentMode = (SystemMode)(modeChar - '0');
          soundBeep(1, 40);
          updateLcdDisplay();
        }
      }
    } else if (cmd == 'C' || cmd == 'c') {
      // Cover servo toggle for demo
      coverAngle = (coverAngle == 0) ? 90 : 0;
      updateCoverServo(coverAngle);
    }
  }
}

// ==========================================
// BUTTON INPUT (DEBOUNCED MODE CYCLING)
// ==========================================
void checkModeButton() {
  int reading = digitalRead(PIN_BUTTON_MODE);
  if (reading != lastButtonState) {
    lastDebounceTime = millis();
  }

  if ((millis() - lastDebounceTime) > DEBOUNCE_DELAY_MS) {
    static int debouncedState = HIGH;
    if (reading != debouncedState) {
      debouncedState = reading;
      if (debouncedState == LOW) { // Button Pressed
        // Cycle mode: 0 -> 1 -> 2 -> 0
        if (currentMode == MODE_STORAGE) currentMode = MODE_GERMINATION;
        else if (currentMode == MODE_GERMINATION) currentMode = MODE_FIELD;
        else currentMode = MODE_STORAGE;

        soundBeep(currentMode + 1, 50); // Feedback beeps corresponding to mode
        updateLcdDisplay();
      }
    }
  }
  lastButtonState = reading;
}

// ==========================================
// SETUP & SELF-TEST (PHASE 1 REQUIREMENT)
// ==========================================
void setup() {
  // CRITICAL: Initialize relay pin HIGH before configuring OUTPUT to prevent boot click
  if (RELAY_ACTIVE_LOW) {
    digitalWrite(PIN_RELAY_PUMP, HIGH);
  } else {
    digitalWrite(PIN_RELAY_PUMP, LOW);
  }
  pinMode(PIN_RELAY_PUMP, OUTPUT);

  pinMode(PIN_FAN, OUTPUT);
  digitalWrite(PIN_FAN, LOW);

  pinMode(PIN_BUZZER, OUTPUT);
  digitalWrite(PIN_BUZZER, LOW);

  pinMode(PIN_STATUS_LED, OUTPUT);
  digitalWrite(PIN_STATUS_LED, LOW);

  pinMode(PIN_BUTTON_MODE, INPUT_PULLUP);

  // Initialize Serial
  Serial.begin(115200);

  // Initialize LCD
  lcd.begin(16, 2);
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("CHIGURU - v1.0");
  lcd.setCursor(0, 1);
  lcd.print("TerraByte (YEN)");
  
  // Power-on self-test chime
  soundBeep(2, 60);
  delay(1200);

  // Initialize Sensors
  dhtStorage.begin();
  dhtGerm.begin();

  // Self-test diagnostic display
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("SELF-TEST RUN...");

  delay(500);
  readAllSensors();

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("D1:");
  lcd.print(isnan(temp1) ? "ERR " : "OK  ");
  lcd.print("D2:");
  lcd.print(isnan(temp2) ? "ERR" : "OK");

  lcd.setCursor(0, 1);
  lcd.print("M:");
  lcd.print(soil1Valid ? "OK " : "NC ");
  lcd.print("GAS:");
  lcd.print(gasRaw > 20 ? "OK" : "NC");

  delay(1500);
  lcd.clear();
}

// ==========================================
// MAIN LOOP (NON-BLOCKING)
// ==========================================
void loop() {
  unsigned long currentMillis = millis();

  // 1. Check Button Input (continuous)
  checkModeButton();

  // 2. Check Incoming Serial Commands from Dashboard
  checkIncomingCommands();

  // 3. Sensor Acquisition (Every 2000 ms)
  if (currentMillis - lastSensorReadTime >= 2000) {
    lastSensorReadTime = currentMillis;
    readAllSensors();

    // Evaluate Mode Automata
    switch (currentMode) {
      case MODE_STORAGE:
        evaluateStorageMode();
        break;
      case MODE_GERMINATION:
        evaluateGerminationMode();
        break;
      case MODE_FIELD:
        evaluateFieldMode();
        break;
    }
  }

  // 4. Handle Alerts & Annunciators (continuous)
  handleAlertAnnunciation();

  // 5. Update LCD Screen (Every 500 ms)
  if (currentMillis - lastLcdUpdateTime >= 500) {
    lastLcdUpdateTime = currentMillis;
    updateLcdDisplay();
  }

  // 6. Transmit Telemetry CSV (Every 1000 ms)
  if (currentMillis - lastSerialTelemetryTime >= 1000) {
    lastSerialTelemetryTime = currentMillis;
    sendSerialTelemetry();
  }
}
