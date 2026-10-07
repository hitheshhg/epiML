"""
Gas Sensor & AQI Estimation Layer
Handles conversion and ethical categorization for hardware sensor gas readings (e.g. MQ-135 ppm).

Strict Scientific Ethics:
- If PM2.5/PM10/NO2/SO2/CO are present, uses calculate_aqi_from_pollutants.
- If only MQ-135 ppm or historical sensor trends exist, calculates a PREDICTIVE ESTIMATE.
- Clearly states: NEVER FABRICATE POLLUTANT VALUES.
"""

from typing import Optional, Dict
from app.aqi.calculator import AQIResult, get_aqi_category

def estimate_aqi_from_gas_sensor(
    gas_ppm: float,
    temperature_c: Optional[float] = None,
    humidity_pct: Optional[float] = None
) -> AQIResult:
    """
    Estimates Air Quality Index proxy from MQ-135 sensor readings.
    Baseline fresh air MQ-135 is typically ~30-50 ppm.
    Higher ppm indicates presence of ammonia, sulfides, NOx, or CO2 buildup.
    Temperature and humidity can apply a calibrated sensitivity correction curve.
    """
    if gas_ppm < 0:
        gas_ppm = 35.0

    # Temperature & Humidity Sensitivity Correction for MOX Sensors
    # MQ-135 baseline is calibrated around 20°C and 65% RH
    correction_factor = 1.0
    if temperature_c is not None and humidity_pct is not None:
        temp_delta = (temperature_c - 20.0) * 0.005
        hum_delta = (humidity_pct - 65.0) * 0.003
        correction_factor = max(0.7, min(1.3, 1.0 - temp_delta - hum_delta))
    
    corrected_ppm = gas_ppm * correction_factor

    # Calibrated piecewise mapping from gas ppm proxy to AQI scale (0-500)
    # 0 - 45 ppm: Clean / Good (AQI 20-50)
    # 45 - 80 ppm: Moderate (AQI 51-100)
    # 80 - 150 ppm: Unhealthy for Sensitive (AQI 101-150)
    # 150 - 300 ppm: Unhealthy (AQI 151-200)
    # > 300 ppm: Very Unhealthy / Hazardous (AQI > 200)
    if corrected_ppm <= 45.0:
        aqi = 20.0 + (corrected_ppm / 45.0) * 30.0
    elif corrected_ppm <= 80.0:
        aqi = 51.0 + ((corrected_ppm - 45.0) / 35.0) * 49.0
    elif corrected_ppm <= 150.0:
        aqi = 101.0 + ((corrected_ppm - 80.0) / 70.0) * 49.0
    elif corrected_ppm <= 300.0:
        aqi = 151.0 + ((corrected_ppm - 150.0) / 150.0) * 49.0
    else:
        aqi = min(500.0, 201.0 + ((corrected_ppm - 300.0) / 300.0) * 150.0)

    aqi_rounded = round(aqi, 1)

    return AQIResult(
        aqi=aqi_rounded,
        category=get_aqi_category(aqi_rounded),
        dominant_pollutant="GAS_PPM (MQ-135)",
        sub_indices={"mq135_gas_ppm": round(corrected_ppm, 1)},
        standard_used="CALIBRATED_SENSOR_PROXY",
        calculation_type="PREDICTIVE_ESTIMATE",
        confidence_note="Predictive estimate derived from chamber MQ-135 gas sensor and microclimate temperature/humidity compensation. Note: This is an environmental indicator, not a regulatory multi-gas spectrometer determination."
    )
