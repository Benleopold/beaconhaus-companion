# Neon Free Setup

Use this when creating the hosted BeaconHaus backend for the Vercel pilot.

## 1. Create the project

1. Create a Neon project on the Free plan.
2. Copy the pooled connection string for the main database.
3. Keep the connection string server-side only. It goes in Vercel as
   `DATABASE_URL`.

## 2. Apply SQL

Fast path: open the Neon SQL editor and run:

```text
neon-pilot.sql
```

If the bundle is missing or stale, regenerate it from the repo root:

```text
node postgres/build-neon-bundle.mjs
```

Careful path: run the files in this order:

```text
00-bootstrap.sql
01-drop-and-create-tables.sql
01b-customize-schema.sql
02-create-functions.sql
02b-customize-functions.sql
03-create-views.sql
03b-customize-views.sql
04-create-policies.sql
04b-customize-policies.sql
05-insert-data.sql
05b-customize-data.sql
```

Do not run `99-fk-constraints.sql` for this pilot. The ERB relationships use
logical `Name` values, while the current generated FK file points at substrate
primary keys.

## 3. Claim Liz's seed profile

Before Liz signs in with Google for the first time, run this with her real
Google email:

```sql
INSERT INTO beaconhaus_profile_claims (email, account_key)
VALUES ('liz@example.com', 'liz')
ON CONFLICT (email) DO UPDATE SET account_key = EXCLUDED.account_key;
```

When Liz opens the app and signs in with Google, `ensure_profile_for_auth()`
binds her Auth.js Google subject to the existing `liz` profile and seed rows.

## 4. Google OAuth

Create a Google OAuth client for a Web application.

Authorized JavaScript origins:

```text
http://localhost:3939
https://your-vercel-domain.vercel.app
```

Authorized redirect URIs:

```text
http://localhost:3939/api/auth/callback/google
https://your-vercel-domain.vercel.app/api/auth/callback/google
```

## 5. Vercel environment variables

In the Vercel project settings, add:

```text
DATABASE_URL=your Neon pooled connection string
NEXT_PUBLIC_BEACONHAUS_BACKEND=neon
AUTH_SECRET=generate a long random value
AUTH_GOOGLE_ID=your Google OAuth client ID
AUTH_GOOGLE_SECRET=your Google OAuth client secret
AUTH_URL=https://your-vercel-domain.vercel.app
GEMINI_API_KEY=optional, only needed for Copilot
```

Redeploy after adding the variables.

## 6. Second-user proof

A second Google account can sign in without a claim row. The profile bootstrap
creates a separate profile with a `user-...` account key. That user starts empty
unless they use Settings -> Start fresh, which copies the rulebook starter seed
under their own owner value.
