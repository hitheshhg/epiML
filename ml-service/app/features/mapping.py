"""
Canonical Feature Mapping & Unit Normalization
Maps arbitrary raw column names to canonical schema without destructive assumptions.
Stores explicit units and produces a comprehensive Normalization Report.
"""

from typing import Dict, Any, List, Tuple
import pandas as pd

CANONICAL_UNIT_MAP = {
    "temperature_c": "Celsius (°C)",
    "humidity_pct": "Relative Humidity (% RH)",
    "soil_moisture_pct": "Volumetric Soil Moisture (%)",
    "aqi": "Air Quality Index (0-500)",
    "gas_ppm": "Parts Per Million (ppm)",
    "pm25": "ug/m3",
    "pm10": "ug/m3",
    "co": "ppm",
    "no2": "ppb",
    "so2": "ppb",
    "o3": "ppb",
    "nh3": "ug/m3",
    "lux": "Illuminance (Lux)"
}

SYNONYM_MAPPINGS = {
    "temperature_c": ["temperature", "temp", "temp_c", "temperature_c", "temp1", "temp2", "temperature1"],
    "humidity_pct": ["humidity", "rh", "relative_humidity", "humidity_pct", "hum1", "hum2", "humidity_rh"],
    "soil_moisture_pct": ["soil_moisture", "moisture", "soil", "soil1", "soil2", "soil_moisture_pct", "soil_humidity"],
    "aqi": ["aqi", "air_quality_index", "air_quality", "index_aqi"],
    "gas_ppm": ["gas", "gas_ppm", "mq135", "mq135_gas", "voc_ppm"]
}

class NormalizationReport:
    def __init__(self):
        self.mappings_applied: Dict[str, str] = {}
        self.conversions_applied: List[str] = []
        self.unmapped_columns: List[str] = []
        self.target_units: Dict[str, str] = CANONICAL_UNIT_MAP

    def to_dict(self) -> Dict[str, Any]:
        return {
            "mappings_applied": self.mappings_applied,
            "conversions_applied": self.conversions_applied,
            "unmapped_columns": self.unmapped_columns,
            "target_units": self.target_units
        }

def map_and_normalize_features(df: pd.DataFrame) -> Tuple[pd.DataFrame, NormalizationReport]:
    """
    Normalizes arbitrary input columns into canonical names and ensures consistent physical units.
    """
    report = NormalizationReport()
    normalized = df.copy()

    col_lookup = {str(c).lower().strip(): c for c in normalized.columns}

    for canonical_name, synonyms in SYNONYM_MAPPINGS.items():
        if canonical_name in normalized.columns:
            continue
        for syn in synonyms:
            if syn in col_lookup:
                orig_col = col_lookup[syn]
                normalized[canonical_name] = normalized[orig_col]
                report.mappings_applied[orig_col] = canonical_name
                break

    # Unit Normalization Checks
    # 1. Temperature: If values > 70, detect if Fahrenheit and convert to Celsius
    if "temperature_c" in normalized.columns:
        if normalized["temperature_c"].mean() > 60.0:
            normalized["temperature_c"] = (normalized["temperature_c"] - 32.0) * (5.0 / 9.0)
            report.conversions_applied.append("Converted temperature from Fahrenheit to Celsius (°C).")

    # 2. Humidity: If max <= 1.0, detect if 0-1 ratio and convert to percentage
    if "humidity_pct" in normalized.columns:
        if normalized["humidity_pct"].max() <= 1.05 and normalized["humidity_pct"].mean() < 0.99:
            normalized["humidity_pct"] = normalized["humidity_pct"] * 100.0
            report.conversions_applied.append("Converted relative humidity fraction (0-1) to percentage (% RH).")

    # Document unmapped columns
    for c in df.columns:
        if c not in report.mappings_applied.keys() and c not in SYNONYM_MAPPINGS.keys():
            report.unmapped_columns.append(str(c))

    return normalized, report
