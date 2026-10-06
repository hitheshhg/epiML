# Chiguru Timed 4-Minute Pitch Script & 90-Second Demo Arc (Phase 7)

**Event:** YEN NOVA 1.0, Yenepoya Institute of Technology  
**Team:** TerraByte (Pavan HP, Hithesh HG, Vikas KH, Karthik V)  
**Total Pitch Duration:** 4 Minutes (240 Seconds)  
**Live Hardware Arc:** 90 Seconds Strict  

---

## Pitch Choreography & Speaker Roles

* **Karthik V:** Opens with Hook, Farmer Survey Reality, Problem Statement, and Cultural Anchoring.
* **Pavan HP:** Leads the 90-second live physical hardware demo arc (Button, Enclosure, LCD, Actuators).
* **Vikas KH:** Drives the Laptop Dashboard, Multilingual Switch, and Phone-Camera Computer Vision.
* **Hithesh HG:** Explains BOM Costing, Enclosure Productization, and closes with the punchline.

---

## Minute-by-Minute Script

### [0:00 – 0:45] The Emotional Hook & The Coastal Farmer's Reality
*(Speaker: Karthik V)*

> **"ಎಲ್ಲರಿಗೂ ನಮಸ್ಕಾರ. ತುಳುನಾಡಿನ ಮಾತಾ ಹಿರಿಯೆರೆಗ್ ಎನ್ನ ವಂದನೆಲು."**  
> *(Warm smile, looking directly at the judges)*
> 
> "Respected judges, this morning in Moodbidri and across coastal Karnataka, farmers are opening their storage bags to find rotten paddy, destroyed by our humid monsoon air. Today, our team surveyed 10 local farmers in Belvai, Karkala, and Alangar. The numbers are heartbreaking: **13.1% of harvested grain rots in storage**, and **over 20% of seeds fail to germinate in nursery trays**.
> 
> When we asked them what technology they use, every single farmer said *zero*. They touch the grain with their fingers, or bite it with their teeth. 
> 
> Why? Because commercial weather stations cost ₹25,000 and don't measure seed health. And hobbyist tutorial projects only automate a single watering relay. 
> 
> Today, Team TerraByte presents **CHIGURU (ಚಿಗುರು)**. 
> **'One device. Three crop stages. It tells you why.'**
> It protects a crop across its entire lifecycle: from Seed Storage, to Tray Germination, to Field Harvest. And it does it all under ₹3,000 with a single button."

---

### [0:45 – 2:15] The 90-Second Live Hardware Arc (THE WINNING MOMENT)
*(Speaker: Pavan HP & Vikas KH)*

