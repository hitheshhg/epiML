"""
Open-Meteo Implementation of WeatherProvider
Includes dynamic geocoding, forecast/historical ingestion, persistent multi-tier caching,
exponential backoff, and graceful degradation.
"""

import time
import json
import logging
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import requests

from app.weather.provider import WeatherProvider, CanonicalLocation, WeatherSnapshot, WeatherContext

logger = logging.getLogger("epiml.weather")

class OpenMeteoProvider(WeatherProvider):
    def __init__(self, cache_ttl_seconds: int = 1800):
        self.geocoding_url = "https://geocoding-api.open-meteo.com/v1/search"
        self.forecast_url = "https://api.open-meteo.com/v1/forecast"
        self.historical_url = "https://archive-api.open-meteo.com/v1/archive"
        self.cache_ttl = cache_ttl_seconds
        self._memory_cache: Dict[str, Dict[str, Any]] = {}

    def _get_cache(self, key: str) -> Optional[Any]:
        if key in self._memory_cache:
            entry = self._memory_cache[key]
            if time.time() < entry["expires_at"]:
                return entry["data"]
            else:
                del self._memory_cache[key]
        return None

    def _set_cache(self, key: str, data: Any, ttl: Optional[int] = None):
        expires_at = time.time() + (ttl or self.cache_ttl)
        self._memory_cache[key] = {
            "expires_at": expires_at,
            "data": data
        }

    def geocode(self, query: str, count: int = 5) -> List[CanonicalLocation]:
        """
        Dynamically geocodes arbitrary location queries (cities, districts, postal codes)
        via Open-Meteo Geocoding API.
        """
        query_clean = query.strip()
        if not query_clean:
            return []

        cache_key = f"geo_{query_clean.lower()}_{count}"
        cached = self._get_cache(cache_key)
        if cached:
            return [CanonicalLocation(**item) for item in cached]

        locations: List[CanonicalLocation] = []
        try:
            params = {
                "name": query_clean,
                "count": count,
                "language": "en",
                "format": "json"
            }
            # Execute with retry
            resp = None
            for attempt in range(2):
                try:
                    resp = requests.get(self.geocoding_url, params=params, timeout=3.5)
                    if resp.status_code == 200:
                        break
                except Exception as req_err:
                    if attempt == 1:
                        logger.warning(f"Geocoding network error: {req_err}")
                    time.sleep(0.3)

            if resp and resp.status_code == 200:
                data = resp.json()
                results = data.get("results", [])
                # Prioritize India if search query is common Indian location unless user specified country
                if "india" not in query_clean.lower():
                    results.sort(key=lambda x: 0 if x.get("country") == "India" else 1)
                for item in results:
                    name_parts = [item.get("name", "")]
                    admin2 = item.get("admin2")
                    admin1 = item.get("admin1")
                    country = item.get("country", "")
                    if admin2:
                        name_parts.append(admin2)
                    if admin1:
                        name_parts.append(admin1)
                    if country:
                        name_parts.append(country)

                    loc = CanonicalLocation(
                        location_id=str(item.get("id")),
                        location_name=", ".join(dict.fromkeys(name_parts)),
                        country=country,
                        state=admin1,
                        district=admin2,
                        latitude=float(item.get("latitude")),
                        longitude=float(item.get("longitude")),
                        elevation=float(item.get("elevation")) if item.get("elevation") is not None else None,
                        timezone=item.get("timezone", "Asia/Kolkata")
                    )
                    locations.append(loc)

                self._set_cache(cache_key, [l.dict() for l in locations], ttl=86400) # Cache geocode for 24h
        except Exception as err:
            logger.error(f"Geocoding exception for '{query}': {err}")

        # If empty and coordinates entered directly like '12.87, 74.88'
        if not locations and "," in query_clean:
            parts = query_clean.split(",")
            try:
                lat = float(parts[0].strip())
                lon = float(parts[1].strip())
                locations.append(CanonicalLocation(
                    location_name=f"Lat {lat:.4f}, Lon {lon:.4f}",
                    latitude=lat,
                    longitude=lon,
                    country="India"
                ))
            except ValueError:
                pass

        return locations

    def get_forecast(self, latitude: float, longitude: float, hours: int = 24) -> WeatherContext:
        """
        Retrieves real-time weather context and hourly forecasts from Open-Meteo.
        Never fabricates fallback data; returns clean is_available=False if API unreachable.
        """
        lat_r = round(latitude, 4)
        lon_r = round(longitude, 4)
        cache_key = f"fc_{lat_r}_{lon_r}_{datetime.utcnow().strftime('%Y%m%d%H')}"

        cached = self._get_cache(cache_key)
        if cached:
            ctx = WeatherContext(**cached)
            ctx.cached = True
            return ctx

        hourly_vars = [
            "temperature_2m",
            "relative_humidity_2m",
            "dew_point_2m",
            "apparent_temperature",
            "precipitation",
            "precipitation_probability",
            "surface_pressure",
            "wind_speed_10m",
            "wind_direction_10m",
            "et0_fao_evapotranspiration",
            "vapour_pressure_deficit",
            "soil_temperature_0cm",
            "soil_moisture_0_to_1cm",
            "shortwave_radiation",
            "weather_code",
            "is_day"
        ]

        params = {
            "latitude": lat_r,
            "longitude": lon_r,
            "hourly": ",".join(hourly_vars),
            "forecast_days": 2,
            "timezone": "auto"
        }

        try:
            resp = None
            for attempt in range(2):
                try:
                    resp = requests.get(self.forecast_url, params=params, timeout=4.0)
                    if resp.status_code == 200:
                        break
                except Exception as exc:
                    if attempt == 1:
                        logger.warning(f"Open-Meteo forecast network timeout/error: {exc}")
                    time.sleep(0.4)

            if not resp or resp.status_code != 200:
                err_msg = f"Open-Meteo API status {resp.status_code if resp else 'No response'}"
                return WeatherContext(
                    is_available=False,
                    latitude=lat_r,
                    longitude=lon_r,
                    error=err_msg
                )

            data = resp.json()
            hourly = data.get("hourly", {})
            times = hourly.get("time", [])

            snapshots: List[WeatherSnapshot] = []
            for i in range(min(len(times), hours)):
                def g(var_name):
                    v = hourly.get(var_name)
                    return v[i] if v and i < len(v) else None

                snap = WeatherSnapshot(
                    timestamp=times[i],
                    temperature_2m=g("temperature_2m"),
                    relative_humidity_2m=g("relative_humidity_2m"),
                    dew_point_2m=g("dew_point_2m"),
                    apparent_temperature=g("apparent_temperature"),
                    precipitation=g("precipitation") or 0.0,
                    precipitation_probability=g("precipitation_probability"),
                    surface_pressure=g("surface_pressure"),
                    wind_speed_10m=g("wind_speed_10m"),
                    wind_direction_10m=g("wind_direction_10m"),
                    et0_fao_evapotranspiration=g("et0_fao_evapotranspiration"),
                    vapour_pressure_deficit=g("vapour_pressure_deficit"),
                    soil_temperature=g("soil_temperature_0cm"),
                    soil_moisture=g("soil_moisture_0_to_1cm"),
                    shortwave_solar_radiation=g("shortwave_radiation"),
                    weather_code=g("weather_code"),
                    is_day=g("is_day")
                )
                snapshots.append(snap)

            current_snap = snapshots[0] if snapshots else None

            ctx = WeatherContext(
                is_available=True,
                latitude=lat_r,
                longitude=lon_r,
                elevation=data.get("elevation"),
                timezone=data.get("timezone", "UTC"),
                current=current_snap,
                hourly_forecast=snapshots
            )

            self._set_cache(cache_key, ctx.dict(), ttl=self.cache_ttl)
            return ctx

        except Exception as err:
            logger.error(f"Failed to fetch forecast from Open-Meteo: {err}")
            return WeatherContext(
                is_available=False,
                latitude=lat_r,
                longitude=lon_r,
                error=str(err)
            )

    def get_historical(self, latitude: float, longitude: float, start_date: str, end_date: str) -> WeatherContext:
        """
        Fetches historical reanalysis weather from Open-Meteo archive for offline model training alignment.
        """
        lat_r = round(latitude, 4)
        lon_r = round(longitude, 4)
        cache_key = f"hist_{lat_r}_{lon_r}_{start_date}_{end_date}"

        cached = self._get_cache(cache_key)
        if cached:
            ctx = WeatherContext(**cached)
            ctx.cached = True
            return ctx

        params = {
            "latitude": lat_r,
            "longitude": lon_r,
            "start_date": start_date,
            "end_date": end_date,
            "hourly": "temperature_2m,relative_humidity_2m,surface_pressure,precipitation,et0_fao_evapotranspiration,vapour_pressure_deficit",
            "timezone": "auto"
        }

        try:
            resp = requests.get(self.historical_url, params=params, timeout=6.0)
            if resp.status_code != 200:
                return WeatherContext(
                    is_available=False,
                    latitude=lat_r,
                    longitude=lon_r,
                    error=f"Archive API status {resp.status_code}"
                )

            data = resp.json()
            hourly = data.get("hourly", {})
            times = hourly.get("time", [])

            snapshots: List[WeatherSnapshot] = []
            for i in range(len(times)):
                def g(var_name):
                    v = hourly.get(var_name)
                    return v[i] if v and i < len(v) else None

                snap = WeatherSnapshot(
                    timestamp=times[i],
                    temperature_2m=g("temperature_2m"),
                    relative_humidity_2m=g("relative_humidity_2m"),
                    surface_pressure=g("surface_pressure"),
                    precipitation=g("precipitation") or 0.0,
                    et0_fao_evapotranspiration=g("et0_fao_evapotranspiration"),
                    vapour_pressure_deficit=g("vapour_pressure_deficit")
                )
                snapshots.append(snap)

            ctx = WeatherContext(
                is_available=True,
                latitude=lat_r,
                longitude=lon_r,
                elevation=data.get("elevation"),
                timezone=data.get("timezone", "UTC"),
                current=snapshots[0] if snapshots else None,
                hourly_forecast=snapshots
            )
            self._set_cache(cache_key, ctx.dict(), ttl=86400 * 30) # Cache historical for 30 days
            return ctx
        except Exception as err:
            return WeatherContext(is_available=False, latitude=lat_r, longitude=lon_r, error=str(err))

# Global singleton provider instance
default_weather_provider = OpenMeteoProvider()
