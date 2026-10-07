# 🌱 epiML — AI Crop Experiment Lab

> **"One Arduino. Three biological epochs. AI-designed protocols. Deterministic control. Scientist-grade evidence."**  
> Autonomous Agricultural Experimentation & Nursery Control Platform

---

### Project Overview
* **Event:** YEN NOVA 1.0 (Yenepoya Institute of Technology, Dept. of ECE, Moodbidri, Mangalore)
* **Team:** **TerraByte**
  - **Pavan HP** (Lead — Firmware, Integration, Judging Demo)
  - **Hithesh HG** (Hardware Wiring, Power Decoupling, Enclosure)
  - **Vikas KH** (Laptop Software: Dashboard, Serial Bridge, Phone Camera CV)
  - **Karthik V** (Documentation, Farmer Survey, Regional Language, Pitch & IEEE Paper)
* **Official Problem Statement:**  
  *"Design a single Arduino-based Agri-monitoring unit that ensures healthy seed germination through real-time environment tracking, automates field irrigation based on soil moisture, and prevents post-harvest grain spoilage through storage condition monitoring addressing pre-sowing, active growth, and post-harvest stages of a crop's lifecycle within one device."*
* **Crop Strategy:**
  - **Live Demo Crop:** Moong / Green Gram (*Vigna radiata*) — 24–48h fast emergence for live stage verification.
  - **Research Target Crop:** Maize (*Zea mays*) — documented thermal emergence models and discrete countable seeds for IEEE manuscript.

---

## 🚀 Key Innovations & Competitive Differentiators

1. **Explainable Cyber-Physical Decision Engine (X-CPS):**
   Unlike blind threshold relays, every action AND refusal displays its causal reason on-screen (e.g., `PUMP ON: M1<35%`, `VENT BLOCKED: OUTSIDE DAMP`, `FAULT: SENS ACT OF`). It is intelligent enough to **know when not to act**!
2. **Full 3-Epoch Lifecycle Continuity in One Device:**
   Transitions dynamically across **Mode 0: Storage**, **Mode 1: Germination**, and **Mode 2: Field** via a single debounced button with zero rewiring.
3. **Phone-Camera Seed Emergence Phenotyping:**
   Non-contact edge computer vision engine using the Excess Green Index ($ExG = 2G - R - B$) fused with HSV chromaticity filtering to score seedling emergence and achieve **100% rejection of brown unsprouted seeds**.
4. **Hyper-Localized Multilingual Human-Machine Interface:**
   High-contrast offline tablet dashboard supporting **English, Hindi, Kannada (ಕನ್ನಡ), and Coastal Karnataka Tulu (ತುಳು)**.
