export type Language = "en" | "kn" | "tu" | "hi";

export interface LanguageMeta {
  code: Language;
  name: string;
  nativeName: string;
  badge: string;
  region: string;
}

export const LANGUAGES: LanguageMeta[] = [
  { code: "en", name: "English", nativeName: "English", badge: "EN", region: "International" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", badge: "ಕನ್ನಡ", region: "ಕರ್ನಾಟಕ (Karnataka)" },
  { code: "tu", name: "Tulu", nativeName: "ತುಳು", badge: "ತುಳು", region: "ಕರಾವಳಿ (Coastal Karnataka)" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी", badge: "हिंदी", region: "राष्ट्रीय (National)" },
];

export interface TranslationDict {
  // Brand & Nav
  appName: string;
  subtitle: string;
  teamName: string;
  hardwareConnected: string;
  hardwareDisconnected: string;
  connectHardware: string;
  done: string;
  selectUsb: string;
  bridgeActive: string;
  mode0: string;
  mode1: string;
  mode2: string;
  mode0Desc: string;
  mode1Desc: string;
  mode2Desc: string;

  // Hero
  heroTag: string;
  heroHeading: string;
  heroSubtext: string;
  activePhase: string;
  activeRule: string;

  // KPIs
  germinationRate: string;
  sproutsDetected: string;
  canopyCover: string;
  vigorScore: string;
  ofSown: string;
  optimalSaturation: string;
  irrigationNeeded: string;
  climateNormal: string;
  cleanAtmosphere: string;
  rotGasSurge: string;

  // Seed Phenotyping
  seedMonitorTitle: string;
  seedMonitorSubtitle: string;
  tabTrayMap: string;
  tabTrayPhoto: string;
  tabPhenoMetrics: string;
  sproutInspector: string;
  sproutHeight: string;
  sproutVigor: string;
  radicleIntegrity: string;
  chlorophyllLevel: string;
  optimalPrime: string;
  growthLifecycle: string;
  day1: string;
  day2: string;
  day3: string;
  day5: string;
  agronomistAdvice: string;
  agronomistAdviceText: string;
  uploadTrayPhoto: string;
  loadBenchmark: string;
  noPhotoUploaded: string;
  noPhotoDesc: string;

  // Sensor Grid
  sensorGridTitle: string;
  sensorGridSubtitle: string;
  channelsActive: string;
  soilMoisture1: string;
  soilMoisture2: string;
  storageClimate: string;
  germinationClimate: string;
  gasPurity: string;
  dewPoint: string;
  irrigationWatchdog: string;
  targetRange: string;
  airDry: string;
  waterWet: string;
  marginDew: string;
  sweatingWarning: string;
  sweatingSafe: string;
  maxPumpRun: string;
  forcedCooldown: string;

  // Actuator Controls
  actuatorTitle: string;
  actuatorSubtitle: string;
  resumeAuto: string;
  pumpMotor: string;
  pumpMotorDesc: string;
  pumpOn: string;
  pumpOff: string;
  ventAperture: string;
  ventDesc: string;
  shadeCover: string;
  shadeDesc: string;
  buzzerAnnunciator: string;
  buzzerDesc: string;
  buzzerTest: string;
  lastCommand: string;

  // Explainable AI
  explainableTitle: string;
  explainableSubtitle: string;
  patentBadge: string;
  lcdHardwareMirror: string;
  activeRuleLabel: string;
  sensorInputTrigger: string;
  actionStatus: string;
  causalRationale: string;

  // Trend Charts
  trendTitle: string;
  trendSubtitle: string;
  liveWindow: string;

  // Footer
  institution: string;
  ieeePaper: string;
}

export const translations: Record<Language, TranslationDict> = {
  en: {
    appName: "Chiguru • ಚಿಗುರು",
    subtitle: "Autonomous Smart Agri-CPS & Real-Time Seed Phenotyping",
    teamName: "Team TerraByte · YEN NOVA 1.0",
    hardwareConnected: "Hardware Connected",
    hardwareDisconnected: "Simulated Telemetry",
    connectHardware: "Connect Hardware",
    done: "Done",
    selectUsb: "Select Arduino USB Port",
    bridgeActive: "Bridge Active & Streaming",
    mode0: "Grain Storage",
    mode1: "Nursery Germination",
    mode2: "Field Irrigation",
    mode0Desc: "Pre-Sowing & Post-Harvest Silo",
    mode1Desc: "Nursery Tray & Micro-Irrigation",
    mode2Desc: "Vegetative Field Zone",

    heroTag: "Full-Lifecycle Smart Agri-CPS · Patent-Grade",
    heroHeading: "Cultivating Intelligence for Every Seed.",
    heroSubtext: "Autonomous microclimate conditioning, closed-loop sub-surface irrigation, and real-time computer vision seed phenotyping engineered for climate-resilient farming.",
    activePhase: "Active Phase",
    activeRule: "Rule",

    germinationRate: "Germination Rate",
    sproutsDetected: "Sprouts Emerged",
    canopyCover: "Canopy Green Cover",
    vigorScore: "Seed Vigor Index",
    ofSown: "of seeds sown",
    optimalSaturation: "Optimal Saturation",
    irrigationNeeded: "Irrigation Needed",
    climateNormal: "Climate Normal",
    cleanAtmosphere: "Clean Atmosphere",
    rotGasSurge: "Decay Gas Surge",

    seedMonitorTitle: "Real-Time Seedling & Germination Monitor",
    seedMonitorSubtitle: "Computer Vision Phenotyping • Excess Green Index (ExG) • Tray Vigor",
    tabTrayMap: "AI Tray Map",
    tabTrayPhoto: "Tray Photo",
    tabPhenoMetrics: "Pheno-Metrics",
    sproutInspector: "Selected Sprout Inspection",
    sproutHeight: "Emerged Height",
    sproutVigor: "Individual Vigor Index",
    radicleIntegrity: "Radicle Integrity",
    chlorophyllLevel: "Chlorophyll Level",
    optimalPrime: "Optimal Prime",
    growthLifecycle: "Seed Germination Lifecycle",
    day1: "Day 1: Water Imbibition",
    day2: "Day 2: Radicle Emergence (Active)",
    day3: "Day 3: Shoot & Foliar Expansion",
    day5: "Day 5: Field Ready Hardening",
    agronomistAdvice: "Agronomist Advisory",
    agronomistAdviceText: "Moisture in nursery tray is optimal at 52%. Vent shutter closed to preserve tray humidity. Ready for first light photoperiod in 14h.",
    uploadTrayPhoto: "Upload Tray Photo",
    loadBenchmark: "Load Bench Benchmark",
    noPhotoUploaded: "No Seedling Image Uploaded Yet",
    noPhotoDesc: "Take a top-down photo of your nursery tray or connect your phone camera for real-time computer vision phenotyping.",

    sensorGridTitle: "Live Hardware Sensory Network",
    sensorGridSubtitle: "10-bit analog conversion & calibrated digital environmental telemetry",
    channelsActive: "7 Channels Active",
    soilMoisture1: "Tray Moisture #1 (A0)",
    soilMoisture2: "Field Moisture #2 (A1)",
    storageClimate: "Storage Climate (DHT1)",
    germinationClimate: "Germination Climate (DHT2)",
    gasPurity: "Rot Gas Air Index (MQ135)",
    dewPoint: "Psychrometric Dew Point",
    irrigationWatchdog: "Irrigation Safety Loop",
    targetRange: "Target: 35–60%",
    airDry: "0% (Air)",
    waterWet: "100% (Wet)",
    marginDew: "Margin (T - Td)",
    sweatingWarning: "Sweating Warning",
    sweatingSafe: "Dry / Safe",
    maxPumpRun: "Max Pump Run Cutoff",
    forcedCooldown: "Forced Cooldown",

    actuatorTitle: "Interactive Physical Actuator Deck",
    actuatorSubtitle: "Zero-latency remote actuation via PySerial / Web Serial Bridge",
    resumeAuto: "Resume Auto CPS Loop",
    pumpMotor: "Submersible Pump Motor",
    pumpMotorDesc: "Pin D13 (Active-LOW Optocoupled Relay driving 5V Submersible Pump).",
    pumpOn: "Motor ON",
    pumpOff: "Motor OFF",
    ventAperture: "Climate Vent Aperture",
    ventDesc: "Pin D5 (TowerPro SG90 9g Micro Servo Flap: 0° Closed to 90° Flush).",
    shadeCover: "Tray Shade Cover",
    shadeDesc: "Pin D6 (Photoperiod & Noon Shade Shutter for etiolation control).",
    buzzerAnnunciator: "Buzzer Annunciator",
    buzzerDesc: "TMB12A12 Active Electromagnetic Beeper chime verification.",
    buzzerTest: "Test Buzzer Alarm",
    lastCommand: "Last Dispatched Hardware Command",

    explainableTitle: "Explainable CPS Decision Engine (X-CPS)",
    explainableSubtitle: "Transparent causal reasoning engine: Measurement → Rationale → Action or Refusal",
    patentBadge: "Patent-Grade Decision Engine",
    lcdHardwareMirror: "ARDUINO 16x2 LCD HARDWARE MIRROR",
    activeRuleLabel: "Active Scientific Rule",
    sensorInputTrigger: "Sensor Input Trigger",
    actionStatus: "Action or Refusal Status",
    causalRationale: "Causal Rationale",

    trendTitle: "Real-Time Environmental Trendlines",
    trendSubtitle: "Synchronized rolling data buffer recorded at 1 Hz from Arduino Uno",
    liveWindow: "Past 30 Data Samples (Live Window)",

    institution: "Yenepoya Institute of Technology, Moodbidri",
    ieeePaper: "IEEE Paper & Patent Ready",
  },

  kn: {
    appName: "ಚಿಗುರು • Chiguru",
    subtitle: "ಸ್ವಾಯತ್ತ ಸ್ಮಾರ್ಟ್ ಕೃಷಿ-ಸಿಪಿಎಸ್ ಮತ್ತು ನೈಜ-ಸಮಯದ ಬೀಜ ಮೊಳಕೆ ಮಾನಿಟರ್",
    teamName: "ಟೀಮ್ ಟೆರಾಬೈಟ್ · YEN NOVA 1.0",
    hardwareConnected: "ಹಾರ್ಡ್‌ವೇರ್ ಸಂಪರ್ಕಗೊಂಡಿದೆ",
    hardwareDisconnected: "ಮಾದರಿ ಡೇಟಾ (ಸಿಮ್ಯುಲೇಶನ್)",
    connectHardware: "ಹಾರ್ಡ್‌ವೇರ್ ಸಂಪರ್ಕಿಸಿ",
    done: "ಮುಗಿಯಿತು",
    selectUsb: "ಆರ್ಡುನೊ ಯುಎಸ್‌ಬಿ ಪೋರ್ಟ್ ಆರಿಸಿ",
    bridgeActive: "ಬ್ರಿಡ್ಜ್ ಸಕ್ರಿಯವಾಗಿದೆ",
    mode0: "ಧಾನ್ಯ ಸಂಗ್ರಹಣೆ",
    mode1: "ಮೊಳಕೆ ತಟ್ಟೆ ನಿಯಂತ್ರಣ",
    mode2: "ಹೊಲ ನೀರಾವರಿ",
    mode0Desc: "ಬೀಜ ಬಿತ್ತನೆ ಪೂರ್ವ ಮತ್ತು ಕಣಜ",
    mode1Desc: "ನರ್ಸರಿ ತಟ್ಟೆ ಮತ್ತು ಹನಿ ನೀರಾವರಿ",
    mode2Desc: "ಬೆಳವಣಿಗೆಯ ಹೊಲದ ವಲಯ",

    heroTag: "ಸಂಪೂರ್ಣ ಕೃಷಿ ಜೀವನಚಕ್ರದ ಸ್ಮಾರ್ಟ್ ಸಿಪಿಎಸ್ · ಪೇಟೆಂಟ್ ದರ್ಜೆ",
    heroHeading: "ಪ್ರತಿ ಬೀಜಕ್ಕೂ ಬುದ್ಧಿವಂತ ತಂತ್ರಜ್ಞಾನದ ಪೋಷಣೆ.",
    heroSubtext: "ಸ್ವಾಯತ್ತ ಹವಾಮಾನ ನಿಯಂತ್ರಣ, ಕ್ಲೋಸ್ಡ್-ಲೂಪ್ ಉಪ-ಮೇಲ್ಮೈ ನೀರಾವರಿ ಮತ್ತು ಹವಾಮಾನ ಸ್ಥಿತಿಸ್ಥಾಪಕ ಕೃಷಿಗಾಗಿ ನೈಜ-ಸಮಯದ ಕಂಪ್ಯೂಟರ್ ವಿಷನ್ ಬೀಜ ಮೊಳಕೆ ಪರೀಕ್ಷೆ.",
    activePhase: "ಸಕ್ರಿಯ ಹಂತ",
    activeRule: "ನಿಯಮ",

    germinationRate: "ಮೊಳಕೆಯೊಡೆಯುವ ದರ",
    sproutsDetected: "ಬಂದ ಮೊಳಕೆಗಳು",
    canopyCover: "ಹಸಿರು ವ್ಯಾಪ್ತಿ",
    vigorScore: "ಬೀಜದ ಚೈತನ್ಯ ಸೂಚ್ಯಂಕ",
    ofSown: "ಬಿತ್ತಿದ ಬೀಜಗಳಲ್ಲಿ",
    optimalSaturation: "ಉತ್ತಮ ತೇವಾಂಶ",
    irrigationNeeded: "ನೀರಿನ ಅಗತ್ಯವಿದೆ",
    climateNormal: "ಹವಾಮಾನ ಸಾಮಾನ್ಯ",
    cleanAtmosphere: "ಸ್ವಚ್ಛ ವಾತಾವರಣ",
    rotGasSurge: "ಕೊಳೆತ ಅನಿಲ ಏರಿಕೆ",

    seedMonitorTitle: "ನೈಜ-ಸಮಯದ ಬೀಜ ಮೊಳಕೆ ಮತ್ತು ಬೆಳವಣಿಗೆ ಮಾನಿಟರ್",
    seedMonitorSubtitle: "ಕಂಪ್ಯೂಟರ್ ವಿಷನ್ ಫಿನೋಟೈಪಿಂಗ್ • ಹಸಿರು ಸೂಚ್ಯಂಕ (ExG) • ತಟ್ಟೆಯ ಆರೋಗ್ಯ",
    tabTrayMap: "ಎಐ ತಟ್ಟೆ ನಕ್ಷೆ",
    tabTrayPhoto: "ತಟ್ಟೆಯ ಫೋಟೋ",
    tabPhenoMetrics: "ಮೊಳಕೆ ಅಂಕಿಅಂಶ",
    sproutInspector: "ಆಯ್ದ ಮೊಳಕೆಯ ತಪಾಸಣೆ",
    sproutHeight: "ಮೊಳಕೆಯ ಎತ್ತರ",
    sproutVigor: "ವೈಯಕ್ತಿಕ ಚೈತನ್ಯ",
    radicleIntegrity: "ಬೇರಿನ ಸಾಮರ್ಥ್ಯ",
    chlorophyllLevel: "ಕ್ಲೋರೊಫಿಲ್ ಮಟ್ಟ",
    optimalPrime: "ಉತ್ತಮ ಗುಣಮಟ್ಟ",
    growthLifecycle: "ಬೀಜ ಮೊಳಕೆಯೊಡೆಯುವ ಜೀವನಚಕ್ರ",
    day1: "ದಿನ 1: ನೀರು ಹೀರಿಕೊಳ್ಳುವಿಕೆ",
    day2: "ದಿನ 2: ಮೂಲಬೇರು ಹೊರಹೊಮ್ಮುವಿಕೆ (ಸಕ್ರಿಯ)",
    day3: "ದಿನ 3: ಚಿಗುರು ಮತ್ತು ಎಲೆಗಳ ವಿಸ್ತರಣೆ",
    day5: "ದಿನ 5: ಹೊಲಕ್ಕೆ ನಾಟಿ ಮಾಡಲು ಸಿದ್ಧ",
    agronomistAdvice: "ಕೃಷಿ ತಜ್ಞರ ಸಲಹೆ",
    agronomistAdviceText: "ನರ್ಸರಿ ತಟ್ಟೆಯಲ್ಲಿ ತೇವಾಂಶ 52% ಸೂಕ್ತವಾಗಿದೆ. ತೇವಾಂಶ ಕಾಪಾಡಲು ಕಿಂಡಿ ಮುಚ್ಚಲಾಗಿದೆ. 14 ಗಂಟೆಗಳಲ್ಲಿ ಮೊದಲ ಬೆಳಕಿನ ಚಕ್ರಕ್ಕೆ ಸಿದ್ಧವಾಗಿದೆ.",
    uploadTrayPhoto: "ತಟ್ಟೆಯ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    loadBenchmark: "ಮಾದರಿ ಬೆಂಚ್‌ಮಾರ್ಕ್ ಲೋಡ್ ಮಾಡಿ",
    noPhotoUploaded: "ಯಾವುದೇ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಆಗಿಲ್ಲ",
    noPhotoDesc: "ನೈಜ-ಸಮಯದ ಮೊಳಕೆ ವಿಶ್ಲೇಷಣೆಗಾಗಿ ನಿಮ್ಮ ನರ್ಸರಿ ತಟ್ಟೆಯ ಮೇಲಿನಿಂದ ಫೋಟೋ ತೆಗೆಯಿರಿ ಅಥವಾ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",

    sensorGridTitle: "ಲೈವ್ ಹಾರ್ಡ್‌ವೇರ್ ಸೆನ್ಸರ್ ಜಾಲ",
    sensorGridSubtitle: "10-ಬಿಟ್ ಅನಲಾಗ್ ಪರಿವರ್ತನೆ ಮತ್ತು ಕ್ಯಾಲಿಬ್ರೇಟ್ ಮಾಡಲಾದ ಡಿಜಿಟಲ್ ಡೇಟಾ",
    channelsActive: "7 ಚಾನಲ್‌ಗಳು ಸಕ್ರಿಯ",
    soilMoisture1: "ತಟ್ಟೆಯ ತೇವಾಂಶ #1 (A0)",
    soilMoisture2: "ಹೊಲದ ತೇವಾಂಶ #2 (A1)",
    storageClimate: "ಸಂಗ್ರಹಣಾ ಹವಾಮಾನ (DHT1)",
    germinationClimate: "ಮೊಳಕೆ ಕೋಣೆ ಹವಾಮಾನ (DHT2)",
    gasPurity: "ಅನಿಲ ಶುದ್ಧತೆ (MQ135)",
    dewPoint: "ಇಬ್ಬನಿ ಬಿಂದು ಅಪಾಯ",
    irrigationWatchdog: "ನೀರಾವರಿ ಸುರಕ್ಷತಾ ಚಕ್ರ",
    targetRange: "ಗುರಿ: 35–60%",
    airDry: "0% (ಒಣಗಿದ ಗಾಳಿ)",
    waterWet: "100% (ತೇವಾಂಶ)",
    marginDew: "ಇಬ್ಬನಿ ಅಂತರ (T - Td)",
    sweatingWarning: "ಧಾನ್ಯ ಬೆವರುವ ಎಚ್ಚರಿಕೆ",
    sweatingSafe: "ಸುರಕ್ಷಿತ ಒಣ ಸ್ಥಿತಿ",
    maxPumpRun: "ಗರಿಷ್ಠ ಪಂಪ್ ಸಮಯ ಮಿತಿ",
    forcedCooldown: "ತಂಪಾಗಿಸುವ ವಿರಾಮ",

    actuatorTitle: "ಪವರ್ ಕಂಟ್ರೋಲ್ ಡೆಸ್ಕ್ (ಆಕ್ಚುಯೇಟರ್ಸ್)",
    actuatorSubtitle: "ಕಂಪ್ಯೂಟರ್ ಅಥವಾ ಫೋನ್‌ನಿಂದ ನೇರ ನಿಯಂತ್ರಣ (ಶೂನ್ಯ ವಿಳಂಬ)",
    resumeAuto: "ಸ್ವಯಂಚಾಲಿತ ನಿಯಂತ್ರಣಕ್ಕೆ ಮರಳಿ",
    pumpMotor: "ನೀರಿನ ಪಂಪ್ ಮೋಟರ್",
    pumpMotorDesc: "ಪಿನ್ D13 (5V ಸಬ್‌ಮರ್ಸಿಬಲ್ ಪಂಪ್ ನಿಯಂತ್ರಿಸುವ ರಿಲೇ).",
    pumpOn: "ಮೋಟರ್ ಚಾಲು",
    pumpOff: "ಮೋಟರ್ ಬಂದ್",
    ventAperture: "ಹವಾಮಾನ ಗಾಳಿ ಕಿಂಡಿ",
    ventDesc: "ಪಿನ್ D5 (ಟವರ್ ಪ್ರೋ SG90 ಸರ್ವೋ ಕಿಂಡಿ: 0° ಮುಚ್ಚಳ - 90° ತೆರೆದ).",
    shadeCover: "ತಟ್ಟೆಯ ನೆರಳು ಮುಚ್ಚಳ",
    shadeDesc: "ಪಿನ್ D6 (ಮೊಳಕೆ ಕತ್ತಲೆಯ ಚಕ್ರ ಮತ್ತು ಬಿಸಿಲಿನ ನೆರಳು ನಿಯಂತ್ರಣ).",
    buzzerAnnunciator: "ಬಜರ್ ಅಲಾರಾಂ ಧ್ವನಿ",
    buzzerDesc: "TMB12A12 ಸಕ್ರಿಯ ಎಲೆಕ್ಟ್ರೋಮ್ಯಾಗ್ನೆಟಿಕ್ ಬೀಪರ್ ಪರೀಕ್ಷೆ.",
    buzzerTest: "ಬಜರ್ ಧ್ವನಿ ಪರೀಕ್ಷಿಸಿ",
    lastCommand: "ಕೊನೆಯದಾಗಿ ಕಳುಹಿಸಿದ ಆಜ್ಞೆ",

    explainableTitle: "ವಿವರಣಾತ್ಮಕ ನಿರ್ಧಾರ ಇಂಜಿನ್ (X-CPS)",
    explainableSubtitle: "ಪಾರದರ್ಶಕ ನಿರ್ಧಾರ: ಅಳತೆ → ವೈಜ್ಞಾನಿಕ ಕಾರಣ → ಕಾರ್ಯಾಚರಣೆ ಅಥವಾ ನಿರಾಕರಣೆ",
    patentBadge: "ಪೇಟೆಂಟ್ ದರ್ಜೆಯ ನಿರ್ಧಾರ ವ್ಯವಸ್ಥೆ",
    lcdHardwareMirror: "ಆರ್ಡುನೊ 16x2 ಎಲ್‌ಸಿಡಿ ಪರದೆ ಮಿರರ್",
    activeRuleLabel: "ಸಕ್ರಿಯ ವೈಜ್ಞಾನಿಕ ನಿಯಮ",
    sensorInputTrigger: "ಸೆನ್ಸರ್ ಪ್ರಚೋದಕ",
    actionStatus: "ಕಾರ್ಯ ಅಥವಾ ನಿರಾಕರಣೆ ಸ್ಥಿತಿ",
    causalRationale: "ವೈಜ್ಞಾನಿಕ ಸಮರ್ಥನೆ",

    trendTitle: "ನೈಜ-ಸಮಯದ ಹವಾಮಾನ ಟ್ರೆಂಡ್‌ಲೈನ್‌ಗಳು",
    trendSubtitle: "ಆರ್ಡುನೊದಿಂದ ಪ್ರತಿ ಸೆಕೆಂಡಿಗೆ ದಾಖಲಾಗುವ 1 Hz ಡೇಟಾ",
    liveWindow: "ಕಳೆದ 30 ಡೇಟಾ ಸ್ಯಾಂಪಲ್‌ಗಳು (ಲೈವ್ ವಿಂಡೋ)",

    institution: "ಯೆನೆಪೋಯ ಇನ್ಸ್ಟಿಟ್ಯೂಟ್ ಆಫ್ ಟೆಕ್ನಾಲಜಿ, ಮೂಡುಬಿದಿರೆ",
    ieeePaper: "ಐಇಇಇ ಪೇಪರ್ ಮತ್ತು ಪೇಟೆಂಟ್ ಸಿದ್ಧತೆ",
  },

  tu: {
    appName: "ಚಿಗುರು • Chiguru",
    subtitle: "ಸ್ವಾಯತ್ತ ಕೃಷಿ ಯಂತ್ರ ಬುದ್ಧಿ ಮತ್ತೆ ಬಿತ್ತ್ ಮೊಳಕೆ ಲೆಕ್ಕಾಚಾರ",
    teamName: "ಟೀಮ್ ಟೆರಾಬೈಟ್ · YEN NOVA 1.0",
    hardwareConnected: "ಹಾರ್ಡ್‌ವೇರ್ ಜೋಡಣೆ ಆತ್ಂಡ್",
    hardwareDisconnected: "ಡೆಮೋ ಡೇಟಾ (ಸಿಮ್ಯುಲೇಶನ್)",
    connectHardware: "ಹಾರ್ಡ್‌ವೇರ್ ಜೋಡಣೆ ಮಲ್ಪುಲೆ",
    done: "ಆಂಡ್",
    selectUsb: "ಯುಎಸ್‌ಬಿ ಪೋರ್ಟ್ ತೂಲೆ",
    bridgeActive: "ಬ್ರಿಡ್ಜ್ ಕೆಲಸ ಮಲ್ತೊಂದುಂಡು",
    mode0: "ಬಾರ್ ದಾಸ್ತಾನು",
    mode1: "ಬಿತ್ತ್ ಮೊಳಕೆ ತಟ್ಟೆ",
    mode2: "ಕಂಡ ನೀರಾವರಿ",
    mode0Desc: "ಬಿತ್ತಿ ಬೊಕ್ಕ ಕೊಟ್ಯದ ಬಾರ್",
    mode1Desc: "ನರ್ಸರಿ ತಟ್ಟೆ ಬೊಕ್ಕ ನೀರ್",
    mode2Desc: "ಬುಲೆಚಿಲ್ ಕಂಡದ ಜಾಗೆ",

    heroTag: "ಕೃಷಿ ಬುದ್ಧಿವಂತ ಸಿಪಿಎಸ್ ವ್ಯವಸ್ಥೆ · ಪೇಟೆಂಟ್ ಗುಣಮಟ್ಟ",
    heroHeading: "ಪ್ರತಿ ಬಿತ್ತ್‌ಗ್‌ಲಾ ಚಾಣಾಕ್ಷ ತಂತ್ರಜ್ಞಾನದ ಬಲ.",
    heroSubtext: "ಸ್ವಾಯತ್ತ ಗಾಳಿ-ಬೆಚ್ಚ ನಿಯಂತ್ರಣ, ಕಂಡೊಗು ನೀರ್ ಪಾಡುನ ವ್ಯವಸ್ಥೆ ಬೊಕ್ಕ ಬಿತ್ತ್ ಮೊಳಕೆ ತೂಪುನ ಕಂಪ್ಯೂಟರ್ ಕ್ಯಾಮೆರಾ.",
    activePhase: "ಇತ್ತೆದ ಹಂತ",
    activeRule: "ನಿಯಮ",

    germinationRate: "ಮೊಳಕೆ ಶೇಕಡಾವಾರು",
    sproutsDetected: "ಮೊಳೆತಿನ ಬಿತ್ತ್",
    canopyCover: "ಪಚ್ಚೆ ಪಸೆ",
    vigorScore: "ಬಿತ್ತ್ ಚೈತನ್ಯ",
    ofSown: "ಪಾಡ್ದಿನ ಬಿತ್ತ್‌ಲೆಡ್",
    optimalSaturation: "ಸರಿಯಾದ ಪಸೆ",
    irrigationNeeded: "ನೀರ್ ಬೋಡು",
    climateNormal: "ಹವಾಮಾನ ಎಡ್ಡ ಉಂಡು",
    cleanAtmosphere: "ಸ್ವಚ್ಛ ಗಾಳಿ",
    rotGasSurge: "ಕೊಳೆತ ಅನಿಲ ಜಾಸ್ತಿ",

    seedMonitorTitle: "ಲೈವ್ ಬಿತ್ತ್ ಮೊಳಕೆ ಪರಿಶೀಲನೆ",
    seedMonitorSubtitle: "ಕ್ಯಾಮೆರಾ ಎಐ • ಹಸಿರು ತೇಜಸ್ಸು • ಬಿತ್ತ್ ಬಲ",
    tabTrayMap: "ಎಐ ತಟ್ಟೆ ನಕ್ಷೆ",
    tabTrayPhoto: "ತಟ್ಟೆ ಫೋಟೋ",
    tabPhenoMetrics: "ಮೊಳಕೆ ಲೆಕ್ಕ",
    sproutInspector: "ಆಜಿನ ಮೊಳಕೆ ಪರೀಕ್ಷೆ",
    sproutHeight: "ಮೊಳಕೆ ಎತ್ತರ",
    sproutVigor: "ಬಿತ್ತ್‌ದ ಬಲ",
    radicleIntegrity: "ಬೇರ್‌ದ ಗಟ್ಟಿ",
    chlorophyllLevel: "ಪಚ್ಚೆ ಬಣ್ಣದ ಮಟ್ಟ",
    optimalPrime: "ಬಾರೀ ಎಡ್ಡ ಗುಣಮಟ್ಟ",
    growthLifecycle: "ಬಿತ್ತ್ ಮೊಳಕೆ ಬರ್ಪಿನ ಹಂತ",
    day1: "ದಿನ 1: ನೀರ್ ಒಯಿಪುನ",
    day2: "ದಿನ 2: ತಿರ್ತ್ ಬೇರ್ ಬರ್ಪಿನ (ಸಕ್ರಿಯ)",
    day3: "ದಿನ 3: ಮೇಲ್ ಚಿಗುರು ಬರ್ಪಿನ",
    day5: "ದಿನ 5: ಕಂಡೊಗು ಪಾಡೆರೆ ತಯಾರ್",
    agronomistAdvice: "ಕೃಷಿಕರ ಸಲಹೆ",
    agronomistAdviceText: "ತಟ್ಟೆಡ್ ಪಸೆ 52% ಎಡ್ಡ ಉಂಡು. ಪಸೆ ಉರಿಯರೆ ಕಿಂಡಿ ಮುಚ್ಚಿದ್ಂಡ್. 14 ಗಂಟೆಡ್ ಬೊಲ್ಪುಗು ತಯಾರ್ ಆಪುಂಡು.",
    uploadTrayPhoto: "ತಟ್ಟೆ ಫೋಟೋ ಪಾಡುಲೆ",
    loadBenchmark: "ಮಾದರಿ ಬೆಂಚ್‌ಮಾರ್ಕ್ ತೂಲೆ",
    noPhotoUploaded: "ಫೋಟೋ ಪಾತ್‌ಜಿ",
    noPhotoDesc: "ಬಿತ್ತ್ ಮೊಳಕೆ ತೂಯೆರೆ ನಿಕ್ಲೆನ ನರ್ಸರಿ ತಟ್ಟೆದ ಫೋಟೋ ಒಯಿತ್‌ದ್ ಪಾಡುಲೆ.",

    sensorGridTitle: "ಲೈವ್ ಸೆನ್ಸರ್ ನೆಟ್‌ವರ್ಕ್",
    sensorGridSubtitle: "10-ಬಿಟ್ ಅನಲಾಗ್ ಬೊಕ್ಕ ಡಿಜಿಟಲ್ ಸೆನ್ಸರ್ ಡೇಟಾ",
    channelsActive: "7 ಚಾನಲ್ ಲೈವ್",
    soilMoisture1: "ತಟ್ಟೆ ಪಸೆ #1 (A0)",
    soilMoisture2: "ಕಂಡ ಪಸೆ #2 (A1)",
    storageClimate: "ಕೊಟ್ಯದ ಗಾಳಿ-ಬೆಚ್ಚ (DHT1)",
    germinationClimate: "ಮೊಳಕೆ ಜಾಗೆ (DHT2)",
    gasPurity: "ಕೊಳೆಯುನ ಅನಿಲ (MQ135)",
    dewPoint: "ಮಂಜು ಕರಪುನ ಲೆಕ್ಕ",
    irrigationWatchdog: "ನೀರ್ ಪಾಡುನ ಸುರಕ್ಷತೆ",
    targetRange: "ಗುರಿ: 35–60%",
    airDry: "0% (ನುಂಗಿನ ಗಾಳಿ)",
    waterWet: "100% (ನೀರ್)",
    marginDew: "ಮಂಜು ಅಂತರ (T - Td)",
    sweatingWarning: "ಬಾರ್ ಬೆವರುನ ಎಚ್ಚರಿಕೆ",
    sweatingSafe: "ಸುರಕ್ಷಿತ",
    maxPumpRun: "ಪಂಪ್ ಮಿತಿ ಸಮಯ",
    forcedCooldown: "ತಂಪು ಮಲ್ಪುನ ವಿರಾಮ",

    actuatorTitle: "ಮಿಷನ್ ನಿಯಂತ್ರಣ ಡೆಸ್ಕ್ (ಆಕ್ಚುಯೇಟರ್ಸ್)",
    actuatorSubtitle: "ಫೋನ್ ಅಥವಾ ಲ್ಯಾಪ್‌ಟಾಪ್‌ರ್ದ್ ನೇರ ನಿಯಂತ್ರಣ",
    resumeAuto: "ಆಟೋಮ್ಯಾಟಿಕ್ ಮೋಡ್‌ಗ್ ಪೋಲೆ",
    pumpMotor: "ನೀರ್ ಪಂಪ್ ಮೋಟರ್",
    pumpMotorDesc: "ಪಿನ್ D13 (5V ಪಂಪ್ ಮೋಟರ್ ರಿಲೇ).",
    pumpOn: "ಮೋಟರ್ ಚಾಲು",
    pumpOff: "ಮೋಟರ್ ಬಂದ್",
    ventAperture: "ಕಿಂಡಿ ಸರ್ವೋ",
    ventDesc: "ಪಿನ್ D5 (SG90 ಸರ್ವೋ ಕಿಂಡಿ: 0° ಮುಚ್ಚಿದ್ಂಡ್ - 90° ತೆರೆದ್ಂಡ್).",
    shadeCover: "ನೆಳಲ್ ಮುಚ್ಚಳ",
    shadeDesc: "ಪಿನ್ D6 (ಮೊಳಕೆ ಕತ್ತಲೆ ಬೊಕ್ಕ ಬಿಸಿಲ್ ನಿಯಂತ್ರಣ).",
    buzzerAnnunciator: "ಬಜರ್ ಸೌಂಡ್",
    buzzerDesc: "TMB12A12 ಸೌಂಡ್ ಅಲಾರಾಂ ಪರೀಕ್ಷೆ.",
    buzzerTest: "ಬಜರ್ ಸೌಂಡ್ ಕೇನುಲೆ",
    lastCommand: "ಕೊನೆಗೆ ಕಡಪುಡಿನ ಆಜ್ಞೆ",

    explainableTitle: "ಕಾರಣ ತೆರಿಪಾವುನ ಎಐ ವ್ಯವಸ್ಥೆ (X-CPS)",
    explainableSubtitle: "ಅಳತೆ → ವೈಜ್ಞಾನಿಕ ಕಾರಣ → ಕೆಲಸ ಅಥವಾ ನಿರಾಕರಣೆ",
    patentBadge: "ಪೇಟೆಂಟ್ ಮಟ್ಟದ ಎಐ ಇಂಜಿನ್",
    lcdHardwareMirror: "ಆರ್ಡುನೊ 16x2 ಎಲ್‌ಸಿಡಿ ಪರದೆ",
    activeRuleLabel: "ಇತ್ತೆದ ವೈಜ್ಞಾನಿಕ ನಿಯಮ",
    sensorInputTrigger: "ಸೆನ್ಸರ್ ಗುರುತು",
    actionStatus: "ಕೆಲಸ ಅಥವಾ ನಿರಾಕರಣೆ",
    causalRationale: "ವೈಜ್ಞಾನಿಕ ಕಾರಣ",

    trendTitle: "ಲೈವ್ ಹವಾಮಾನ ಟ್ರೆಂಡ್‌ಲೈನ್‌ಗಳು",
    trendSubtitle: "ಆರ್ಡುನೊರ್ದ್ ಪ್ರತಿ ಸೆಕೆಂಡ್‌ಗ್ ಬರ್ಪಿನ ಡೇಟಾ",
    liveWindow: "ಕರಿನ 30 ಸ್ಯಾಂಪಲ್‌ಗಳು (ಲೈವ್)",

    institution: "ಯೆನೆಪೋಯ ಇನ್ಸ್ಟಿಟ್ಯೂಟ್ ಆಫ್ ಟೆಕ್ನಾಲಜಿ, ಮೂಡುಬಿದಿರೆ",
    ieeePaper: "ಐಇಇಇ ಪೇಪರ್ ಬೊಕ್ಕ ಪೇಟೆಂಟ್ ತಯಾರ್",
  },

  hi: {
    appName: "Chiguru • चिगुरु",
    subtitle: "स्वायत्त स्मार्ट एग्री-सीपीएस एवं लाइव बीज अंकुरण विश्लेषण",
    teamName: "टीम टेराबाइट · YEN NOVA 1.0",
    hardwareConnected: "हार्डवेयर कनेक्टेड",
    hardwareDisconnected: "सिम्युलेटेड टेलीमेट्री",
    connectHardware: "हार्डवेयर कनेक्ट करें",
    done: "पूर्ण",
    selectUsb: "आर्डुइनो यूएसबी पोर्ट चुनें",
    bridgeActive: "ब्रिज सक्रिय एवं चालू",
    mode0: "अनाज भंडारण",
    mode1: "नर्सरी अंकुरण",
    mode2: "खेत सिंचाई",
    mode0Desc: "बुवाई पूर्व एवं भंडार साइलो",
    mode1Desc: "नर्सरी ट्रे एवं सूक्ष्म सिंचाई",
    mode2Desc: "वानस्पतिक खेत क्षेत्र",

    heroTag: "पूर्ण जीवन-चक्र स्मार्ट एग्री-सीपीएस · पेटेंट ग्रेड",
    heroHeading: "प्रत्येक बीज के लिए बुद्धिमत्ता का पोषण।",
    heroSubtext: "स्वायत्त सूक्ष्म-जलवायु नियंत्रण, बंद-लूप उप-सतह सिंचाई और जलवायु-सहिष्णु खेती के लिए रीयल-टाइम कंप्यूटर विज़न बीज अंकुरण विश्लेषण।",
    activePhase: "सक्रिय चरण",
    activeRule: "नियम",

    germinationRate: "अंकुरण दर",
    sproutsDetected: "अंकुरित पौधे",
    canopyCover: "हरित छत्र कवरेज",
    vigorScore: "बीज ओज सूचकांक",
    ofSown: "बोए गए बीजों में से",
    optimalSaturation: "इष्टतम नमी",
    irrigationNeeded: "सिंचाई आवश्यक",
    climateNormal: "जलवायु सामान्य",
    cleanAtmosphere: "स्वच्छ वातावरण",
    rotGasSurge: "सड़न गैस वृद्धि",

    seedMonitorTitle: "रियल-टाइम बीज अंकुरण एवं पौध मॉनिटर",
    seedMonitorSubtitle: "कंप्यूटर विज़न फेनोटाइपिंग • हरित सूचकांक (ExG) • ट्रे स्वास्थ्य",
    tabTrayMap: "एआई ट्रे मानचित्र",
    tabTrayPhoto: "ट्रे फोटो",
    tabPhenoMetrics: "फेनो-मीट्रिक्स",
    sproutInspector: "चयनित अंकुर निरीक्षण",
    sproutHeight: "अंकुर की ऊंचाई",
    sproutVigor: "व्यक्तिगत ओज सूचकांक",
    radicleIntegrity: "मूल अखंडता",
    chlorophyllLevel: "क्लोरोफिल स्तर",
    optimalPrime: "उत्कृष्ट गुणवत्ता",
    growthLifecycle: "बीज अंकुरण जीवन चक्र",
    day1: "दिन 1: जल अवशोषण",
    day2: "दिन 2: मूलांकुर उद्भव (सक्रिय)",
    day3: "दिन 3: प्ररोह एवं पत्ती विस्तार",
    day5: "दिन 5: खेत हेतु तैयार",
    agronomistAdvice: "कृषि विशेषज्ञ सलाह",
    agronomistAdviceText: "नर्सरी ट्रे में नमी 52% इष्टतम है। नमी बनाए रखने हेतु वेंट बंद है। 14 घंटे में प्रथम प्रकाश चक्र हेतु तैयार।",
    uploadTrayPhoto: "ट्रे फोटो अपलोड करें",
    loadBenchmark: "बेंचमार्क लोड करें",
    noPhotoUploaded: "कोई फोटो अपलोड नहीं",
    noPhotoDesc: "रीयल-टाइम पौध विश्लेषण हेतु अपनी नर्सरी ट्रे की ऊपर से फोटो लें या अपलोड करें।",

    sensorGridTitle: "लाइव हार्डवेयर सेंसर नेटवर्क",
    sensorGridSubtitle: "10-बिट एनालॉग रूपांतरण एवं कैलिब्रेटेड डिजिटल डेटा",
    channelsActive: "7 चैनल सक्रिय",
    soilMoisture1: "ट्रे नमी #1 (A0)",
    soilMoisture2: "खेत नमी #2 (A1)",
    storageClimate: "भंडारण जलवायु (DHT1)",
    germinationClimate: "अंकुरण कक्ष जलवायु (DHT2)",
    gasPurity: "सड़न गैस सूचकांक (MQ135)",
    dewPoint: "ओस बिंदु संघनन",
    irrigationWatchdog: "सिंचाई सुरक्षा लूप",
    targetRange: "लक्ष्य: 35–60%",
    airDry: "0% (शुष्क हवा)",
    waterWet: "100% (गीला)",
    marginDew: "ओस अंतर (T - Td)",
    sweatingWarning: "अनाज पसीना चेतावनी",
    sweatingSafe: "शुष्क / सुरक्षित",
    maxPumpRun: "अधिकतम पंप संचालन सीमा",
    forcedCooldown: "अनिवार्य शीतलन विराम",

    actuatorTitle: "इंटरएक्टिव हार्डवेयर कंट्रोल डेस्क",
    actuatorSubtitle: "शून्य-विलंबता रिमोट नियंत्रण (वेब सीरियल / ब्रिज)",
    resumeAuto: "स्वचालित लूप पर लौटें",
    pumpMotor: "जल पंप मोटर",
    pumpMotorDesc: "पिन D13 (5V सबमर्सिबल पंप चलाने वाला रिले)।",
    pumpOn: "मोटर चालू",
    pumpOff: "मोटर बंद",
    ventAperture: "जलवायु वेंट सर्वो",
    ventDesc: "पिन D5 (SG90 सर्वो फ्लैप: 0° बंद - 90° खुला)।",
    shadeCover: "ट्रे छाया कवर सर्वो",
    shadeDesc: "पिन D6 (अंकुरण अंधेरा एवं दोपहर धूप छाया नियंत्रण)।",
    buzzerAnnunciator: "बजर उद्घोषक",
    buzzerDesc: "TMB12A12 सक्रिय इलेक्ट्रोमैग्नेटिक बीपर परीक्षण।",
    buzzerTest: "बजर ध्वनि परीक्षण",
    lastCommand: "अंतिम भेजा गया कमांड",

    explainableTitle: "व्याख्यात्मक निर्णय प्रणाली (X-CPS)",
    explainableSubtitle: "पारदर्शी कारण-कार्य प्रणाली: माप → वैज्ञानिक कारण → कार्रवाई अथवा इनकार",
    patentBadge: "पेटेंट-ग्रेड निर्णय इंजन",
    lcdHardwareMirror: "आर्डुइनो 16x2 एलसीडी स्क्रीन मिरर",
    activeRuleLabel: "सक्रिय वैज्ञानिक नियम",
    sensorInputTrigger: "सेंसर इनपुट ट्रिगर",
    actionStatus: "कार्रवाई या इनकार स्थिति",
    causalRationale: "वैज्ञानिक कारण",

    trendTitle: "रियल-टाइम जलवायु प्रवृत्तियां",
    trendSubtitle: "आर्डुइनो से 1 Hz दर पर निरंतर डेटा रिकॉर्डिंग",
    liveWindow: "पिछले 30 डेटा नमूने (लाइव)",

    institution: "येनेपोया इंस्टीट्यूट ऑफ टेक्नोलॉजी, मूडबिद्री",
    ieeePaper: "आईईईई पेपर एवं पेटेंट हेतु तैयार",
  },
};
