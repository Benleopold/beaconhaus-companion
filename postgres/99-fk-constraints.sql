-- ============================================================================
-- 99-fk-constraints.sql — FK CONSTRAINTS (off by default)
-- ============================================================================
-- Demos must never fail on FK violations, so init-db.sh SKIPS this file
-- unless EFFORTLESS_ENFORCE_FKS=true is set in the environment.
--
--   EFFORTLESS_ENFORCE_FKS=true bash init-db.sh    # apply constraints
--   bash init-db.sh                                # leave them documented but unenforced
--
-- The rulebook always documents the FK relationships, and 01-drop-and-create-tables.sql
-- always installs the supporting indexes inline. This file just declares the actual
-- enforcement. Idempotent: every constraint is dropped if present, then added.
-- ============================================================================

-- Profiles
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS fk_profiles_people;
ALTER TABLE profiles ADD CONSTRAINT fk_profiles_people
  FOREIGN KEY (people) REFERENCES people (people_id);
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS fk_profiles_facilities;
ALTER TABLE profiles ADD CONSTRAINT fk_profiles_facilities
  FOREIGN KEY (facilities) REFERENCES facilities (facilities_id);
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS fk_profiles_captures;
ALTER TABLE profiles ADD CONSTRAINT fk_profiles_captures
  FOREIGN KEY (captures) REFERENCES captures (captures_id);
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS fk_profiles_o_auth_tokens;
ALTER TABLE profiles ADD CONSTRAINT fk_profiles_o_auth_tokens
  FOREIGN KEY (o_auth_tokens) REFERENCES o_auth_tokens (o_auth_tokens_id);

-- People
ALTER TABLE people DROP CONSTRAINT IF EXISTS fk_people_owner;
ALTER TABLE people ADD CONSTRAINT fk_people_owner
  FOREIGN KEY (owner) REFERENCES profiles (profiles_id);
ALTER TABLE people DROP CONSTRAINT IF EXISTS fk_people_sphere;
ALTER TABLE people ADD CONSTRAINT fk_people_sphere
  FOREIGN KEY (sphere) REFERENCES spheres (spheres_id);
ALTER TABLE people DROP CONSTRAINT IF EXISTS fk_people_status;
ALTER TABLE people ADD CONSTRAINT fk_people_status
  FOREIGN KEY (status) REFERENCES person_statuses (person_statuses_id);

-- Facilities
ALTER TABLE facilities DROP CONSTRAINT IF EXISTS fk_facilities_owner;
ALTER TABLE facilities ADD CONSTRAINT fk_facilities_owner
  FOREIGN KEY (owner) REFERENCES profiles (profiles_id);
ALTER TABLE facilities DROP CONSTRAINT IF EXISTS fk_facilities_type;
ALTER TABLE facilities ADD CONSTRAINT fk_facilities_type
  FOREIGN KEY (type) REFERENCES facility_types (facility_types_id);
ALTER TABLE facilities DROP CONSTRAINT IF EXISTS fk_facilities_region;
ALTER TABLE facilities ADD CONSTRAINT fk_facilities_region
  FOREIGN KEY (region) REFERENCES regions (regions_id);
ALTER TABLE facilities DROP CONSTRAINT IF EXISTS fk_facilities_lead_route;
ALTER TABLE facilities ADD CONSTRAINT fk_facilities_lead_route
  FOREIGN KEY (lead_route) REFERENCES lead_routes (lead_routes_id);
ALTER TABLE facilities DROP CONSTRAINT IF EXISTS fk_facilities_aligned;
ALTER TABLE facilities ADD CONSTRAINT fk_facilities_aligned
  FOREIGN KEY (aligned) REFERENCES alignment_levels (alignment_levels_id);
ALTER TABLE facilities DROP CONSTRAINT IF EXISTS fk_facilities_status;
ALTER TABLE facilities ADD CONSTRAINT fk_facilities_status
  FOREIGN KEY (status) REFERENCES facility_statuses (facility_statuses_id);

-- Captures
ALTER TABLE captures DROP CONSTRAINT IF EXISTS fk_captures_owner;
ALTER TABLE captures ADD CONSTRAINT fk_captures_owner
  FOREIGN KEY (owner) REFERENCES profiles (profiles_id);
ALTER TABLE captures DROP CONSTRAINT IF EXISTS fk_captures_type;
ALTER TABLE captures ADD CONSTRAINT fk_captures_type
  FOREIGN KEY (type) REFERENCES capture_types (capture_types_id);

-- OAuthTokens
ALTER TABLE o_auth_tokens DROP CONSTRAINT IF EXISTS fk_o_auth_tokens_owner;
ALTER TABLE o_auth_tokens ADD CONSTRAINT fk_o_auth_tokens_owner
  FOREIGN KEY (owner) REFERENCES profiles (profiles_id);

-- Spheres
ALTER TABLE spheres DROP CONSTRAINT IF EXISTS fk_spheres_people;
ALTER TABLE spheres ADD CONSTRAINT fk_spheres_people
  FOREIGN KEY (people) REFERENCES people (people_id);

-- PersonStatuses
ALTER TABLE person_statuses DROP CONSTRAINT IF EXISTS fk_person_statuses_people;
ALTER TABLE person_statuses ADD CONSTRAINT fk_person_statuses_people
  FOREIGN KEY (people) REFERENCES people (people_id);

-- FacilityTypes
ALTER TABLE facility_types DROP CONSTRAINT IF EXISTS fk_facility_types_facilities;
ALTER TABLE facility_types ADD CONSTRAINT fk_facility_types_facilities
  FOREIGN KEY (facilities) REFERENCES facilities (facilities_id);

-- Regions
ALTER TABLE regions DROP CONSTRAINT IF EXISTS fk_regions_facilities;
ALTER TABLE regions ADD CONSTRAINT fk_regions_facilities
  FOREIGN KEY (facilities) REFERENCES facilities (facilities_id);

-- LeadRoutes
ALTER TABLE lead_routes DROP CONSTRAINT IF EXISTS fk_lead_routes_facilities;
ALTER TABLE lead_routes ADD CONSTRAINT fk_lead_routes_facilities
  FOREIGN KEY (facilities) REFERENCES facilities (facilities_id);

-- AlignmentLevels
ALTER TABLE alignment_levels DROP CONSTRAINT IF EXISTS fk_alignment_levels_facilities;
ALTER TABLE alignment_levels ADD CONSTRAINT fk_alignment_levels_facilities
  FOREIGN KEY (facilities) REFERENCES facilities (facilities_id);

-- FacilityStatuses
ALTER TABLE facility_statuses DROP CONSTRAINT IF EXISTS fk_facility_statuses_facilities;
ALTER TABLE facility_statuses ADD CONSTRAINT fk_facility_statuses_facilities
  FOREIGN KEY (facilities) REFERENCES facilities (facilities_id);

-- CaptureTypes
ALTER TABLE capture_types DROP CONSTRAINT IF EXISTS fk_capture_types_captures;
ALTER TABLE capture_types ADD CONSTRAINT fk_capture_types_captures
  FOREIGN KEY (captures) REFERENCES captures (captures_id);

-- 24 FK constraint(s) declared (off unless EFFORTLESS_ENFORCE_FKS=true).
