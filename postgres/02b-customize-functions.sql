-- ============================================================================
-- CUSTOMIZE FUNCTIONS - User-defined functions customizations
-- ============================================================================
-- This file is for YOUR custom changes that should persist across
-- regeneration of the base ERB files.
--
-- IMPORTANT:
--   - This file runs AFTER the main functions script
--   - Define your customizations in the ERBCustomizations table in Airtable
--   - Those changes will appear here after the next build
--
-- ============================================================================

-- Neon/Auth.js bridge plus formula overrides for unsupported generated
-- translations. Meaning remains in the rulebook; these functions repair the
-- Postgres projection where the transpiler cannot yet express the formula.

CREATE OR REPLACE FUNCTION public.beaconhaus_slug(value TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT NULLIF(regexp_replace(lower(trim(coalesce(value, ''))), '[^a-z0-9]+', '-', 'g'), '');
$$;

CREATE OR REPLACE FUNCTION public.ensure_profile_for_auth(
  p_auth_subject TEXT,
  p_email TEXT,
  p_display_name TEXT
)
RETURNS profiles
LANGUAGE plpgsql
AS $$
DECLARE
  v_subject TEXT := nullif(trim(p_auth_subject), '');
  v_email TEXT := lower(nullif(trim(coalesce(p_email, '')), ''));
  v_claimed_account_key TEXT;
  v_account_key TEXT;
  v_display_name TEXT;
  v_target profiles%ROWTYPE;
  v_existing profiles%ROWTYPE;
  v_existing_name TEXT;
BEGIN
  IF v_subject IS NULL THEN
    RAISE EXCEPTION 'Missing authenticated subject';
  END IF;

  SELECT account_key
    INTO v_claimed_account_key
    FROM beaconhaus_profile_claims
    WHERE lower(email) = v_email;

  v_account_key := coalesce(v_claimed_account_key, 'user-' || beaconhaus_slug(v_subject));
  v_display_name := coalesce(nullif(trim(p_display_name), ''), nullif(split_part(v_email, '@', 1), ''), 'Friend');

  SELECT *
    INTO v_existing
    FROM profiles
    WHERE auth_subject = v_subject
    LIMIT 1;

  IF v_existing.profiles_id IS NOT NULL THEN
    v_existing_name := calc_profiles_name(v_existing.profiles_id);

    IF v_claimed_account_key IS NULL OR v_existing_name = v_account_key THEN
      RETURN v_existing;
    END IF;

    IF EXISTS (SELECT 1 FROM people WHERE owner = v_existing_name)
      OR EXISTS (SELECT 1 FROM facilities WHERE owner = v_existing_name)
      OR EXISTS (SELECT 1 FROM captures WHERE owner = v_existing_name) THEN
      RAISE EXCEPTION 'This signed-in user already has data under another profile';
    END IF;

    DELETE FROM profiles WHERE profiles_id = v_existing.profiles_id;
  END IF;

  SELECT *
    INTO v_target
    FROM profiles
    WHERE lower(account_key) = lower(v_account_key)
    LIMIT 1;

  IF v_target.profiles_id IS NULL THEN
    INSERT INTO profiles (
      profiles_id,
      account_key,
      display_name,
      tagline,
      weekly_warmup_goal,
      warm_threshold_days,
      cooling_threshold_days,
      morning_warmup_count,
      week_start,
      week_count,
      auth_subject,
      auth_email
    )
    VALUES (
      gen_random_uuid()::text,
      v_account_key,
      initcap(v_display_name),
      'Illuminating Life, Legacy, and Love',
      4,
      14,
      30,
      3,
      date_trunc('week', now()),
      0,
      v_subject,
      v_email
    )
    RETURNING * INTO v_target;
  ELSE
    IF v_target.auth_subject IS NOT NULL AND v_target.auth_subject <> v_subject THEN
      RAISE EXCEPTION 'This profile is already claimed';
    END IF;

    UPDATE profiles
      SET auth_subject = v_subject,
          auth_email = v_email
      WHERE profiles_id = v_target.profiles_id
      RETURNING * INTO v_target;
  END IF;

  RETURN v_target;
END;
$$;

CREATE OR REPLACE FUNCTION calc_people_warm_threshold_days(p_people_id TEXT)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT coalesce((
    SELECT p.warm_threshold_days
    FROM profiles p
    WHERE calc_profiles_name(p.profiles_id) = (
      SELECT owner FROM people WHERE people_id = p_people_id
    )
    LIMIT 1
  ), 14)::integer;
$$;

CREATE OR REPLACE FUNCTION calc_people_cooling_threshold_days(p_people_id TEXT)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT coalesce((
    SELECT p.cooling_threshold_days
    FROM profiles p
    WHERE calc_profiles_name(p.profiles_id) = (
      SELECT owner FROM people WHERE people_id = p_people_id
    )
    LIMIT 1
  ), 30)::integer;
$$;

CREATE OR REPLACE FUNCTION calc_people_days_since_last_touched(p_people_id TEXT)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT coalesce((
    SELECT greatest(floor(extract(epoch FROM (now() - last_touched)) / 86400)::integer, 0)
    FROM people
    WHERE people_id = p_people_id
      AND last_touched IS NOT NULL
  ), 0)::integer;
$$;

CREATE OR REPLACE FUNCTION calc_people_is_never_touched(p_people_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM people
    WHERE people_id = p_people_id
      AND last_touched IS NULL
  );
$$;

CREATE OR REPLACE FUNCTION calc_people_warmth(p_people_id TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT CASE
    WHEN (SELECT last_touched FROM people WHERE people_id = p_people_id) IS NULL THEN 'cold'
    WHEN calc_people_days_since_last_touched(p_people_id) <= calc_people_warm_threshold_days(p_people_id) THEN 'warm'
    WHEN calc_people_days_since_last_touched(p_people_id) <= calc_people_cooling_threshold_days(p_people_id) THEN 'cooling'
    ELSE 'cold'
  END::text;
$$;

CREATE OR REPLACE FUNCTION calc_facilities_region_label(p_facilities_id TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT (
    SELECT r.region_label
    FROM regions r
    WHERE calc_regions_name(r.regions_id) = (
      SELECT region FROM facilities WHERE facilities_id = p_facilities_id
    )
    LIMIT 1
  )::text;
$$;

CREATE OR REPLACE FUNCTION calc_facilities_lead_route_label(p_facilities_id TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT (
    SELECT l.lead_route_label
    FROM lead_routes l
    WHERE calc_lead_routes_name(l.lead_routes_id) = (
      SELECT lead_route FROM facilities WHERE facilities_id = p_facilities_id
    )
    LIMIT 1
  )::text;
$$;

CREATE OR REPLACE FUNCTION calc_facilities_is_warm_lead(p_facilities_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT coalesce((
    SELECT lead_route LIKE 'warm-via-%'
    FROM facilities
    WHERE facilities_id = p_facilities_id
  ), false)::boolean;
$$;
