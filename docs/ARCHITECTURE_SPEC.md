# Chiguru (ಚಿಗುರು) — Frozen Architecture Specification (Phase 0)

**Project:** Chiguru — Single Arduino-Based Full-Lifecycle Agri-Monitoring System  
**Tagline:** *"One device. Three crop stages. It tells you why."*  
**Event:** YEN NOVA 1.0 (Yenepoya Institute of Technology, Moodbidri)  
**Team:** TerraByte (Pavan HP, Hithesh HG, Vikas KH, Karthik V)  
**Status:** ARCHITECTURE FROZEN — NO AMBIGUITY SURVIVES  

---

## 0. Dual Crop Strategy & Validation Model

* **Live Demo Crop: Moong / Green Gram (*Vigna radiata*):**
  - **Purpose:** 24–48 hour rapid emergence cycle for live stage judging demonstration.
  - **Action:** Trays pre-sown 24 hours prior; visible cotyledons and sprouts guaranteed for the camera CV module on judging day.
* **Research & Paper Target Crop: Maize (*Zea mays*):**
  - **Purpose:** Rigorous IEEE paper and patent validation.
  - **Characteristics:** Discrete countable seeds, well-documented base temperature threshold ($10^\circ\text{C}$), strict seed bank moisture respiration curves, and commercially critical crop in Karnataka.

---

## 0.1. Explainable Cyber-Physical Decision Engine (X-CPS)

The core architectural innovation distinguishing Chiguru from hobbyist threshold switches is **Explainable Decisions and Refusal Autonomy**:
> *The system must display measurement $\to$ reason $\to$ action, including "know when not to act" refusals.*

| Subsystem / Actuator | State | Physical Trigger Condition | LCD Explainable Reason String | Causal Justification |
| :--- | :---: | :--- | :--- | :--- |
| **Storage Fan** | **ACT** | $\text{Humidity}_1 > 60\%$ | `FAN ON: HUM>60%` | Aeration prevents moisture stagnation and mold spores. |
| **Storage Fan** | **REFUSE**| $\text{Humidity}_1 \le 60\%$ | `AIR OK: FAN OFF` | Quiescent air preserves seed grain equilibrium moisture. |
| **Nursery Pump** | **ACT** | $\text{Moisture} < 35\%$ | `PUMP ON: M1<35%` | Replenish sub-surface root zone hydration. |
| **Nursery Pump** | **REFUSE**| In 30s forced thermal cooldown | `PUMP BLK: COOLDWN` | Prevent motor driver overheating and soil waterlogging. |
| **Nursery Pump** | **REFUSE**| Soil probe disconnected ($>1000$ raw) | `FAULT: SENS ACT OF` | Fail-safe: broken wire must never flood seed tray. |
| **Ventilation Servo**| **ACT** | $\text{Temp}_2 > 32^\circ\text{C}$ & outside drier | `VENT ON: T2>32C` | Proportional thermal relief for emergent shoots. |
| **Ventilation Servo**| **REFUSE**| Outside air is humid ($\text{Hum}_1 > \text{Hum}_2 + 8\%$) | `VENT BLK: AMB DAMP` | **High Innovation:** Opening vent would suck wet air in and induce fungal rot! |
| **Field Fan** | **ACT** | Canopy $\text{Temp}_2 > 33^\circ\text{C}$ | `FAN ON: T2>33C` | Mitigate transpiration shutdown and heat stress. |

---

## 1. The 3-Mode State Machine

The system cycles cyclically via a single debounced tactile button on pin `D10`:
$$\text{MODE 0 (STORAGE)} \longrightarrow \text{MODE 1 (GERMINATION)} \longrightarrow \text{MODE 2 (FIELD)} \longrightarrow \text{MODE 0}$$

### Mode 0: STORAGE (Pre-Sowing Seed Bank & Post-Harvest Grain Silo)
* **Goal:** Detect moisture buildup, mold risk, and anaerobic grain respiration; prevent rot.
* **Sensors Sampled:** DHT22 #1 (Ambient Temp & Relative Humidity), MQ-135 (Spoilage Gas/Ammonia/CO2/Ethanol).
* **Live Actuators:**
  - DC Aeration Fan (Pin A5 via 2N2222 transistor) triggers when $\text{Humidity} > 60\%$ to circulate air.
  - Piezo Buzzer (Pin A3) pulses alarm pattern (3 short beeps) if $\text{Temp} > 30^\circ\text{C}$, $\text{Humidity} > 65\%$, or $\text{Gas} > 1.5\times \text{baseline}$. Silences after 10 seconds of continuous sounding.
  - Status LED (Pin A4) stays latched ON until environment recovers.
