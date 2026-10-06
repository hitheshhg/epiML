# Chiguru 45-Minute End-to-End System Test Protocol (Phase 6)

**Team:** All Hands (Pavan, Hithesh, Vikas, Karthik)  
**Execution:** Run top to bottom on real hardware. Log every result. Fix and re-run until all green.

---

## The 12 Working Capabilities Test Matrix

| # | Working Capability | Test Procedure | Expected Observable Result | Status |
| :---: | :--- | :--- | :--- | :---: |
| **1** | **3-Mode Lifecycle** | Cycle modes via button D10 AND via phone dashboard card. | Arduino beeps, LCD line 0 reconfigures: `STG` $\to$ `GERM` $\to$ `FLD`. Actuators update within 2 seconds. | [  ] |
| **2** | **Explainable Decisions (X-CPS)** | Trigger actuators in each mode. | LCD line 2 always shows explicit reason: `PUMP ON WHY M1<35`, `FAN ON: HUM>60%`. | [  ] |
| **3** | **Automated Irrigation** | In Germination / Field mode, pull soil moisture probe into air. | Relay clicks, D13 LED turns ON, pump discharges water into catch tray. | [  ] |
| **4** | **"Do Not Irrigate" Refusal** | Dip soil moisture probe into water glass ($>60\%$). | Pump turns OFF immediately; LCD line 2 displays: `PUMP OFF: M OK`. | [  ] |
| **5** | **Vision Germination Score** | On phone dashboard, tap "Capture tray photo" or load Moong sprout tray. | Sprout count ($18/20$), $90\%$ emergence, and fused **Germination Health Score (92/100)** rendered. | [  ] |
| **6** | **Germination Failure Warning** | Exhale hot breath on DHT22 #2 ($>32^\circ\text{C}$). | Vent servo opens proportionally ($0^\circ \to 90^\circ$); alerts if thermal stress persists. | [  ] |
| **7** | **Dew-Point Condensation Warning** | In Storage mode, exhale humid breath onto DHT22 #1 until $(T_1 - T_{\text{dew}}) < 2^\circ\text{C}$. | LCD line 2 warns: `DEW CONDENSATION` before grain sweats! | [  ] |
| **8** | **Overwatering Detection** | Hold soil probe submerged in water for $>60$ seconds continuously. | Firmware flags saturation with no dry-down: `OVERWATER: NO PUMP` to prevent root rot. | [  ] |
| **9** | **Sensor Cross-Validation** | Unplug signal jumper from DHT22 #2 live during operation. | LCD line 0 detects drop: `DHT2 FAULT`; Actuators forced to safe state: `SENSOR FAULT ACT OF`. | [  ] |
| **10**| **Multilingual Farmer UI** | On phone browser, tap `EN`, `हिंदी`, `ಕನ್ನಡ`, `ತುಳು`. | Instantaneous translation of all mode cards, banners, and explainable decision strings. | [  ] |
| **11**| **Offline-First & Cable Resilience**| Unplug laptop USB serial cable while dashboard is live. | LCD continues operating standalone on battery; Dashboard auto-switches to mock simulation. Replug $\to$ resumes! | [  ] |
| **12**| **Storage Spoilage-Risk Watch**| Exhale on MQ135 sensor until raw reading exceeds $1.5\times \text{GAS\_BASE}$. | Buzzer sounds alarm pattern for 10s, then silences; Status LED stays latched; LCD: `ALRT: GAS > 1.5X`. | [  ] |

---

## Critical Power-Cycle Safety Re-Check (Step 13)

* **Action:** Cut main power and reconnect.
* **Pass Criterion:** Water pump must **NOT** pulse, twitch, or pump water during bootloader startup.
* **Verification:** `digitalWrite(RELAY, HIGH)` must remain latched throughout the boot self-test.
