"""
epiML Weather Provider Abstraction & Data Models
Defines interfaces for meteorological context providers.
"""

from abc import ABC, abstractmethod
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from datetime import datetime

class CanonicalLocation(BaseModel):
    location_id: Optional[str] = None
    location_name: str
    country: str = "India"
    state: Optional[str] = None
    district: Optional[str] = None
    latitude: float
    longitude: float
    elevation: Optional[float] = None
    timezone: str = "Asia/Kolkata"

class WeatherSnapshot(BaseModel):
    timestamp: str
    temperature_2m: Optional[float] = None
    relative_humidity_2m: Optional[float] = None
    dew_point_2m: Optional[float] = None
    apparent_temperature: Optional[float] = None
    precipitation: Optional[float] = 0.0
    precipitation_probability: Optional[float] = None
    surface_pressure: Optional[float] = None
    wind_speed_10m: Optional[float] = None
    wind_direction_10m: Optional[float] = None
    et0_fao_evapotranspiration: Optional[float] = None
    vapour_pressure_deficit: Optional[float] = None
    soil_temperature: Optional[float] = None
    soil_moisture: Optional[float] = None
    shortwave_solar_radiation: Optional[float] = None
    weather_code: Optional[int] = None
    is_day: Optional[int] = None

class WeatherContext(BaseModel):
    is_available: bool = True
    provider: str = "Open-Meteo"
    attribution: str = "Weather data provided by Open-Meteo.com (https://open-meteo.com/)"
    latitude: float
    longitude: float
    elevation: Optional[float] = None
    timezone: str = "UTC"
    retrieved_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    cached: bool = False
    current: Optional[WeatherSnapshot] = None
    hourly_forecast: List[WeatherSnapshot] = Field(default_factory=list)
    error: Optional[str] = None

class WeatherProvider(ABC):
    @abstractmethod
    def geocode(self, query: str, count: int = 5) -> List[CanonicalLocation]:
        """Resolves location query to canonical coordinates."""
        pass

    @abstractmethod
    def get_forecast(self, latitude: float, longitude: float, hours: int = 24) -> WeatherContext:
        """Fetches current context and upcoming hourly forecast."""
        pass

    @abstractmethod
    def get_historical(self, latitude: float, longitude: float, start_date: str, end_date: str) -> WeatherContext:
        """Fetches historical reanalysis weather for alignment."""
        pass
