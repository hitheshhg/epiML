-- ==============================================================================
-- epiML — Admin ML Training & Model Management Center Schema
-- Migration: 20261007_admin_ml_management.sql
-- ==============================================================================

-- 1. Governance & Data Consent flags on existing tables
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS include_in_research_training BOOLEAN DEFAULT true;
ALTER TABLE public.experiments ADD COLUMN IF NOT EXISTS include_in_research_training BOOLEAN DEFAULT true;
ALTER TABLE public.experiments ADD COLUMN IF NOT EXISTS exclude_reason TEXT;

-- 2. ML Datasets Master Table
CREATE TABLE IF NOT EXISTS public.ml_datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  dataset_type TEXT NOT NULL CHECK (dataset_type IN ('USER_IOT', 'EXPERIMENTAL', 'KAGGLE_REFERENCE', 'COMBINED')),
  description TEXT,
  source_identifier TEXT, -- e.g. 'arkabhowmik/crop-recommendation' or 'supabase:public.experiments'
  provenance JSONB DEFAULT '{}'::jsonb, -- author, license, original columns, download date, URL
  record_count INT DEFAULT 0,
  feature_count INT DEFAULT 0,
  quality_score NUMERIC DEFAULT 100.0, -- 0 to 100%
  missing_value_pct NUMERIC DEFAULT 0.0,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'QUARANTINED', 'ARCHIVED')),
  is_eligible_for_training BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. ML Dataset Versions Table
CREATE TABLE IF NOT EXISTS public.ml_dataset_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID REFERENCES public.ml_datasets(id) ON DELETE CASCADE,
  version_tag TEXT NOT NULL, -- e.g. 'v1.0.0'
  row_count INT NOT NULL DEFAULT 0,
  column_count INT NOT NULL DEFAULT 0,
  columns_schema JSONB NOT NULL DEFAULT '[]'::jsonb,
  file_uri TEXT, -- local path or storage bucket URL
  quality_report JSONB DEFAULT '{}'::jsonb,
  normalization_report JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. ML Feature Schemas Table
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

-- 5. ML Models Master Table
CREATE TABLE IF NOT EXISTS public.ml_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  family TEXT NOT NULL DEFAULT 'TABULAR' CHECK (family IN ('TABULAR', 'ENSEMBLE', 'DEEP_LEARNING')),
  description TEXT,
  primary_metric TEXT DEFAULT 'RMSE',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. ML Model Versions (Model Registry)
CREATE TABLE IF NOT EXISTS public.ml_model_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID REFERENCES public.ml_models(id) ON DELETE CASCADE,
  version_tag TEXT NOT NULL UNIQUE, -- e.g. 'v1.0.0'
  algorithm TEXT NOT NULL, -- 'XGBoost', 'RandomForest', 'VotingEnsemble', etc.
  targets JSONB NOT NULL DEFAULT '["aqi", "temperature_c", "humidity_pct", "soil_moisture_pct"]'::jsonb,
  prediction_horizon_minutes INT NOT NULL DEFAULT 30,
  dataset_version_id UUID REFERENCES public.ml_dataset_versions(id) ON DELETE SET NULL,
  feature_schema_id UUID REFERENCES public.ml_feature_schemas(id) ON DELETE SET NULL,
  feature_count INT DEFAULT 0,
  training_records INT DEFAULT 0,
  training_duration_seconds NUMERIC DEFAULT 0.0,
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb, -- { aqi: { mae, rmse, r2 }, temperature_c: { ... }, overall: { ... } }
  validation_metrics JSONB DEFAULT '{}'::jsonb,
  test_metrics JSONB DEFAULT '{}'::jsonb,
  artifact_location TEXT, -- e.g. 'ml-service/artifacts/model_v1.0.0.joblib'
  git_commit TEXT,
  status TEXT DEFAULT 'CANDIDATE' CHECK (status IN ('CANDIDATE', 'ACTIVE', 'ARCHIVED', 'FAILED', 'ROLLBACK_PREVIOUS')),
  smoke_test_passed BOOLEAN DEFAULT false,
  trained_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. ML Training Jobs Table
CREATE TABLE IF NOT EXISTS public.ml_training_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  status TEXT DEFAULT 'QUEUED' CHECK (status IN ('QUEUED', 'PREPROCESSING', 'FEATURE_ENGINEERING', 'TRAINING', 'VALIDATION', 'EVALUATION', 'COMPLETED', 'FAILED')),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  progress_pct INT DEFAULT 0,
  logs JSONB DEFAULT '[]'::jsonb, -- array of { timestamp, message, level }
  error_message TEXT,
  resulting_model_version_id UUID REFERENCES public.ml_model_versions(id) ON DELETE SET NULL,
  triggered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. ML Deployments & Audit History Table
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

-- 9. ML Real-Time Predictions Log
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

