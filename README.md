# 🌱 CHIGURU 2.0 (ಚಿಗುರು) — Intelligent Seed & Seedling Research Platform

> **"Chiguru transforms a standard nursery seedling tray into a programmable, continuously monitored biological experiment."**  
> **"The hardware creates controlled conditions. The software measures how individual seedlings respond."**  
> *"Technical Definition: A low-cost cyber-physical platform for programmable nursery experiments, continuous environmental sensing, automated seedling phenotyping, treatment comparison, and cell-level biological data acquisition."*

---

### Project Identity & Research Objective
* **Event:** YEN NOVA 1.0 (Yenepoya Institute of Technology, Dept. of ECE, Moodbidri, Mangalore)
* **Team:** **TerraByte**
  - **Pavan HP** (Lead — Firmware, Integration, Judging Demo)
  - **Hithesh HG** (Hardware Wiring, Power Decoupling, Enclosure)
  - **Vikas KH** (Software Architecture, Phenotyping Pipeline, Analytics)
  - **Karthik V** (Research Documentation, References, Regional Localization, Evaluation)
* **Core Research Pipeline:**
  $$\text{EXPERIMENT} \to \text{TREATMENT} \to \text{CONTROLLED MICRO-ENVIRONMENT} \to \text{CONTINUOUS SENSING} \to \text{TIME-LAPSE IMAGING} \to \text{CELL-LEVEL PHENOTYPING} \to \text{DATA FUSION} \to \text{ANALYTICS} \to \text{DATASET EXPORT}$$
* **Primary Scientific Use Cases:**
  - University agricultural research & teaching laboratories
  - Commercial seed certification & lot-vigor quality assurance
  - Controlled-environment horticultural phenotyping trials

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
│   └── Chiguru/
│       └── Chiguru.ino             # Full non-blocking Arduino Uno firmware (Phase 1 & 2)
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
1. Open [`firmware/Chiguru/Chiguru.ino`](file:///c:/Users/gurud/OneDrive/Desktop/terrabyte/firmware/Chiguru/Chiguru.ino) in the Arduino IDE.
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
