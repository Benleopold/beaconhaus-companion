-- ============================================================================
-- CUSTOMIZE SCHEMA - User-defined schema customizations
-- ============================================================================
-- This file is for YOUR custom changes that should persist across
-- regeneration of the base ERB files.
--
-- IMPORTANT:
--   - This file runs AFTER the main schema script
--   - Define your customizations in the ERBCustomizations table in Airtable
--   - Those changes will appear here after the next build
--
-- ============================================================================

-- Your custom schema changes will appear here:

-- Neon/Auth.js bridge for the ERB ownership root.
-- ERB owner values stay as Profiles.Name. Auth.js users bind to profiles
-- through these infrastructure-only columns.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS auth_subject TEXT;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS auth_email TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_auth_subject
  ON profiles (auth_subject)
  WHERE auth_subject IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_account_key_lower
  ON profiles (LOWER(account_key))
  WHERE account_key IS NOT NULL;

CREATE TABLE IF NOT EXISTS beaconhaus_profile_claims (
  email TEXT PRIMARY KEY,
  account_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE beaconhaus_profile_claims IS
  'Auth setup table. Map an email address to an existing ERB profile account_key before first sign-in.';

-- Audit columns live in the substrate. They are intentionally not modeled as
-- ERB meaning fields, but the app needs them for sync and gentle timestamps.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE people ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE people ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE facilities ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE captures ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE captures ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS t_profiles_updated ON profiles;
CREATE TRIGGER t_profiles_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS t_people_updated ON people;
CREATE TRIGGER t_people_updated
  BEFORE UPDATE ON people
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS t_facilities_updated ON facilities;
CREATE TRIGGER t_facilities_updated
  BEFORE UPDATE ON facilities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS t_captures_updated ON captures;
CREATE TRIGGER t_captures_updated
  BEFORE UPDATE ON captures
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
