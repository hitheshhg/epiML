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

-- ==============================================================================
-- 13. USER CROP EXPERIMENTS TABLE (With Complete ML Phenotyping & Telemetry Schema)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_code TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL,
  scientific_name TEXT,
  emoji TEXT DEFAULT '🌱',
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'COMPLETED', 'RUNNING')),
  current_epoch TEXT DEFAULT 'GERMINATION',
  current_epoch_name TEXT DEFAULT 'Epoch 1: Imbibition & Radicle Anchor',
  current_day INT DEFAULT 1,
  duration_days INT DEFAULT 1,
  duration_seconds INT DEFAULT 0,
  target_temp NUMERIC DEFAULT 25.0,
  target_humidity NUMERIC DEFAULT 75.0,
  target_soil_moisture NUMERIC DEFAULT 70.0,
  target_light_hours INT DEFAULT 14,
  avg_temp NUMERIC DEFAULT 24.5,
  avg_humidity NUMERIC DEFAULT 75.0,
  avg_soil_moisture NUMERIC DEFAULT 70.0,
  avg_gas_ppm NUMERIC DEFAULT 38.0,
  actuations_total INT DEFAULT 0,
  total_cells INT DEFAULT 40,
  cells_emerged INT DEFAULT 0,
  emergence_rate_pct NUMERIC DEFAULT 0.0,
  sown_pins JSONB DEFAULT '[]'::jsonb,
  tray_image_url TEXT,
  telemetry_history JSONB DEFAULT '[]'::jsonb,
  phenotype_history JSONB DEFAULT '[]'::jsonb,
  protocol_snapshot JSONB DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure all enhanced ML telemetry columns exist if table was already created
ALTER TABLE public.experiments ADD COLUMN IF NOT EXISTS experiment_code TEXT;
ALTER TABLE public.experiments ADD COLUMN IF NOT EXISTS emoji TEXT DEFAULT '🌱';
ALTER TABLE public.experiments ADD COLUMN IF NOT EXISTS duration_days INT DEFAULT 1;
ALTER TABLE public.experiments ADD COLUMN IF NOT EXISTS duration_seconds INT DEFAULT 0;
ALTER TABLE public.experiments ADD COLUMN IF NOT EXISTS emergence_rate_pct NUMERIC DEFAULT 0.0;
ALTER TABLE public.experiments ADD COLUMN IF NOT EXISTS cells_emerged INT DEFAULT 0;
ALTER TABLE public.experiments ADD COLUMN IF NOT EXISTS total_cells INT DEFAULT 40;
ALTER TABLE public.experiments ADD COLUMN IF NOT EXISTS avg_temp NUMERIC DEFAULT 24.5;
ALTER TABLE public.experiments ADD COLUMN IF NOT EXISTS avg_humidity NUMERIC DEFAULT 75.0;
ALTER TABLE public.experiments ADD COLUMN IF NOT EXISTS avg_soil_moisture NUMERIC DEFAULT 70.0;
ALTER TABLE public.experiments ADD COLUMN IF NOT EXISTS avg_gas_ppm NUMERIC DEFAULT 38.0;
ALTER TABLE public.experiments ADD COLUMN IF NOT EXISTS actuations_total INT DEFAULT 0;
ALTER TABLE public.experiments ADD COLUMN IF NOT EXISTS current_epoch_name TEXT DEFAULT 'Epoch 1: Imbibition & Radicle Anchor';
ALTER TABLE public.experiments ADD COLUMN IF NOT EXISTS sown_pins JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.experiments ADD COLUMN IF NOT EXISTS tray_image_url TEXT;
ALTER TABLE public.experiments ADD COLUMN IF NOT EXISTS telemetry_history JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.experiments ADD COLUMN IF NOT EXISTS phenotype_history JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.experiments ADD COLUMN IF NOT EXISTS protocol_snapshot JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.experiments ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.experiments ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Drop and recreate flexible status check constraint
ALTER TABLE public.experiments DROP CONSTRAINT IF EXISTS experiments_status_check;
ALTER TABLE public.experiments ADD CONSTRAINT experiments_status_check CHECK (status IN ('ACTIVE', 'RUNNING', 'PAUSED', 'COMPLETED'));

ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own experiments" ON public.experiments;
CREATE POLICY "Users can view their own experiments"
  ON public.experiments FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own experiments" ON public.experiments;
CREATE POLICY "Users can insert their own experiments"
  ON public.experiments FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own experiments" ON public.experiments;
CREATE POLICY "Users can update their own experiments"
  ON public.experiments FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own experiments" ON public.experiments;
CREATE POLICY "Users can delete their own experiments"
  ON public.experiments FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ==============================================================================
-- 14. ADMIN ML MANAGEMENT TABLES & DATA GOVERNANCE
-- ==============================================================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS include_in_research_training BOOLEAN DEFAULT true;
ALTER TABLE public.experiments ADD COLUMN IF NOT EXISTS include_in_research_training BOOLEAN DEFAULT true;
ALTER TABLE public.experiments ADD COLUMN IF NOT EXISTS exclude_reason TEXT;

