-- ==============================================================================
-- epiML — Supabase Profiles, Experiments & Auth Setup
-- Project URL: https://qbeqacmwaoufiwhafvyj.supabase.co
-- Run this in your Supabase Dashboard -> SQL Editor -> New query -> Run
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CLEAN UP ANY PREVIOUS EXPERIMENTAL TRIGGERS ON auth.users
DROP TRIGGER IF EXISTS on_auth_user_auto_confirm ON auth.users;
DROP FUNCTION IF EXISTS public.auto_confirm_user_email();

-- 3. CONFIRM ALL EXISTING REGISTERED USERS
-- In Supabase PostgreSQL, `confirmed_at` is a GENERATED column calculated
-- automatically from `email_confirmed_at`. Therefore, we ONLY update `email_confirmed_at`.
UPDATE auth.users 
SET email_confirmed_at = now() 
WHERE email_confirmed_at IS NULL;

-- ==============================================================================
-- 4. USER PROFILES TABLE (Linked to auth.users)
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

-- Allow reading public profiles for researcher attribution
DROP POLICY IF EXISTS "Profiles are viewable by anyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by anyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Allow authenticated users to insert their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- Allow authenticated users to update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- ==============================================================================
-- 5. AUTOMATIC PROFILE ONBOARDING TRIGGER
-- Whenever a user signs up in auth.users, create their profile row automatically
-- ==============================================================================
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

-- Backfill profile rows for any existing auth users
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email, '@', 1)),
  COALESCE(raw_user_meta_data->>'role', 'researcher')
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 6. CROP EXPERIMENTS TABLE (With Complete ML Phenotyping & Telemetry Data Schema)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_code TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL,
  scientific_name TEXT,
  emoji TEXT DEFAULT '🌱',
  status TEXT DEFAULT 'ACTIVE',
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
-- 7. ADMIN ML MANAGEMENT TABLES & DATA GOVERNANCE
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

