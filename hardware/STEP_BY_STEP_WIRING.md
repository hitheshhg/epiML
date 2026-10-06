# Chiguru Step-by-Step Hardware Wiring Architecture

**Board:** Arduino Uno R3 (ATmega328P)  
**Components Verified from User Hardware Inventory:**
1. MQ Gas Sensor Breakout (LM393 based)
2. 5V Relay Module (CYX-3FC / T73)
3. Tower Pro SG90 (9g) Micro Servo
4. Soil Moisture Sensor Probes (Tester Pro & 2602) + LM393 Control Boards (x2)
5. DHT11 Temperature & Humidity Sensor Module
6. 16x2 Character LCD + 10k Potentiometer
7. Push Button, Buzzer, LED

---

## Step 0: Set Up Master Power Rails on Breadboard
Before wiring individual sensors, create common power buses:
1. Connect Arduino Uno **5V pin** $\to$ Breadboard **Red (+) Rail**.
2. Connect Arduino Uno **GND pin** $\to$ Breadboard **Blue/Black (-) Rail**.

---

## Step 1: Gas Sensor Module (MH MQ Series / MQ135)
* **VCC** $\to$ Breadboard **5V Rail**
* **GND** $\to$ Breadboard **GND Rail**
* **A0 (Analog Output)** $\to$ Arduino **Pin A2**
* **D0 (Digital Output)** $\to$ *Leave Unconnected*

---

## Step 2: 5V Single-Channel Relay Module (CYX-3FC)
* **VCC** $\to$ Breadboard **5V Rail**
* **GND** $\to$ Breadboard **GND Rail**
* **IN (Signal Trigger)** $\to$ Arduino **Pin D13**
* *Pump Wiring (High-voltage / Isolated side):*
  - **COM (Common)** $\to$ External Power (+) or USB 5V (+)
  - **NO (Normally Open)** $\to$ Pump Red Wire (+)
  - Pump Black Wire (-) $\to$ Power Source GND (-)

---

## Step 3: Soil Moisture Sensor #1 (Probe 1 + LM393 Board)
1. Connect the 2-pin probe prongs $\to$ the 2-pin input header on the LM393 board.
2. Connect the 4-pin output header:
   * **VCC** $\to$ Breadboard **5V Rail**
   * **GND** $\to$ Breadboard **GND Rail**
   * **A0 (Analog Output)** $\to$ Arduino **Pin A0**
   * **D0 (Digital Output)** $\to$ *Leave Unconnected*

---

## Step 4: Soil Moisture Sensor #2 (Probe 2 + LM393 Board)
1. Connect the 2-pin probe prongs $\to$ the 2-pin input header on the 2nd LM393 board.
2. Connect the 4-pin output header:
   * **VCC** $\to$ Breadboard **5V Rail**
   * **GND** $\to$ Breadboard **GND Rail**
   * **A0 (Analog Output)** $\to$ Arduino **Pin A1**
   * **D0 (Digital Output)** $\to$ *Leave Unconnected*

---

## Step 5: DHT11 Temperature & Humidity Sensor Module
* **`+` / VCC** $\to$ Breadboard **5V Rail**
* **`-` / GND** $\to$ Breadboard **GND Rail**
* **`OUT` / `S` / DATA** $\to$ Arduino **Pin D2** (Storage Zone DHT #1)
*(Note: If connecting a 2nd DHT sensor for the germination tray, connect its DATA pin $\to$ Arduino **Pin D3**).*

---

## Step 6: Tower Pro SG90 Micro Servo (9g)
* **Brown Wire (GND)** $\to$ Breadboard **GND Rail**
* **Red Wire (Power)** $\to$ Breadboard **5V Rail**
* **Orange/Yellow Wire (PWM Signal)** $\to$ Arduino **Pin D5** (Vent Servo #1)
*(Note: If connecting 2nd servo for canopy cover, its signal wire connects to Arduino **Pin D6**).*

---

## Step 7: Tactile Mode Button (D10)
* **One Pin / Leg** $\to$ Arduino **Pin D10**
* **Opposite Pin / Leg** $\to$ Breadboard **GND Rail**
*(Firmware uses internal `INPUT_PULLUP`, so no external resistor is required).*

---

## Step 8: Active Buzzer & Status LED
* **Buzzer Long Leg (+)** $\to$ Arduino **Pin A3**
* **Buzzer Short Leg (-)** $\to$ Breadboard **GND Rail**
* **Status LED Anode (+)** $\to$ Arduino **Pin A4** (through a 220Ω resistor)
* **Status LED Cathode (-)** $\to$ Breadboard **GND Rail**

---

## Step 9: 16x2 Character LCD (4-Bit Direct Parallel)
* Pin 1 (VSS) $\to$ Breadboard GND
* Pin 2 (VDD) $\to$ Breadboard 5V
* Pin 3 (V0 Contrast) $\to$ Center wiper of 10k Potentiometer (Pot outer pins $\to$ 5V & GND)
* Pin 4 (RS) $\to$ Arduino **Pin D4**
* Pin 5 (RW) $\to$ Breadboard GND
* Pin 6 (Enable / EN) $\to$ Arduino **Pin D7**
* Pins 7, 8, 9, 10 (D0, D1, D2, D3) $\to$ *Leave Unconnected*
* Pin 11 (D4) $\to$ Arduino **Pin D8**
* Pin 12 (D5) $\to$ Arduino **Pin D9**
* Pin 13 (D6) $\to$ Arduino **Pin D11**
* Pin 14 (D7) $\to$ Arduino **Pin D12**
* Pin 15 (Backlight Anode A) $\to$ Breadboard 5V (via 220Ω resistor)
* Pin 16 (Backlight Cathode K) $\to$ Breadboard GND
