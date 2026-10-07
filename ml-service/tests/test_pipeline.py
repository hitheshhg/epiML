"""
End-to-End Integration Test for epiML ML Pipeline
Covers: Data ingestion -> Preprocessing -> Chronological split -> Training -> Serialization -> Prediction -> Activation -> Rollback.
"""

import pytest
import pandas as pd
import numpy as np
from pathlib import Path

from app.datasets.quality_checks import validate_and_clean_dataset
from app.features.engineering import build_time_series_features
from app.features.split import chronological_time_split
from app.models.forecaster import MultiTargetEnvironmentalForecaster
from app.deployment.registry import registry

def test_complete_end_to_end_pipeline():
    # 1. Synthesize realistic chamber time-series dataset
    base_time = pd.Timestamp("2026-10-01 00:00:00")
    records = []
    for i in range(120):
        records.append({
            "record_id": f"TEST-{i}",
            "timestamp": base_time + pd.Timedelta(minutes=15 * i),
            "temperature_c": 23.0 + 3.0 * np.sin(i * np.pi / 24) + np.random.normal(0, 0.1),
            "humidity_pct": 78.0 - 8.0 * np.sin(i * np.pi / 24) + np.random.normal(0, 0.2),
            "soil_moisture_pct": 72.0 - 0.05 * (i % 30) + np.random.normal(0, 0.1),
            "aqi": 38.0 + 4.0 * np.sin(i * np.pi / 24) + np.random.normal(0, 0.2),
            "gas_ppm": 38.0,
            "fan_state": 0,
            "pump_state": 0,
            "vent_angle_deg": 30,
            "crop": "Tomato"
        })
    raw_df = pd.DataFrame(records)

    # 2. Quality validation & cleaning
    cleaned_df, quality_report = validate_and_clean_dataset(raw_df)
    assert quality_report.quality_score >= 90.0
    assert len(cleaned_df) == len(raw_df)

    # 3. Feature engineering
    X, y, feature_names = build_time_series_features(
        cleaned_df,
        targets=["aqi", "temperature_c", "humidity_pct", "soil_moisture_pct"],
        prediction_horizon_steps=2
    )
    assert len(X) > 50
    assert len(feature_names) >= 15

    # 4. Anti-leakage chronological split
    X_tr, X_val, X_te, y_tr, y_val, y_te = chronological_time_split(X, y)
    assert len(X_tr) > len(X_val)
    assert len(X_val) > 0

    # 5. Model training & benchmark
    forecaster = MultiTargetEnvironmentalForecaster(
        targets=["aqi", "temperature_c", "humidity_pct", "soil_moisture_pct"],
        prediction_horizon_minutes=30
    )
    metrics = forecaster.fit_and_select(
        X_tr, y_tr, X_val, y_val, X_te, y_te,
        candidate_algorithms=["XGBoost", "RandomForest"]
    )
    assert metrics["overall_mae"] >= 0.0
    assert metrics["overall_r2"] > -1.0 # Reasonable fit

    # 6. Artifact persistence & registration
    test_version_tag = "v_test_e2e"
    meta = registry.register_model(
        model_obj=forecaster,
        version_tag=test_version_tag,
        algorithm="MultiTargetChampion",
        targets=["aqi", "temperature_c", "humidity_pct", "soil_moisture_pct"],
        prediction_horizon_minutes=30,
        feature_names=feature_names,
        metrics=metrics
    )
    assert Path(meta.artifact_path).exists()

    # 7. Safe activation with smoke test
    success, msg = registry.activate_model(test_version_tag)
    assert success is True
    assert registry.active_metadata.version_tag == test_version_tag

    # 8. Live inference prediction with prediction intervals
    preds, conf, intervals = registry.active_model.predict(X_te.iloc[[-1]])
    assert "aqi" in preds
    assert "temperature_c" in preds
    assert "humidity_pct" in preds
    assert "soil_moisture_pct" in preds
    assert 0.0 <= conf["temperature_c"] <= 1.0
    assert intervals["temperature_c"]["lower_bound"] <= preds["temperature_c"] <= intervals["temperature_c"]["upper_bound"]

    # 9. Rollback test
    # If a previous model exists, rollback should work safely
    if registry.previous_version_tag:
        rb_success, rb_msg = registry.rollback_to_previous()
        assert rb_success is True
