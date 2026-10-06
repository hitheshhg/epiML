# Chiguru Hardware & Firmware Bug Log Protocol

**Team:** TerraByte · YEN NOVA 1.0  
**Usage:** Any unexpected behavior during bench-testing or rehearsal must be logged immediately. No silent fixes.

---

## Bug Incident Register

| ID | Phase / Subsystem | Failure Description | Root Cause Identified | Engineering Fix Implemented | Re-Test Verification | Sign-off |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: |
| **BUG-01** | Power / Actuator | Relay click caused Uno to reboot. | 9V battery sag under 150mA inductive inrush. | Powered MCU logic from laptop USB; separated actuator rail with 470µF capacitor. | 50 consecutive pump cycles without brownout. | Pavan / Hithesh |
| **BUG-02** | Firmware / Timers | DHT22 returned `NAN` when Servo moved. | `<Servo.h>` Timer1 interrupts conflicted with microsecond pulse timing. | Detached servo when stationary (`servo.detach()`); added atomic retry read loop. | 100 continuous sensor reads with 0% dropped packets. | Pavan |
| **BUG-03** | Computer Vision | Harsh sunlight washed out green seedlings. | Standard RGB thresholding failed under direct glare. | Implemented Excess Green Index ($ExG = 2G - R - B$) with CLAHE contrast compensation. | 6-scenario benchmark passed 100% within tolerance. | Vikas |
| **BUG-04** | User Interface | Serial disconnect locked Streamlit UI. | Blocking serial socket read caused Python traceback. | Implemented non-blocking thread in `bridge.py` and auto-mock fallback in `dashboard.py`. | Unplugged USB mid-stream; dashboard switched to demo mode with 0 latency. | Vikas |
| **BUG-05** | Firmware / Relay | Water pump clicked ON briefly during bootloader reset. | Arduino D13 bootloader LED pulse tripped active-LOW relay. | Initialized `digitalWrite(PIN_RELAY, HIGH)` *before* configuring `pinMode(OUTPUT)`. | Booted Uno 10 times; zero spurious pump activations. | Pavan |

---

## Live Incident Report Template (For Demo Day)

```text
INCIDENT ID: BUG-____
TIMESTAMP: ____________________
SUBSYSTEM: [ ] Firmware   [ ] Enclosure/Wiring   [ ] Dashboard   [ ] Vision   [ ] Sensors
SYMPTOMS OBSERVED:
__________________________________________________________________________________
ROOT CAUSE:
__________________________________________________________________________________
CORRECTIVE ACTION:
__________________________________________________________________________________
RE-TEST RESULT:
__________________________________________________________________________________
ENGINEER SIGN-OFF: ___________________
```
