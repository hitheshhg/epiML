# Chiguru Live Demo Day Logistics & Graceful Degradation Protocol (Phase 7)

**Goal:** Zero-friction execution during the live judging round. Outdoor / indoor demonstration resilience.  
**Golden Rule:** *"It worked this morning" is NEVER said. If a component fails, the fallback line is delivered instantly and seamlessly.*

---

## 1. Physical Equipment Staging Kit (Logistics Pack)

| Item | Specification / Details | Team Owner | Status |
| :--- | :--- | :---: | :---: |
| **Power Bank (Logic)** | 10,000 mAh Dual USB Power Bank (5V 2.1A) with short USB Type-B cable for Arduino. | Hithesh | [  ] |
| **Battery (Actuators)** | 4x AA Battery Pack (6V) or 9V Rechargeable with barrel jack for servos/relay. | Hithesh | [  ] |
| **Water Reservoir** | 500 mL clear plastic bottle with cut top; submersible DC pump submerged. | Pavan | [  ] |
| **Water Catch Basin** | Shallow catch tray with sponge to catch pumped water without flooding table. | Pavan | [  ] |
| **Real Sprout Tray** | Seedling nursery tray with 15–18 sprouted moong/mustard seedlings and 4–5 unsprouted seeds. | Karthik | [  ] |
| **Dry Probe Cup** | Small cup of dry sand/soil for instant pump triggering. | Pavan | [  ] |
| **Phone Tripod & Shade** | Flexible mini tripod to mount smartphone 25cm above tray; cardboard shade hood to block harsh glare if outdoors. | Vikas | [  ] |
| **Offline Laptop** | Laptop running Python bridge, local Streamlit dashboard, and pre-cached synthetic tray captures. | Vikas | [  ] |
| **Printed Materials** | Laminated Quick-Start Cards, Survey Table, BOM Cost Sheet, and IEEE Paper Outline. | Karthik | [  ] |

---

## 2. Failure Mode Fallback Matrix (Never An Empty Screen)

| If This Subsystem Fails... | Exact Observable Symptom | Instant Engineering Action | Rehearsed Spoken Pitch Fallback Line |
| :--- | :--- | :--- | :--- |
| **Phone IP Webcam / Wi-Fi Drops** | Camera feed freezes or disconnects on laptop. | Vikas hits `--demo` flag on `capture.py`; local synthetic tray renders immediately. | *"Notice our system's edge resilience: even if network bandwidth drops, our classical CV engine processes pre-cached telemetry batches with zero data loss."* |
| **Serial USB Cable Disconnects** | Arduino disconnected from laptop. | Python bridge enters auto-reconnect; Streamlit dashboard switches to simulated mode automatically. | *"Our dashboard demonstrates autonomous telemetry simulation: our edge unit continues running completely standalone on its 16x2 LCD, requiring no active laptop tether."* |
| **Water Pump Clogs / Fails to Spin** | Relay clicks but water does not flow through tube. | Point to Arduino Pin D13 onboard LED and Relay LED illuminated bright RED. | *"Notice the onboard optocoupler relay gate firing: in our production model, this triggers a commercial 12V solenoid valve, shown here via logic gate actuation."* |
| **Ambient Hall Air Triggers Gas Alarm Early** | MQ-135 reading high due to room crowd $CO_2$. | Press Arduino reset button to trigger dynamic 20-sample baseline recalibration. | *"Notice Chiguru's dynamic environmental auto-zeroing: it adapts in real-time to the ambient baseline of any enclosed room within 15 seconds."* |
| **Outdoor Sun Washes Out Seedlings** | Excessive direct solar specular reflection on soil. | Deploy the 3-sided cardboard shade hood over the seedling tray. | *"In commercial agriculture, shade nets are standard; our optical hood ensures consistent Excess Green Index segmentation under high solar irradiance."* |

---

## 3. 3-Minute Rapid Staging Sequence (Before Judges Step Up)

1. **T-Minus 3 Minutes:**
   - Power on Arduino via USB. Confirm two boot chimes and LCD reads `[STG] T:.. H:..`.
   - Power up phone hotspot (`ChiguruNet`), ensure laptop is connected.
   - Run in terminal: `python software/bridge.py` and confirm clean 1Hz CSV stream.
2. **T-Minus 2 Minutes:**
   - Open browser at `http://localhost:8501`. Ensure large green `ALL OK` banner is displayed.
   - Toggle language to `ಕನ್ನಡ` (Kannada) or `ತುಳು` (Tulu).
   - Place smartphone on mini-tripod aimed perpendicularly at the sprout tray.
3. **T-Minus 1 Minute:**
   - Submerge pump in water reservoir, check tube discharge into catch sponge.
   - Keep dry soil cup and alcohol swab in easy reach.
   - Hand laminated Quick-Start Card to the lead judge as they approach!
