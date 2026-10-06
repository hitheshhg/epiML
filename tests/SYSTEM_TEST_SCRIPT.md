# Chiguru End-to-End System Integration Test Protocol (Phase 6)

**Duration:** ~45 Minutes  
**Target:** 100% Verification of Autonomous Hardware, Safety Interlocks, Vision Engine & Fallbacks.  

---

## Stage 1: Power-On Self-Test (POST) & Hardware Zeroing (5 Min)

| Step | Action | Expected Observable Result | Pass/Fail | Notes |
| :---: | :--- | :--- | :---: | :--- |
| **1.1** | Connect USB power to Uno. | Piezo buzzer emits two crisp 60ms beeps. LCD backlight turns ON. | [  ] | Verify no servo shudder. |
| **1.2** | Observe LCD Row 0 & 1 during first 2 seconds. | Row 0: `CHIGURU - v1.0` <br>Row 1: `TerraByte (YEN)` | [  ] | Text centered and clear. |
| **1.3** | Observe LCD Diagnostic Self-Test report. | Row 0: `D1:OK  D2:OK` <br>Row 1: `M:OK  GAS:OK` | [  ] | If any shows `ERR` or `NC`, check wiring. |
| **1.4** | Check actuator initial states. | Pump Relay OFF (LED unlit), Fan OFF, Buzzer silent, Servos at $0^\circ$. | [  ] | Active-LOW relay must NOT click on boot. |

---

## Stage 2: 3-Mode State Machine Traversal (10 Min)

| Step | Action | Expected Observable Result | Pass/Fail | Notes |
| :---: | :--- | :--- | :---: | :--- |
| **2.1** | Boot default is Mode 0 (Storage). | LCD: `[STG] T:xxC H:xx%` <br>Row 1: `G:xxx [SYS: OK]` | [  ] | MQ-135 baseline auto-calibrating. |
| **2.2** | Press D10 Mode Button once. | Buzzer gives 2 short chirps. LCD switches to: `[GER] M1:xx% M2:xx%` <br>Row 1: `T:xxC P:OF  V:0` | [  ] | Transition delay $< 80$ms. |
| **2.3** | Press D10 Mode Button again. | Buzzer gives 3 short chirps. LCD switches to: `[FLD] ZA:xx% ZB:xx%` <br>Row 1: `T:xxC P:--  F:--` | [  ] | Validates cyclic enum pointer. |
| **2.4** | Press D10 Mode Button a third time. | Buzzer gives 1 short chirp. LCD returns to: `[STG]`. | [  ] | 3-state circular wrap confirmed. |

---

## Stage 3: Closed-Loop Sensor Triggering & Safety Trips (15 Min)

| Step | Action | Expected Observable Result | Pass/Fail | Notes |
| :---: | :--- | :--- | :---: | :--- |
| **3.1** | In Mode 0 (Storage): Exhale warm, humid breath directly onto DHT22 #1. | Humidity climbs past 60% $\to$ DC Aeration Fan turns ON immediately. | [  ] | 2N2222 transistor switching verified. |
| **3.2** | Continue exhaling until Humidity $> 65\%$ or Temp $> 30^\circ\text{C}$. | Status LED turns ON solid. Buzzer pulses alarm pattern. | [  ] | Alarm threshold latching confirmed. |
| **3.3** | Wait 10 seconds without resetting. | Buzzer silences automatically after 10s timeout, but Status LED remains latched ON. | [  ] | Meets acoustic comfort requirement. |
| **3.4** | Switch to Mode 1 (Germination): Pull Soil Moisture Sensor 1 out of soil (dry air). | Moisture drops below 35% $\to$ Relay clicks ON, D13 LED turns ON, Pump starts. | [  ] | Closed-loop hydration activation. |
| **3.5** | Submerge Soil Probe in glass of water. | Moisture jumps $> 60\%$ $\to$ Relay clicks OFF, Pump stops immediately. | [  ] | Hysteresis upper-bound shutoff verified. |
| **3.6** | **Safety Trip Test:** Hold Soil Probe in dry air for $> 60$ seconds. | Pump automatically turns OFF at exactly 60 seconds; Alert flag raised on LCD. | [  ] | 60-second flood prevention safety trip! |
| **3.7** | **Disconnect Failsafe:** Unplug signal wire of Soil Probe. | Raw ADC goes to rail ($>1000$) $\to$ Pump is inhibited from turning ON. | [  ] | Sensor fault protection verified. |

---

## Stage 4: Telemetry Bridge, Dashboard & Camera CV (15 Min)

| Step | Action | Expected Observable Result | Pass/Fail | Notes |
| :---: | :--- | :--- | :---: | :--- |
| **4.1** | Connect USB to laptop. Start `bridge.py`. | Terminal prints: `[HH:MM:SS] [GERMINATION] T1:.. H1:.. M1:.. Pump:.. [OK]`. Telemetry logged to `data/log.csv`. | [  ] | Continuous 1Hz stream. |
| **4.2** | Launch `dashboard.py`. Project to screen. | Dashboard renders large dark theme UI. Shows `● ARDUINO LIVE`. Large green banner: `🛡️ ALL SYSTEMS NOMINAL`. | [  ] | 3-meter readability verified. |
| **4.3** | Click Language buttons: `ಕನ್ನಡ`, `ತುಳು`, `हिंदी`, `English`. | All labels, metrics, and banners translate instantaneously without reloading delay. | [  ] | Zero translation latency. |
| **4.4** | Click `🌱 Germination` card on dashboard. | Dashboard writes `M1` to `cmd.txt`; bridge transmits `M1\n`; Arduino beeps and LCD switches to Germination mode! | [  ] | Bi-directional IPC sync confirmed. |
| **4.5** | Run `python software/capture.py --demo`. | Captures synthetic nursery tray. Outputs: `Detected 18/20 Sprouts (90.0%)`. Rejects brown seeds in red boxes. | [  ] | Phenotyping CV verified. |
| **4.6** | **Serial Drop Recovery Test:** Unplug Arduino USB cable while dashboard is open. | Bridge enters auto-reconnect loop. Dashboard immediately transitions to `◐ OFFLINE DEMO SIMULATION` with realistic telemetry. | [  ] | **Screen NEVER goes blank or shows an error!** |
| **4.7** | Reconnect USB cable. | Bridge auto-detects COM port within 2 seconds, resumes live streaming; dashboard returns to `● ARDUINO LIVE`. | [  ] | Complete self-healing loop verified. |
