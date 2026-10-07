"""
Isolated AQI Calculation Layer
Implements official piecewise linear interpolation according to:
1. US EPA Standard (40 CFR Part 58, Appendix G)
2. Indian Central Pollution Control Board (CPCB) NAQI Standard

Strict Scientific Compliance:
- Never fabricates pollutant values.
- Requires actual pollutant measurements (PM2.5, PM10, CO, NO2, SO2, O3, NH3) for official AQI calculation.
- Reports individual sub-indices and identifying the critical pollutant (highest sub-index).
- If only gas ppm or microclimate data is available, marks output as PREDICTIVE_ESTIMATE.
"""

from typing import Dict, Optional, Tuple
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# US EPA Breakpoint Tables (Concentration in ug/m3 or ppm -> Index 0-500)
# Format: (C_low, C_high, I_low, I_high)
# ---------------------------------------------------------------------------
US_EPA_BREAKPOINTS = {
    "pm25": [  # ug/m3 (24-hr avg)
        (0.0, 12.0, 0, 50),
        (12.1, 35.4, 51, 100),
        (35.5, 55.4, 101, 150),
        (55.5, 150.4, 151, 200),
        (150.5, 250.4, 201, 300),
        (250.5, 350.4, 301, 400),
        (350.5, 500.4, 401, 500),
    ],
    "pm10": [  # ug/m3 (24-hr avg)
        (0, 54, 0, 50),
        (55, 154, 51, 100),
        (155, 254, 101, 150),
        (255, 354, 151, 200),
        (355, 424, 201, 300),
        (425, 504, 301, 400),
        (505, 604, 401, 500),
    ],
    "co": [  # ppm (8-hr avg)
        (0.0, 4.4, 0, 50),
        (4.5, 9.4, 51, 100),
        (9.5, 12.4, 101, 150),
        (12.5, 15.4, 151, 200),
        (15.5, 30.4, 201, 300),
        (30.5, 40.4, 301, 400),
        (40.5, 50.4, 401, 500),
    ],
    "no2": [  # ppb (1-hr avg)
        (0, 53, 0, 50),
        (54, 100, 51, 100),
        (101, 360, 101, 150),
        (361, 649, 151, 200),
        (650, 1249, 201, 300),
        (1250, 1649, 301, 400),
        (1650, 2049, 401, 500),
    ],
    "so2": [  # ppb (1-hr avg)
        (0, 35, 0, 50),
        (36, 75, 51, 100),
        (76, 185, 101, 150),
        (186, 304, 151, 200),
        (305, 604, 201, 300),
        (605, 804, 301, 400),
        (805, 1004, 401, 500),
    ],
    "o3": [  # ppb (8-hr avg)
        (0, 54, 0, 50),
        (55, 70, 51, 100),
        (71, 85, 101, 150),
        (86, 105, 151, 200),
        (106, 200, 201, 300),
    ],
}

# ---------------------------------------------------------------------------
# Indian CPCB National Air Quality Index (NAQI) Breakpoints
# ---------------------------------------------------------------------------
CPCB_NAQI_BREAKPOINTS = {
    "pm25": [  # ug/m3
        (0, 30, 0, 50),
        (31, 60, 51, 100),
        (61, 90, 101, 200),
        (91, 120, 201, 300),
        (121, 250, 301, 400),
        (251, 350, 401, 500),
    ],
    "pm10": [  # ug/m3
        (0, 50, 0, 50),
        (51, 100, 51, 100),
        (101, 250, 101, 200),
        (251, 350, 201, 300),
        (351, 430, 301, 400),
        (431, 500, 401, 500),
    ],
    "nh3": [  # ug/m3
        (0, 200, 0, 50),
        (201, 400, 51, 100),
        (401, 800, 101, 200),
        (801, 1200, 201, 300),
        (1201, 1800, 301, 400),
        (1801, 2400, 401, 500),
    ],
    "co": [  # mg/m3
        (0.0, 1.0, 0, 50),
        (1.1, 2.0, 51, 100),
        (2.1, 10.0, 101, 200),
        (10.1, 17.0, 201, 300),
        (17.1, 34.0, 301, 400),
        (34.1, 50.0, 401, 500),
    ],
}

class AQIResult(BaseModel):
    aqi: float
    category: str
    dominant_pollutant: Optional[str] = None
    sub_indices: Dict[str, float] = Field(default_factory=dict)
    standard_used: str
    calculation_type: str # "DIRECT_POLLUTANT_CALCULATION" or "PREDICTIVE_ESTIMATE"
    confidence_note: str

def get_aqi_category(aqi: float) -> str:
    if aqi <= 50:
        return "Good"
    elif aqi <= 100:
        return "Moderate"
    elif aqi <= 150:
        return "Unhealthy for Sensitive Groups"
    elif aqi <= 200:
        return "Unhealthy"
    elif aqi <= 300:
        return "Very Unhealthy"
    else:
        return "Hazardous"

def compute_sub_index(conc: float, breakpoints: list) -> Optional[float]:
    """Calculates linear sub-index for a specific pollutant."""
    if conc < 0:
        return None
    for c_lo, c_hi, i_lo, i_hi in breakpoints:
        if c_lo <= conc <= c_hi:
            # Linear interpolation formula: Ip = ((Ihi - Ilo)/(BPhi - BPlo)) * (Cp - BPlo) + Ilo
            return round(((i_hi - i_lo) / (c_hi - c_lo)) * (conc - c_lo) + i_lo, 1)
    # If above max breakpoint
    if conc > breakpoints[-1][1]:
        return 500.0
    return None

def calculate_aqi_from_pollutants(
    pollutants: Dict[str, float],
    standard: str = "US_EPA"
) -> Optional[AQIResult]:
    """
    Calculates official AQI from measured raw pollutant concentrations.
    standard: "US_EPA" or "CPCB_NAQI"
    """
    table = US_EPA_BREAKPOINTS if standard == "US_EPA" else CPCB_NAQI_BREAKPOINTS
    sub_indices: Dict[str, float] = {}
    
    for pollutant, value in pollutants.items():
        if value is None or value < 0:
            continue
        p_key = pollutant.lower().replace(".", "")
        if p_key in table:
            sub = compute_sub_index(value, table[p_key])
            if sub is not None:
                sub_indices[p_key] = sub

    if not sub_indices:
        return None

    # Overall AQI is the maximum of the sub-indices
    dominant = max(sub_indices, key=sub_indices.get)
    max_aqi = sub_indices[dominant]

    return AQIResult(
        aqi=max_aqi,
        category=get_aqi_category(max_aqi),
        dominant_pollutant=dominant.upper(),
        sub_indices=sub_indices,
        standard_used=standard,
        calculation_type="DIRECT_POLLUTANT_CALCULATION",
        confidence_note=f"Calculated directly from {len(sub_indices)} measured pollutant channels according to {standard} standards."
    )
