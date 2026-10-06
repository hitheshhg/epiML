# Chiguru Bench-Test Script & Observable Acceptance Matrix (Phase 2)

**Tester:** Pavan HP (Lead / Firmware)  
**Equipment Needed:** Glass of water, paper cup of dry sand/soil, straw or breath on sensor.  
**Acceptance Standard:** Every actuator fires on demand; unplugging a sensor triggers a safe state.

---

## Step-by-Step Bench Verification

| Step | Mode | Physical Action | Expected Hardware Action | Expected LCD Display (Row 0 & 1) | Pass/Fail |
| :---: | :---: | :--- | :--- | :--- | :---: |
| **B-1** | STORAGE (0) | Idle in room air | Fan OFF, Buzzer OFF, LED OFF | `[STG] T:28C H:58%`<br>`G:112  [SYS: OK]` | [  ] |
| **B-2** | STORAGE (0) | Exhale humid breath gently across DHT22 #1 | Relative humidity exceeds 60% $\to$ DC Aeration Fan spins up immediately | `[STG] T:30C H:62%`<br>`G:114  [SYS: OK]` | [  ] |
| **B-3** | STORAGE (0) | Exhale deeply or bring alcohol swab near MQ-135 | Gas reading surges past baseline threshold $\to$ Buzzer alarm pulses, Status LED turns ON | `[STG] T:30C H:68%`<br>`G:245  [ALRT:GAS]` | [  ] |
| **B-4** | STORAGE (0) | Wait 10 seconds without resetting | Buzzer silences automatically; Status LED remains latched ON | `[STG] T:29C H:67%`<br>`G:210  [ALRT:GAS]` | [  ] |
| **B-5** | GERMINATION (1) | Press D10 button to enter Germination mode | 2 beeps sound; Mode switches; LCD updates | `[GER] M1: 0% M2: 0%`<br>`T:28C P:ON* V:0 ` | [  ] |
| **B-6** | GERMINATION (1) | Dip Soil Sensor 1 probe into glass of water | Moisture climbs past 60% $\to$ Water pump clicks OFF; Relay LED unlit | `[GER] M1:78% M2: 0%`<br>`T:28C P:OF  V:0 ` | [  ] |
| **B-7** | GERMINATION (1) | Pull probe out of water into dry air | Moisture falls $< 35\%$ $\to$ Relay clicks ON; Pump initiates watering | `[GER] M1:12% M2: 0%`<br>`T:28C P:ON* V:0 ` | [  ] |
| **B-8** | GERMINATION (1) | Warm DHT22 #2 gently past 32°C (hair dryer or warm palm) | Vent Servo #1 horn rotates proportionally toward 90° | `[GER] M1:75% M2: 0%`<br>`T:35C P:OF  V:45` | [  ] |
| **B-9** | FIELD (2) | Press D10 button to enter Field mode | 3 beeps sound; Both Zone A & Zone B moisture monitored | `[FLD] ZA:76% ZB: 0%`<br>`T:28C P:ON  F:--` | [  ] |
| **B-10** | FIELD (2) | Warm DHT22 #2 past 33°C | Canopy cooling fan kicks ON | `[FLD] ZA:76% ZB:72%`<br>`T:34C P:--  F:ON` | [  ] |
| **B-11** | FAULT TRIP | Unplug Soil Sensor 1 signal jumper (Simulate broken wire) | Raw ADC reads $>1000$; Pump immediately turns OFF; Alert triggered | `[GER] M1: 0% M2: 0%`<br>`T:28C P:OF  V:0 ` | [  ] |
| **B-12** | TIMEOUT TRIP | Leave probe in air for $> 60$ seconds | Pump trips OFF at exactly 60.0s mark (flood prevention) | Pump locks OFF until reset or cooldown | [  ] |
