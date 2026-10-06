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
