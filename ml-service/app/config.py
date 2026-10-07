"""
epiML Standalone ML Service Configuration
Centralized configuration loaded from environment variables.
Never hardcodes secrets.
"""

import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent
ARTIFACTS_DIR = BASE_DIR / "artifacts"
DATA_DIR = BASE_DIR / "data"

# Ensure directories exist
ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseModel):
    # Service settings
    app_name: str = "epiML Microclimate & AQI Prediction Service"
    version: str = "2.0.0"
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", "8000"))
    environment: str = os.getenv("ENVIRONMENT", "production")
    
    # Supabase credentials (Service-role key only exists on trusted server-side ML infrastructure)
    supabase_url: str = os.getenv("SUPABASE_URL", os.getenv("NEXT_PUBLIC_SUPABASE_URL", "https://qbeqacmwaoufiwhafvyj.supabase.co"))
    supabase_service_role_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    supabase_anon_key: str = os.getenv("SUPABASE_ANON_KEY", os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY", ""))
    
    # Paths
    artifacts_dir: Path = ARTIFACTS_DIR
    data_dir: Path = DATA_DIR
    
    # ML Defaults
    default_prediction_horizon_minutes: int = int(os.getenv("DEFAULT_HORIZON_MINUTES", "30"))
    aqi_standard: str = os.getenv("AQI_STANDARD", "US_EPA") # "US_EPA" or "CPCB_NAQI"
    supported_horizons: list[int] = [15, 30, 60, 360, 1440]
    
    # Kaggle credentials (optional for private datasets)
    kaggle_username: str = os.getenv("KAGGLE_USERNAME", "")
    kaggle_key: str = os.getenv("KAGGLE_KEY", "")

settings = Settings()
