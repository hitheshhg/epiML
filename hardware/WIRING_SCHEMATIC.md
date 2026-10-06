# Chiguru Complete Electrical Schematic & Wiring Architecture

**System:** Arduino Uno R3 (ATmega328P @ 16 MHz)  
**Total I/O Allocation:** 20 of 20 Pins Fully Mapped  

---

## 1. Master Pinout Table

| Pin | Function / Component | Direction | Electrical Characteristics | Protection / Sub-circuit |
| :---: | :--- | :---: | :--- | :--- |
| **D0** | UART RX | Input | 5V TTL | USB Serial Bridge to Laptop |
| **D1** | UART TX | Output | 5V TTL | 115200 Baud Telemetry output |
| **D2** | DHT22 #1 (Storage) | Bi-dir | Digital 1-wire | 10kΩ pull-up to 5V |
| **D3** | DHT22 #2 (Germination) | Bi-dir | Digital 1-wire | 10kΩ pull-up to 5V |
| **D4** | 16x2 LCD RS | Output | 5V CMOS | Register Select |
| **D5** | Servo #1 (Vent Aperture) | Output | PWM | 50Hz Pulse Train; SG90 signal |
| **D6** | Servo #2 (Cover Shade) | Output | PWM | 50Hz Pulse Train; SG90 signal |
| **D7** | 16x2 LCD Enable (EN) | Output | 5V CMOS | Clock strobe |
| **D8** | 16x2 LCD Data 4 (D4) | Output | 5V CMOS | 4-bit data bus |
| **D9** | 16x2 LCD Data 5 (D5) | Output | 5V CMOS | 4-bit data bus |
| **D10** | Tactile Mode Button | Input | Digital Input | Internal `INPUT_PULLUP` to GND |
| **D11** | 16x2 LCD Data 6 (D6) | Output | 5V CMOS | 4-bit data bus |
| **D12** | 16x2 LCD Data 7 (D7) | Output | 5V CMOS | 4-bit data bus |
| **D13** | Submersible Pump Relay | Output | Active-LOW | Optocoupled 5V coil; onboard LED indicator |
| **A0** | Soil Moisture Sensor #1 | Input | Analog (0–5V) | ADC 10-bit; nursery tray zone |
| **A1** | Soil Moisture Sensor #2 | Input | Analog (0–5V) | ADC 10-bit; field control zone |
| **A2** | MQ-135 Gas Sensor | Input | Analog (0–5V) | ADC 10-bit; internal heater 5V/150mA |
| **A3** | Piezo Buzzer | Output | Digital Push-Pull | Active buzzer 5V alarm |
| **A4** | Status Alert LED | Output | Digital Push-Pull | 220Ω current limiting resistor to GND |
| **A5** | 40mm DC Aeration Fan | Output | Low-side Transistor | 2N2222 NPN driver with 1kΩ base resistor |

---

## 2. Power Rail Distribution & Transient Protection

```
                  +--------------------------------+
                  |  EXTERNAL POWER (USB / POWER)  |
                  +---------------+----------------+
                                  |
              +-------------------+-------------------+
              |                                       |
    [LOGIC RAIL (5V MCU)]                  [ACTUATOR RAIL (5V HIGH CURRENT)]
              |                                       |
  - Arduino Uno ATmega328P                 - SG90 Micro Servos (x2)
  - 16x2 LCD (Logic + Backlight)           - 5V Relay Coil
  - DHT22 Sensors (x2)                     - 40mm DC Motor Fan
  - MQ-135 Gas Sensor Logic                - Submersible DC Pump
              |                                       |
   Decoupling: 0.1µF Ceramic               Decoupling: 470µF 16V Electrolytic
```

### Critical Protection Sub-Circuits:

1. **DC Fan Low-Side NPN Transistor Switch (Pin A5):**
   ```
   Arduino A5 ----[ 1kΩ Resistor ]----> Base (2N2222 NPN)
                                        Emitter ----> GND
                                        Collector --+
                                                    |
                                            [ DC Fan Motor ]
                                                    |
                                          +---------+--------+
                                          |                  |
                                         _|_ Cathode       +5V Rail
                                       1N4007 Diode
                                          |
                                         --- Anode
   ```
   *The 1N4007 diode shunts back-EMF inductive flyback spikes generated whenever the fan motor turns OFF, protecting the 2N2222 transistor and MCU.*

2. **LiquidCrystal 4-Bit Direct Parallel Pinout (No I2C):**
   - Pin 1 (VSS) $\to$ GND
   - Pin 2 (VDD) $\to$ +5V
   - Pin 3 (V0) $\to$ Center wiper of 10kΩ Potentiometer (Ends connected to +5V and GND)
   - Pin 4 (RS) $\to$ Arduino D4
   - Pin 5 (RW) $\to$ GND (Write only)
   - Pin 6 (EN) $\to$ Arduino D7
   - Pins 7–10 (D0–D3) $\to$ Unconnected (Floating in 4-bit mode)
   - Pin 11 (D4) $\to$ Arduino D8
   - Pin 12 (D5) $\to$ Arduino D9
   - Pin 13 (D6) $\to$ Arduino D11
   - Pin 14 (D7) $\to$ Arduino D12
   - Pin 15 (LED Backlight +) $\to$ 220Ω resistor to +5V
   - Pin 16 (LED Backlight -) $\to$ GND

3. **Submersible Water Pump Relay Driver (Pin D13):**
   - VCC $\to$ Actuator +5V
   - GND $\to$ Common GND
   - IN $\to$ Arduino D13 (Active LOW)
   - Relay Common (COM) $\to$ External 5V / 9V DC supply positive
   - Relay Normally Open (NO) $\to$ Pump motor (+) lead
   - Pump motor (-) lead $\to$ DC supply ground
   - Reverse-biased flyback diode across pump terminals.
