# Chiguru Sensor Metrology & Calibration Guide (Phase 6)

**Purpose:** Field-tune analog sensor conversion constants before live judging demonstration to account for local soil salinity, atmospheric humidity, and hackathon hall air quality.

---

## 1. Soil Moisture Probe Calibration Procedure

Soil moisture sensors output an analog voltage proportional to dielectric permittivity / resistance between probe prongs. Because soil minerals and trace salts vary across geographical regions (coastal Karnataka laterite soil has high iron and aluminum content), calibration must be performed using local soil.

### Step-by-Step Tuning:
1. **Air Calibration (Dry Zero Point):**
   - Clean probe prongs thoroughly with a dry tissue.
   - Hold sensor in dry open air.
   - Open Arduino Serial Monitor at 115200 baud.
   - Note the raw ADC value printed (field index 5 or 6).
   - Expected Dry ADC: **$800 \sim 860$**.
   - Set constant in `Chiguru.ino`:
     ```cpp
     const int SOIL_RAW_DRY = 820; // Update with observed dry value
     ```

2. **Saturation Calibration (100% Water Point):**
   - Submerge probe prongs completely into a cup of tap water up to the white indicator line.
   - Wait 5 seconds for readings to stabilize.
   - Note the raw ADC value printed.
   - Expected Wet ADC: **$260 \sim 320$**.
   - Set constant in `Chiguru.ino`:
     ```cpp
     const int SOIL_RAW_WET = 290; // Update with observed wet value
     ```

3. **Field Normalization Verification:**
   - Insert probe into damp potting soil.
   - Observe LCD: Value should read between $40\%$ and $65\%$.
   - Pull probe out of soil: Value should drop to $0\%$ within 2 seconds.

---

## 2. MQ-135 Gas Sensor Baseline Procedure

The MQ-135 utilizes a heated Tin Dioxide ($\text{SnO}_2$) ceramic substrate. In clean air, its electrical conductivity is low; in the presence of reducing gases (ammonia, carbon dioxide, ethanol vapor from decaying grains), conductivity surges.

### Pre-Judging Warm-Up:
1. **Heater Thermal Stabilization:**
   - Power the Arduino at least **5 to 10 minutes** before judging.
   - Touch the MQ-135 metal cap: It should feel gently warm to the touch (indicating normal operation of the internal 5V heating coil).
2. **Dynamic Auto-Zeroing Baseline:**
   - `Chiguru.ino` samples the first 20 readings upon boot and computes dynamic baseline average:
     $$G_0 = \frac{1}{20}\sum_{i=1}^{20} \text{ADC}_i$$
   - In a typical hackathon room, clean ambient air yields an ADC reading between **$90 \sim 140$**.
3. **Threshold Calibration:**
   - Alarm is triggered when: $\text{ADC}_{\text{current}} \ge 1.5 \times G_0$.
   - If ambient hall is crowded with high $CO_2$, power-cycle the board or recalibrate baseline so false alarms are avoided during quiet judging moments.

---

## 3. Micro-Servo SG90 Mechanical Calibration

1. **Vent Servo (Pin D5):**
   - Ensure the horn is attached such that when `targetAngle = 0`, the ventilation flap is flush and completely sealed over the nursery box duct.
   - Test full stroke at $90^\circ$: The flap should stand perpendicular, permitting maximum convective airflow.
2. **Cover Servo (Pin D6):**
   - At $0^\circ$, canopy shield rests stowed flat.
   - At $90^\circ$, canopy swings over seedling tray to simulate dark germination cycle.

---

## 4. Quick Constant Modification Cheat Sheet (Top of `Chiguru.ino`)

```cpp
// ==========================================
// CALIBRATION & TUNING CONSTANTS
// ==========================================
const int SOIL_RAW_DRY = 820;    // Adjust if open-air reads differently
const int SOIL_RAW_WET = 290;    // Adjust if water cup reads differently
const int SOIL_DISCONNECT_MIN = 50;   // Noise floor
const int SOIL_DISCONNECT_MAX = 1000; // Open circuit pull-up clamp

const float STORAGE_TEMP_ALERT = 30.0;     // deg C (Coastal Karnataka ambient ~29-32C)
const float STORAGE_HUMID_ALERT = 65.0;    // % RH (Silo mold threshold)
const float STORAGE_FAN_HUMID = 60.0;      // % RH (Aeration fan kicks in)
const float GERM_TEMP_VENT = 32.0;         // deg C (Vent servo starts opening)
const float FIELD_TEMP_FAN = 33.0;         // deg C (Field cooling fan)

const int MOISTURE_PUMP_ON_THRESH = 35;    // % Start irrigation
const int MOISTURE_PUMP_OFF_THRESH = 60;   // % Stop irrigation
```
