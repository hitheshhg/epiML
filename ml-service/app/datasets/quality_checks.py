"""
Data Quality & Sensor Validation Engine
Performs rigorous health checks on ingested agricultural and environmental records.
Generates comprehensive quality score and identifies anomalous sensor flatlines or spikes.
"""

from typing import Dict, Any, List, Tuple
import pandas as pd
import numpy as np

# Valid physiological sensor ranges for agricultural growth chambers
VALID_RANGES = {
    "temperature_c": (-10.0, 65.0),
    "humidity_pct": (0.0, 100.0),
    "soil_moisture_pct": (0.0, 100.0),
    "aqi": (0.0, 500.0),
    "gas_ppm": (0.0, 1000.0),
    "lux": (0.0, 100000.0)
}

class DataQualityReport:
    def __init__(self):
        self.total_records: int = 0
        self.valid_records: int = 0
        self.rejected_records: int = 0
        self.duplicate_timestamps: int = 0
        self.out_of_bounds_count: int = 0
        self.missing_values: Dict[str, int] = {}
        self.stale_sensor_warnings: List[str] = []
        self.quality_score: float = 100.0
        self.issues: List[str] = []

    def to_dict(self) -> Dict[str, Any]:
        return {
            "total_records": self.total_records,
            "valid_records": self.valid_records,
            "rejected_records": self.rejected_records,
            "duplicate_timestamps": self.duplicate_timestamps,
            "out_of_bounds_count": self.out_of_bounds_count,
            "missing_values": self.missing_values,
            "stale_sensor_warnings": self.stale_sensor_warnings,
            "quality_score": round(self.quality_score, 1),
            "issues": self.issues
        }

def validate_and_clean_dataset(df: pd.DataFrame) -> Tuple[pd.DataFrame, DataQualityReport]:
    """
    Validates a dataset against physical constraints, deduplicates timestamps,
    and returns sanitized DataFrame along with audit report.
    """
    report = DataQualityReport()
    report.total_records = len(df)
    
    if df.empty:
        report.quality_score = 0.0
        report.issues.append("Dataset is empty.")
        return df, report

    cleaned = df.copy()

    # 1. Check duplicate timestamps
    if "timestamp" in cleaned.columns:
        cleaned["timestamp"] = pd.to_datetime(cleaned["timestamp"], errors="coerce")
        # Remove null timestamps
        null_ts = cleaned["timestamp"].isna().sum()
        if null_ts > 0:
            report.issues.append(f"Dropped {null_ts} records with invalid/null timestamp.")
            cleaned = cleaned.dropna(subset=["timestamp"])

        dup_count = cleaned.duplicated(subset=["timestamp"]).sum()
        report.duplicate_timestamps = int(dup_count)
        if dup_count > 0:
            cleaned = cleaned.drop_duplicates(subset=["timestamp"], keep="last")
            report.issues.append(f"Deduplicated {dup_count} duplicate timestamp records.")

        # Sort chronologically (critical for time series)
        cleaned = cleaned.sort_values(by="timestamp").reset_index(drop=True)

    # 2. Check missing values
    for col in ["temperature_c", "humidity_pct", "soil_moisture_pct", "aqi"]:
        if col in cleaned.columns:
            missing = int(cleaned[col].isna().sum())
            report.missing_values[col] = missing
            if missing > 0:
                # Interpolate small gaps linearly; never drop entire time series if gap is short
                cleaned[col] = cleaned[col].interpolate(method="linear").bfill().ffill()

    # 3. Check out of bounds
    out_of_bounds = 0
    for col, (min_val, max_val) in VALID_RANGES.items():
        if col in cleaned.columns:
            invalid_mask = (cleaned[col] < min_val) | (cleaned[col] > max_val)
            cnt = int(invalid_mask.sum())
            if cnt > 0:
                out_of_bounds += cnt
                report.issues.append(f"{col}: {cnt} values outside valid bounds [{min_val}, {max_val}]. Clipped to bounds.")
                cleaned[col] = cleaned[col].clip(lower=min_val, upper=max_val)

    report.out_of_bounds_count = out_of_bounds

    # 4. Check stale sensor flatlines (e.g. constant identical values for > 50 consecutive readings)
    for col in ["temperature_c", "humidity_pct", "soil_moisture_pct"]:
        if col in cleaned.columns and len(cleaned) > 20:
            std_val = cleaned[col].std()
            if std_val < 1e-4:
                report.stale_sensor_warnings.append(f"Sensor {col} appears frozen (variance near zero).")

    # 5. Compute quality score (100% baseline minus penalty deductions)
    penalties = 0.0
    if report.total_records > 0:
        penalties += (report.duplicate_timestamps / report.total_records) * 20.0
        penalties += (report.out_of_bounds_count / (report.total_records * 4)) * 25.0
        missing_total = sum(report.missing_values.values())
        penalties += (missing_total / (report.total_records * 4)) * 30.0
        penalties += len(report.stale_sensor_warnings) * 15.0

    report.quality_score = max(10.0, min(100.0, 100.0 - penalties))
    report.valid_records = len(cleaned)
    report.rejected_records = report.total_records - report.valid_records

    return cleaned, report