5. **Scientifically Defensible Architecture:**
   Includes the rigorous [`judging/HONEST_QA.md`](file:///c:/Users/gurud/OneDrive/Desktop/terrabyte/judging/HONEST_QA.md) guide covering the 5 hardest PhD judge questions with truthful, unassailable answers.
6. **Sub-₹3,000 Economic Target:**
   Total prototype Bill of Materials is **₹2,290**, scaling to **₹1,372** in mass production with a 45-day farmer ROI.

---

## 📂 Repository Directory Layout

```
terrabyte/
├── firmware/
│   └── epiML/
│       └── epiML.ino               # Full non-blocking Arduino Uno firmware (Real-time AQI, VPD, Temp, Humid, Soil)
├── software/
│   ├── bridge.py                   # Auto-reconnecting PySerial to CSV/Socket bridge
│   ├── dashboard.py                # Mobile-friendly 4-language offline Streamlit UI (Phone Remote)
│   ├── germination_cv.py           # Classical CV germination phenotyping & Health Score module
│   ├── capture.py                  # Standalone CLI capture tool
│   ├── LANG.json                   # EN, HI, KN, TU agricultural dictionary
│   ├── requirements.txt            # Python dependencies (pyserial, streamlit, opencv, etc.)
│   └── data/                       # Telemetry logs, latest state, and CV benchmarks
├── hardware/
│   ├── WIRING_SCHEMATIC.md         # Full pinout, transistor driver & transient decoupling
│   ├── ENCLOSURE.md                # 3mm chassis cut sheet, thermal zoning & port layout
│   ├── LABELS.md                   # Print-ready badges, legend plate & quick-start cards
│   └── CHECKLIST.md                # 10-point pre-judging mission checklist
├── tests/
│   ├── SYSTEM_TEST_SCRIPT.md       # 45-minute end-to-end integration test protocol (12 capabilities)
│   ├── BENCH_TEST.md               # Step-by-step sensor/actuator bench verification script
│   ├── CALIBRATION_GUIDE.md        # Soil moisture and MQ-135 tuning guide
│   └── BUG_LOG_TEMPLATE.md         # Demo-day bug tracking template
├── judging/
│   ├── SURVEY.md                   # 5-question farmer survey (EN/KN/TU) & field data
│   ├── MARKET.md                   # Market gap, competitive matrix, BOM costing & ROI
│   ├── HONEST_QA.md                # The 5 hardest PhD judge questions with truthful answers
│   ├── PAPER_OUTLINE.md            # IEEE Transactions style research paper draft
│   ├── PITCH.md                    # Timed 4-minute pitch & 90-sec live stage arc
│   └── DEMO_PLAN.md                # Outdoor logistics & graceful degradation matrix
└── docs/
    └── ARCHITECTURE_SPEC.md        # Frozen Phase 0 architectural specification
```

---

## ⚡ Quick Start Guide

### 1. Flash Arduino Firmware
1. Open [`firmware/epiML/epiML.ino`](file:///c:/Users/gurud/OneDrive/Desktop/terrabyte/firmware/epiML/epiML.ino) in the Arduino IDE.
2. Select **Board: Arduino Uno** and your COM port.
3. Click **Upload**. On boot, observe LCD splash screen and diagnostic sensor self-test.

### 2. Launch Software Suite on Laptop
```bash
# 1. Install dependencies
pip install -r software/requirements.txt

# 2. Start the serial telemetry bridge (Terminal 1)
python software/bridge.py --port auto

# 3. Launch the mobile-ready dashboard (Terminal 2)
streamlit run software/dashboard.py
```

### 3. Connect Farmer's Phone
1. Turn on laptop Wi-Fi hotspot (`ChiguruNet`) and connect phone.
2. Open the Network URL displayed by Streamlit (e.g., `http://192.168.137.1:8501`) on your phone browser.
3. **Test Remote Control:** Tap `Storage`, `Germination`, or `Field` on the phone screen $\to$ Arduino LCD switches mode within 1 second!
4. **Test Tray Photo Phenotyping:** In Germination mode, tap *"📷 Capture Tray Photo"* and photograph your sprout tray $\to$ OpenCV detects sprouts, rejects brown seeds in red boxes, and calculates the **Germination Health Score (0–100%)**!

---

## 🏆 The 90-Second Judging Arc
* **0:00 – 0:20 (Storage):** Exhale on DHT22/MQ-135 $\to$ Aeration fan triggers $\to$ `DEW CONDENSATION` & gas alert latch $\to$ Auto-silences after 10s.
* **0:20 – 0:55 (Germination):** Tap phone screen $\to$ Arduino switches mode $\to$ `VENT BLOCKED:OUTSIDE DAMP` refusal demonstrated $\to$ Snap tray photo on phone $\to$ 18/20 sprouts ($90\%$) detected + **Germination Health Score of 92/100** appears on screen!
* **0:55 – 1:20 (Field):** Tap phone card $\to$ Pull soil probe $\to$ Submersible water pump discharges real water $\to$ Dip probe in water $\to$ Pump stops immediately $\to$ Unplug wire $\to$ Disconnect safety trip verified.
* **1:20 – 1:30 (Close):** *"One device. Three crop stages. It tells you why. Everyone here monitors the soil. We monitor the seed."*
