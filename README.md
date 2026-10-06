# 🌱 Chiguru (ಚಿಗುರು) — Complete Agri-Lifecycle Monitoring System

> **"Everyone here monitors the soil. We monitor the seed."**  
> *"ಇಲ್ಲಿ ಪ್ರತಿಯೊಬ್ಬರೂ ಮಣ್ಣನ್ನು ಮಾತ್ರ ಪರೀಕ್ಷಿಸುತ್ತಾರೆ... ಆದರೆ ನಾವು ಬೀಜದ ಜೀವಂತಿಕೆಯನ್ನು ಪರೀಕ್ಷಿಸುತ್ತೇವೆ."*

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

---

## 🚀 Key Innovations & Competitive Differentiators

1. **Full 3-Epoch Lifecycle Continuity in One Device:**
   Transitions dynamically across **Mode 0: Storage**, **Mode 1: Germination**, and **Mode 2: Field** via a single debounced button with zero rewiring.
2. **Phone-Camera Seed Emergence Phenotyping:**
   Non-contact edge computer vision engine using the Excess Green Index ($ExG = 2G - R - B$) fused with HSV chromaticity filtering to score seedling emergence and achieve **100% rejection of brown unsprouted seeds**.
3. **Hyper-Localized Multilingual Human-Machine Interface:**
   High-contrast offline tablet dashboard supporting **English, Hindi, Kannada (ಕನ್ನಡ), and Coastal Karnataka Tulu (ತುಳು)**.
4. **Ruthless Engineering & Pin-Efficiency:**
   100% pin allocation on the ATmega328P (all 14 digital and 6 analog pins utilized), non-blocking `millis()` execution, active-LOW relay boot protection, and triple safety interlocks.
5. **Sub-₹3,000 Economic Target:**
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
│   ├── dashboard.py                # High-contrast 4-language offline Streamlit UI
│   ├── capture.py                  # Classical CV germination phenotyping module
│   ├── LANG.json                   # EN, HI, KN, TU agricultural dictionary
│   ├── requirements.txt            # Python dependencies (pyserial, streamlit, opencv, etc.)
│   └── data/                       # Telemetry logs, latest state, and CV benchmarks
├── hardware/
│   ├── WIRING_SCHEMATIC.md         # Full pinout, transistor driver & transient decoupling
│   ├── ENCLOSURE.md                # 3mm chassis cut sheet, thermal zoning & port layout
│   ├── LABELS.md                   # Print-ready badges, legend plate & quick-start cards
│   └── CHECKLIST.md                # 10-point pre-judging mission checklist
├── tests/
│   ├── SYSTEM_TEST_SCRIPT.md       # 45-minute end-to-end integration test protocol
│   ├── BENCH_TEST.md               # Step-by-step sensor/actuator bench verification script
│   ├── CALIBRATION_GUIDE.md        # Soil moisture and MQ-135 tuning guide
│   └── BUG_LOG_TEMPLATE.md         # Demo-day bug tracking template
├── judging/
│   ├── SURVEY.md                   # 5-question farmer survey (EN/KN/TU) & field data
│   ├── MARKET.md                   # Market gap, competitive matrix, BOM costing & ROI
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
2. Select **Board: Arduino Uno** and the corresponding COM port.
3. Click **Upload**. On boot, observe LCD splash screen and diagnostic sensor self-test.

### 2. Launch Software Suite
```bash
# 1. Install dependencies
pip install -r software/requirements.txt

# 2. Start the serial telemetry bridge (Terminal 1)
python software/bridge.py --port auto

# 3. Launch the judging dashboard (Terminal 2)
streamlit run software/dashboard.py

# 4. Run the computer vision germination counter (Terminal 3)
python software/capture.py --demo      # For synthetic demo
python software/capture.py --tune      # Run the 6-scenario benchmark suite
```

---

## 🏆 The 90-Second Judging Arc
* **0:00 – 0:30 (Storage):** Exhale on DHT22/MQ-135 $\to$ Aeration fan triggers $\to$ Gas alert latches.
* **0:30 – 1:00 (Germination):** Tap button $\to$ 2 beeps $\to$ Phone camera CV reveals 90% sprout rate with brown seed rejection.
* **1:00 – 1:30 (Field):** Tap button $\to$ 3 beeps $\to$ Pull soil probe $\to$ Submersible pump fires instantly $\to$ Emergency cutoff safety verified.
