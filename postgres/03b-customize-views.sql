-- ============================================================================
-- CUSTOMIZE VIEWS - User-defined views customizations
-- ============================================================================
-- This file is for YOUR custom changes that should persist across
-- regeneration of the base ERB files.
--
-- IMPORTANT:
--   - This file runs AFTER the main views script
--   - Define your customizations in the ERBCustomizations table in Airtable
--   - Those changes will appear here after the next build
--
-- ============================================================================

-- Your custom views changes will appear here:

CREATE OR REPLACE VIEW vw_profiles WITH (security_invoker = ON) AS
SELECT
  t.profiles_id,
  calc_profiles_name(t.profiles_id) AS name,
  t.account_key,
  t.display_name,
  t.tagline,
  t.weekly_warmup_goal,
  t.warm_threshold_days,
  t.cooling_threshold_days,
  t.morning_warmup_count,
  t.week_start,
  t.week_count,
  t.people,
  t.facilities,
  t.captures,
  t.o_auth_tokens,
  t.created_at,
  t.updated_at,
  calc_profiles_count_of_people(t.profiles_id) AS count_of_people,
  calc_profiles_count_of_facilities(t.profiles_id) AS count_of_facilities,
  calc_profiles_count_of_captures(t.profiles_id) AS count_of_captures
FROM profiles t;

CREATE OR REPLACE VIEW vw_people WITH (security_invoker = ON) AS
SELECT
  t.people_id,
  calc_people_name(t.people_id) AS name,
  t.full_name,
  t.owner,
  t.role_org,
  t.sphere,
  t.relationship,
  t.doors_can_open,
  t.the_ask,
  t.email,
  t.phone,
  t.linkedin_url,
  t.status,
  t.last_touched,
  t.next_step,
  t.notes,
  t.created_at,
  t.updated_at,
  calc_people_warm_threshold_days(t.people_id) AS warm_threshold_days,
  calc_people_cooling_threshold_days(t.people_id) AS cooling_threshold_days,
  calc_people_days_since_last_touched(t.people_id) AS days_since_last_touched,
  calc_people_is_never_touched(t.people_id) AS is_never_touched,
  calc_people_warmth(t.people_id) AS warmth
FROM people t;

CREATE OR REPLACE VIEW vw_facilities WITH (security_invoker = ON) AS
SELECT
  t.facilities_id,
  calc_facilities_name(t.facilities_id) AS name,
  t.facility_name,
  t.owner,
  t.type,
  t.town,
  t.region,
  t.lead_route,
  t.aligned,
  t.decision_maker,
  t.title,
  t.email,
  t.phone,
  t.website,
  t.status,
  t.next_step,
  t.fit_notes,
  t.created_at,
  t.updated_at,
  calc_facilities_region_label(t.facilities_id) AS region_label,
  calc_facilities_lead_route_label(t.facilities_id) AS lead_route_label,
  calc_facilities_is_warm_lead(t.facilities_id) AS is_warm_lead
FROM facilities t;

CREATE OR REPLACE VIEW vw_captures WITH (security_invoker = ON) AS
SELECT
  t.captures_id,
  calc_captures_name(t.captures_id) AS name,
  t.title,
  t.owner,
  t.type,
  t.detail,
  t.created_at,
  t.updated_at
FROM captures t;