* **16x2 LCD Layout (No I2C, 4-bit parallel):**
  ```
  Line 1: [STG] T:28C H:58%
  Line 2: G:112  [STATUS:OK]
  ```
  *(On Alert: `Line 2: G:240 [ALRT:MOLD]`)*

---

### Mode 1: GERMINATION (Active Seedling Nursery & Emergence Stage)
* **Goal:** Maintain precise microclimate for seedling sprouting; automate sub-surface misting/irrigation; optical phenotyping via external camera.
* **Sensors Sampled:** DHT22 #2 (Germination Tray Microclimate), Soil Moisture Sensors #1 & #2 (Analog A0 & A1).
* **Live Actuators:**
  - Water Pump Relay (Pin D13): ON when $\text{Avg Soil Moisture} < 35\%$, OFF when $\ge 60\%$.
  - Safety Clamps: Maximum run time 60 seconds followed by mandatory 120-second cooldown. Failsafe: Pump forced OFF if sensor disconnected ($\text{Raw} < 50$ or $> 1000$).
  - Vent Servo #1 (Pin D5 PWM): Proportional aperture opening when $\text{Temp} > 32^\circ\text{C}$ ($0^\circ \text{ at } 32^\circ\text{C} \to 90^\circ \text{ at } 38^\circ\text{C}$).
  - Cover Servo #2 (Pin D6 PWM): Available for manual light-shield toggle / darkness cycle demo.
  - Vision Integration: External Phone Camera stream captured via IP Webcam (`capture.py`), scoring green cotyledon emergence percentage against total seed count.
* **16x2 LCD Layout:**
  ```
  Line 1: [GER] M1:42% M2:39%
  Line 2: T:31C P:OFF V:0
  ```
  *(When Pumping: `Line 2: T:31C P:ON* V:45`)*

---

### Mode 2: FIELD (Active Vegetative Growth & Root-Zone Irrigation)
* **Goal:** Dynamic dual-zone soil irrigation and heat-stress mitigation.
* **Sensors Sampled:** Soil Moisture #1 (Zone A), Soil Moisture #2 (Zone B), DHT22 #2 (Field Canopy Temp/Humidity).
* **Live Actuators:**
  - Water Pump (Pin D13): Dispatches water pulse when root moisture falls below threshold ($< 35\%$).
  - Cooling DC Fan (Pin A5): Turns ON when canopy temperature exceeds $33^\circ\text{C}$ to combat thermal transpiration stress.
* **16x2 LCD Layout:**
  ```
  Line 1: [FLD] ZA:32% ZB:48%
  Line 2: T:34C P:ON* F:ON
  ```

---

## 2. Standardized CSV Telemetry Specification

The Arduino continuously emits 1 line of ASCII CSV per second over Serial UART (`115200 baud, 8N1`):

```text
FORMAT: MODE,T1,H1,T2,H2,M1,M2,GAS,PUMP,FAN,ALERT\r\n
```

### Field Definitions:
| Index | Field | Data Type | Units / Range | Description |
| :---: | :--- | :--- | :--- | :--- |
| 0 | `MODE` | Integer | `0, 1, 2` | 0=STORAGE, 1=GERMINATION, 2=FIELD |
| 1 | `T1` | Float | `°C` (-40.0 to 80.0) | Temperature from DHT22 #1 (Storage) |
| 2 | `H1` | Float | `%` (0.0 to 100.0) | Relative Humidity from DHT22 #1 |
| 3 | `T2` | Float | `°C` (-40.0 to 80.0) | Temperature from DHT22 #2 (Germination/Field) |
| 4 | `H2` | Float | `%` (0.0 to 100.0) | Relative Humidity from DHT22 #2 |
| 5 | `M1` | Integer | `%` (0 to 100) | Calibrated moisture percentage for Sensor 1 |
| 6 | `M2` | Integer | `%` (0 to 100) | Calibrated moisture percentage for Sensor 2 |
| 7 | `GAS` | Integer | Raw ADC (0 to 1023) | Analog reading from MQ-135 sensor |
| 8 | `PUMP` | Integer | `0` or `1` | Relay state: 0=OFF, 1=ON |
| 9 | `FAN` | Integer | `0` or `1` | DC Fan state: 0=OFF, 1=ON |
| 10 | `ALERT` | Integer | `0` or `1` | System alert latch: 0=Nominal, 1=Alarm |

