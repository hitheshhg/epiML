# Chiguru Demo-Day Runbook & Graceful Degradation Protocol (Phase 7)

**Team:** TerraByte · YEN NOVA 1.0  
**Core Strategy:** 100% Kit Compliant. No camera in the device. The farmer's phone is the camera + remote control.  
**Golden Rule:** *"It worked this morning" is NEVER said. If anything hiccups, say: "Here is the fallback path we engineered for exactly this condition."*

---

## 1. The 90-Second Judging Arc (Strict Timeline)

* **[0:00 – 0:20] STORAGE (Spoilage Story — 20s):**
  - Show the physical unit in Mode 0. Explain coastal humidity rotting grain bags ($13.1\%$ loss from survey).
  - Exhale onto DHT22 #1 $\to$ Aeration fan kicks ON (`FAN ON: HUM>60%`).
  - Demonstrate dew-point math: `DEW CONDENSATION` warning triggers before grain sweats!
* **[0:20 – 0:55] GERMINATION (Phone Photo + CV Score — 35s — THE GASP):**
  - Tap button or tap phone screen $\to$ switches to Mode 1 (`[GER]`).
  - Show refusal: `VENT BLOCKED:OUTSIDE DAMP` (knows when NOT to act!).
  - **The Winning Hook:** *"The device is 100% kit — no camera in it. The phone is the farmer's own, like the eyes they already have. They photograph the tray; Chiguru does the agronomy."*
  - Farmer taps "Capture tray photo" on phone $\to$ 18/20 sprouts detected ($90\%$ emergence) $\to$ Fused **Germination Health Score of 92/100** appears on screen!
  - Brown seeds visibly boxed in red (100% rejection).
* **[0:55 – 1:20] FIELD (Submersible Pump Fires — 25s):**
  - Tap phone card $\to$ Arduino switches to Mode 2 (`[FLD]`) over wireless serial.
  - Pull probe out of wet soil $\to$ Submersible water pump fires real water into catch sponge!
  - Dip probe into water $\to$ Pump stops immediately (`PUMP OFF: M OK`).
  - Demonstrate disconnect safety: unplug wire $\to$ `SENSOR FAULT ACT OF`.
* **[1:20 – 1:30] THE CLOSE (10s):**
  - *"One device. Three crop stages. It tells you why."*
  - **"Everyone here monitors the soil. We monitor the seed."**

---

## 2. Equipment Pack List (Check Off Before Leaving for Hall)

- [ ] **Dual-rail Power Bank** (Logic) + USB Type-B cable for Arduino Uno.
- [ ] **4x AA Battery Pack** (Actuators: servos, fan, pump) sharing GND with Arduino.
- [ ] **Water can + glass cup** for soil moisture dipping test.
- [ ] **Submersible 5V micro-pump** with silicone vinyl tube + catch sponge.
- [ ] **2 Soil Trays:** One dry soil tray, one wet soil tray.
- [ ] **1 Live Moong Sprout Tray:** Pre-sown 24 hours prior with 18 green sprouts + 2 unsprouted seeds.
- [ ] **Farmer's Smartphone:** Pre-charged, hotspot configured (`ChiguruNet`), dashboard bookmarked.
- [ ] **Laptop:** Running `bridge.py` and `dashboard.py` locally.
- [ ] **Printed Documents:**
  - Laminated Quick-Start Cards (English & Kannada)
  - Printed BOM Cost Table (₹2,290)
  - Printed 10-Farmer Survey Table
  - Dated build-log photos (patent hygiene)
- [ ] **Backup screenshots** of dashboard on phone (in case laptop display dies).

---

## 3. Failure Mode Fallback Matrix (Never An Empty Screen)

| Subsystem Failure | What Breaks | Immediate Engineering Action | What You Say to Judges |
| :--- | :--- | :--- | :--- |
| **Arduino Power / USB Dies** | Hardware turns off mid-demo. | Laptop dashboard continues running seamlessly in auto-demo simulation. | *"Notice our dashboard's simulated playback mode: here is the pre-recorded telemetry stream captured during our field trial."* |
| **Laptop Screen Dies** | Laptop display goes dark. | Hand the physical device directly to the lead judge! | *"Chiguru was engineered offline-first: the entire decision engine runs standalone on the Arduino LCD without requiring any computer."* |
| **Live Photo Capture Fails** | Phone browser camera permissions blocked. | Click the "🧪 Load Fresh Moong Sprout Tray" demo simulation button on dashboard. | *"Here is the fallback path we built for exactly this: our cached high-resolution phenotyping frame runs the identical OpenCV pipeline locally."* |
| **Pump Doesn't Move Water** | Tube airlock or dry impeller. | Point to Arduino D13 LED and Relay coil LED lit bright red. | *"Notice the optocoupled transistor gate firing: in our production model, this triggers a commercial 12V solenoid valve, demonstrated here via circuit state."* |
| **Buzzer Doesn't Sound** | Wiring loose on pin A3. | Point to latched Red Status LED on pin A4 and LCD warning text. | *"Notice our dual-channel annunciation: the visual alarm latch triggers independently of acoustic alert channels."* |