> **[0:45 – 1:15] Stage 1: Storage Mode (Pre-Sowing & Post-Harvest Grain)**
> *(Pavan points to the enclosed device)*
> "Watch the unit. It is currently in **Mode 0: STORAGE**. It samples the storage silo's microclimate with a DHT22 and an MQ-135 gas sensor. 
> If humidity exceeds 60%, watch what happens..."
> *(Pavan exhales gently onto the sensor)*
> "...The aeration fan starts up immediately! And if spoilage gases surge..."
> *(Status LED latches RED, buzzer chirps)*
> "...The alarm trips to alert the farmer before fungus destroys the seed bank. But notice: the buzzer silences after 10 seconds so the farmer isn't annoyed, while the LED remains latched."
> 
> **[1:15 – 1:45] Stage 2: Germination Mode & The Vision Gasp**
> *(Pavan presses the D10 button once — 2 crisp beeps sound, LCD shows `[GER]`)*
> "Now, the seeds are planted in the nursery. With ONE button press, we transition to **Mode 1: GERMINATION**. No rewiring. No new device.
> 
> Look at the LCD: notice it doesn't blindly flip relays. It displays **Measurement $\to$ Reason $\to$ Action**. Look at this refusal:
> `VENT BLOCKED:OUTSIDE DAMP`!
> Outdoor humidity is 82%; opening the vent right now would suck wet air in and rot the seedlings! Chiguru knows **when NOT to act**.
> 
> Now, the judges might ask: *where is the camera?*
> **The judged device is 100% kit — there is NO camera in it.**
> The phone is the farmer's own, like the eyes they already have. Watch Vikas take out his phone:
> *(Vikas taps 'Capture tray photo' on his phone screen and snaps our live Moong sprout tray)*
> "They photograph the tray; Chiguru does the agronomy!
> In 1.5 seconds, our classical OpenCV engine runs on the laptop, detects **18 out of 20 sprouts (90% emergence)**, and fuses it with our live soil moisture into a **Germination Health Score of 92/100**! And look at the red boxes: brown unsprouted seeds are 100% rejected! 
> Plus, watch this: Vikas taps 'Field' on his phone screen..."
> *(Arduino LCD immediately beeps and switches to `[FLD]` within 1 second!)*
> "...The farmer's phone is also the wireless remote control!"
> 
> **[1:45 – 2:15] Stage 3: Field Mode & Dual-Zone Irrigation**
> *(Pavan presses the button again — 3 beeps, LCD shows `[FLD]`)*
> "The seedlings move to the field: **Mode 2: FIELD**. 
> Watch our dual-zone root moisture probes. Zone A drops below 35%..."
> *(Pavan pulls the probe from the moist sponge)*
> "...The submersible water pump fires instantly! 
> And if a sensor wire is accidentally cut by a spade? Most student systems flood the field. Chiguru's sensor-disconnect interlock shuts the pump OFF immediately, with a hardcoded 60-second safety cutoff."

---

### [2:15 – 3:15] Inclusive Design, BOM Economics & Academic Rigor
*(Speaker: Hithesh HG & Vikas KH)*

> *(Vikas clicks the language buttons on the dashboard)*
> "Technology is useless if a farmer cannot understand it. 
> With one tap, our judging dashboard switches between **English, Hindi, Kannada, and Tulu** — with authentic agricultural terminology like *'ಕಣಜ'* for storage and *'ಮುಗೆ'* for sprouts. Even without reading, the giant green banner tells the farmer from 3 meters away: *'ಎಲ್ಲವೂ ಸರಿಯಾಗಿದೆ — ಮಾತಾ ಎಡ್ಡ ಉಂಡು'*.
> 
> *(Hithesh holds up the BOM card)*
> "Every single component comes from our declared kit and standard scrap: full BOM is just **₹2,290**, scaling to ₹1,370 in production. For a small farmer losing ₹12,000 every season, Chiguru pays for itself in less than **45 days**.
> 
> Architecturally, we have utilized **100% of the Arduino Uno's 20 I/O pins** with zero pin conflicts, complete power rail decoupling, and non-blocking scheduling."

---

### [3:15 – 4:00] The Close & Unforgettable Punchline
*(Speaker: Karthik V & Pavan HP)*

> "We have documented every phase of our build in a timestamped engineering log for an Indian Patent Office provisional filing. Our IEEE research paper draft is grounded on a Maize emergence validation trial showing a **34% water reduction** and **28% higher seedling vigor**.
> 
> Respected judges: 
> 
> **'One device. Three crop stages. It tells you why.'**
> 
> **'ಇಲ್ಲಿ ಪ್ರತಿಯೊಬ್ಬರೂ ಮಣ್ಣನ್ನು ಮಾತ್ರ ಪರೀಕ್ಷಿಸುತ್ತಾರೆ... ಆದರೆ ನಾವು ಬೀಜದ ಜೀವಂತಿಕೆಯನ್ನು ಪರೀಕ್ಷಿಸುತ್ತೇವೆ.'**
> 
> **'Everyone here monitors the soil. We monitor the seed.'**
> 
> We are Team TerraByte. Thank you, and we welcome your questions!"
