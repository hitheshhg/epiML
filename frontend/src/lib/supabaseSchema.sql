-- ==============================================================================
-- epiML — AI Crop Experiment Lab
-- Autonomous Agricultural Experiment & Phenotyping Platform
-- Built for: Supabase PostgreSQL + Auth + Storage
-- Project Ref: qbeqacmwaoufiwhafvyj
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1.1 CLEANUP & CONFIRM EXISTING USERS
-- (Note: confirmed_at is a generated column in Supabase, so only email_confirmed_at is updated)
-- ==============================================================================
DROP TRIGGER IF EXISTS on_auth_user_auto_confirm ON auth.users;
DROP FUNCTION IF EXISTS public.auto_confirm_user_email();

UPDATE auth.users 
SET email_confirmed_at = now() 
WHERE email_confirmed_at IS NULL;

-- ==============================================================================
-- 2. USER PROFILES TABLE (Linked to auth.users)
-- Simple authentication: Any standard email is supported (e.g. Gmail, Outlook, personal, work).
-- NO institutional email requirement or domain restrictions.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'researcher' CHECK (role IN ('researcher', 'evaluator', 'guest', 'admin', 'operator')),
  avatar_url TEXT,
  preferred_crop TEXT DEFAULT 'Tomato',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow reading public profiles for collaborative monitoring and researcher attribution
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by anyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by anyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Allow authenticated users to insert and manage their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- Trigger to automatically create or sync profile on Supabase auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'researcher')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- 3. PLANT & BIOLOGICAL PROFILES (Section 10 & 12)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.plant_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  common_name TEXT NOT NULL,
  scientific_name TEXT NOT NULL,
  scientific_name_confidence NUMERIC DEFAULT 0.95,
  growth_stage TEXT DEFAULT 'germination',
  gbif_taxon_key BIGINT,
  gbif_match_confidence TEXT,
  accepted_scientific_name TEXT,
  temp_min NUMERIC NOT NULL DEFAULT 20.0,
  temp_optimal NUMERIC NOT NULL DEFAULT 25.0,
  temp_max NUMERIC NOT NULL DEFAULT 30.0,
  humidity_min NUMERIC NOT NULL DEFAULT 65.0,
  humidity_optimal NUMERIC NOT NULL DEFAULT 78.0,
  humidity_max NUMERIC NOT NULL DEFAULT 88.0,
  moisture_target TEXT DEFAULT '65-75% Index',
  moisture_min NUMERIC DEFAULT 60.0,
  moisture_optimal NUMERIC DEFAULT 72.0,
  moisture_max NUMERIC DEFAULT 82.0,
  light_regime TEXT,
  canopy_shade_target NUMERIC DEFAULT 50,
  germination_window JSONB DEFAULT '{"minDays": 5, "typicalDays": 7, "maxDays": 12}'::jsonb,
  monitoring_notes TEXT,
  evidence_level TEXT DEFAULT 'LITERATURE' CHECK (evidence_level IN ('LITERATURE', 'PUBLIC DATA', 'RESEARCHER DEFINED', 'AI ASSISTED', 'UNVERIFIED')),
  reference_suggestions JSONB DEFAULT '[]'::jsonb,
  limitations TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.plant_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view plant profiles"
  ON public.plant_profiles FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can insert plant profiles"
  ON public.plant_profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ==============================================================================
-- 4. MONITORING SESSIONS TABLE (Section 14)
-- The profile used by an old session must never silently change later.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.monitoring_sessions (
  id TEXT PRIMARY KEY, -- e.g. 'SES-2026-TRAY-01'
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  plant_name TEXT NOT NULL,
  scientific_name TEXT NOT NULL,
  profile_snapshot JSONB NOT NULL,
  profile_source TEXT DEFAULT 'LITERATURE',
  profile_version TEXT DEFAULT 'v1.0',
  algorithm_version TEXT DEFAULT 'ExG_V0_HYBRID',
  software_version TEXT DEFAULT 'CHIGURU_2.0',
  camera_config JSONB DEFAULT '{"distance_mm": 420, "angle_deg": 90, "resolution": "1920x1080"}'::jsonb,
  sensor_config JSONB DEFAULT '{"channels": ["D2_DHT22", "D3_DHT22", "A0_SOIL1", "A1_SOIL2", "A2_MQ135", "A5_FAN"]}'::jsonb,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'ARCHIVED')),
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ
);

ALTER TABLE public.monitoring_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sessions viewable by all authenticated and anon"
  ON public.monitoring_sessions FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can create sessions"
  ON public.monitoring_sessions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own sessions"
  ON public.monitoring_sessions FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id OR user_id IS NULL)
  WITH CHECK ((select auth.uid()) = user_id OR user_id IS NULL);

