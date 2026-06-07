# BeaconHaus Companion

A calm, cross-device companion that helps Liz Imbro run her BeaconHaus outreach as a gentle daily ritual: tend her warm network, track facility targets, and capture pain points, stories, and ideas. Single user, non-technical, no overwhelm.

---

## Governance: read this first

This project follows the Leopold Loop. The single source of truth is the Airtable rulebook. Everything in this repository below the meaning layer is derivative.

- Do not hand-edit derivative artifacts (Postgres schema, RLS policies, enum tables, seed, or generated frontend config).
- To change behavior, change the rulebook, then run `effortless build` to regenerate the derivative outputs.
- Meaning lives in exactly one place. If a rule or a vocabulary appears in two places, that is a defect to fix, not a convenience to keep.

CMCC applies: business logic is auditable and traceable to a rule in the meaning layer. There is no hidden logic in code. If a behavior cannot be traced to a rule below, it does not belong in the build.

---

## The Leopold Loop for this project

```
Stakeholder input (Liz, the calls, Ben)
        |
   Glossary  .  Narrative  .  Mock Data
        |
   Blueprint Sketch
        |
   Airtable Rulebook   <-- SSOT
        |
   effortless build
   (rulebook-to-airtable . airtable-to-rulebook . rulebook-to-postgres)
        |
   Derivative outputs
   - Neon/Postgres tables, views, functions, RLS, seed
   - Frontend config (entities, vocabularies, copy, rules)
```

A rule change flows from Airtable through the build and rebuilds deterministically. Nothing downstream is the source.

---

## Layers

1. Meaning layer (SSOT, Airtable). Entities, fields, controlled vocabularies, governance rules, and curated reference data.
2. ERB. The rulebook layer that the build reads and writes.
3. Derivative. The Neon/Postgres backend and the frontend, generated from the rulebook. This repo holds the derivative outputs and the app shell.

---

## Entities

These are the rulebook entities. Field names map one to one to the derivative tables in `beaconhaus_schema.sql`.

### people (warm network)
Liz's sphere of influence and community ecosystem. Anyone who can open a door or help map who is aligned.
Fields: name (required), role_org, sphere [vocab], relationship, doors_can_open, the_ask, email, phone, linkedin_url, status [vocab], last_touched, next_step, notes.

### facilities (targets)
The places Liz is working toward. Values-aligned independent living and 55 and over communities first.
Fields: facility_name (required), type [vocab], town, region [vocab], lead_route [vocab], aligned [vocab], decision_maker, title, email, phone, website, status [vocab], next_step, fit_notes.

### captures (notes)
Pain points, case studies, and ideas, captured as they come. Feeds the marketing package.
Fields: type [vocab], title (required), detail. (created_at is a substrate audit timestamp, not a rulebook field.)

### profile (per-user settings)
One row per user. Holds the gentle settings that drive the daily ritual.
Fields: display_name, tagline, weekly_warmup_goal, warm_threshold_days, cooling_threshold_days, morning_warmup_count, week_start, week_count.

### oauth_tokens (server-side only)
Holds connection tokens for Drive and LinkedIn. Never exposed to the client. Read and refreshed only in server code.
Fields: provider, access_token, refresh_token, scope, expires_at.

---

## Controlled vocabularies

Defined in the rulebook as enum tables and generated as derivative. Do not hardcode these in the frontend or the schema. Read them from the generated vocabulary.

- people.sphere: Facility, Independent Living, Community, Nonprofit, Foundation, Faith Leader, Insurance, Doula, Legal, Mentor, Other
- people.status: To reach out, Reached out, In conversation, Intro made, Resting
- facilities.type: Independent Living, 55 and Over Community, Assisted Living, Memory Care, Skilled Nursing, CCRC, Senior Center, Other
- facilities.region: Warwick NY, Goshen NY, Orange County NY, Rockland County NY, Sussex County NJ, Other
- facilities.lead_route: Warm via Mina, Warm via Haley, Warm via other, Cold
- facilities.aligned: Yes, Maybe, No, Unknown
- facilities.status: To research, Intro requested, Meeting set, In discussion, Proposal sent, Signed, Resting
- captures.type: Pain Point, Case Study, Idea
- warmth (derived, not stored): Warm, Cooling, Cold

