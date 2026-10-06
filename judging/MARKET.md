# Chiguru Market Analysis, BOM Costing & Value Proposition (Phase 7)

**Product:** Chiguru (ಚಿಗುರು) — Single-Unit Closed-Loop Agri-Lifecycle Controller  
**Target Sector:** Smallholder Farmers, Commercial Seedling Nurseries, and Regional Seed Banks in Coastal Karnataka (Tulunadu / Malnad belt).

---

## 1. The Market Gap: Three-Way Competitive Comparison

| Dimension | Tier 1: Commercial Weather Stations | Tier 2: Hobbyist / Academic Tutorial Projects | Tier 3: CHIGURU (Our System) |
| :--- | :--- | :--- | :--- |
| **Typical Cost** | ₹25,000 – ₹85,000 | ₹1,500 – ₹2,500 | **₹2,840 (Full Production BOM)** |
| **Lifecycle Scope** | Only outdoor weather / ambient canopy | Only single stage (soil moisture watering) | **Full 3-Stage Continuity (Storage $\to$ Germination $\to$ Field)** |
| **Germination Scoring** | **None** (Cannot inspect trays) | **None** (Blind open-loop irrigation) | **Autonomous Computer Vision Phenotyping** |
| **User Interface** | Complex cloud dashboard (English only) | Arduino Serial Monitor (No UI) | **Single-Button + 4-Language Offline Dashboard (EN/HI/KN/TU)** |
| **Failure Safety** | Proprietary repair required | None (floods tray if sensor breaks) | **Triple Interlock: 60s max pump + disconnect trip + auto-silencing** |
| **Hardware Overhead**| Multi-device installation | Single-purpose throwaway board | **100% pin-optimized single MCU with zero rewiring** |

### The Core Value Proposition:
> *"Existing commercial stations monitor only the sky, and student projects monitor only the soil. Neither monitors the seed. Chiguru bridges the gap by creating a continuous digital thread from seed bag to sprout to field harvest for under ₹3,000."*

---

## 2. Bill of Materials (BOM) & Unit Economics

### Complete Kit & Component Cost Breakdown:

| Item # | Component Description | Source | Unit Quantity | Commercial Cost (INR) | Mass Scale Cost (1,000+ units) |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **1** | ATmega328P / Arduino Uno Microcontroller | Provided in Kit | 1 | ₹450 | ₹260 |
| **2** | DHT22 Precision Temp/Humidity Sensor | Provided in Kit | 2 | ₹500 (₹250 ea) | ₹320 |
| **3** | Resistive/Capacitive Soil Moisture Sensor Probes | Provided in Kit | 2 | ₹120 (₹60 ea) | ₹70 |
| **4** | 16x2 HD44780 Character LCD Display | Provided in Kit | 1 | ₹160 | ₹95 |
| **5** | 10kΩ Potentiometer + Tactile Pushbutton | Provided in Kit | 1 + 1 | ₹25 | ₹12 |
| **6** | Active 5V Piezo Buzzer + High-Brightness LED | Provided in Kit | 1 + 1 | ₹30 | ₹14 |
| **7** | SG90 Micro Servos (Ventilation & Shade) | Provided in Kit | 2 | ₹240 (₹120 ea) | ₹160 |
| **8** | MQ-135 Air Quality / Spoilage Gas Sensor | Provided in Kit | 1 | ₹180 | ₹110 |
| **9** | 5V 1-Channel Optocoupled Relay Module | Provided in Kit | 1 | ₹90 | ₹55 |
| **10** | 5V Submersible Micro DC Water Pump + Tubing | Kit / Added Extra | 1 | ₹180 | ₹110 |
| **11** | 40mm 5V Brushless DC Fan + 2N2222 Driver | Kit / Added Extra | 1 | ₹95 | ₹55 |
| **12** | Chassis Enclosure, Wires, Terminals, Capacitor | Sourced / Fabricated | 1 | ₹220 | ₹110 |
| **13** | Vision Engine (Phone Camera via Wi-Fi) | Farmer's Existing Smartphone | 1 | ₹0 (Software) | ₹0 |
| **TOTAL**| **Complete Chiguru Unit BOM** | — | — | **₹2,290** | **₹1,372** |

---

## 3. Customer Segments & Economic ROI

### Primary Target: Coastal Karnataka Agriculture
1. **Smallholder Paddy Farmers (Dakshina Kannada & Udupi):**
   - Annual planting of 1 to 3 acres of high-yield paddy (e.g., MO-4, Jaya, Panchami).
   - High monsoon humidity causes storage grain losses exceeding ₹12,000 per season.
   - **Payback Period:** Less than **1.5 months** through spoilage prevention alone.
2. **Commercial Seedling Nurseries (Horticulture & Arecanut):**
   - Nurseries germinate thousands of arecanut, vegetable, and fruit saplings in seed trays.
   - Overwatering causes damping-off disease (fungal seedling wilt).
   - Chiguru's vision-guided germination counting provides verified batch germination certificates before seedlings are dispatched to buyers.
3. **Primary Agricultural Credit Societies (PACS) & Seed Banks:**
   - Community grain storage facilities vulnerable to localized fungal outbreaks and hot spots.
