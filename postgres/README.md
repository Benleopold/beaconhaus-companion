# Rulebook to PostgreSQL Script Generation Report

**Schema:** `public`
**Database:** `demo`
**Timestamp:** 2026-06-04 21:05:56 UTC

## Parsing Rulebook

Found **15** tables in rulebook


  - **Profiles** (18 fields, 1 records)
  - **People** (21 fields, 4 records)
  - **Facilities** (20 fields, 3 records)
  - **Captures** (6 fields, 4 records)
  - **OAuthTokens** (8 fields, 0 records)
  - **Spheres** (7 fields, 11 records)
  - **PersonStatuses** (7 fields, 5 records)
  - **FacilityTypes** (7 fields, 8 records)
  - **Regions** (7 fields, 6 records)
  - **LeadRoutes** (7 fields, 4 records)
  - **AlignmentLevels** (7 fields, 4 records)
  - **FacilityStatuses** (7 fields, 7 records)
  - **CaptureTypes** (7 fields, 3 records)
  - **WarmthLevels** (6 fields, 3 records)
  - **GovernanceRules** (8 fields, 12 records)

Generated **15** table definitions with **85** raw fields (mode=check-add)
Generated **94** calculation functions
Generated **15** views
Enabled RLS on **15** tables
Generated insert statements for **75** records
## Script Generation Complete

Generated files:
- `00-bootstrap.sql` - Bootstrap (overwrite Never); includes commented-out drop-all script
- `01-drop-and-create-tables.sql` - Drop and recreate tables with raw fields and FK indexes
- `01b-customize-schema.sql` - User customizations for schema
- `02-create-functions.sql` - Create calculation functions
- `02b-customize-functions.sql` - User customizations for functions
- `03-create-views.sql` - Create views with calculated fields
- `03b-customize-views.sql` - User customizations for views
- `04-create-policies.sql` - Create RLS policies
- `04b-customize-policies.sql` - User customizations for RLS policies
- `05-insert-data.sql` - Insert data from rulebook
- `05b-customize-data.sql` - User customizations for seed data
- `99-fk-constraints.sql` - FK constraints (skipped unless EFFORTLESS_ENFORCE_FKS=true)
- `init-db.sh` - Database initialization script