---

## Governance rules

Each rule is meaning. It lives in the rulebook and is traceable. The frontend and backend enforce these because they are generated from them, not because someone wrote them into code by hand.

- R1 Ownership. Every row belongs to one user via user_id. Row Level Security limits all access to that user. Enforced in the generated RLS policies.
- R2 Warmth model. Warmth is derived from last_touched. Warm within warm_threshold_days, Cooling up to cooling_threshold_days, Cold beyond that or if never touched. Warmth drives sorting and the daily ritual only.
- R3 Daily ritual. The Today screen surfaces morning_warmup_count people, coldest or never-touched first, one at a time. Logging a hello sets last_touched to today and counts toward the weekly total.
- R4 Weekly count. Counted since the most recent Monday and reset each Monday. Shown as encouragement toward weekly_warmup_goal. Never shown as a backlog.
- R5 No guilt. No overdue, late, or warning states anywhere. A cold contact reads as ready for a hello. Empty states are warm and inviting.
- R6 Minimal friction. Only name (people) or facility_name (facilities) is required to create a row. Every other field is optional.
- R7 Status auto-advance. Logging a first hello moves a person from To reach out to Reached out. Further status changes are manual.
- R8 Content punctuation. Never use em dashes or en dashes in any label, message, or generated text. Use hyphens only inside hyphenated words. This is a BeaconHaus content rule.
- R9 Positioning. Do not lead with death literacy in the interface. Lead with later-life planning and community connection.
- R10 LinkedIn safety. No scraping or browser automation of LinkedIn, ever. The official API cannot read connections, search people, or send requests or messages for this app, and unofficial tools risk her account. LinkedIn is limited to official posting (member social scope) and Open in LinkedIn deep links from stored profile URLs.
- R11 Least privilege. Request the narrowest OAuth scope that does the job: drive.file for Drive, calendar.events for Calendar, member social for LinkedIn posting, Gmail send only if added later. Ask for each scope only when the feature is first used.
- R12 Secrets server-side. OAuth client secrets and token exchanges live only in server code. Tokens are stored in oauth_tokens, never in the client bundle.

---

## Curated reference data

The starter people, facilities, and captures are human-curated reference data, not generated. Their source of truth is the curated seed in the rulebook, so they are not invented by the build. This mirrors the methodology: human-curated truth is its own SSOT, generated data is derivative.

Seed includes Mina, Haley, Pam, and Terry; Mount Alverno and the two unconfirmed Warwick and Goshen targets; and the starting pain points, the case study, and one idea. The two unconfirmed facility names are placeholders to be resolved with Mina.

---

## Derivative artifacts in this repo

Generated from the rulebook. Do not hand-edit.

- `postgres/`: Postgres tables, views, functions, policy seams, and seed data generated from the rulebook.
- Frontend config: entities, controlled vocabularies, copy, and rule parameters, read from the generated vocabulary and rule set rather than hardcoded.
- The app shell (PWA) is the only hand-authored layer, and it reads everything meaningful from the generated config.

---

## Stack

- Frontend: responsive PWA, installable to the home screen on phone, tablet, and computer.
- Data, auth, sync: Neon Postgres, Auth.js with Google sign-in, server-side data routes, and Row Level Security policy seams.
- Hosting: Vercel.
- Integrations: native email via device compose links, calendar via add-to-calendar files with an optional Google Calendar events scope, Google Drive via drive.file for backups and saved documents, and LinkedIn limited to official posting and deep links per R10.

These are delivery choices. Any of them that encodes meaning (vocabularies, rules, copy) is defined in the rulebook, not in the app.

---

## Change protocol

1. Open the Airtable rulebook.
2. Change the entity, vocabulary, rule, or curated seed.
3. Run `effortless build` to regenerate the derivative outputs.
4. Deploy.

Do not patch the schema, the RLS, the enums, or the rule parameters directly. If you find yourself editing a derivative artifact, stop, and make the change in the rulebook instead.