-- ==============================================================================
-- 5. 40-CELL MATRIX TABLE (Section 16: C01 - C40)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.cells (
  session_id TEXT NOT NULL REFERENCES public.monitoring_sessions(id) ON DELETE CASCADE,
  cell_id TEXT NOT NULL, -- 'C01' to 'C40'
  state TEXT NOT NULL DEFAULT 'SEEDED' CHECK (state IN ('SEEDED', 'EMERGING', 'GERMINATED', 'GROWING', 'REVIEW', 'NO OBSERVATION')),
  green_area_mm2 NUMERIC NOT NULL DEFAULT 0.0,
  growth_rate_mm_day NUMERIC DEFAULT 0.0,
  confidence NUMERIC DEFAULT 0.85,
  first_emergence_at TIMESTAMPTZ,
  last_updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (session_id, cell_id)
);

ALTER TABLE public.cells ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cells viewable by everyone"
  ON public.cells FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Cells modifiable by authenticated"
  ON public.cells FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ==============================================================================
-- 6. SENSOR SAMPLES (Section 19, 20 & 32)
-- Continuous telemetry timeseries with source category tags
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.sensor_samples (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES public.monitoring_sessions(id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sensor_id TEXT NOT NULL, -- e.g. 'DHT22_CHAMBER', 'SOIL_1', 'MQ135'
  sensor_type TEXT NOT NULL, -- 'TEMPERATURE', 'HUMIDITY', 'MOISTURE_INDEX', 'VOC_PROXY', 'DEW_POINT'
  raw_value NUMERIC NOT NULL,
  normalized_value NUMERIC,
  unit TEXT NOT NULL, -- '°C', '%', 'INDEX', 'PPM'
  source_category TEXT NOT NULL DEFAULT 'MEASURED' CHECK (source_category IN ('MEASURED', 'DERIVED', 'EXTERNAL', 'IMPORTED', 'REPLAY', 'SIMULATED', 'AI INTERPRETATION')),
  quality_flag TEXT DEFAULT 'VALID',
  calibration_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_sensor_samples_session_time 
  ON public.sensor_samples(session_id, recorded_at DESC);

ALTER TABLE public.sensor_samples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sensor samples viewable by all"
  ON public.sensor_samples FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Sensor samples insertable by authenticated"
  ON public.sensor_samples FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ==============================================================================
-- 7. ACTUATOR EVENTS HISTORY (Section 33, 34, 36, 37)
-- Pump, Servos, Fan, Buzzer events with reason and duration
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.actuator_events (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES public.monitoring_sessions(id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  actuator_type TEXT NOT NULL CHECK (actuator_type IN ('PUMP', 'VENT_SERVO', 'SHADE_SERVO', 'FAN', 'BUZZER')),
  action TEXT NOT NULL, -- 'ON', 'OFF', 'SET_ANGLE', 'PULSE'
  previous_state TEXT,
  new_state TEXT,
  duration_ms INTEGER,
  trigger_source TEXT NOT NULL DEFAULT 'AUTOMATIC' CHECK (trigger_source IN ('AUTOMATIC', 'MANUAL', 'SCHEDULED', 'SAFETY_OVERRIDE')),
  reason TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_actuator_events_session 
  ON public.actuator_events(session_id, recorded_at DESC);

ALTER TABLE public.actuator_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Actuator events viewable by all"
  ON public.actuator_events FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Actuator events insertable by authenticated"
  ON public.actuator_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ==============================================================================
-- 8. COMPUTER VISION PHENOTYPE OBSERVATIONS (Section 22 & 31)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.phenotype_observations (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES public.monitoring_sessions(id) ON DELETE CASCADE,
  cell_id TEXT NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  raw_image_path TEXT,
  thumbnail_path TEXT,
  segmentation_mask_path TEXT,
  green_area_mm2 NUMERIC NOT NULL,
  growth_delta_mm2 NUMERIC DEFAULT 0.0,
  model_prediction TEXT NOT NULL CHECK (model_prediction IN ('SEEDED', 'EMERGING', 'GERMINATED', 'GROWING', 'REVIEW', 'NO OBSERVATION')),
  model_version TEXT NOT NULL DEFAULT 'V0',
  confidence NUMERIC NOT NULL,
  environmental_context JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_phenotype_cell 
  ON public.phenotype_observations(session_id, cell_id, recorded_at DESC);

ALTER TABLE public.phenotype_observations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Phenotype observations viewable by all"
  ON public.phenotype_observations FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Phenotype observations insertable by authenticated"
  ON public.phenotype_observations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ==============================================================================
-- 9. HUMAN-IN-THE-LOOP VERIFIED RESEARCH DATASET (Section 25, 49 & 50)
-- Only human-verified examples become training ground truth
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.verified_dataset (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT REFERENCES public.monitoring_sessions(id) ON DELETE SET NULL,
  cell_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  plant_name TEXT NOT NULL,
  scientific_name TEXT NOT NULL,
  raw_image_path TEXT,
  model_prediction TEXT NOT NULL,
  model_confidence NUMERIC,
  human_label TEXT NOT NULL CHECK (human_label IN ('YES', 'NO', 'UNCERTAIN')),
  final_verified_label TEXT NOT NULL,
  dataset_version TEXT NOT NULL DEFAULT 'v1.0',
  consent_shared BOOLEAN NOT NULL DEFAULT true,
  environmental_context JSONB DEFAULT '{}'::jsonb,
  green_area_mm2 NUMERIC DEFAULT 0.0,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_verified_dataset_version 
  ON public.verified_dataset(dataset_version, plant_name);

ALTER TABLE public.verified_dataset ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Verified dataset viewable by all"
  ON public.verified_dataset FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Verified dataset insertable by authenticated"
  ON public.verified_dataset FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ==============================================================================
-- 10. MODEL LINEAGE & EVALUATION METRICS (Section 26 & 27)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.models (
  id TEXT PRIMARY KEY, -- 'V0', 'V1', 'V2'
  version TEXT NOT NULL,
  name TEXT NOT NULL,
  algorithm TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'CANDIDATE' CHECK (status IN ('ACTIVE', 'CANDIDATE', 'TEST', 'ARCHIVED')),
  training_dataset_version TEXT,
  training_samples_count INTEGER DEFAULT 0,
  evaluation_metrics JSONB DEFAULT '{"precision": 0, "recall": 0, "f1": 0, "iou": 0, "accuracy": 0}'::jsonb,
  weights_path TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Models viewable by all"
  ON public.models FOR SELECT
  TO authenticated, anon
  USING (true);

-- Insert Model Lineage Baselines
INSERT INTO public.models (id, version, name, algorithm, status, training_dataset_version, training_samples_count, evaluation_metrics)
VALUES 
  ('V0', 'v0.9-baseline', 'ExG Classical Baseline', 'Excess Green Index (2G - R - B) + Fixed 5x8 Grid', 'ACTIVE', 'v0.0', 0, '{"precision": 0.88, "recall": 0.85, "f1": 0.865, "iou": 0.74, "accuracy": 0.87}'::jsonb),
  ('V1', 'v1.0-transfer', 'MobileNetV3 Transfer Seedling', 'PyTorch Transfer Learning fine-tuned on Chiguru Dataset', 'CANDIDATE', 'v1.0', 3, '{"precision": 0.667, "recall": 1.0, "f1": 0.8, "iou": 0.667, "accuracy": 0.667}'::jsonb),
  ('V2', 'v2.0-multimodal', 'Multimodal Emergence Forecaster', 'Phenotype Imagery + Thermal Sum (GDD) + Moisture Sum', 'CANDIDATE', 'v2.0-pending', 0, '{"precision": 0.0, "recall": 0.0, "f1": 0.0, "iou": 0.0, "accuracy": 0.0}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  evaluation_metrics = EXCLUDED.evaluation_metrics,
  status = EXCLUDED.status;

-- ==============================================================================
-- 11. SUPABASE STORAGE BUCKET: seedling-images
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('seedling-images', 'seedling-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public image bucket access"
  ON storage.objects FOR SELECT
  TO authenticated, anon
  USING (bucket_id = 'seedling-images');

CREATE POLICY "Authenticated users can upload seedling images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'seedling-images');

-- ==============================================================================
-- 12. SEED DEFAULT BASELINE SESSION FOR TOMATO
-- ==============================================================================
INSERT INTO public.monitoring_sessions (
  id,
  plant_name,
  scientific_name,
  profile_snapshot,
  profile_source,
  profile_version,
  status
)
VALUES (
  'SES-2026-TRAY-01',
  'Tomato',
  'Solanum lycopersicum L.',
  '{
    "commonName": "Tomato",
    "scientificName": "Solanum lycopersicum L.",
    "gbifTaxonKey": 2930137,
    "temperatureGuidance": {"min": 20, "optimal": 25, "max": 30, "unit": "C"},
    "humidityGuidance": {"min": 65, "optimal": 78, "max": 88, "unit": "%"},
    "moistureGuidance": {"monitoringTarget": "65-75% Index", "minIndex": 60, "optimalIndex": 72, "maxIndex": 82}
  }'::jsonb,
  'LITERATURE',
  'v1.0',
  'ACTIVE'
)
ON CONFLICT (id) DO NOTHING;

-- Seed Cell C17 as the signature emergence cell
INSERT INTO public.cells (session_id, cell_id, state, green_area_mm2, growth_rate_mm_day, confidence, first_emergence_at)
VALUES 
  ('SES-2026-TRAY-01', 'C17', 'GERMINATED', 14.8, 0.8, 0.94, now() - INTERVAL '2 days'),
  ('SES-2026-TRAY-01', 'C08', 'GROWING', 18.2, 1.2, 0.96, now() - INTERVAL '3 days'),
  ('SES-2026-TRAY-01', 'C23', 'REVIEW', 2.1, 0.1, 0.54, NULL)
ON CONFLICT (session_id, cell_id) DO UPDATE SET
  green_area_mm2 = EXCLUDED.green_area_mm2,
  state = EXCLUDED.state;
