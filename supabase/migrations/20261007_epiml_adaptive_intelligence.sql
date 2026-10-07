-- ==============================================================================
-- epiML — Adaptive Agricultural Environmental Intelligence Platform Schema
-- Migration: 20261007_epiml_adaptive_intelligence.sql
-- ==============================================================================

-- 1. Canonical Locations Table (Section 6)
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_name TEXT NOT NULL,
  country TEXT DEFAULT 'India',
  state TEXT,
  district TEXT,
  latitude NUMERIC(9, 6) NOT NULL,
  longitude NUMERIC(9, 6) NOT NULL,
  elevation NUMERIC(7, 2),
  timezone TEXT DEFAULT 'Asia/Kolkata',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_locations_coords ON public.locations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_locations_name ON public.locations(location_name);

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Locations viewable by all" ON public.locations;
CREATE POLICY "Locations viewable by all"
  ON public.locations FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert locations" ON public.locations;
CREATE POLICY "Authenticated users can insert locations"
  ON public.locations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 2. Seed Varieties Table (Section 13)
CREATE TABLE IF NOT EXISTS public.seed_varieties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop TEXT NOT NULL,
  seed_variety TEXT NOT NULL,
  growth_stage TEXT NOT NULL DEFAULT 'germination',
  seed_batch TEXT,
  description TEXT,
  temp_min NUMERIC DEFAULT 18.0,
  temp_optimal NUMERIC DEFAULT 25.0,
  temp_max NUMERIC DEFAULT 32.0,
  rh_min NUMERIC DEFAULT 60.0,
  rh_optimal NUMERIC DEFAULT 75.0,
  rh_max NUMERIC DEFAULT 88.0,
  soil_min NUMERIC DEFAULT 50.0,
  soil_optimal NUMERIC DEFAULT 70.0,
  soil_max NUMERIC DEFAULT 85.0,
  vpd_min NUMERIC DEFAULT 0.40,
  vpd_optimal NUMERIC DEFAULT 0.85,
  vpd_max NUMERIC DEFAULT 1.25,
  aqi_max NUMERIC DEFAULT 100.0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (crop, seed_variety, growth_stage)
);

ALTER TABLE public.seed_varieties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Seed varieties viewable by all" ON public.seed_varieties;
CREATE POLICY "Seed varieties viewable by all"
  ON public.seed_varieties FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated can insert seed varieties" ON public.seed_varieties;
CREATE POLICY "Authenticated can insert seed varieties"
  ON public.seed_varieties FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 3. Weather Cache Table (Section 9)
CREATE TABLE IF NOT EXISTS public.weather_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT NOT NULL UNIQUE,
  latitude NUMERIC(9, 6) NOT NULL,
  longitude NUMERIC(9, 6) NOT NULL,
  weather_model TEXT DEFAULT 'best_match',
  endpoint TEXT NOT NULL,
  response_payload JSONB NOT NULL,
  units JSONB DEFAULT '{}'::jsonb,
  retrieved_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_weather_cache_key ON public.weather_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_weather_cache_expiry ON public.weather_cache(expires_at);

ALTER TABLE public.weather_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Weather cache viewable by all" ON public.weather_cache;
CREATE POLICY "Weather cache viewable by all"
  ON public.weather_cache FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Weather cache manageable by authenticated" ON public.weather_cache;
CREATE POLICY "Weather cache manageable by authenticated"
  ON public.weather_cache FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Weather Observations Provenance Table (Section 8 & 36)
