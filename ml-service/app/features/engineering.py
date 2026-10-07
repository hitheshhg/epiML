"""
Time-Series Feature Engineering Engine
Generates predictive features from historical environmental trajectories.
Strictly prevents look-ahead bias and target leakage.
"""

from typing import List, Tuple, Dict, Any, Optional
import pandas as pd
import numpy as np

DEFAULT_LAGS = [1, 3, 6, 12]
DEFAULT_WINDOWS = [3, 6, 12]

def calculate_vpd(temperature_c: float, humidity_pct: float) -> float:
    """
    Calculates Vapor Pressure Deficit (VPD in kPa), a foundational agronomic
    driver of plant transpiration and microclimate dynamics.
    SVP = 0.61078 * exp((17.27 * T) / (T + 237.3))
    VPD = SVP * (1 - RH / 100)
    """
    svp = 0.61078 * np.exp((17.27 * temperature_c) / (temperature_c + 237.3))
    vpd = svp * (1.0 - (humidity_pct / 100.0))
    return float(np.clip(vpd, 0.0, 10.0))

def build_time_series_features(
    df: pd.DataFrame,
    targets: List[str] = ["aqi", "temperature_c", "humidity_pct", "soil_moisture_pct"],
    prediction_horizon_steps: int = 2, # e.g. 2 steps of 15m = 30 minutes
    lags: List[int] = DEFAULT_LAGS,
    rolling_windows: List[int] = DEFAULT_WINDOWS
) -> Tuple[pd.DataFrame, pd.DataFrame, List[str]]:
    """
    Builds statistical time-series features and shifts target columns forward by
    prediction_horizon_steps so the model learns to forecast future environmental states.
    
    Returns:
    (X_features, y_targets, feature_names)
    """
    if df.empty or len(df) < 15:
        raise ValueError(f"Dataset requires at least 15 historical points for feature engineering. Received: {len(df)}")

    data = df.copy()

    # Ensure chronological order
    if "timestamp" in data.columns:
        data["timestamp"] = pd.to_datetime(data["timestamp"])
        data = data.sort_values(by="timestamp").reset_index(drop=True)

    feature_cols: List[str] = []

    # 1. Base Continuous Telemetry Channels
    base_channels = ["temperature_c", "humidity_pct", "soil_moisture_pct", "aqi"]
    for ch in base_channels:
        if ch not in data.columns:
            data[ch] = 25.0 if "temp" in ch else (75.0 if "hum" in ch else (70.0 if "soil" in ch else 35.0))
        data[f"{ch}_current"] = data[ch]
        feature_cols.append(f"{ch}_current")

    # 2. Agronomic Interaction Features
    data["temp_x_humidity"] = data["temperature_c"] * data["humidity_pct"]
    data["temp_x_soil"] = data["temperature_c"] * data["soil_moisture_pct"]
    data["humidity_x_soil"] = data["humidity_pct"] * data["soil_moisture_pct"]
    data["aqi_x_temp"] = data["aqi"] * data["temperature_c"]
    data["aqi_x_humidity"] = data["aqi"] * data["humidity_pct"]
    
    # Vapor Pressure Deficit
    svp = 0.61078 * np.exp((17.27 * data["temperature_c"]) / (data["temperature_c"] + 237.3))
    data["vpd_kpa"] = np.clip(svp * (1.0 - (data["humidity_pct"] / 100.0)), 0.0, 10.0)
    
    feature_cols.extend([
        "temp_x_humidity", "temp_x_soil", "humidity_x_soil",
        "aqi_x_temp", "aqi_x_humidity", "vpd_kpa"
    ])

    # 3. External Weather Context & Local-External Sensor Fusion
    if "ext_temperature_2m" in data.columns:
        data["diff_temperature"] = data["temperature_c"] - data["ext_temperature_2m"]
        feature_cols.extend(["ext_temperature_2m", "diff_temperature"])
    if "ext_relative_humidity_2m" in data.columns:
        data["diff_humidity"] = data["humidity_pct"] - data["ext_relative_humidity_2m"]
        feature_cols.extend(["ext_relative_humidity_2m", "diff_humidity"])
    for ext_col in ["ext_precipitation", "ext_surface_pressure", "ext_solar_radiation", "ext_vpd"]:
        if ext_col in data.columns:
            feature_cols.append(ext_col)

    # 4. Location Context Conditioning
    for loc_col in ["latitude", "longitude", "elevation"]:
        if loc_col in data.columns:
            feature_cols.append(loc_col)

    # 5. Time-of-Day Cyclic & Seasonal Features
    if "timestamp" in data.columns:
        hours = data["timestamp"].dt.hour + data["timestamp"].dt.minute / 60.0
        data["hour_sin"] = np.sin(2 * np.pi * hours / 24.0)
        data["hour_cos"] = np.cos(2 * np.pi * hours / 24.0)
        data["day_of_week"] = data["timestamp"].dt.dayofweek
        feature_cols.extend(["hour_sin", "hour_cos", "day_of_week"])

    # 6. Actuator State Encodings (if available)
    for act in ["fan_state", "pump_state", "vent_angle_deg"]:
        if act in data.columns:
            feature_cols.append(act)

    # 5. Lag Features (Historical Retrospection)
    for ch in base_channels:
        for lag in lags:
            col_name = f"{ch}_lag_{lag}"
            data[col_name] = data[ch].shift(lag)
            feature_cols.append(col_name)

    # 6. Rolling Window Statistics & Rates of Change
    for ch in base_channels:
        # Rate of change (1-step derivative)
        data[f"{ch}_roc_1"] = data[ch].diff(1)
        data[f"{ch}_roc_3"] = data[ch].diff(3)
        feature_cols.extend([f"{ch}_roc_1", f"{ch}_roc_3"])

        for win in rolling_windows:
            data[f"{ch}_roll_mean_{win}"] = data[ch].rolling(win).mean()
            data[f"{ch}_roll_std_{win}"] = data[ch].rolling(win).std().fillna(0.0)
            data[f"{ch}_roll_min_{win}"] = data[ch].rolling(win).min()
            data[f"{ch}_roll_max_{win}"] = data[ch].rolling(win).max()
            data[f"{ch}_roll_median_{win}"] = data[ch].rolling(win).median()
            feature_cols.extend([
                f"{ch}_roll_mean_{win}",
                f"{ch}_roll_std_{win}",
                f"{ch}_roll_min_{win}",
                f"{ch}_roll_max_{win}",
                f"{ch}_roll_median_{win}"
            ])

    # 7. Target Shifting for Future Prediction Horizon
    # We predict the value 'prediction_horizon_steps' in the future
    target_cols_map = {}
    for tgt in targets:
        target_future_col = f"{tgt}_future_{prediction_horizon_steps}"
        data[target_future_col] = data[tgt].shift(-prediction_horizon_steps)
        target_cols_map[tgt] = target_future_col

    # Drop rows that contain NaNs from shifting (head for lags, tail for future horizon)
    all_needed = feature_cols + list(target_cols_map.values())
    valid_mask = ~data[all_needed].isna().any(axis=1)
    clean_data = data[valid_mask].reset_index(drop=True)

    if clean_data.empty:
        raise ValueError("Feature matrix empty after lag and horizon truncation. Insufficient sample duration.")

    X = clean_data[feature_cols]
    y = clean_data[list(target_cols_map.values())]
    # Rename y columns back to canonical target names for downstream models
    y.columns = list(target_cols_map.keys())

    return X, y, feature_cols