-- 10. ML Drift & Quality Monitoring Table
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

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_ml_datasets_type ON public.ml_datasets(dataset_type);
CREATE INDEX IF NOT EXISTS idx_ml_datasets_status ON public.ml_datasets(status);
CREATE INDEX IF NOT EXISTS idx_ml_model_versions_status ON public.ml_model_versions(status);
CREATE INDEX IF NOT EXISTS idx_ml_model_versions_tag ON public.ml_model_versions(version_tag);
CREATE INDEX IF NOT EXISTS idx_ml_training_jobs_status ON public.ml_training_jobs(status);
CREATE INDEX IF NOT EXISTS idx_ml_deployments_status ON public.ml_deployments(status);
CREATE INDEX IF NOT EXISTS idx_ml_predictions_created_at ON public.ml_predictions(created_at DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Security Rule: Normal users can NEVER view or mutate ML management tables.
-- Only authorized administrators can read or mutate centralized ML-management data.
-- ==============================================================================
ALTER TABLE public.ml_datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_dataset_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_feature_schemas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_model_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_training_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_drift_metrics ENABLE ROW LEVEL SECURITY;

-- Helper function: is_admin()
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies for ml_datasets
DROP POLICY IF EXISTS "Admins can manage ml_datasets" ON public.ml_datasets;
CREATE POLICY "Admins can manage ml_datasets"
  ON public.ml_datasets FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Policies for ml_dataset_versions
DROP POLICY IF EXISTS "Admins can manage ml_dataset_versions" ON public.ml_dataset_versions;
CREATE POLICY "Admins can manage ml_dataset_versions"
  ON public.ml_dataset_versions FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Policies for ml_feature_schemas
DROP POLICY IF EXISTS "Admins can manage ml_feature_schemas" ON public.ml_feature_schemas;
CREATE POLICY "Admins can manage ml_feature_schemas"
  ON public.ml_feature_schemas FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Policies for ml_models
DROP POLICY IF EXISTS "Admins can manage ml_models" ON public.ml_models;
CREATE POLICY "Admins can manage ml_models"
  ON public.ml_models FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Policies for ml_model_versions
DROP POLICY IF EXISTS "Admins can manage ml_model_versions" ON public.ml_model_versions;
CREATE POLICY "Admins can manage ml_model_versions"
  ON public.ml_model_versions FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Policies for ml_training_jobs
DROP POLICY IF EXISTS "Admins can manage ml_training_jobs" ON public.ml_training_jobs;
CREATE POLICY "Admins can manage ml_training_jobs"
  ON public.ml_training_jobs FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Policies for ml_deployments
DROP POLICY IF EXISTS "Admins can manage ml_deployments" ON public.ml_deployments;
CREATE POLICY "Admins can manage ml_deployments"
  ON public.ml_deployments FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Predictions can be inserted by authenticated users & read by admins
DROP POLICY IF EXISTS "Authenticated users can insert predictions" ON public.ml_predictions;
CREATE POLICY "Authenticated users can insert predictions"
  ON public.ml_predictions FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can read predictions" ON public.ml_predictions;
CREATE POLICY "Admins can read predictions"
  ON public.ml_predictions FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Drift metrics: Admins only
DROP POLICY IF EXISTS "Admins can manage drift metrics" ON public.ml_drift_metrics;
CREATE POLICY "Admins can manage drift metrics"
  ON public.ml_drift_metrics FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- SEED INITIAL ML METADATA
-- ==============================================================================
INSERT INTO public.ml_models (id, name, family, description)
VALUES 
  ('11111111-1111-4111-a111-111111111111', 'epiML Microclimate & AQI Time-Series Predictor', 'TABULAR', 'Multi-target environmental predictor forecasting AQI, temperature, relative humidity, and soil moisture across configurable time horizons.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.ml_datasets (id, name, dataset_type, description, source_identifier, provenance, record_count, feature_count, quality_score, status)
VALUES 
  ('22222222-2222-4222-a222-222222222222', 'Centralized IoT & Crop Chamber Telemetry', 'USER_IOT', 'Aggregated real sensor readings, chamber actuations, and seed emergence trials from all authorized research accounts.', 'supabase:public.experiments', '{"provenance": "epiML Distributed Chambers", "license": "Proprietary Research"}'::jsonb, 0, 14, 98.5, 'ACTIVE'),
  ('33333333-3333-4333-a333-333333333333', 'Kaggle Crop Recommendation Reference', 'KAGGLE_REFERENCE', 'Bootstrapping reference dataset containing environmental bounds across 22 crops.', 'arkabhowmik/crop-recommendation', '{"dataset": "arkabhowmik/crop-recommendation", "url": "https://www.kaggle.com/datasets/arkabhowmik/crop-recommendation", "license": "CC0: Public Domain", "format": "Excel .xlsx", "rows": 7000}'::jsonb, 7000, 5, 99.2, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
