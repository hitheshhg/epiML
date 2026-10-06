export type Language = "en" | "kn" | "tu" | "hi";

export interface TranslationDict {
  appName: string;
  subtitle: string;
  teamName: string;
  hardwareConnected: string;
  hardwareDisconnected: string;
  connectHardware: string;
  mode0: string;
  mode1: string;
  mode2: string;
  seedMonitoring: string;
  seedSubheading: string;
  germinationRate: string;
  sproutsDetected: string;
  canopyCover: string;
  vigorScore: string;
  seedStage: string;
  soilMoisture1: string;
  soilMoisture2: string;
  storageClimate: string;
  germinationClimate: string;
  gasPurity: string;
  dewPoint: string;
  pumpControl: string;
  pumpOn: string;
  pumpOff: string;
  ventControl: string;
  coverControl: string;
  buzzerTest: string;
  explainableAi: string;
  currentDecision: string;
  whyAction: string;
}

export const translations: Record<Language, TranslationDict> = {
  en: {
    appName: "Chiguru • ಚಿಗುರು",
    subtitle: "Autonomous Smart Agri-CPS & Real-Time Seed Phenotyping",
    teamName: "Team TerraByte · YEN NOVA 1.0",
    hardwareConnected: "Hardware Connected",
    hardwareDisconnected: "Simulated Telemetry",
    connectHardware: "Connect Hardware",
    mode0: "Grain Storage",
    mode1: "Nursery Germination",
    mode2: "Field Irrigation",
    seedMonitoring: "Real-Time Seedling & Germination Monitor",
    seedSubheading: "Computer Vision Phenotyping • Excess Green Index (ExG) • Tray Vigor",
    germinationRate: "Germination Rate",
    sproutsDetected: "Sprouts Emerged",
    canopyCover: "Canopy Green Cover",
    vigorScore: "Seed Vigor Index",
    seedStage: "Growth Stage",
    soilMoisture1: "Tray Moisture #1",
    soilMoisture2: "Field Moisture #2",
    storageClimate: "Storage Climate (DHT1)",
    germinationClimate: "Germination Climate (DHT2)",
    gasPurity: "Rot Gas Air Index (MQ135)",
    dewPoint: "Dew Point Condensation",
    pumpControl: "Submersible Pump Relay (D13)",
    pumpOn: "Pump ON",
    pumpOff: "Pump OFF",
    ventControl: "Climate Vent Aperture (Servo 1)",
    coverControl: "Tray Shade Cover (Servo 2)",
    buzzerTest: "Test Buzzer Alarm",
    explainableAi: "Explainable CPS Decision Engine",
    currentDecision: "Active System Rule",
    whyAction: "Decision Rationale & Physical Actuation",
  },
  kn: {
    appName: "ಚಿಗುರು • Chiguru",
    subtitle: "ಸ್ವಾಯತ್ತ ಸ್ಮಾರ್ಟ್ ಕೃಷಿ-ಸಿಪಿಎಸ್ ಮತ್ತು ನೈಜ-ಸಮಯದ ಬೀಜ ಮೊಳಕೆ ಮಾನಿಟರ್",
    teamName: "ಟೀಮ್ ಟೆರಾಬೈಟ್ · YEN NOVA 1.0",
    hardwareConnected: "ಹಾರ್ಡ್‌ವೇರ್ ಸಂಪರ್ಕಗೊಂಡಿದೆ",
    hardwareDisconnected: "ಮಾದರಿ ಡೇಟಾ (ಸಿಮ್ಯುಲೇಶನ್)",
    connectHardware: "ಹಾರ್ಡ್‌ವೇರ್ ಸಂಪರ್ಕಿಸಿ",
    mode0: "ಧಾನ್ಯ ಸಂಗ್ರಹಣೆ",
    mode1: "ಮೊಳಕೆ ತಟ್ಟೆ ನಿಯಂತ್ರಣ",
    mode2: "ಹೊಲ ನೀರಾವರಿ",
    seedMonitoring: "ನೈಜ-ಸಮಯದ ಬೀಜ ಮೊಳಕೆ ಮತ್ತು ಬೆಳವಣಿಗೆ ಮಾನಿಟರ್",
    seedSubheading: "ಕಂಪ್ಯೂಟರ್ ವಿಷನ್ ಫಿನೋಟೈಪಿಂಗ್ • ಮೊಳಕೆ ಎಣಿಕೆ • ತಟ್ಟೆಯ ಆರೋಗ್ಯ",
    germinationRate: "ಮೊಳಕೆಯೊಡೆಯುವ ದರ",
    sproutsDetected: "ಬಂದ ಮೊಳಕೆಗಳು",
    canopyCover: "ಹಸಿರು ವ್ಯಾಪ್ತಿ",
    vigorScore: "ಬೀಜದ ಚೈತನ್ಯ ಸೂಚ್ಯಂಕ",
    seedStage: "ಬೆಳವಣಿಗೆಯ ಹಂತ",
    soilMoisture1: "ತಟ್ಟೆಯ ತೇವಾಂಶ #1",
    soilMoisture2: "ಹೊಲದ ತೇವಾಂಶ #2",
    storageClimate: "ಸಂಗ್ರಹಣಾ ಹವಾಮಾನ (DHT1)",
    germinationClimate: "ಮೊಳಕೆ ಕೋಣೆ ಹವಾಮಾನ (DHT2)",
    gasPurity: "ಅನಿಲ ಶುದ್ಧತೆ (MQ135)",
    dewPoint: "ಇಬ್ಬನಿ ಬಿಂದು ಅಪಾಯ",
    pumpControl: "ನೀರಿನ ಪಂಪ್ ರಿಲೇ (D13)",
    pumpOn: "ಪಂಪ್ ಚಾಲು",
    pumpOff: "ಪಂಪ್ ಬಂದ್",
    ventControl: "ಗಾಳಿ ಕಿಂಡಿ ಸರ್ವೋ 1",
    coverControl: "ನೆರಳು ಮುಚ್ಚಳ ಸರ್ವೋ 2",
    buzzerTest: "ಬಜರ್ ಧ್ವನಿ ಪರೀಕ್ಷೆ",
    explainableAi: "ವಿವರಣಾತ್ಮಕ ನಿರ್ಧಾರ ಇಂಜಿನ್",
    currentDecision: "ಪ್ರಸ್ತುತ ನಿಯಮ",
    whyAction: "ಕಾರ್ಯಾಚರಣೆಯ ವೈಜ್ಞಾನಿಕ ಕಾರಣ",
  },
  tu: {
    appName: "ಚಿಗುರು • Chiguru",
    subtitle: "ಸ್ವಾಯತ್ತ ಕೃಷಿ ಯಂತ್ರ ಬುದ್ಧಿ ಮತ್ತೆ ಬೀಜದ ಮೊಳಕೆ ಲೆಕ್ಕಾಚಾರ",
    teamName: "ಟೀಮ್ ಟೆರಾಬೈಟ್ · YEN NOVA 1.0",
    hardwareConnected: "ಹಾರ್ಡ್‌ವೇರ್ ಜೋಡಣೆ ಆತ್ಂಡ್",
    hardwareDisconnected: "ಡೆಮೋ ಡೇಟಾ",
    connectHardware: "ಹಾರ್ಡ್‌ವೇರ್ ಜೋಡಣೆ ಮಲ್ಪುಲೆ",
    mode0: "ಬಾರ್ ದಾಸ್ತಾನು",
    mode1: "ಬಿತ್ತ್ ಮೊಳಕೆ ತಟ್ಟೆ",
    mode2: "ಕಂಡ ನೀರಾವರಿ",
    seedMonitoring: "ಲೈವ್ ಬಿತ್ತ್ ಮೊಳಕೆ ಪರಿಶೀಲನೆ",
    seedSubheading: "ಕ್ಯಾಮೆರಾ ಎಐ • ಹಸಿರು ತೇಜಸ್ಸು • ಬಿತ್ತ್ ಬಲ",
    germinationRate: "ಮೊಳಕೆ ಶೇಕಡಾವಾರು",
    sproutsDetected: "ಮೊಳೆತಿನ ಬಿತ್ತ್",
    canopyCover: "ಪಚ್ಚೆ ಪಸೆ",
    vigorScore: "ಬಿತ್ತ್ ಚೈತನ್ಯ",
    seedStage: "ಬುಲೆಚಿಲ್ ಹಂತ",
    soilMoisture1: "ತಟ್ಟೆ ಪಸೆ #1",
    soilMoisture2: "ಕಂಡ ಪಸೆ #2",
    storageClimate: "ಕೊಟ್ಯದ ಗಾಳಿ-ಬೆಚ್ಚ (DHT1)",
    germinationClimate: "ಮೊಳಕೆ ಜಾಗ (DHT2)",
    gasPurity: "ಕೊಳೆಯುನ ಅನಿಲ (MQ135)",
    dewPoint: "ಮಂಜು ಕರಪುನ ಲೆಕ್ಕ",
    pumpControl: "ಪಂಪ್ ರಿಲೇ (D13)",
    pumpOn: "ಪಂಪ್ ಚಾಲು",
    pumpOff: "ಪಂಪ್ ಬಂದ್",
    ventControl: "ಕಿಂಡಿ ಸರ್ವೋ 1",
    coverControl: "ನೆಳಲ್ ಮುಚ್ಚಳ ಸರ್ವೋ 2",
    buzzerTest: "ಬಜರ್ ಪರೀಕ್ಷೆ",
    explainableAi: "ಕಾರಣ ತೆರಿಪಾವುನ ಎಐ",
    currentDecision: "ಈಗಿನ ನಿಯಮ",
    whyAction: "ಕಾರ್ಯ ಮಲ್ತಿನ ಕಾರಣ",
  },
  hi: {
    appName: "Chiguru • चिगुरु",
    subtitle: "स्वायत्त स्मार्ट एग्री-सीपीएस एवं लाइव बीज अंकुरण विश्लेषण",
    teamName: "टीम टेराबाइट · YEN NOVA 1.0",
    hardwareConnected: "हार्डवेयर कनेक्टेड",
    hardwareDisconnected: "सिम्युलेटेड टेलीमेट्री",
    connectHardware: "हार्डवेयर कनेक्ट करें",
    mode0: "अनाज भंडारण",
    mode1: "नर्सरी अंकुरण",
    mode2: "खेत सिंचाई",
    seedMonitoring: "रियल-टाइम बीज अंकुरण एवं पौध मॉनिटर",
    seedSubheading: "कंप्यूटर विज़न फेनोटाइपिंग • अंकुरण गणना • ट्रे स्वास्थ्य",
    germinationRate: "अंकुरण दर",
    sproutsDetected: "अंकुरित पौधे",
    canopyCover: "हरित छत्र कवरेज",
    vigorScore: "बीज ओज सूचकांक",
    seedStage: "विकास चरण",
    soilMoisture1: "ट्रे नमी #1",
    soilMoisture2: "खेत नमी #2",
    storageClimate: "भंडारण जलवायु (DHT1)",
    germinationClimate: "अंकुरण कक्ष (DHT2)",
    gasPurity: "सड़न गैस शुद्धता (MQ135)",
    dewPoint: "ओस बिंदु संघनन",
    pumpControl: "जल पंप रिले (D13)",
    pumpOn: "पंप चालू",
    pumpOff: "पंप बंद",
    ventControl: "जलवायु वेंट सर्वो 1",
    coverControl: "छाया कवर सर्वो 2",
    buzzerTest: "बजर ध्वनि परीक्षण",
    explainableAi: "व्याख्यात्मक निर्णय प्रणाली",
    currentDecision: "सक्रिय प्रणाली नियम",
    whyAction: "निर्णय का वैज्ञानिक आधार",
  },
};