**Example Nominal Line:**
`1,28.4,62.1,30.2,74.5,42,40,115,0,0,0`

**Example Alert Line (Storage Spoilage):**
`0,34.2,78.0,0.0,0.0,0,0,380,0,1,1`

---

## 3. Sensor Calibration Checklist & Baseline Formulas

1. **Soil Moisture Calibration (Per Sensor #1 & #2):**
   - Measure open air (Dry): Record $\text{RAW}_{\text{dry}} \approx 820 \pm 40$.
   - Immerse in saturated wet soil (Wet): Record $\text{RAW}_{\text{wet}} \approx 280 \pm 30$.
   - Formula:
     $$\text{Moisture \%} = \text{constrain}\left(\frac{\text{RAW}_{\text{dry}} - \text{RAW}_{\text{current}}}{\text{RAW}_{\text{dry}} - \text{RAW}_{\text{wet}}} \times 100, 0, 100\right)$$
   - Disconnect Fault: $\text{RAW} > 1000$ or $\text{RAW} < 50 \implies \text{Error Flag}$.

2. **MQ-135 Gas Sensor Baseline:**
   - 60-second rolling sample window at boot in ambient air.
   - Dynamic baseline $G_0 = \frac{1}{N}\sum_{i=1}^{N} \text{ADC}_i$.
   - Spoilage condition triggered if $\text{ADC}_{\text{current}} \ge 1.5 \times G_0$.

3. **Micro-Servo SG90 Calibration:**
   - Vent Servo #1: $0^\circ = \text{Fully Closed (Retracted)}$, $90^\circ = \text{Full Ventilation Open}$.
   - Cover Servo #2: $0^\circ = \text{Cover Stowed}$, $90^\circ = \text{Dark Germination Canopy Deployed}$.
   - Software safeguard: Detach PWM pulse output when stationary to prevent servo hum and thermal sag.

---

## 4. Top 5 Demo-Day Risks & One-Line Mitigations

1. **Risk:** Arduino reboots on stage when the water pump relay or servos kick in.  
   **Mitigation:** Power Arduino Uno logic via USB laptop connection; power pump, fan, and servos from dedicated battery/rail with 470µF smoothing capacitor.
2. **Risk:** Venue Wi-Fi blocks phone IP Webcam or assigns shifting IP addresses.  
   **Mitigation:** Phone creates a standalone Wi-Fi hotspot with laptop connected directly; IP address fixed to `192.168.43.1:8080`.
3. **Risk:** Serial cable unplugs or COM port drops during the live judging presentation.  
   **Mitigation:** Python `bridge.py` contains automated auto-reconnect loop; `dashboard.py` has armed `DEMO_MODE=auto` that renders seamless simulated live data if serial drops.
4. **Risk:** Ambient stage lighting washes out seedling colors, corrupting computer vision.  
   **Mitigation:** `capture.py` uses Excess Green Index ($ExG = 2G - R - B$) plus HSV saturation masking rather than plain RGB thresholding.
5. **Risk:** Soil moisture probe shorts in water glass, causing continuous pump flood.  
   **Mitigation:** Hardcoded 60-second maximum run timer and sensor sanity check ($>1000$ / $<50$) shuts pump down instantly.

---

## 5. Patent & Intellectual Property Notice

* **Novelty Claim 1:** Single-microcontroller reconfigurable multi-epoch agri-state machine architecture transitioning across Pre-Sowing, Emergence, and Vegetative Growth stages without hardware rewiring.
* **Novelty Claim 2:** Fused optical phenotyping (non-contact emergence scoring) with closed-loop microclimate actuation (adaptive proportional ventilation and soil hydration) under a sub-₹3,000 BOM constraint.
* **Novelty Claim 3:** Dual-sensor fault-tolerant comparative hydration monitoring with automatic disconnect shutdown and regional linguistic display translation.
* **IP Hygiene Action:** Complete date-stamped git commit log, signed engineering build log, and research paper pre-print draft archived before public competition floor demonstration to maintain priority date under Indian Patent Office (IPO) provisional filing rules.
