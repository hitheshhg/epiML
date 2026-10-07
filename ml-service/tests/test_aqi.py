"""
Unit Tests for AQI Calculation and Gas Sensor Conversion
"""

import pytest
from app.aqi.calculator import calculate_aqi_from_pollutants, get_aqi_category, compute_sub_index
from app.aqi.gas_conversion import estimate_aqi_from_gas_sensor

def test_epa_pm25_sub_index():
    # 12.0 ug/m3 PM2.5 -> AQI 50 (Good)
    res = calculate_aqi_from_pollutants({"pm25": 12.0}, standard="US_EPA")
    assert res is not None
    assert res.aqi == 50.0
    assert res.category == "Good"
    assert res.calculation_type == "DIRECT_POLLUTANT_CALCULATION"

def test_epa_unhealthy_air():
    # 70 ug/m3 PM2.5 -> Unhealthy (151-200)
    res = calculate_aqi_from_pollutants({"pm25": 70.0}, standard="US_EPA")
    assert res is not None
    assert 151 <= res.aqi <= 200
    assert res.category == "Unhealthy"

def test_mq135_gas_proxy_estimation():
    # MQ-135 38 ppm in normal chamber
    res = estimate_aqi_from_gas_sensor(gas_ppm=38.0, temperature_c=25.0, humidity_pct=75.0)
    assert res is not None
    assert 20 <= res.aqi <= 70
    assert res.calculation_type == "PREDICTIVE_ESTIMATE"
    assert "MQ-135" in res.dominant_pollutant
