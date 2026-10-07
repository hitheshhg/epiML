"""
Model & Data Drift Monitoring Engine
Tracks physiological sensor distribution shifts, missing-data rates, and anomalous sensor variance.
Computes Population Stability Index (PSI) and assigns drift status (NORMAL, WATCH, DRIFT DETECTED).
"""

from typing import Dict, Any, List
import numpy as np
import pandas as pd

def calculate_psi(baseline: np.ndarray, current: np.ndarray, num_bins: int = 10) -> float:
    """
    Computes Population Stability Index (PSI) between reference baseline and live stream.
    PSI < 0.10: Insignificant change (NORMAL)
    0.10 <= PSI < 0.25: Moderate shift (WATCH)
    PSI >= 0.25: Significant change (DRIFT DETECTED)
    """
    if len(baseline) < 10 or len(current) < 10:
        return 0.0

    min_val = min(baseline.min(), current.min())
    max_val = max(baseline.max(), current.max())
    if min_val == max_val:
        return 0.0

    bins = np.linspace(min_val, max_val, num_bins + 1)
    b_counts, _ = np.histogram(baseline, bins=bins)
    c_counts, _ = np.histogram(current, bins=bins)

    b_pct = (b_counts + 1e-4) / (len(baseline) + 1e-4 * num_bins)
    c_pct = (c_counts + 1e-4) / (len(current) + 1e-4 * num_bins)

    psi_val = np.sum((c_pct - b_pct) * np.log(c_pct / b_pct))
    return float(max(0.0, psi_val))

def assess_drift(
    baseline_df: pd.DataFrame,
    recent_df: pd.DataFrame
) -> Dict[str, Any]:
    """
    Compares recent observations against historical baseline distribution.
    """
    features_to_check = ["temperature_c", "humidity_pct", "soil_moisture_pct", "aqi"]
    feature_psi_scores: Dict[str, float] = {}
    max_psi = 0.0

    for feat in features_to_check:
        if feat in baseline_df.columns and feat in recent_df.columns:
            b_vals = baseline_df[feat].dropna().values
            r_vals = recent_df[feat].dropna().values
            psi = calculate_psi(b_vals, r_vals)
            feature_psi_scores[feat] = round(psi, 3)
            max_psi = max(max_psi, psi)

    # Missing value rate on recent data
    missing_rate = float(recent_df[features_to_check].isna().mean().mean() * 100.0) if not recent_df.empty else 0.0

    # Categorize status
    if max_psi >= 0.25 or missing_rate > 15.0:
        status = "DRIFT_DETECTED"
    elif max_psi >= 0.10 or missing_rate > 5.0:
        status = "WATCH"
    else:
        status = "NORMAL"

    return {
        "status": status,
        "max_psi": round(max_psi, 3),
        "feature_psi_scores": feature_psi_scores,
        "missing_rate_pct": round(missing_rate, 2),
        "records_evaluated": len(recent_df),
        "status_description": (
            "Severe feature distribution deviation detected. Retraining recommended."
            if status == "DRIFT_DETECTED"
            else ("Minor microclimate shift observed. Continue observation." if status == "WATCH" else "Telemetry distributions nominal.")
        )
    }
