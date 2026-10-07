"""
Canonical Internal Training Schema
Standardized contract across all data sources (User IoT, Experimental, Kaggle Reference).
Extensible: preserves raw and contextual metadata without discarding valuable fields.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field

# Core prediction targets for epiML multi-target time-series platform
TARGET_COLUMNS = [
    "aqi",
    "temperature_c",
    "humidity_pct",
    "soil_moisture_pct"
]

# Canonical environmental and context columns
CANONICAL_COLUMNS = [
    "record_id",
    "experiment_id",
    "user_id",
    "device_id",
    "crop",
    "seed_variety",
    "growth_stage",
    "soil_type",
    "location",
    "timestamp",
    "temperature_c",
    "humidity_pct",
    "soil_moisture_pct",
    "aqi",
    "gas_ppm",
    "pm25",
    "pm10",
    "co",
    "no2",
    "so2",
    "o3",
    "nh3",
    "lux",
    "fan_state",
    "pump_state",
    "vent_angle_deg",
    "source_type", # "USER_IOT", "EXPERIMENTAL", "KAGGLE_REFERENCE", "AUGMENTED"
    "include_in_research_training"
]

class CanonicalRecord(BaseModel):
    record_id: str
    experiment_id: Optional[str] = None
    user_id: Optional[str] = None
    device_id: Optional[str] = "epiML-Chamber-01"
    crop: str = "Unknown"
    seed_variety: Optional[str] = None
    growth_stage: Optional[str] = "Germination"
    soil_type: Optional[str] = "Nursery Mud"
    location: Optional[str] = "Indoor Controlled Chamber"
    timestamp: datetime
    
    # Core Environmental Fields
    temperature_c: float
    humidity_pct: float
    soil_moisture_pct: float
    aqi: float
    gas_ppm: Optional[float] = 38.0
    
    # Optional Pollutants (never fabricated)
    pm25: Optional[float] = None
    pm10: Optional[float] = None
    co: Optional[float] = None
    no2: Optional[float] = None
    so2: Optional[float] = None
    o3: Optional[float] = None
    nh3: Optional[float] = None
    lux: Optional[float] = 450.0
    
    # Actuator States
    fan_state: int = 0
    pump_state: int = 0
    vent_angle_deg: int = 30
    
    # Metadata & Governance
    source_type: str = "USER_IOT"
    include_in_research_training: bool = True
    raw_metadata: Dict[str, Any] = Field(default_factory=dict)
