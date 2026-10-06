# Chiguru 10-Point Pre-Judging Mission Checklist (Phase 5)

**Execution Time:** Exactly 15 minutes before the judging panel arrives.  
**Rule:** Every item must be physically checked and initialed. No assumptions.

---

| # | Check Item | Verification Action | Pass Criteria | Initial |
| :---: | :--- | :--- | :--- | :---: |
| **1** | **Power Supply Integrity** | Connect 9V / USB power. Check Arduino 5V rail with multimeter or verify steady power LED. | 5.0V $\pm 0.25$V; no flickering or dimming when servos twitch. | [  ] |
| **2** | **Boot Self-Test Sequence** | Press reset button on Arduino Uno. Observe 16x2 LCD boot splash. | Screen displays "CHIGURU v1.0", buzzer chimes twice, all sensor self-tests read `OK`. | [  ] |
| **3** | **Mode Button Responsiveness** | Press D10 button 3 times: `0 -> 1 -> 2 -> 0`. | Beeps 1, 2, then 3 times. LCD changes headers: `[STG]`, `[GER]`, `[FLD]`. | [  ] |
| **4** | **Actuator Zero State** | Confirm that pump, fan, and buzzer are completely silent on startup. | Zero false triggering of water pump or fan during initial boot. | [  ] |
| **5** | **Laptop Serial Bridge Connection** | Run `python software/bridge.py`. Inspect terminal stdout. | Continuous clean CSV stream received at 115200 baud; green `OK` status printed. | [  ] |
| **6** | **Judging Dashboard Launch** | Launch `streamlit run software/dashboard.py`. Project onto large display. | Big dark-mode UI visible from 3 meters; toggle through EN, HI, KN, TU to confirm instant language switch. | [  ] |
| **7** | **Phone Hotspot & IP Webcam** | Turn on phone mobile hotspot. Connect laptop. Launch IP Webcam app. | Video feed accessible at `http://192.168.43.1:8080/shot.jpg`. Mount phone securely on tripod/bracket over tray. | [  ] |
| **8** | **Computer Vision Live Verification** | Run `python software/capture.py --once`. | Detects seedlings with green bounding boxes; ignores brown seeds; writes count to `data/germination.csv`. | [  ] |
| **9** | **Physical Demo Props Staged** | Inspect tray setup: Real soil tray with pre-sprouted seedlings, small water reservoir with pump submerged, cup of dry soil for probe demo. | No water leaks; tubing firmly inserted into soil tray; soil probes dry and clean. | [  ] |
| **10** | **Fail-Safe Fallback Armed** | Confirm that if the serial cable is pulled, the dashboard seamlessly displays plausible mock data without crashing or showing an error screen. | Disconnect test: Dashboard switches smoothly to simulated mode with no ugly Python tracebacks. | [  ] |
