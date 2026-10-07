"""
Unit Tests for Feature Engineering & Chronological Split
"""

import pytest
import pandas as pd
import numpy as np
from app.features.engineering import build_time_series_features, calculate_vpd
from app.features.split import chronological_time_split

def test_vpd_calculation():
    # 25°C and 80% RH -> realistic chamber VPD ~0.63 kPa
    vpd = calculate_vpd(temperature_c=25.0, humidity_pct=80.0)
    assert 0.4 <= vpd <= 0.8

def test_time_series_features_generation():
    # Synthesize 40 sequential readings
    base_time = pd.Timestamp("2026-10-01 10:00:00")
    records = []
    for i in range(40):
        records.append({
            "timestamp": base_time + pd.Timedelta(minutes=15 * i),
            "temperature_c": 24.0 + (i * 0.1),
            "humidity_pct": 75.0 - (i * 0.1),
            "soil_moisture_pct": 70.0 - (i * 0.05),
            "aqi": 40.0 + (i * 0.2),
            "gas_ppm": 38.0,
            "fan_state": 0,
            "pump_state": 0,
            "vent_angle_deg": 30
        })
    df = pd.DataFrame(records)

    X, y, feature_names = build_time_series_features(
        df,
        targets=["aqi", "temperature_c", "humidity_pct", "soil_moisture_pct"],
        prediction_horizon_steps=2
    )

    assert len(X) > 0
    assert len(X) == len(y)
    assert "temperature_c_lag_1" in feature_names
    assert "temp_x_humidity" in feature_names
    assert "vpd_kpa" in feature_names
    assert "hour_sin" in feature_names

def test_chronological_split_prevents_leakage():
    X = pd.DataFrame({"val": range(100)})
    y = pd.DataFrame({"target": range(100)})
    X_tr, X_val, X_te, y_tr, y_val, y_te = chronological_time_split(X, y)

    # Train max value must be strictly less than Val min value
    assert X_tr["val"].max() < X_val["val"].min()
    # Val max value must be strictly less than Test min value
    assert X_val["val"].max() < X_te["val"].min()
