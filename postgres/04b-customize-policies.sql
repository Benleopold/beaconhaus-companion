-- ============================================================================
-- CUSTOMIZE POLICIES - User-defined policies customizations
-- ============================================================================
-- This file is for YOUR custom changes that should persist across
-- regeneration of the base ERB files.
--
-- IMPORTANT:
--   - This file runs AFTER the main policies script
--   - Define your customizations in the ERBCustomizations table in Airtable
--   - Those changes will appear here after the next build
--
-- ============================================================================

-- Neon/Vercel uses server-side database access. The app sets
-- beaconhaus.current_profile inside each transaction before reading views or
-- writing base tables. Policies below preserve the ERB owner boundary without
-- relying on a provider-specific auth schema.

ALTER TABLE beaconhaus_profile_claims ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON beaconhaus_profile_claims FROM PUBLIC;
REVOKE ALL ON o_auth_tokens FROM PUBLIC;

DROP POLICY IF EXISTS profiles_current_profile_select ON profiles;
DROP POLICY IF EXISTS profiles_current_profile_insert ON profiles;
DROP POLICY IF EXISTS profiles_current_profile_update ON profiles;
DROP POLICY IF EXISTS profiles_current_profile_delete ON profiles;

CREATE POLICY profiles_current_profile_select ON profiles
  FOR SELECT
  USING (
    beaconhaus_slug(account_key) = current_setting('beaconhaus.current_profile', true)
  );

CREATE POLICY profiles_current_profile_insert ON profiles
  FOR INSERT
  WITH CHECK (
    beaconhaus_slug(account_key) = current_setting('beaconhaus.current_profile', true)
  );

CREATE POLICY profiles_current_profile_update ON profiles
  FOR UPDATE
  USING (
    beaconhaus_slug(account_key) = current_setting('beaconhaus.current_profile', true)
  )
  WITH CHECK (
    beaconhaus_slug(account_key) = current_setting('beaconhaus.current_profile', true)
  );

CREATE POLICY profiles_current_profile_delete ON profiles
  FOR DELETE
  USING (
    beaconhaus_slug(account_key) = current_setting('beaconhaus.current_profile', true)
  );

DROP POLICY IF EXISTS people_current_profile_select ON people;
DROP POLICY IF EXISTS people_current_profile_insert ON people;
DROP POLICY IF EXISTS people_current_profile_update ON people;
DROP POLICY IF EXISTS people_current_profile_delete ON people;

CREATE POLICY people_current_profile_select ON people
  FOR SELECT
  USING (owner = current_setting('beaconhaus.current_profile', true));

CREATE POLICY people_current_profile_insert ON people
  FOR INSERT
  WITH CHECK (owner = current_setting('beaconhaus.current_profile', true));

CREATE POLICY people_current_profile_update ON people
  FOR UPDATE
  USING (owner = current_setting('beaconhaus.current_profile', true))
  WITH CHECK (owner = current_setting('beaconhaus.current_profile', true));

CREATE POLICY people_current_profile_delete ON people
  FOR DELETE
  USING (owner = current_setting('beaconhaus.current_profile', true));

DROP POLICY IF EXISTS facilities_current_profile_select ON facilities;
DROP POLICY IF EXISTS facilities_current_profile_insert ON facilities;
DROP POLICY IF EXISTS facilities_current_profile_update ON facilities;
DROP POLICY IF EXISTS facilities_current_profile_delete ON facilities;

CREATE POLICY facilities_current_profile_select ON facilities
  FOR SELECT
  USING (owner = current_setting('beaconhaus.current_profile', true));

CREATE POLICY facilities_current_profile_insert ON facilities
  FOR INSERT
  WITH CHECK (owner = current_setting('beaconhaus.current_profile', true));

CREATE POLICY facilities_current_profile_update ON facilities
  FOR UPDATE
  USING (owner = current_setting('beaconhaus.current_profile', true))
  WITH CHECK (owner = current_setting('beaconhaus.current_profile', true));

CREATE POLICY facilities_current_profile_delete ON facilities
  FOR DELETE
  USING (owner = current_setting('beaconhaus.current_profile', true));

DROP POLICY IF EXISTS captures_current_profile_select ON captures;
DROP POLICY IF EXISTS captures_current_profile_insert ON captures;
DROP POLICY IF EXISTS captures_current_profile_update ON captures;
DROP POLICY IF EXISTS captures_current_profile_delete ON captures;

CREATE POLICY captures_current_profile_select ON captures
  FOR SELECT
  USING (owner = current_setting('beaconhaus.current_profile', true));

CREATE POLICY captures_current_profile_insert ON captures
  FOR INSERT
  WITH CHECK (owner = current_setting('beaconhaus.current_profile', true));

CREATE POLICY captures_current_profile_update ON captures
  FOR UPDATE
  USING (owner = current_setting('beaconhaus.current_profile', true))
  WITH CHECK (owner = current_setting('beaconhaus.current_profile', true));

CREATE POLICY captures_current_profile_delete ON captures
  FOR DELETE
  USING (owner = current_setting('beaconhaus.current_profile', true));

DROP POLICY IF EXISTS spheres_read ON spheres;
DROP POLICY IF EXISTS person_statuses_read ON person_statuses;
DROP POLICY IF EXISTS facility_types_read ON facility_types;
DROP POLICY IF EXISTS regions_read ON regions;
DROP POLICY IF EXISTS lead_routes_read ON lead_routes;
DROP POLICY IF EXISTS alignment_levels_read ON alignment_levels;
DROP POLICY IF EXISTS facility_statuses_read ON facility_statuses;
DROP POLICY IF EXISTS capture_types_read ON capture_types;
DROP POLICY IF EXISTS warmth_levels_read ON warmth_levels;
DROP POLICY IF EXISTS governance_rules_read ON governance_rules;

CREATE POLICY spheres_read ON spheres FOR SELECT USING (true);
CREATE POLICY person_statuses_read ON person_statuses FOR SELECT USING (true);
CREATE POLICY facility_types_read ON facility_types FOR SELECT USING (true);
CREATE POLICY regions_read ON regions FOR SELECT USING (true);
CREATE POLICY lead_routes_read ON lead_routes FOR SELECT USING (true);
CREATE POLICY alignment_levels_read ON alignment_levels FOR SELECT USING (true);
CREATE POLICY facility_statuses_read ON facility_statuses FOR SELECT USING (true);
CREATE POLICY capture_types_read ON capture_types FOR SELECT USING (true);
CREATE POLICY warmth_levels_read ON warmth_levels FOR SELECT USING (true);
CREATE POLICY governance_rules_read ON governance_rules FOR SELECT USING (true);