CREATE TABLE IF NOT EXISTS public.weather_observations (
  id BIGSERIAL PRIMARY KEY,
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  latitude NUMERIC(9, 6) NOT NULL,
  longitude NUMERIC(9, 6) NOT NULL,
  forecast_timestamp TIMESTAMPTZ NOT NULL,
  weather_source TEXT DEFAULT 'Open-Meteo',
  weather_model TEXT DEFAULT 'best_match',
  temperature_2m NUMERIC,
  relative_humidity_2m NUMERIC,
  dew_point_2m NUMERIC,
  apparent_temperature NUMERIC,
  precipitation NUMERIC,
  precipitation_probability NUMERIC,
  surface_pressure NUMERIC,
  wind_speed_10m NUMERIC,
  wind_direction_10m NUMERIC,
  et0_fao_evapotranspiration NUMERIC,
  vapour_pressure_deficit NUMERIC,
  soil_temperature NUMERIC,
  soil_moisture NUMERIC,
  shortwave_solar_radiation NUMERIC,
  weather_code INT,
  is_day INT,
  units JSONB DEFAULT '{}'::jsonb,
  retrieved_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_weather_obs_coords_time 
  ON public.weather_observations(latitude, longitude, forecast_timestamp DESC);

ALTER TABLE public.weather_observations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Weather observations viewable by all" ON public.weather_observations;
CREATE POLICY "Weather observations viewable by all"
  ON public.weather_observations FOR SELECT
  USING (true);

-- 5. Local Calibration Records Table (Section 12)
CREATE TABLE IF NOT EXISTS public.local_calibration_records (
  id BIGSERIAL PRIMARY KEY,
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
  target_variable TEXT NOT NULL CHECK (target_variable IN ('temperature_c', 'humidity_pct', 'soil_moisture_pct', 'aqi')),
  local_observation NUMERIC NOT NULL,
  external_prediction NUMERIC NOT NULL,
  residual NUMERIC NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  calibration_model_version TEXT DEFAULT 'v1.0'
);

CREATE INDEX IF NOT EXISTS idx_local_calibration_loc_target 
  ON public.local_calibration_records(location_id, target_variable, recorded_at DESC);

ALTER TABLE public.local_calibration_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Calibration records viewable by all" ON public.local_calibration_records;
CREATE POLICY "Calibration records viewable by all"
  ON public.local_calibration_records FOR SELECT
  USING (true);

-- 6. Closed-Loop Prediction Feedback Logs (Section 29)
CREATE TABLE IF NOT EXISTS public.prediction_feedback_logs (
  id BIGSERIAL PRIMARY KEY,
  experiment_id UUID REFERENCES public.experiments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  crop TEXT NOT NULL,
  seed_variety TEXT,
  growth_stage TEXT,
  prediction_horizon_minutes INT DEFAULT 30,
  predicted_temperature NUMERIC,
  actual_temperature NUMERIC,
  error_temperature NUMERIC,
  predicted_humidity NUMERIC,
  actual_humidity NUMERIC,
  error_humidity NUMERIC,
  predicted_soil_moisture NUMERIC,
  actual_soil_moisture NUMERIC,
  error_soil_moisture NUMERIC,
  predicted_aqi NUMERIC,
  actual_aqi NUMERIC,
  error_aqi NUMERIC,
  model_version TEXT,
  prediction_basis TEXT,
  feedback_timestamp TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prediction_feedback_exp 
  ON public.prediction_feedback_logs(experiment_id, feedback_timestamp DESC);

ALTER TABLE public.prediction_feedback_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Feedback viewable by all" ON public.prediction_feedback_logs;
CREATE POLICY "Feedback viewable by all"
  ON public.prediction_feedback_logs FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Feedback insertable by authenticated" ON public.prediction_feedback_logs;
CREATE POLICY "Feedback insertable by authenticated"
  ON public.prediction_feedback_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 7. Add location and seed columns to experiments table if not present
ALTER TABLE public.experiments ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL;
ALTER TABLE public.experiments ADD COLUMN IF NOT EXISTS location_name TEXT DEFAULT 'Mangalore, Karnataka';
ALTER TABLE public.experiments ADD COLUMN IF NOT EXISTS latitude NUMERIC(9, 6) DEFAULT 12.8797;
ALTER TABLE public.experiments ADD COLUMN IF NOT EXISTS longitude NUMERIC(9, 6) DEFAULT 74.8828;
ALTER TABLE public.experiments ADD COLUMN IF NOT EXISTS elevation NUMERIC(7, 2) DEFAULT 22.0;
ALTER TABLE public.experiments ADD COLUMN IF NOT EXISTS seed_variety TEXT DEFAULT 'Pusa Ruby';
ALTER TABLE public.experiments ADD COLUMN IF NOT EXISTS seed_batch TEXT DEFAULT 'BATCH-2026-A1';
ALTER TABLE public.experiments ADD COLUMN IF NOT EXISTS growth_stage TEXT DEFAULT 'germination';

-- 8. Seed Standard Seed Varieties Reference Data (Real baseline biology)
INSERT INTO public.seed_varieties (crop, seed_variety, growth_stage, description, temp_min, temp_optimal, temp_max, rh_min, rh_optimal, rh_max, soil_min, soil_optimal, soil_max, vpd_min, vpd_optimal, vpd_max, aqi_max)
VALUES
  ('Tomato', 'Pusa Ruby', 'germination', 'Determinate variety bred by IARI, high lycopene, robust germination in coastal/humid conditions', 20.0, 25.5, 30.0, 65.0, 78.0, 88.0, 55.0, 70.0, 80.0, 0.40, 0.82, 1.20, 100),
  ('Tomato', 'Arka Rakshak', 'germination', 'Triple disease-resistant hybrid by IIHR, higher thermal tolerance', 22.0, 26.5, 32.0, 60.0, 75.0, 85.0, 50.0, 68.0, 78.0, 0.45, 0.88, 1.25, 100),
  ('Wheat', 'HD-2967', 'germination', 'Widely cultivated high-yielding Indian spring wheat with cooler canopy preference', 15.0, 21.0, 25.0, 50.0, 65.0, 75.0, 45.0, 60.0, 70.0, 0.50, 0.95, 1.35, 90),
  ('Rice', 'IR-64', 'germination', 'Semi-dwarf indica rice cultivar, moisture and thermal loving', 25.0, 30.0, 35.0, 70.0, 82.0, 92.0, 65.0, 80.0, 90.0, 0.35, 0.70, 1.10, 120),
  ('Maize', 'DHM-117', 'germination', 'High-vigor single-cross hybrid, balanced soil water requirements', 20.0, 27.0, 33.0, 55.0, 70.0, 82.0, 50.0, 65.0, 75.0, 0.45, 0.85, 1.30, 110),
  ('Chilli', 'Byadagi KDL', 'germination', 'Geographical Indication GI-tagged Karnataka cultivar, moderate temperature & moisture', 20.0, 26.0, 31.0, 60.0, 72.0, 84.0, 50.0, 65.0, 75.0, 0.45, 0.85, 1.25, 95)
ON CONFLICT (crop, seed_variety, growth_stage) DO UPDATE SET
  temp_optimal = EXCLUDED.temp_optimal,
  rh_optimal = EXCLUDED.rh_optimal,
  soil_optimal = EXCLUDED.soil_optimal,
  vpd_optimal = EXCLUDED.vpd_optimal;