CREATE TABLE IF NOT EXISTS public.ml_datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  dataset_type TEXT NOT NULL CHECK (dataset_type IN ('USER_IOT', 'EXPERIMENTAL', 'KAGGLE_REFERENCE', 'COMBINED')),
  description TEXT,
  source_identifier TEXT,
  provenance JSONB DEFAULT '{}'::jsonb,
  record_count INT DEFAULT 0,
  feature_count INT DEFAULT 0,
  quality_score NUMERIC DEFAULT 100.0,
  missing_value_pct NUMERIC DEFAULT 0.0,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'QUARANTINED', 'ARCHIVED')),
  is_eligible_for_training BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ml_dataset_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID REFERENCES public.ml_datasets(id) ON DELETE CASCADE,
  version_tag TEXT NOT NULL,
  row_count INT NOT NULL DEFAULT 0,
  column_count INT NOT NULL DEFAULT 0,
  columns_schema JSONB NOT NULL DEFAULT '[]'::jsonb,
  file_uri TEXT,
  quality_report JSONB DEFAULT '{}'::jsonb,
  normalization_report JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ml_feature_schemas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  target_columns JSONB NOT NULL DEFAULT '["aqi", "temperature_c", "humidity_pct", "soil_moisture_pct"]'::jsonb,
  lags_config JSONB DEFAULT '[1, 3, 6, 12, 24]'::jsonb,
  rolling_windows_config JSONB DEFAULT '[3, 6, 12]'::jsonb,
  normalization_mappings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ml_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  family TEXT NOT NULL DEFAULT 'TABULAR' CHECK (family IN ('TABULAR', 'ENSEMBLE', 'DEEP_LEARNING')),
  description TEXT,
  primary_metric TEXT DEFAULT 'RMSE',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ml_model_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID REFERENCES public.ml_models(id) ON DELETE CASCADE,
  version_tag TEXT NOT NULL UNIQUE,
  algorithm TEXT NOT NULL,
  targets JSONB NOT NULL DEFAULT '["aqi", "temperature_c", "humidity_pct", "soil_moisture_pct"]'::jsonb,
  prediction_horizon_minutes INT NOT NULL DEFAULT 30,
  dataset_version_id UUID REFERENCES public.ml_dataset_versions(id) ON DELETE SET NULL,
  feature_schema_id UUID REFERENCES public.ml_feature_schemas(id) ON DELETE SET NULL,
  feature_count INT DEFAULT 0,
  training_records INT DEFAULT 0,
  training_duration_seconds NUMERIC DEFAULT 0.0,
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  validation_metrics JSONB DEFAULT '{}'::jsonb,
  test_metrics JSONB DEFAULT '{}'::jsonb,
  artifact_location TEXT,
  git_commit TEXT,
  status TEXT DEFAULT 'CANDIDATE' CHECK (status IN ('CANDIDATE', 'ACTIVE', 'ARCHIVED', 'FAILED', 'ROLLBACK_PREVIOUS')),
  smoke_test_passed BOOLEAN DEFAULT false,
  trained_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ml_training_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  status TEXT DEFAULT 'QUEUED' CHECK (status IN ('QUEUED', 'PREPROCESSING', 'FEATURE_ENGINEERING', 'TRAINING', 'VALIDATION', 'EVALUATION', 'COMPLETED', 'FAILED')),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  progress_pct INT DEFAULT 0,
  logs JSONB DEFAULT '[]'::jsonb,
  error_message TEXT,
  resulting_model_version_id UUID REFERENCES public.ml_model_versions(id) ON DELETE SET NULL,
  triggered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ml_deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version_id UUID REFERENCES public.ml_model_versions(id) ON DELETE CASCADE,
  previous_model_version_id UUID REFERENCES public.ml_model_versions(id) ON DELETE SET NULL,
  deployed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deployed_at TIMESTAMPTZ DEFAULT now(),
  smoke_test_result JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUPERSEDED', 'ROLLED_BACK')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ml_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version_tag TEXT NOT NULL,
  horizon_minutes INT NOT NULL DEFAULT 30,
  inputs JSONB NOT NULL,
  predictions JSONB NOT NULL,
  confidence JSONB,
  prediction_intervals JSONB,
  client_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ml_drift_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ DEFAULT now(),
  drift_status TEXT DEFAULT 'NORMAL' CHECK (drift_status IN ('NORMAL', 'WATCH', 'DRIFT_DETECTED')),
  feature_drifts JSONB DEFAULT '{}'::jsonb,
  missing_rate NUMERIC DEFAULT 0.0,
  sensor_out_of_bounds_count INT DEFAULT 0,
  prediction_residuals JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER TABLE public.ml_datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_dataset_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_feature_schemas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_model_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_training_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_drift_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage ml_datasets" ON public.ml_datasets;
CREATE POLICY "Admins can manage ml_datasets" ON public.ml_datasets FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage ml_dataset_versions" ON public.ml_dataset_versions;
CREATE POLICY "Admins can manage ml_dataset_versions" ON public.ml_dataset_versions FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage ml_feature_schemas" ON public.ml_feature_schemas;
CREATE POLICY "Admins can manage ml_feature_schemas" ON public.ml_feature_schemas FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage ml_models" ON public.ml_models;
CREATE POLICY "Admins can manage ml_models" ON public.ml_models FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage ml_model_versions" ON public.ml_model_versions;
CREATE POLICY "Admins can manage ml_model_versions" ON public.ml_model_versions FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage ml_training_jobs" ON public.ml_training_jobs;
CREATE POLICY "Admins can manage ml_training_jobs" ON public.ml_training_jobs FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage ml_deployments" ON public.ml_deployments;
CREATE POLICY "Admins can manage ml_deployments" ON public.ml_deployments FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Authenticated users can insert predictions" ON public.ml_predictions;
CREATE POLICY "Authenticated users can insert predictions" ON public.ml_predictions FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can read predictions" ON public.ml_predictions;
CREATE POLICY "Admins can read predictions" ON public.ml_predictions FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage drift metrics" ON public.ml_drift_metrics;
CREATE POLICY "Admins can manage drift metrics" ON public.ml_drift_metrics FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


