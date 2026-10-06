# Chiguru Hardware Enclosure & Fabrication Blueprint (Phase 5)

**Team:** TerraByte (Hithesh HG — Lead Hardware & Enclosure)  
**Objective:** Transform breadboard circuitry into an integrated, field-ready agricultural product. Pass the **60-Second Stranger Test**: *A judge picks up the unit, reads the legend card, presses the single button, and understands the 3-mode lifecycle without verbal explanation.*

---

## 1. Physical Specifications & Material Cut Layout

* **Chassis Material:** 3mm Corrugated Matte-Black Sheet or 3mm Matte Acrylic (Non-reflective for photography).
* **Exterior Dimensions:** 180 mm (Width) $\times$ 125 mm (Depth) $\times$ 65 mm (Height).
* **Thermal & Fluidic Zoning:**
  - **Zone 1 (Clean Logic Bay):** Arduino Uno MCU, 16x2 LCD, tactile mode button.
  - **Zone 2 (Power & Switching Bay):** 5V Relay module, 2N2222 fan driver, 470µF reservoir capacitor.
  - **Zone 3 (Fluidic & Cable Passthrough):** Partitioned silicone tube channel with drip-loop barrier protecting PCB from splashback.

```
       +-------------------------------------------------------+
       |   [CHIGURU]           16x2 LCD WINDOW                 |
       |                   +---------------------+             |
       |                   | [GER] M1:42% M2:39% |     [MODE]  |
       |                   | T:31C P:ON*  V:45   |    (BUTTON) |
       |                   +---------------------+     [O]     |
       |                                                       |
       |  STATUS LED (*)        VENT SERVO PORT (#)            |
       +-------------------------------------------------------+
       | LEFT FLANK:           | REAR FLANK:     | RIGHT FLANK:|
       | - USB Type-B Port     | - DHT22 #1/#2   | - Pump Tube |
       | - 9V / DC Barrel Jack | - Soil A0/A1    | - Fan Duct  |
       |                       | - MQ-135 Grill  |             |
       +-------------------------------------------------------+
```

---

## 2. Dimensional Port Openings & Cut Coordinates

| Cutout ID | Face | Target Component | Exact Cut Dimensions | Tolerance | Purpose / Ergonomics |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **C-01** | Top Face | 16x2 LCD Bezel | 71.5 mm $\times$ 24.5 mm | $\pm 0.5$ mm | Flush bezel fit; 10k contrast pot accessible via underside hole |
| **C-02** | Top Face | Mode Tactile Button | 12.0 mm circular hole | $\pm 0.5$ mm | Single-finger click with raised silicone/rubber cap |
| **C-03** | Top Face | Status LED Bezel | 5.2 mm circular hole | $\pm 0.2$ mm | Red/Green bi-color or diffused red alarm annunciator |
| **C-04** | Left Face | USB Arduino Port | 13.0 mm $\times$ 12.0 mm | $\pm 1.0$ mm | Laptop serial bridge cable connection |
| **C-05** | Left Face | DC Barrel Jack | 10.0 mm circular hole | $\pm 0.5$ mm | 7–12V external power supply / battery input |
| **C-06** | Rear Face | Sensor Wire Loom | 25.0 mm $\times$ 10.0 mm oval | $\pm 1.0$ mm | Rubber-grommeted strain relief for DHT22 and Soil probes |
| **C-07** | Rear Face | MQ-135 Gas Snorkel | 20.0 mm $\times$ 20.0 mm grille | $\pm 1.0$ mm | Free convective air exchange for grain silo gas detection |
| **C-08** | Right Face | Pump Silicone Hose | 8.0 mm circular hole | $\pm 0.5$ mm | 6mm ID / 8mm OD vinyl tube egress with drip loop |
| **C-09** | Right Face | 40mm DC Fan Exhaust | 40.0 mm $\times$ 40.0 mm grille | $\pm 1.0$ mm | Direct forced-air cooling / silo aeration |

---

## 3. Wiring Ruggedization & Strain Relief

1. **Jumper Wire Elimination:**
   - Eliminate loose dupont jumpers prone to intermittent disconnects during transport.
   - Solder wire looms with heat-shrink tubing for off-board sensors (DHT22 #1, DHT22 #2, Soil Probes).
2. **Strain Relief Anchor Points:**
   - Zip-tie anchor pads placed inside the enclosure 20mm before every port exit.
   - Any external tug on the soil probe cable pulls on the chassis wall, never the Arduino header pins.
3. **Power Isolation & Decoupling:**
   - 470µF 16V electrolytic capacitor soldered directly across the 5V and GND power rail of the actuator breadboard.
   - 1N4007 flyback diode connected antiparallel across the DC motor fan and pump inductive terminals.

---

## 4. Enclosure Assembly & Staging Instructions

1. Mount Arduino Uno onto bottom chassis using M3 nylon standoffs (preventing shorting against metal or conductive surfaces).
2. Fix 16x2 LCD firmly into cutout C-01 with hot glue or bezel mounting brackets.
3. Secure the Mode Button onto C-02 within comfortable thumb-reach from the right side.
4. Affix the printed quick-start bilingual badge and mode legend plate on the top face immediately below the LCD.
