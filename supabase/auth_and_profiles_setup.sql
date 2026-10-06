-- ==============================================================================
-- epiML — Supabase Auth, Auto-Confirm, Profiles & Experiments Schema
-- Project URL: https://qbeqacmwaoufiwhafvyj.supabase.co
-- Run this in your Supabase Dashboard -> SQL Editor -> New query -> Run
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. AUTO-CONFIRM USER EMAILS (Fixes "Email not confirmed" error for instant signups)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.auto_confirm_user_email()
RETURNS trigger AS $$
BEGIN
  -- Automatically marks email as confirmed immediately upon registration
  NEW.email_confirmed_at = COALESCE(NEW.email_confirmed_at, now());
  NEW.confirmed_at = COALESCE(NEW.confirmed_at, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_auto_confirm ON auth.users;
CREATE TRIGGER on_auth_user_auto_confirm
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.auto_confirm_user_email();

-- Also confirm any previously registered unconfirmed users
UPDATE auth.users 
SET email_confirmed_at = now(), confirmed_at = now() 
WHERE email_confirmed_at IS NULL;

-- ==============================================================================
-- 3. USER PROFILES TABLE (Linked to auth.users)
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
-- 4. AUTOMATIC PROFILE ONBOARDING TRIGGER
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
-- 5. CROP EXPERIMENTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL,
  scientific_name TEXT,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'COMPLETED')),
  current_epoch TEXT DEFAULT 'GERMINATION' CHECK (current_epoch IN ('IMBIBITION', 'GERMINATION', 'ROOT_DEVELOPMENT', 'EMERGENCE')),
  current_day INT DEFAULT 1,
  target_temp NUMERIC DEFAULT 25.0,
  target_humidity NUMERIC DEFAULT 75.0,
  target_soil_moisture NUMERIC DEFAULT 70.0,
  target_light_hours INT DEFAULT 14,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

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
